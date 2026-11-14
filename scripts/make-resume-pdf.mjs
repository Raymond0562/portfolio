// Renders the site's resume view to public/Raymond_Yang_Resume.pdf, so every
// device downloads the exact same one-page file instead of printing its own.
//
//   npm run resume-pdf
//
// Needs a Chromium browser. Uses Edge or Chrome if found; set BROWSER to override.
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

const PORT = 4631;
const OUT = resolve("public/Raymond_Yang_Resume.pdf");
const candidates = [
  process.env.BROWSER,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);
const browser = candidates.find((path) => existsSync(path));
if (!browser) throw new Error("No Chromium browser found. Set the BROWSER environment variable.");

mkdirSync("public", { recursive: true });
const npx = process.platform === "win32" ? "npx.cmd" : "npx";
spawnSync(npx, ["vite", "build"], { stdio: "inherit", shell: true });

const server = spawn(npx, ["vite", "preview", "--port", String(PORT), "--strictPort"], { stdio: "ignore", shell: true });
try {
  for (let i = 0; i < 40; i += 1) {
    try {
      if ((await fetch(`http://localhost:${PORT}/`)).ok) break;
    } catch {
      /* not up yet */
    }
    await new Promise((done) => setTimeout(done, 250));
  }
  const result = spawnSync(browser, [
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    "--virtual-time-budget=6000",
    `--print-to-pdf=${OUT}`,
    `http://localhost:${PORT}/#resume`,
  ]);
  if (result.status !== 0 || !existsSync(OUT)) throw new Error("The browser did not produce a PDF.");
  console.log(`wrote ${OUT} (${(statSync(OUT).size / 1024).toFixed(0)} KB)`);
} finally {
  if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"]);
  else server.kill();
}
