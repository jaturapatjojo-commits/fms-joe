const { app, BrowserWindow, dialog } = require("electron");
app.name = "FMS Management System";
const path = require("node:path");
const fs = require("node:fs");
const net = require("node:net");
const http = require("node:http");
const { spawn, execSync } = require("node:child_process");

let mainWindow = null;
let serverProcess = null;
let pgProcess = null;

const PG_PORT = 54329;
const DEFAULT_WEB_PORT = 3010;

// Helper: Check if TCP port is open and listening
function checkTcpPort(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host }, () => {
      socket.end();
      resolve(true);
    });
    socket.on("error", () => {
      socket.destroy();
      resolve(false);
    });
    socket.setTimeout(1000, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

// Helper: Poll until TCP port is ready
async function waitForTcp(port, host = "127.0.0.1", maxAttempts = 40) {
  for (let i = 0; i < maxAttempts; i++) {
    const ready = await checkTcpPort(port, host);
    if (ready) return true;
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}

// Helper: Find an available port starting from startPort
function findAvailablePort(startPort) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(startPort, "127.0.0.1", () => {
      server.close(() => resolve(startPort));
    });
    server.on("error", () => {
      resolve(findAvailablePort(startPort + 1));
    });
  });
}

// Helper: Check Next.js /api/health endpoint
function checkServer(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/api/health`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Helper: Poll Next.js until ready
async function waitForServer(port, maxAttempts = 60) {
  for (let i = 0; i < maxAttempts; i++) {
    const ready = await checkServer(port);
    if (ready) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

// Resolve bundle paths
function getPaths() {
  const isPackaged = app.isPackaged;
  const bundleBase = isPackaged
    ? process.resourcesPath
    : path.join(__dirname, "..", "desktop-bundle");

  const postgresDir = path.join(bundleBase, "postgres");
  const postgresBin = path.join(postgresDir, "bin", "postgres.exe");
  const pgCtlBin = path.join(postgresDir, "bin", "pg_ctl.exe");
  const templateDir = path.join(postgresDir, "data-template");

  const standaloneDir = path.join(bundleBase, "standalone");
  const serverPath = path.join(standaloneDir, "server.js");

  const userDataDir = app.getPath("userData");
  const pgDataDir = path.join(userDataDir, "pgdata");

  return {
    isPackaged,
    postgresDir,
    postgresBin,
    pgCtlBin,
    templateDir,
    standaloneDir,
    serverPath,
    userDataDir,
    pgDataDir,
  };
}

// Ensure database data directory is provisioned
function ensureDatabase(paths) {
  const { pgDataDir, templateDir } = paths;

  // Clean stale lock if process died unexpectedly
  const pidFile = path.join(pgDataDir, "postmaster.pid");
  if (fs.existsSync(pidFile)) {
    try {
      const pidContent = fs.readFileSync(pidFile, "utf-8");
      const pid = parseInt(pidContent.split("\n")[0], 10);
      if (pid) {
        let alive = false;
        try {
          process.kill(pid, 0);
          alive = true;
        } catch {
          alive = false;
        }
        if (!alive) {
          console.log("[Electron] Removing stale postmaster.pid:", pid);
          fs.unlinkSync(pidFile);
        }
      }
    } catch {
      // Ignore
    }
  }

  if (!fs.existsSync(pgDataDir)) {
    console.log("[Electron] Initializing database in:", pgDataDir);
    if (fs.existsSync(templateDir)) {
      console.log("[Electron] Copying pre-seeded template ->", pgDataDir);
      fs.cpSync(templateDir, pgDataDir, { recursive: true });
      console.log("[Electron] Database cluster successfully copied.");
    } else {
      console.warn("[Electron] Template directory not found at:", templateDir);
    }
  }
}

// Start embedded PostgreSQL
async function startPostgres(paths) {
  const { postgresBin, pgDataDir, userDataDir } = paths;

  if (!fs.existsSync(postgresBin)) {
    console.warn("[Electron] PostgreSQL binary not found:", postgresBin);
    return false;
  }

  // Check if already running on PG_PORT
  const alreadyUp = await checkTcpPort(PG_PORT);
  if (alreadyUp) {
    console.log(`[Electron] PostgreSQL already running on port ${PG_PORT}`);
    return true;
  }

  console.log(`[Electron] Starting embedded PostgreSQL on port ${PG_PORT}...`);
  const logFile = path.join(userDataDir, "postgres.log");
  const logStream = fs.createWriteStream(logFile, { flags: "a" });

  pgProcess = spawn(
    postgresBin,
    ["-D", pgDataDir, "-p", String(PG_PORT), "-h", "127.0.0.1"],
    {
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    }
  );

  pgProcess.stdout.pipe(logStream);
  pgProcess.stderr.pipe(logStream);

  pgProcess.on("error", (err) => {
    console.error("[Electron] Failed to spawn postgres process:", err);
  });

  const ready = await waitForTcp(PG_PORT, "127.0.0.1", 30);
  if (!ready) {
    console.error("[Electron] Embedded PostgreSQL failed to start. Check log:", logFile);
    return false;
  }

  console.log("[Electron] Embedded PostgreSQL is online and accepting connections.");
  return true;
}

// Start Next.js standalone server
function startNextServer(port, paths) {
  const { isPackaged, standaloneDir, serverPath } = paths;

  console.log(`[Electron] Starting Next.js server from: ${serverPath} on port ${port}`);

  const nodeBinary = isPackaged ? process.execPath : "node";
  const childEnv = {
    ...process.env,
    PORT: String(port),
    HOSTNAME: "127.0.0.1",
    NODE_ENV: "production",
    DATABASE_URL: `postgresql://postgres@127.0.0.1:${PG_PORT}/ums_dev`,
    ...(isPackaged ? { ELECTRON_RUN_AS_NODE: "1" } : {}),
  };

  serverProcess = spawn(nodeBinary, [serverPath], {
    cwd: standaloneDir,
    env: childEnv,
    stdio: "ignore",
    windowsHide: true,
  });

  serverProcess.on("error", (err) => {
    console.error("[Electron] Failed to spawn Next.js server process:", err);
  });
}

