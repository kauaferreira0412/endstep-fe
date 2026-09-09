import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

const API_TARGET = process.env.VITE_API_TARGET ?? "http://localhost:8080";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5174,
    proxy: {
      "/api": { target: API_TARGET, changeOrigin: true },
      "/actuator": { target: API_TARGET, changeOrigin: true },
      "/ws": { target: API_TARGET, changeOrigin: true, ws: true },

      "/oauth2": { target: API_TARGET, changeOrigin: true },
    },
  },
});
