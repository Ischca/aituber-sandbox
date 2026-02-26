import { cpSync, readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const distDir = "dist";
const clientDir = join(distDir, "client");
const serverDir = join(distDir, "server");
const workerDir = join(clientDir, "_worker");

// 1. dist/server/ を dist/client/_worker/ にコピー
if (existsSync(serverDir)) {
  mkdirSync(workerDir, { recursive: true });
  cpSync(serverDir, workerDir, { recursive: true });
  console.log("✅ Copied dist/server/ → dist/client/_worker/");
} else {
  console.warn("⚠️  Warning: dist/server/ not found");
}

// 2. dist/client/wrangler.json を更新
const wranglerPath = join(clientDir, "wrangler.json");
if (existsSync(wranglerPath)) {
  const config = JSON.parse(readFileSync(wranglerPath, "utf-8"));
  config.main = "_worker/index.js";

  if (!config.compatibility_flags) {
    config.compatibility_flags = [];
  }

  if (!config.compatibility_flags.includes("nodejs_compat")) {
    config.compatibility_flags.push("nodejs_compat");
  }

  writeFileSync(wranglerPath, JSON.stringify(config, null, 2));
  console.log("✅ Updated dist/client/wrangler.json with main entry and nodejs_compat");
} else {
  console.warn("⚠️  Warning: dist/client/wrangler.json not found");
}

console.log("\n🎉 Deploy config fix completed!");
