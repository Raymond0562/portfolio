import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // Never inline assets as data: URIs, so the strict CSP in vercel.json holds.
    assetsInlineLimit: 0,
    // dist/ also holds the Claude Artifact build (npm run artifact).
    emptyOutDir: false,
  },
});
