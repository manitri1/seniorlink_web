import { test, expect } from "@playwright/test";

test.describe("Phase 8 스모크 (공개·인증 경계)", () => {
  test("랜딩: 헤드라인·로그인·가입", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /퇴직 시니어 전문가와 단기 TF/i })
    ).toBeVisible();
    await expect(page.getByRole("navigation", { name: "계정" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "로그인", exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "기업 회원가입", exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "시니어 회원가입", exact: true })
    ).toBeVisible();
  });

  test("로그인: 폼 필드", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "로그인" })).toBeVisible();
    await expect(page.getByLabel("이메일")).toBeVisible();
    await expect(page.getByLabel("비밀번호")).toBeVisible();
  });

  test("가입: 기업 폼 노출", async ({ page }) => {
    await page.goto("/signup");
    await expect(
      page.getByRole("heading", { name: "회원가입 (기업)" })
    ).toBeVisible();
  });

  test("가입: 시니어 폼 노출", async ({ page }) => {
    await page.goto("/signup?role=senior");
    await expect(
      page.getByRole("heading", { name: "회원가입 (시니어)" })
    ).toBeVisible();
  });

  test("비로그인 시 시니어 경로는 로그인으로 리다이렉트", async ({ page }) => {
    await page.goto("/senior/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("비로그인 시 대시보드는 로그인으로 리다이렉트", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
