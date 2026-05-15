import { defineConfig, devices } from "@playwright/test";

/** 문서 계정 로그인 확인 — 로컬 `npm run dev`가 떠 있는 URL로 실행 */
export default defineConfig({
  testDir: "e2e/manual",
  testMatch: "*.spec.ts",
  timeout: 60_000,
  forbidOnly: true,
  reporter: "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3001",
    trace: "on-first-retry",
  },
});
