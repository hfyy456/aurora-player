import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    alias: {
      "@": path.join(__dirname, "renderer"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: { additionalData: `@import "renderer/styles/_funs.scss";` },
    },
  },
  plugins: [react()],
});
