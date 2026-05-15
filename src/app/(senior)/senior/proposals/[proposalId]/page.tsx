import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProposalStatusBadge } from "@/components/proposals/ProposalStatusBadge";
import { createClient } from "@/lib/supabase/server";
import type { ProposalStatus } from "@/lib/proposal";
import { SeniorAcceptProposalForm } from "@/app/(senior)/senior/proposals/SeniorAcceptProposalForm";
import { SeniorRejectProposalForm } from "@/app/(senior)/senior/proposals/SeniorRejectProposalForm";

export default async function SeniorProposalDetailPage({
  params,
}: {
  params: Promise<{ proposalId: string }>;
}) {
  const { proposalId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?returnUrl=/senior/proposals/${proposalId}`);

  const { data: row, error } = await supabase
    .from("proposals")
    .select(
      "id, status, message, created_at, tf_requests ( id, title, goals, field, region, companies ( name ) )"
    )
    .eq("id", proposalId)
    .maybeSingle();

  if (error || !row) {
    notFound();
  }

  const trRaw = row.tf_requests as unknown;
  const trSingle = (Array.isArray(trRaw) ? trRaw[0] : trRaw) as {
    id: string;
    title: string;
    goals: string;
    field: string;
    region: string;
    companies: { name: string } | { name: string }[] | null;
  } | null;

  const companiesRaw = trSingle?.companies;
  const companySingle = (
    Array.isArray(companiesRaw) ? companiesRaw[0] : companiesRaw
  ) as { name: string } | null;

  const tr = trSingle
    ? {
        ...trSingle,
        companies: companySingle,
      }
    : null;

  return (
    <div className="sl-stack">
      <p style={{ margin: 0 }}>
        <Link href="/senior/proposals">← 받은 제안 목록</Link>
      </p>
      <h1 style={{ margin: 0, fontSize: "1.5rem" }}>{tr?.title ?? "제안 상세"}</h1>
      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        <ProposalStatusBadge status={row.status as ProposalStatus} />
        <span style={{ color: "var(--color-on-surface-variant)" }}>
          {tr?.companies?.name ?? "기업"}
        </span>
      </div>

      <section className="sl-card">
        <h2 className="sl-card__header" style={{ marginTop: 0 }}>
          요청 개요
        </h2>
        <dl style={{ margin: 0, display: "grid", gap: "12px" }}>
          <div>
            <dt className="sl-label">분야</dt>
            <dd style={{ margin: 0 }}>{tr?.field}</dd>
          </div>
          <div>
            <dt className="sl-label">지역</dt>
            <dd style={{ margin: 0 }}>{tr?.region}</dd>
          </div>
          <div>
            <dt className="sl-label">목표</dt>
            <dd style={{ margin: 0, whiteSpace: "pre-wrap" }}>{tr?.goals}</dd>
          </div>
        </dl>
      </section>

      <section className="sl-card">
        <h2 className="sl-card__header" style={{ marginTop: 0 }}>
          기업 메시지
        </h2>
        <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{row.message ?? "—"}</p>
      </section>

      {row.status === "pending" ? (
        <section className="sl-card">
          <h2 className="sl-card__header" style={{ marginTop: 0 }}>
            응답
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "flex-start" }}>
            <SeniorAcceptProposalForm proposalId={row.id} />
            <SeniorRejectProposalForm proposalId={row.id} />
          </div>
          <p style={{ margin: "var(--space-stack) 0 0", fontSize: "0.875rem", color: "var(--color-on-surface-variant)" }}>
            수락 후에는 기업이 계약 초안을 만들 수 있습니다.
          </p>
        </section>
      ) : row.status === "accepted" ? (
        <p>
          <Link href={`/senior/contracts`}>계약 목록에서 진행 상황 확인 →</Link>
        </p>
      ) : null}
    </div>
  );
}
