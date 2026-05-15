import type { PostgrestError } from "@supabase/supabase-js";

export const PROPOSAL_STATUSES = [
  "pending",
  "accepted",
  "rejected",
  "withdrawn",
] as const;

export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  pending: "대기중",
  accepted: "수락",
  rejected: "거절",
  withdrawn: "철회",
};

export function isProposalStatus(v: string | null | undefined): v is ProposalStatus {
  return !!v && (PROPOSAL_STATUSES as readonly string[]).includes(v);
}

export function mapProposalDbError(err: PostgrestError): string {
  if (err.code === "23505") {
    return "이미 제안을 보낸 후보입니다.";
  }
  if (err.code === "42501" || /permission denied|RLS/i.test(err.message ?? "")) {
    return "권한이 없습니다. 다시 로그인한 뒤 시도해 주세요.";
  }
  if (/column|schema cache|Could not find/i.test(err.message ?? "")) {
    return "DB 스키마가 최신이 아닐 수 있습니다. proposals·request_matches 마이그레이션을 확인해 주세요.";
  }
  return err.message || "처리 중 오류가 발생했습니다.";
}
