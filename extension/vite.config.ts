import { defineConfig } from "vite";
import { crx } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import manifest from "./manifest.json";
import path from "path";

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@dashboard": path.resolve(__dirname, "../src"),
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        popup: "src/popup/popup.html",
      },
    },
  },
});
