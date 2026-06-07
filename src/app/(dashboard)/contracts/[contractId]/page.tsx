import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getContractById,
  nestedRequestTitle,
  nestedSeniorName,
} from "@/lib/contract-server";
import { isContractStatus } from "@/lib/contract";
import { ContractStatusBadge } from "@/components/contracts/ContractStatusBadge";
import { Card } from "@/components/ui/Card";
import { ContractProgressForm } from "./ContractProgressForm";
import { ContractActivateForm } from "./ContractActivateForm";
import { ContractReviewSection } from "./ContractReviewSection";
import { GeneratePdfForm } from "./GeneratePdfForm";

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ contractId: string }>;
}) {
  const { contractId } = await params;
  const { row, error } = await getContractById(contractId);
  if (error || !row) {
    notFound();
  }

  const st = isContractStatus(row.status) ? row.status : null;
  const supabase = await createClient();

  const { data: reviewer } = await supabase.auth.getUser();
  const uid = reviewer.user?.id;
  let hasReview = false;
  if (uid && row.status === "completed") {
    const { data: rv } = await supabase
      .from("contract_reviews")
      .select("id")
      .eq("contract_id", contractId)
      .eq("reviewer_id", uid)
      .maybeSingle();
    hasReview = !!rv;
  }

  const seniorId = row.proposals?.senior_id ?? "";

  return (
    <div className="sl-stack">
      <p style={{ margin: 0 }}>
        <Link href="/contracts" style={{ fontSize: "0.9375rem" }}>
          ← 계약 목록
        </Link>
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1 style={{ margin: 0 }}>{nestedRequestTitle(row)}</h1>
        {st ? <ContractStatusBadge status={st} /> : row.status}
      </div>

      <Card title="개요">
        <dl
          style={{
            margin: 0,
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: "8px 20px",
            fontSize: "0.9375rem",
          }}
        >
          <dt style={{ color: "var(--color-on-surface-variant)" }}>시니어</dt>
          <dd style={{ margin: 0 }}>{nestedSeniorName(row)}</dd>
          <dt style={{ color: "var(--color-on-surface-variant)" }}>기간</dt>
          <dd style={{ margin: 0 }}>
            {row.start_date} ~ {row.end_date}
          </dd>
          <dt style={{ color: "var(--color-on-surface-variant)" }}>보수</dt>
          <dd style={{ margin: 0 }}>
            {row.compensation.toLocaleString("ko-KR")}원
          </dd>
          <dt style={{ color: "var(--color-on-surface-variant)" }}>진행률</dt>
          <dd style={{ margin: 0 }}>{row.progress}%</dd>
          <dt style={{ color: "var(--color-on-surface-variant)" }}>PDF</dt>
          <dd style={{ margin: 0, display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            {row.pdf_url ? (
              <a href={row.pdf_url} target="_blank" rel="noreferrer">열기</a>
            ) : null}
            <GeneratePdfForm contractId={contractId} />
          </dd>
        </dl>
        <div style={{ marginTop: "var(--space-stack)" }}>
          <h3 style={{ margin: "0 0 8px", fontSize: "1rem" }}>역할·범위</h3>
          <p style={{ margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
            {row.role_scope}
          </p>
        </div>
      </Card>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
        <Link
          href={`/contracts/${contractId}/settlement`}
          className="sl-button sl-button--outline"
          style={{ display: "inline-flex", textDecoration: "none" }}
        >
          정산 화면
        </Link>
      </div>

      {row.status === "draft" ? (
        <Card title="계약 시작">
          <p style={{ margin: "0 0 var(--space-stack)", color: "var(--color-on-surface-variant)" }}>
            시작하면 상태가 <strong>진행중</strong>으로 바뀌고, 정산(에스크로) 행이
            생성됩니다.
          </p>
          <ContractActivateForm contractId={contractId} />
        </Card>
      ) : null}

      {row.status === "active" ? (
        <Card title="진행률">
          <ContractProgressForm contractId={contractId} initialProgress={row.progress} />
        </Card>
      ) : null}

      {row.status === "completed" && seniorId && !hasReview ? (
        <ContractReviewSection contractId={contractId} seniorId={seniorId} />
      ) : null}

      {row.status === "completed" && hasReview ? (
        <Card title="후기">
          <p style={{ margin: 0, color: "var(--color-on-surface-variant)" }}>
            이 계약에 대한 후기를 등록했습니다.
          </p>
        </Card>
      ) : null}
    </div>
  );
}
