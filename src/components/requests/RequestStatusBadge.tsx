import type { RequestStatus } from "@/lib/tf-request";
import { REQUEST_STATUS_LABELS } from "@/lib/tf-request";

const STATUS_STYLE: Record<
  RequestStatus,
  { background: string; color: string }
> = {
  open: {
    background: "var(--color-primary)",
    color: "var(--color-on-primary)",
  },
  matching: {
    background: "var(--color-outline-variant)",
    color: "var(--color-on-surface)",
  },
  in_progress: {
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

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const s = STATUS_STYLE[status];
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
      {REQUEST_STATUS_LABELS[status]}
    </span>
  );
}
