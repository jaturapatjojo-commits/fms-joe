import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import { execSync } from "node:child_process";

const root = process.cwd();
const bundleDir = path.join(root, "desktop-bundle");
const standaloneDir = path.join(bundleDir, "standalone");
const postgresBundleDir = path.join(bundleDir, "postgres");
const templateDataDir = path.join(postgresBundleDir, "data-template");

// 1. Locate system PostgreSQL
function findPostgresDir(): string {
  const candidates = [
    "C:\\Program Files\\PostgreSQL\\17",
    "C:\\Program Files\\PostgreSQL\\16",
    "C:\\Program Files\\PostgreSQL\\15",
    "C:\\Program Files (x86)\\PostgreSQL\\17",
    "C:\\Program Files (x86)\\PostgreSQL\\16",
  ];

  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, "bin", "postgres.exe"))) {
      return dir;
    }
  }

  throw new Error("PostgreSQL installation not found on build machine.");
}

function waitForTcp(port: number, maxAttempts = 30): Promise<boolean> {
  return new Promise((resolve) => {
    let attempts = 0;
    function tryConnect() {
      attempts++;
      const socket = net.createConnection({ port, host: "127.0.0.1" }, () => {
        socket.end();
        resolve(true);
      });
      socket.on("error", () => {
        socket.destroy();
        if (attempts >= maxAttempts) return resolve(false);
        setTimeout(tryConnect, 500);
      });
    }
    tryConnect();
  });
}

