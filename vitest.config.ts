import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * O motor do terminal e o conteúdo são TypeScript puro, sem DOM: rodam em
 * Node, sem jsdom e sem React. Só o alias `@/` precisa ser ensinado ao Vite,
 * porque quem resolve isso no build é o Next.
 */
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
