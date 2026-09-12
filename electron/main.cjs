const { app, BrowserWindow, dialog } = require("electron");
const path = require("node:path");
const http = require("node:http");
const { spawn, execSync } = require("node:child_process");

let mainWindow = null;
let serverProcess = null;
const DEFAULT_PORT = 3010;

// Helper to check if server is responsive
function checkServer(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/api/health`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Helper to poll until server is ready
async function waitForServer(port, maxAttempts = 60) {
  for (let i = 0; i < maxAttempts; i++) {
    const ready = await checkServer(port);
    if (ready) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

function startServer(port) {
  const isPackaged = app.isPackaged;
  const standaloneDir = isPackaged
    ? path.join(process.resourcesPath, "standalone")
    : path.join(__dirname, "..", ".next", "standalone");

  const serverPath = path.join(standaloneDir, "server.js");

  console.log(`[Electron] Starting Next.js server from: ${serverPath} on port ${port}`);

  const nodeBinary = isPackaged ? process.execPath : "node";
  const childEnv = {
    ...process.env,
    PORT: String(port),
    HOSTNAME: "127.0.0.1",
    NODE_ENV: "production",
    ...(isPackaged ? { ELECTRON_RUN_AS_NODE: "1" } : {}),
  };

  serverProcess = spawn(nodeBinary, [serverPath], {
    cwd: standaloneDir,
    env: childEnv,
    stdio: "ignore",
    windowsHide: true,
  });

  serverProcess.on("error", (err) => {
    console.error("[Electron] Failed to spawn server process:", err);
  });
}

function stopServer() {
  if (serverProcess && serverProcess.pid) {
    console.log("[Electron] Stopping server process PID:", serverProcess.pid);
    try {
      if (process.platform === "win32") {
        execSync(`taskkill /pid ${serverProcess.pid} /f /t`);
      } else {
        serverProcess.kill("SIGTERM");
      }
    } catch {
      // Ignore if already terminated
    }
    serverProcess = null;
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
  const port = DEFAULT_PORT;

  const alreadyRunning = await checkServer(port);
  if (!alreadyRunning) {
    startServer(port);
  }

  const ready = await waitForServer(port);
  if (!ready) {
    dialog.showErrorBox(
      "Connection Error",
      `Unable to start the application server on port ${port}. Please ensure PostgreSQL is running at localhost:5432.`
    );
    stopServer();
    app.quit();
    return;
  }

  await createWindow(port);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(port);
    }
  });
});

app.on("window-all-closed", () => {
  stopServer();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  stopServer();
});

process.on("exit", () => {
  stopServer();
});
