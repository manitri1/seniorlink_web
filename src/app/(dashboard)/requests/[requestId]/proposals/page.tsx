import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ensureRequestMatches } from "@/lib/request-matches";
import { isProposalStatus } from "@/lib/proposal";
import { ProposalStatusBadge } from "@/components/proposals/ProposalStatusBadge";
import { Card } from "@/components/ui/Card";
import { ProposalComposer } from "./ProposalComposer";
import { WithdrawProposalForm } from "./WithdrawProposalForm";
import { DemoAcceptProposalForm } from "./DemoAcceptProposalForm";

function isUuidLike(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    s
  );
}

type ProposalListRow = {
  id: string;
  senior_id: string;
  message: string | null;
  status: string;
  created_at: string;
  senior_profiles:
    | { display_name: string }
    | { display_name: string }[]
    | null;
};

function proposalSeniorName(
  sp: ProposalListRow["senior_profiles"]
): string {
  if (!sp) return "이름 미상";
  const one = Array.isArray(sp) ? sp[0] : sp;
  return one?.display_name ?? "이름 미상";
}

export default async function RequestProposalsPage({
  params,
  searchParams,
}: {
  params: Promise<{ requestId: string }>;
  searchParams: Promise<{ senior?: string }>;
}) {
  const { requestId } = await params;
  const sp = await searchParams;
  const rawSenior = typeof sp.senior === "string" ? sp.senior.trim() : "";
  const defaultSeniorId = rawSenior && isUuidLike(rawSenior) ? rawSenior : null;

  const supabase = await createClient();
  const ensured = await ensureRequestMatches(supabase, requestId);
  if ("error" in ensured) {
    return (
      <p className="sl-field__error" role="alert">
        {ensured.error}
      </p>
    );
  }

  const { data: proposals, error } = await supabase
    .from("proposals")
    .select(
      "id, senior_id, message, status, created_at, senior_profiles ( display_name )"
    )
    .eq("request_id", requestId)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <p className="sl-field__error" role="alert">
        제안 목록을 불러오지 못했습니다: {error.message}
      </p>
    );
  }

  const list = (proposals ?? []) as unknown as ProposalListRow[];

  const proposalIds = list.map((p) => p.id);
  const contractByProposal = new Map<string, string>();
  if (proposalIds.length > 0) {
    const { data: contractRows } = await supabase
      .from("contracts")
      .select("id, proposal_id")
      .in("proposal_id", proposalIds);
    for (const c of contractRows ?? []) {
      if (c.proposal_id && c.id) {
        contractByProposal.set(String(c.proposal_id), String(c.id));
      }
    }
  }

  return (
    <div className="sl-stack">
      <p style={{ margin: 0 }}>
        <Link href={`/requests/${requestId}`} style={{ fontSize: "0.9375rem" }}>
          ← 요청 개요
        </Link>
      </p>

      <ProposalComposer requestId={requestId} defaultSeniorId={defaultSeniorId} />

      <Card title="보낸 제안">
        <p
          style={{
            margin: "0 0 var(--space-stack)",
            fontSize: "0.875rem",
            color: "var(--color-on-surface-variant)",
          }}
        >
          시니어 앱에서의 수락은 <strong>데모: 수락 처리</strong>로 대체한 뒤 계약을
          만들 수 있습니다.
        </p>
        {list.length === 0 ? (
          <p style={{ margin: 0, color: "var(--color-on-surface-variant)" }}>
            아직 제안이 없습니다. 매칭 결과에서 후보를 선택해 발송해 보세요.
          </p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}
          >
            {list.map((row, index) => {
              const st = isProposalStatus(row.status) ? row.status : null;
              const name = proposalSeniorName(row.senior_profiles);
              const created = new Date(row.created_at).toLocaleString("ko-KR", {
                dateStyle: "short",
                timeStyle: "short",
              });
              const isLast = index === list.length - 1;

              return (
                <li
                  key={row.id}
                  style={{
                    padding: "24px 0",
                    borderBottom: isLast
                      ? "none"
                      : "1px solid var(--color-outline-variant)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "16px",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ flex: "1 1 280px", minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "10px",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <strong style={{ fontSize: "1.0625rem" }}>{name}</strong>
                        {st ? <ProposalStatusBadge status={st} /> : (
                          <span style={{ fontSize: "0.875rem" }}>{row.status}</span>
                        )}
                        <span
                          style={{
                            fontSize: "0.8125rem",
                            color: "var(--color-on-surface-variant)",
                          }}
                        >
                          {created}
                        </span>
                      </div>
                      <p
                        style={{
                          margin: 0,
                          whiteSpace: "pre-wrap",
                          lineHeight: 1.6,
                          fontSize: "0.9375rem",
                        }}
                      >
                        {row.message ?? "—"}
                      </p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        alignItems: "flex-end",
                      }}
                    >
                    {row.status === "pending" ? (
                      <>
                        <WithdrawProposalForm proposalId={row.id} />
                        <DemoAcceptProposalForm proposalId={row.id} />
                      </>
                    ) : null}
                    {row.status === "accepted" ? (
                      contractByProposal.has(row.id) ? (
                        <Link
                          href={`/contracts/${contractByProposal.get(row.id)}`}
                          className="sl-button sl-button--outline"
                          style={{ display: "inline-flex", textDecoration: "none" }}
                        >
                          계약 보기
                        </Link>
                      ) : (
                        <Link
                          href={`/contracts/new?proposalId=${row.id}`}
                          className="sl-button sl-button--cta"
                          style={{ display: "inline-flex", textDecoration: "none" }}
                        >
                          계약 만들기
                        </Link>
                      )
                    ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
