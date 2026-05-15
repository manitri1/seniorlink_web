import Link from "next/link";
import { ProposalStatusBadge } from "@/components/proposals/ProposalStatusBadge";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { ProposalStatus } from "@/lib/proposal";

function isProposalStatus(v: string): v is ProposalStatus {
  return v === "pending" || v === "accepted" || v === "rejected" || v === "withdrawn";
}

export default async function SeniorProposalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const statusFilter =
    sp.status && isProposalStatus(sp.status) ? sp.status : undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?returnUrl=/senior/proposals");

  const { data: me } = await supabase
    .from("senior_profiles")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!me) {
    return <p>시니어 프로필이 없습니다.</p>;
  }

  let q = supabase
    .from("proposals")
    .select(
      "id, status, created_at, message, tf_requests ( id, title, companies ( name ) )"
    )
    .eq("senior_id", me.id)
    .order("created_at", { ascending: false });

  if (statusFilter) {
    q = q.eq("status", statusFilter);
  }

  const { data: rows, error } = await q;

  if (error) {
    return <p role="alert">목록을 불러오지 못했습니다: {error.message}</p>;
  }

  const list = rows ?? [];

  return (
    <div className="sl-stack">
      <h1 style={{ margin: 0, fontSize: "1.5rem" }}>받은 제안</h1>
      <p style={{ margin: 0, color: "var(--color-on-surface-variant)" }}>
        기업이 보낸 TF 제안을 확인하고 수락하거나 거절할 수 있습니다.
      </p>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {(
          [
            { label: "전체", href: "/senior/proposals" },
            { label: "대기", href: "/senior/proposals?status=pending" },
            { label: "수락", href: "/senior/proposals?status=accepted" },
            { label: "거절", href: "/senior/proposals?status=rejected" },
          ] as const
        ).map((l) => (
          <Link key={l.href} href={l.href} className="sl-button sl-button--outline">
            {l.label}
          </Link>
        ))}
      </div>

      {list.length === 0 ? (
        <p style={{ color: "var(--color-on-surface-variant)" }}>표시할 제안이 없습니다.</p>
      ) : (
        <ul className="sl-stack" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {list.map((row) => {
            const trRaw = row.tf_requests as unknown;
            const trSingle = (Array.isArray(trRaw) ? trRaw[0] : trRaw) as {
              id: string;
              title: string;
              companies: { name: string } | { name: string }[] | null;
            } | null;
            const compRaw = trSingle?.companies;
            const comp = (Array.isArray(compRaw) ? compRaw[0] : compRaw) as { name: string } | null;
            const companyName = comp?.name ?? "기업";
            const title = trSingle?.title ?? "요청";
            return (
              <li
                key={row.id}
                className="sl-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
                  <ProposalStatusBadge status={row.status as ProposalStatus} />
                  <strong>{title}</strong>
                  <span style={{ color: "var(--color-on-surface-variant)", fontSize: "0.875rem" }}>
                    {companyName}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "0.9375rem", color: "var(--color-on-surface-variant)" }}>
                  {(row.message as string | null)?.slice(0, 160)}
                  {(row.message as string | null) && (row.message as string).length > 160 ? "…" : ""}
                </p>
                <Link href={`/senior/proposals/${row.id}`} className="sl-button sl-button--outline">
                  상세 보기
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
