import type { ProposalStatus } from "@/lib/proposal";
import { PROPOSAL_STATUS_LABELS } from "@/lib/proposal";

const STYLE: Record<ProposalStatus, { background: string; color: string }> = {
  pending: {
    background: "var(--color-outline-variant)",
    color: "var(--color-on-surface)",
  },
  accepted: {
    background: "var(--color-primary)",
    color: "var(--color-on-primary)",
  },
  rejected: {
    background: "var(--color-error-container)",
    color: "var(--color-error)",
  },
  withdrawn: {
    background: "var(--color-outline-variant)",
    color: "var(--color-on-surface-variant)",
  },
};

export function ProposalStatusBadge({ status }: { status: ProposalStatus }) {
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
      {PROPOSAL_STATUS_LABELS[status]}
    </span>
  );
}
