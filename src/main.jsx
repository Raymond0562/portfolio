import React from "react";
import { createRoot } from "react-dom/client";

// Self-hosted fonts (no third-party requests, so font-src 'self' holds).
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/jetbrains-mono/latin-400.css";
import "@fontsource/jetbrains-mono/latin-500.css";
import "@fontsource/jetbrains-mono/latin-600.css";
import "@fontsource/instrument-serif/latin-400.css";
import "@fontsource/instrument-serif/latin-400-italic.css";

// Order matters: Tailwind's reset, then the site styles, then utilities on top.
import "./tailwind-base.css";
import "./styles.css";
import "./tailwind-utilities.css";

import Portfolio from "./Portfolio.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Portfolio />
  </React.StrictMode>
);
