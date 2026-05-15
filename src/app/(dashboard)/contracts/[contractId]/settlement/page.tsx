import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getContractById } from "@/lib/contract-server";
import { isContractStatus, isSettlementStatus, SETTLEMENT_STATUS_LABELS, type SettlementStatus } from "@/lib/contract";
import { SettlementStepper } from "@/components/contracts/SettlementStepper";
import { Card } from "@/components/ui/Card";
import { RequestSettlementForm } from "./RequestSettlementForm";
import { CompleteSettlementForm } from "./CompleteSettlementForm";

export default async function ContractSettlementPage({
  params,
}: {
  params: Promise<{ contractId: string }>;
}) {
  const { contractId } = await params;
  const { row } = await getContractById(contractId);
  if (!row) {
    notFound();
  }

  const cst = isContractStatus(row.status) ? row.status : "draft";
  const supabase = await createClient();
  const { data: settlement, error } = await supabase
    .from("settlements")
    .select("*")
    .eq("contract_id", contractId)
    .maybeSingle();

  if (error) {
    return (
      <p className="sl-field__error" role="alert">
        정산 정보를 불러오지 못했습니다: {error.message}
      </p>
    );
  }

  let sst: SettlementStatus | null = null;
  if (settlement && isSettlementStatus(settlement.status)) {
    sst = settlement.status;
  }

  return (
    <div className="sl-stack">
      <p style={{ margin: 0 }}>
        <Link href={`/contracts/${contractId}`} style={{ fontSize: "0.9375rem" }}>
          ← 계약 상세
        </Link>
      </p>

      <h1 style={{ margin: 0 }}>정산</h1>

      <Card title="진행 단계">
        <SettlementStepper contractStatus={cst} settlementStatus={sst} />
      </Card>

      {settlement ? (
        <Card title="정산 정보">
          <dl
            style={{
              margin: 0,
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: "8px 16px",
              fontSize: "0.9375rem",
            }}
          >
            <dt style={{ color: "var(--color-on-surface-variant)" }}>금액</dt>
            <dd style={{ margin: 0 }}>
              {Number(settlement.amount).toLocaleString("ko-KR")}원
            </dd>
            <dt style={{ color: "var(--color-on-surface-variant)" }}>상태</dt>
            <dd style={{ margin: 0 }}>
              {sst ? SETTLEMENT_STATUS_LABELS[sst] : String(settlement.status)}
            </dd>
          </dl>
        </Card>
      ) : (
        <Card title="정산 정보">
          <p style={{ margin: 0, color: "var(--color-on-surface-variant)" }}>
            정산 행이 없습니다. 계약 상세에서 <strong>계약 시작</strong>을 먼저
            실행해 주세요.
          </p>
        </Card>
      )}

      {row.status === "active" && settlement?.status === "pending" ? (
        <Card title="정산 요청 (데모)">
          <p style={{ margin: "0 0 var(--space-stack)", color: "var(--color-on-surface-variant)" }}>
            실제 서비스에서는 토스 등 결제·에스크로 API와 웹훅으로 상태가
            바뀝니다. 여기서는 대시보드 액션으로 흐름만 시뮬레이션합니다.
          </p>
          <RequestSettlementForm contractId={contractId} />
        </Card>
      ) : null}

      {row.status === "settlement_requested" && settlement?.status === "held" ? (
        <Card title="정산 완료 (데모)">
          <p style={{ margin: "0 0 var(--space-stack)", color: "var(--color-on-surface-variant)" }}>
            에스크로 보관 이후 정산 확정 시 계약이 <strong>완료</strong>로
            바뀝니다.
          </p>
          <CompleteSettlementForm contractId={contractId} />
        </Card>
      ) : null}
    </div>
  );
}
