export const CONTRACT_STATUSES = [
  "draft",
  "active",
  "settlement_requested",
  "completed",
  "cancelled",
] as const;

export type ContractStatus = (typeof CONTRACT_STATUSES)[number];

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  draft: "초안",
  active: "진행중",
  settlement_requested: "정산 요청됨",
  completed: "완료",
  cancelled: "취소",
};

export function isContractStatus(v: string | null | undefined): v is ContractStatus {
  return !!v && (CONTRACT_STATUSES as readonly string[]).includes(v);
}

export const SETTLEMENT_STATUSES = ["pending", "held", "released", "failed"] as const;

export type SettlementStatus = (typeof SETTLEMENT_STATUSES)[number];

export const SETTLEMENT_STATUS_LABELS: Record<SettlementStatus, string> = {
  pending: "대기",
  held: "에스크로 보관",
  released: "정산 완료",
  failed: "실패",
};

export function isSettlementStatus(v: string | null | undefined): v is SettlementStatus {
  return !!v && (SETTLEMENT_STATUSES as readonly string[]).includes(v);
}
