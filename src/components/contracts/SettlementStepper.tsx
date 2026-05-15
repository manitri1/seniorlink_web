import type { ContractStatus, SettlementStatus } from "@/lib/contract";
import { SETTLEMENT_STATUS_LABELS } from "@/lib/contract";

type Props = {
  contractStatus: ContractStatus;
  settlementStatus: SettlementStatus | null;
};

const STEPS = [
  { key: "draft", label: "계약 초안" },
  { key: "active", label: "TF 진행" },
  { key: "settlement", label: "정산·에스크로" },
  { key: "done", label: "완료" },
] as const;

function stepIndex(contractStatus: ContractStatus, settlementStatus: SettlementStatus | null): number {
  if (contractStatus === "cancelled") return 0;
  if (contractStatus === "draft") return 0;
  if (contractStatus === "active") {
    if (settlementStatus === "held") return 2;
    return 1;
  }
  if (contractStatus === "settlement_requested") return 2;
  if (contractStatus === "completed") return 3;
  return 0;
}

export function SettlementStepper({ contractStatus, settlementStatus }: Props) {
  const current = stepIndex(contractStatus, settlementStatus);
  const settlementLabel =
    settlementStatus != null
      ? SETTLEMENT_STATUS_LABELS[settlementStatus]
      : "—";

  return (
    <div aria-label="계약·정산 진행 단계">
      <ol
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "stretch",
        }}
      >
        {STEPS.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li
              key={step.key}
              style={{
                flex: "1 1 140px",
                minWidth: 0,
                padding: "12px 14px",
                borderRadius: "var(--radius-control)",
                border: `1px solid ${
                  active
                    ? "var(--color-primary)"
                    : "var(--color-outline-variant)"
                }`,
                background: done
                  ? "var(--color-primary-container)"
                  : active
                    ? "var(--color-surface)"
                    : "var(--color-background)",
                color: active ? "var(--color-on-surface)" : "var(--color-on-surface-variant)",
                fontWeight: active ? 600 : 500,
                fontSize: "0.875rem",
              }}
              aria-current={active ? "step" : undefined}
            >
              <span style={{ display: "block", marginBottom: "4px" }}>
                {i + 1}. {step.label}
              </span>
              {step.key === "settlement" && active ? (
                <span style={{ fontSize: "0.8125rem", opacity: 0.9 }}>
                  정산: {settlementLabel}
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
