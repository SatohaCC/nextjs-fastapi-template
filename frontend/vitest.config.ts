import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { stylexVitePlugin } from "./config/stylexVitePlugin";

export default defineConfig({
  plugins: [stylexVitePlugin({ rootDir: __dirname, test: true }), react()],
  cacheDir: path.resolve(__dirname, "../.cache/vitest"),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
