import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  base: "./",
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "svenjs",
  },
  optimizeDeps: {
    exclude: ["svenjs"],
  },
  server: {
    port: 5173,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
