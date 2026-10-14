import { defineConfig } from "vite";
import { crx } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import baseManifest from "./manifest.json";
import path from "path";

// Dashboard URL the extension may connect to; defaults to the public deployment.
const DASHBOARD_URL = process.env.VITE_DASHBOARD_URL || "https://consently.vercel.app";

export default defineConfig({
  plugins: [
    react(),
    crx({
      manifest: {
        ...baseManifest,
        // Inject the configured dashboard into externally_connectable at build time.
        externally_connectable: {
          matches: [
            "http://localhost:3000/*",
            `${DASHBOARD_URL.replace(/\/$/, "")}/*`,
          ],
        },
      },
    }),
  ],
  server: {
    port: 5174,
    strictPort: true,
  },
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
        sidepanel: "src/sidepanel/sidepanel.html",
      },
    },
  },
});
