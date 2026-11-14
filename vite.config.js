import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The font files the first screen needs. Without a preload the browser only
// discovers them after it has parsed the CSS and laid out the text, so the
// hero is painted in a fallback font and then reflows when the real one
// arrives (a layout shift). Keep this list to what is visible before
// scrolling: every extra preload competes with the script for bandwidth.
const PRELOAD_FONTS = [
  "inter-latin-400-normal",
  "inter-latin-500-normal",
  "inter-latin-600-normal",
  "instrument-serif-latin-400-italic",
  "jetbrains-mono-latin-400-normal",
];

/** Adds <link rel="preload"> for those fonts, using their hashed build names. */
function preloadFonts() {
  return {
    name: "preload-fonts",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        if (!ctx.bundle) return html; // dev server: nothing is hashed yet
        const tags = Object.keys(ctx.bundle)
          .filter((file) => file.endsWith(".woff2") && PRELOAD_FONTS.some((name) => file.includes(name)))
          .map((file) => ({
            tag: "link",
            // `crossorigin` is required: fonts are always fetched in CORS
            // mode, and a preload without it is fetched twice.
            attrs: { rel: "preload", as: "font", type: "font/woff2", href: `/${file}`, crossorigin: true },
            injectTo: "head",
          }));
        return { html, tags };
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), preloadFonts()],
  build: {
    // Never inline assets as data: URIs, so the strict CSP in vercel.json holds.
    assetsInlineLimit: 0,
    // dist/ also holds the Claude Artifact build (npm run artifact).
    emptyOutDir: false,
  },
});
