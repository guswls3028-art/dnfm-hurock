import { cpSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const root = process.cwd();
const port = process.env.PORT || "3001";
const standaloneDir = path.join(root, ".next", "standalone");
const standaloneServer = path.join(standaloneDir, "server.js");

function copyIfExists(from, to) {
  if (!existsSync(from)) return;
  mkdirSync(path.dirname(to), { recursive: true });
  cpSync(from, to, { recursive: true, force: true });
}

function run(command, args, options = {}) {
  const child = spawn(command, args, {
    stdio: "inherit",
    env: { ...process.env, PORT: port },
    ...options,
  });
  child.on("exit", (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    process.exit(code ?? 0);
  });
}

if (existsSync(standaloneServer)) {
  copyIfExists(path.join(root, ".next", "static"), path.join(standaloneDir, ".next", "static"));
  copyIfExists(path.join(root, "public"), path.join(standaloneDir, "public"));
  run(process.execPath, ["server.js"], { cwd: standaloneDir });
} else {
  const nextBin = process.platform === "win32"
    ? path.join(root, "node_modules", ".bin", "next.cmd")
    : path.join(root, "node_modules", ".bin", "next");
  run(nextBin, ["start", "-p", port], { cwd: root, shell: process.platform === "win32" });
}