async function main() {
  console.log("==================================================");
  console.log("   Step 1: Building Next.js Standalone Output    ");
  console.log("==================================================");
  execSync("npm run build", { stdio: "inherit" });

  console.log("\n==================================================");
  console.log("   Step 2: Assembling Next.js Standalone Bundle   ");
  console.log("==================================================");
  if (fs.existsSync(bundleDir)) {
    fs.rmSync(bundleDir, { recursive: true, force: true });
  }
  fs.mkdirSync(standaloneDir, { recursive: true });

  const nextStandalone = path.join(root, ".next", "standalone");
  const staticSrc = path.join(root, ".next", "static");
  const staticDest = path.join(standaloneDir, ".next", "static");
  const publicSrc = path.join(root, "public");
  const publicDest = path.join(standaloneDir, "public");

  console.log("Copying .next/standalone -> desktop-bundle/standalone...");
  fs.cpSync(nextStandalone, standaloneDir, { recursive: true });

  // Clean unneeded directories from standalone to save space and avoid recursive bundling
  const unneededDirs = ["dist", "e2e", "tests", "scratch", "electron"];
  for (const dir of unneededDirs) {
    const p = path.join(standaloneDir, dir);
    if (fs.existsSync(p)) {
      fs.rmSync(p, { recursive: true, force: true });
    }
  }

  console.log("Copying static assets...");
  fs.mkdirSync(path.dirname(staticDest), { recursive: true });
  fs.cpSync(staticSrc, staticDest, { recursive: true });

  console.log("Copying public assets...");
  fs.cpSync(publicSrc, publicDest, { recursive: true });

  // Write default embedded environment
  const embeddedEnv = [
    "DATABASE_URL=postgresql://postgres@127.0.0.1:54329/ums_dev",
    "AUTH_SECRET=1qkhZ1dUuzNe42W8p1jPlr7ZkrFqew6/DxGlmONg/GQ=",
    "APP_URL=http://localhost:3010",
    "NODE_ENV=production",
  ].join("\n");
  fs.writeFileSync(path.join(standaloneDir, ".env"), embeddedEnv, "utf-8");
  console.log("✓ Standalone Next.js assembled with node_modules and .env");

  console.log("\n==================================================");
  console.log("   Step 3: Packaging Portable PostgreSQL Runtime ");
  console.log("==================================================");
  const pgSourceDir = findPostgresDir();
  console.log(`Using system PostgreSQL from: ${pgSourceDir}`);

  const pgBinDest = path.join(postgresBundleDir, "bin");
  const pgLibDest = path.join(postgresBundleDir, "lib");
  const pgShareDest = path.join(postgresBundleDir, "share");

  fs.mkdirSync(pgBinDest, { recursive: true });
  fs.mkdirSync(pgLibDest, { recursive: true });
  fs.mkdirSync(pgShareDest, { recursive: true });

  // Copy necessary bin files
  const requiredExes = ["postgres.exe", "initdb.exe", "pg_ctl.exe", "psql.exe", "createdb.exe"];
  const binFiles = fs.readdirSync(path.join(pgSourceDir, "bin"));
  for (const file of binFiles) {
    if (file.toLowerCase().endsWith(".dll") || requiredExes.includes(file.toLowerCase())) {
      fs.copyFileSync(path.join(pgSourceDir, "bin", file), path.join(pgBinDest, file));
    }
  }
  console.log("✓ Copied PostgreSQL binaries and DLLs");

  // Copy lib and share
  fs.cpSync(path.join(pgSourceDir, "lib"), pgLibDest, { recursive: true });
  fs.cpSync(path.join(pgSourceDir, "share"), pgShareDest, { recursive: true });
  console.log("✓ Copied PostgreSQL lib/ and share/");

  console.log("\n==================================================");
  console.log("   Step 4: Initializing & Pre-seeding Database   ");
  console.log("==================================================");
  const initdbBin = path.join(pgBinDest, "initdb.exe");
  const pgCtlBin = path.join(pgBinDest, "pg_ctl.exe");
  const createdbBin = path.join(pgBinDest, "createdb.exe");

  console.log("Running initdb for data-template...");
  execSync(`"${initdbBin}" -D "${templateDataDir}" -U postgres -A trust -E UTF8 --no-locale`, {
    stdio: "inherit",
  });

  const TEMP_PORT = 54332;
  const tempLog = path.join(templateDataDir, "temp_server.log");
  console.log(`Starting temporary PostgreSQL instance on port ${TEMP_PORT}...`);
  execSync(`"${pgCtlBin}" -D "${templateDataDir}" -o "-p ${TEMP_PORT} -h 127.0.0.1" -l "${tempLog}" start`, {
    stdio: "inherit",
  });

  const isReady = await waitForTcp(TEMP_PORT);
  if (!isReady) {
    throw new Error("Temporary PostgreSQL instance failed to start.");
  }
  console.log("✓ Temporary PostgreSQL instance is online");

  try {
    console.log("Creating database 'ums_dev'...");
    execSync(`"${createdbBin}" -h 127.0.0.1 -p ${TEMP_PORT} -U postgres ums_dev`, {
      stdio: "inherit",
    });

    const tempDbUrl = `postgresql://postgres@127.0.0.1:${TEMP_PORT}/ums_dev`;
    console.log("Applying Prisma schema via db push...");
    execSync("npx prisma db push --skip-generate", {
      env: { ...process.env, DATABASE_URL: tempDbUrl },
      stdio: "inherit",
    });

    console.log("Seeding initial data (users, curriculums, news, roles)...");
    execSync("npx tsx prisma/seed.ts", {
      env: { ...process.env, DATABASE_URL: tempDbUrl, NODE_ENV: "development" },
      stdio: "inherit",
    });
    console.log("✓ Database successfully pushed and seeded!");
  } finally {
    console.log("Stopping temporary PostgreSQL instance...");
    try {
      execSync(`"${pgCtlBin}" -D "${templateDataDir}" stop -m fast`, { stdio: "inherit" });
    } catch {
      // Ignore if already stopped
    }
    if (fs.existsSync(tempLog)) {
      fs.unlinkSync(tempLog);
    }
  }

  console.log("\n==================================================");
  console.log("   Desktop Bundle Successfully Assembled!        ");
  console.log("==================================================");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Desktop build failed:", err);
    process.exit(1);
  });
