import localFont from "next/font/local";

/*
 * Self-hosted, subset fonts (built with fontTools from Google Fonts):
 *   Syne 600–800 (display) · Inter Tight 400–600 (UI/body) · DM Mono 400 (labels)
 * Only display + sans are preloaded (two files, ~50 KB together).
 */

export const display = localFont({
  src: "../app/fonts/Syne-600-800.woff2",
  variable: "--f-display",
  weight: "600 800",
  display: "swap",
  preload: true,
  fallback: ["Arial Black", "Arial", "sans-serif"],
  adjustFontFallback: "Arial",
});

export const sans = localFont({
  src: "../app/fonts/InterTight-400-600.woff2",
  variable: "--f-sans",
  weight: "400 600",
  display: "swap",
  preload: true,
  fallback: ["Arial", "sans-serif"],
  adjustFontFallback: "Arial",
});

export const mono = localFont({
  src: "../app/fonts/DMMono-400.woff2",
  variable: "--f-mono",
  weight: "400",
  display: "swap",
  preload: false,
  fallback: ["Courier New", "monospace"],
  adjustFontFallback: false,
});

export const fontVariables = `${display.variable} ${sans.variable} ${mono.variable}`;
