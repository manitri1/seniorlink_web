import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SeniorDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?returnUrl=/senior/dashboard");

  const { data: sp } = await supabase
    .from("senior_profiles")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!sp) {
    return (
      <div className="sl-stack">
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>대시보드</h1>
        <p style={{ color: "var(--color-on-surface-variant)" }}>
          시니어 프로필 행이 아직 없습니다. 관리자에게 문의하거나 마이그레이션·가입 트리거를 확인해 주세요.
        </p>
      </div>
    );
  }

  const seniorId = sp.id;

  const [{ count: pendingCount }, { count: acceptedCount }, { data: propRows }] = await Promise.all([
    supabase
      .from("proposals")
      .select("id", { count: "exact", head: true })
      .eq("senior_id", seniorId)
      .eq("status", "pending"),
    supabase
      .from("proposals")
      .select("id", { count: "exact", head: true })
      .eq("senior_id", seniorId)
      .eq("status", "accepted"),
    supabase.from("proposals").select("id").eq("senior_id", seniorId),
  ]);

  const propIds = propRows?.map((r) => r.id) ?? [];
  let contractCount = 0;
  if (propIds.length > 0) {
    const { count } = await supabase
      .from("contracts")
      .select("id", { count: "exact", head: true })
      .in("proposal_id", propIds);
    contractCount = count ?? 0;
  }

  return (
    <div className="sl-stack">
      <h1 style={{ margin: 0, fontSize: "1.5rem" }}>대시보드</h1>
      <p style={{ margin: 0, color: "var(--color-on-surface-variant)" }}>
        받은 제안과 계약 진행을 한곳에서 확인합니다.
      </p>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: "var(--space-stack)",
        }}
      >
        {[
          { label: "대기 제안", value: pendingCount ?? 0, href: "/senior/proposals?status=pending" },
          { label: "수락됨", value: acceptedCount ?? 0, href: "/senior/proposals?status=accepted" },
          { label: "계약", value: contractCount, href: "/senior/contracts" },
        ].map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="sl-card"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <p className="sl-label" style={{ margin: 0 }}>
              {c.label}
            </p>
            <p style={{ margin: "8px 0 0", fontSize: "1.75rem", fontWeight: 700 }}>{c.value}</p>
          </Link>
        ))}
      </section>

      <p style={{ margin: 0, fontSize: "0.9375rem" }}>
        <Link href="/senior/proposals">받은 제안 목록으로 이동 →</Link>
      </p>
    </div>
  );
}
