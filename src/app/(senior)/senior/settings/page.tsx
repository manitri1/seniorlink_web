import Link from "next/link";
import { logout } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SeniorSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?returnUrl=/senior/settings");

  const email = user.email ?? "—";

  return (
    <div className="sl-stack">
      <h1 style={{ margin: 0, fontSize: "1.5rem" }}>설정</h1>

      <Card title="계정">
        <dl style={{ margin: 0, display: "grid", gap: "var(--space-unit)" }}>
          <div>
            <dt className="sl-label" style={{ fontSize: "0.875rem", marginBottom: "4px" }}>
              로그인 이메일
            </dt>
            <dd style={{ margin: 0, fontSize: "1rem" }}>{email}</dd>
          </div>
        </dl>
        <p
          style={{
            margin: "var(--space-stack) 0 0",
            fontSize: "0.875rem",
            color: "var(--color-on-surface-variant)",
          }}
        >
          비밀번호 변경·이메일 인증은 Supabase Auth 정책에 따릅니다.
        </p>
      </Card>

      <Card title="세션">
        <p style={{ margin: 0, color: "var(--color-on-surface-variant)" }}>
          이 기기에서 로그아웃하면 다시 이메일과 비밀번호로 로그인해야 합니다.
        </p>
        <form action={logout} style={{ marginTop: "var(--space-stack)" }}>
          <Button type="submit" variant="outline">
            로그아웃
          </Button>
        </form>
      </Card>

      <Card title="바로가기">
        <ul
          style={{
            margin: 0,
            paddingLeft: "1.25rem",
            color: "var(--color-on-surface-variant)",
          }}
        >
          <li>
            <Link href="/senior/profile">내 프로필 편집</Link>
          </li>
          <li>
            <Link href="/senior/dashboard">시니어 대시보드</Link>
          </li>
          <li>
            <Link href="/">공개 랜딩 페이지</Link>
          </li>
        </ul>
      </Card>
    </div>
  );
}
