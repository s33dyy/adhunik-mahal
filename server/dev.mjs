import { spawn } from "node:child_process";
import { startServer } from "./index.mjs";

const api = startServer({ port: 8001, apiOnly: true });
const vite = spawn("npm", ["run", "dev:vite"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

function shutdown() {
  api.close();
  vite.kill("SIGTERM");
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
vite.on("exit", (code) => {
  api.close();
  process.exit(code ?? 0);
});