// Cleanly stop all running background processes
function stopAllProcesses(paths) {
  if (serverProcess && serverProcess.pid) {
    console.log("[Electron] Stopping Next.js server process PID:", serverProcess.pid);
    try {
      if (process.platform === "win32") {
        execSync(`taskkill /pid ${serverProcess.pid} /f /t`);
      } else {
        serverProcess.kill("SIGTERM");
      }
    } catch {}
    serverProcess = null;
  }

  if (paths) {
    const { pgCtlBin, pgDataDir } = paths;
    if (fs.existsSync(pgCtlBin) && fs.existsSync(pgDataDir)) {
      console.log("[Electron] Stopping embedded PostgreSQL via pg_ctl...");
      try {
        execSync(`"${pgCtlBin}" -D "${pgDataDir}" stop -m fast`, {
          windowsHide: true,
          timeout: 5000,
        });
      } catch {}
    }
  }

  if (pgProcess && pgProcess.pid) {
    console.log("[Electron] Terminating PostgreSQL process PID:", pgProcess.pid);
    try {
      if (process.platform === "win32") {
        execSync(`taskkill /pid ${pgProcess.pid} /f /t`);
      } else {
        pgProcess.kill("SIGTERM");
      }
    } catch {}
    pgProcess = null;
  }
}

async function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    title: "FMS Management System",
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.setMenuBarVisibility(false);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  await mainWindow.loadURL(`http://127.0.0.1:${port}`);
}

app.whenReady().then(async () => {
  const paths = getPaths();

  // 1. Provision database directory
  ensureDatabase(paths);

  // 2. Start PostgreSQL
  const pgOk = await startPostgres(paths);
  if (!pgOk) {
    dialog.showErrorBox(
      "Database Error",
      "Unable to start the embedded database server. Please check the logs in your AppData directory."
    );
    stopAllProcesses(paths);
    app.quit();
    return;
  }

  // 3. Find available port for Next.js
  const port = await findAvailablePort(DEFAULT_WEB_PORT);

  // 4. Start Next.js server
  startNextServer(port, paths);

  // 5. Wait for Next.js to be responsive and DB healthy
  const ready = await waitForServer(port);
  if (!ready) {
    dialog.showErrorBox(
      "Connection Error",
      `Unable to start the application server on port ${port}.`
    );
    stopAllProcesses(paths);
    app.quit();
    return;
  }

  // 6. Launch Desktop Window
  await createWindow(port);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(port);
    }
  });
});

app.on("window-all-closed", () => {
  const paths = getPaths();
  stopAllProcesses(paths);
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  const paths = getPaths();
  stopAllProcesses(paths);
});

process.on("exit", () => {
  const paths = getPaths();
  stopAllProcesses(paths);
});

