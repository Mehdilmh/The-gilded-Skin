import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
    env: { AMAZON_ASSOCIATE_TAG: "gettse00-20", NEXT_PUBLIC_SITE_URL: "https://thegildedskin.com", SITE_ENV: "production" },
  },
});
