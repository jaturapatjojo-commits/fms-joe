import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

console.log("=== Step 1: Building Next.js Standalone ===");
execSync("npm run build", { stdio: "inherit" });

console.log("=== Step 2: Assembling Standalone Assets ===");
const root = process.cwd();
const standalone = path.join(root, ".next", "standalone");
const staticSrc = path.join(root, ".next", "static");
const staticDest = path.join(standalone, ".next", "static");
const publicSrc = path.join(root, "public");
const publicDest = path.join(standalone, "public");
const envSrc = path.join(root, ".env");
const envDest = path.join(standalone, ".env");

if (!fs.existsSync(staticDest)) {
  fs.mkdirSync(path.dirname(staticDest), { recursive: true });
}
fs.cpSync(staticSrc, staticDest, { recursive: true });
console.log("✓ Copied .next/static -> .next/standalone/.next/static");

if (!fs.existsSync(publicDest)) {
  fs.mkdirSync(publicDest, { recursive: true });
}
fs.cpSync(publicSrc, publicDest, { recursive: true });
console.log("✓ Copied public/ -> .next/standalone/public");

if (fs.existsSync(envSrc)) {
  fs.copyFileSync(envSrc, envDest);
  console.log("✓ Copied .env -> .next/standalone/.env");
}

console.log("=== Standalone Assets Assembled Successfully! ===");
