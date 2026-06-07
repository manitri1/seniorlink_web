/**
 * 로그인 스모크 — **Supabase가 허용하는 실제 수신 가능 도메인**만 사용하세요.
 * `@example.com` 등은 Auth에서 거절됩니다.
 *
 *   set E2E_COMPANY_EMAIL=본인계정+slweb@gmail.com
 *   set E2E_COMPANY_PASSWORD=TestPassw0rd!
 *   set PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001
 *   npm run test:e2e:doc-login
 */
import { test, expect } from "@playwright/test";

const EMAIL = process.env.E2E_COMPANY_EMAIL?.trim();
const PASSWORD = process.env.E2E_COMPANY_PASSWORD?.trim() ?? "TestPassw0rd!";

test("환경 변수 계정으로 로그인 → 대시보드", async ({ page }) => {
  if (!EMAIL) {
    test.skip(
      true,
      "E2E_COMPANY_EMAIL 미설정. docs/test_usecase.md TU-P2-00 참고 — @example.com 은 사용할 수 없습니다."
    );
    return;
  }

  await page.goto("/login");
  await page.getByLabel("이메일").fill(EMAIL);
  await page.getByLabel("비밀번호").fill(PASSWORD);
  await page.getByRole("button", { name: "로그인" }).click();

  await page.waitForTimeout(2500);

  if (!page.url().includes("/dashboard")) {
    const alerts = page.locator('[role="alert"]');
    const n = await alerts.count();
    const parts: string[] = [];
    for (let i = 0; i < n; i++) {
      const t = await alerts.nth(i).textContent();
      if (t?.trim()) parts.push(t.trim());
    }
    const hint = parts.length ? parts.join(" | ") : "(알림 없음)";
    throw new Error(
      `로그인 후 대시보드로 이동하지 않았습니다.\n` +
        `  URL: ${page.url()}\n` +
        `  알림: ${hint}\n` +
        `  이메일 인증·비밀번호·E2E_COMPANY_EMAIL 값을 확인하세요.`
    );
  }

  await expect(page.getByRole("navigation", { name: "주요 메뉴" })).toBeVisible();
});
