/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Mirrors the "@/*" path in tsconfig.json so `@/components/...`
      // resolves identically for the TS compiler and the Vite bundler.
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
  // Single source of truth for the "@" alias and the React plugin — a
  // separate vitest.config.ts would silently drift from this file the
  // first time someone changes one and forgets the other.
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: false, // explicit `import { describe, it, expect }` — matches the rest of the codebase's no-implicit-globals style
    css: false, // Tailwind's utility classes don't need real CSS to assert on; skip parsing for speed
  },
});