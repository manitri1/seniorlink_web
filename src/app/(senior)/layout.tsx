import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/(auth)/actions";
import { SeniorNav } from "@/components/layout/SeniorNav";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";

export default async function SeniorShellLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?returnUrl=/senior/dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "senior") {
    redirect("/dashboard");
  }

  return (
    <div className="sl-shell">
      <aside className="sl-sidebar">
        <div className="sl-sidebar__brand">Seniorlink</div>
        <SeniorNav />
        <div style={{ marginTop: "auto", fontSize: "0.8125rem", opacity: 0.75 }}>
          <Link href="/" style={{ color: "inherit" }}>
            ← 공개 홈
          </Link>
        </div>
      </aside>
      <div className="sl-main-wrap">
        <header className="sl-topbar">
          <span className="sl-topbar__title">시니어 워크스페이스</span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: "0.875rem",
                color: "var(--color-on-surface-variant)",
              }}
            >
              {user.email}
            </span>
            <form action={logout}>
              <Button type="submit" variant="outline">
                로그아웃
              </Button>
            </form>
          </div>
        </header>
        <main className="sl-content">
          <div className="sl-content__inner">{children}</div>
        </main>
      </div>
    </div>
  );
}
