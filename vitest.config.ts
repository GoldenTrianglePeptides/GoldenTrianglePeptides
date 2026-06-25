import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Run with: npm i -D vitest && npx vitest run
// (vitest is intentionally not in package.json so the Vercel build's lockfile
// stays untouched; install it locally / in CI to run these.)
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
