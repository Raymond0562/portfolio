// Bundles src/ into dist/portfolio.html, a single self-contained fragment for
// Claude Artifacts. The real website is built by Vite: `npm run build`.
// Preview build only: it uses the Tailwind play CDN and Google Fonts. For
// production, compile Tailwind and self-host fonts so the strict CSP in
// vercel.json applies as written.
import { build } from "esbuild";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { renderToString } from "react-dom/server";

const common = {
  bundle: true,
  write: false,
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "warning",
};

const client = await build({ ...common, entryPoints: ["src/artifact.jsx"], format: "iife", minify: true, target: "es2020" });
const js = client.outputFiles[0].text;
const css = await readFile("src/styles.css", "utf8");

// Smoke test: render once on the server so a render-time exception fails the build.
const ssr = await build({ ...common, entryPoints: ["src/Portfolio.jsx"], format: "esm", platform: "node", outfile: "dist/.ssr.mjs", write: true, external: ["react", "react-dom", "lucide-react"] });
void ssr;
const mod = await import(new URL(`./dist/.ssr.mjs?${Date.now()}`, import.meta.url));
const React = (await import("react")).default;
const html = renderToString(React.createElement(mod.default));
if (!html.includes("Raymond Yang")) throw new Error("smoke render produced unexpected output");

const tailwindConfig = `tailwind.config={theme:{extend:{fontFamily:{sans:['Inter','ui-sans-serif','system-ui','-apple-system','Segoe UI','sans-serif'],serif:['Instrument Serif','Iowan Old Style','Georgia','serif'],mono:['JetBrains Mono','ui-monospace','Cascadia Code','Consolas','monospace']}}}}`;

const page = `<title>Raymond Yang</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600;700&display=swap">
<script src="https://cdn.tailwindcss.com/3.4.17"></script>
<script>${tailwindConfig}</script>
<style>
${css}
</style>
<div id="root"></div>
<script>${js}</script>
`;

await mkdir("dist", { recursive: true });
await writeFile("dist/portfolio.html", page);
console.log(`built dist/portfolio.html (${(page.length / 1024).toFixed(0)} KB), smoke render ok (${html.length} chars)`);
