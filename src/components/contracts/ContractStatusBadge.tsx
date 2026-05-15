import type { ContractStatus } from "@/lib/contract";
import { CONTRACT_STATUS_LABELS } from "@/lib/contract";

const STYLE: Record<ContractStatus, { background: string; color: string }> = {
  draft: {
    background: "var(--color-outline-variant)",
    color: "var(--color-on-surface)",
  },
  active: {
    background: "var(--color-primary)",
    color: "var(--color-on-primary)",
  },
  settlement_requested: {
    background: "var(--color-secondary)",
    color: "var(--color-on-secondary)",
  },
  completed: {
    background: "var(--color-outline-variant)",
    color: "var(--color-on-surface-variant)",
  },
  cancelled: {
    background: "var(--color-error-container)",
    color: "var(--color-error)",
  },
};

export function ContractStatusBadge({ status }: { status: ContractStatus }) {
  const s = STYLE[status];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: "999px",
        fontSize: "0.8125rem",
        fontWeight: 600,
        lineHeight: 1.3,
        background: s.background,
        color: s.color,
      }}
    >
      {CONTRACT_STATUS_LABELS[status]}
    </span>
  );
}
