import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SeniorContractsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?returnUrl=/senior/contracts");

  const { data: me } = await supabase
    .from("senior_profiles")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!me) return <p>시니어 프로필이 없습니다.</p>;

  const { data: propIds } = await supabase.from("proposals").select("id").eq("senior_id", me.id);
  const ids = propIds?.map((p) => p.id) ?? [];
  if (ids.length === 0) {
    return (
      <div className="sl-stack">
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>계약</h1>
        <p style={{ color: "var(--color-on-surface-variant)" }}>연결된 계약이 없습니다.</p>
      </div>
    );
  }

  const { data: rows, error } = await supabase
    .from("contracts")
    .select("id, status, progress, start_date, end_date, proposals ( id, tf_requests ( title ) )")
    .in("proposal_id", ids)
    .order("created_at", { ascending: false });

  if (error) {
    return <p role="alert">목록을 불러오지 못했습니다: {error.message}</p>;
  }

  const list = rows ?? [];

  return (
    <div className="sl-stack">
      <h1 style={{ margin: 0, fontSize: "1.5rem" }}>계약</h1>
      <p style={{ margin: 0, color: "var(--color-on-surface-variant)" }}>
        수락한 제안으로 생성된 계약을 조회합니다.
      </p>
      {list.length === 0 ? (
        <p>계약이 없습니다.</p>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }} className="sl-stack">
          {list.map((c) => {
            const prRaw = c.proposals as unknown;
            const pr = (
              Array.isArray(prRaw) ? prRaw[0] : prRaw
            ) as { id: string; tf_requests: { title: string } | null } | null;
            const title = pr?.tf_requests?.title ?? "TF";
            return (
              <li key={c.id} className="sl-card">
                <strong>{title}</strong>
                <p style={{ margin: "8px 0 0", fontSize: "0.875rem", color: "var(--color-on-surface-variant)" }}>
                  상태: {c.status} · 진행률 {c.progress}%
                </p>
                <p style={{ margin: "4px 0 0", fontSize: "0.875rem" }}>
                  기간: {c.start_date} ~ {c.end_date}
                </p>
              </li>
            );
          })}
        </ul>
      )}
      <p>
        <Link href="/senior/proposals">← 제안 목록</Link>
      </p>
    </div>
  );
}
