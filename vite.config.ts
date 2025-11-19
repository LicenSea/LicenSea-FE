import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api/walrus": {
        target: "https://walrus.space",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/walrus/, ""),
      },
      "/api/staketab": {
        target: "https://sui.staketab.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/staketab/, ""),
      },
    },
  },
});
