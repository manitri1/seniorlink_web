import type { PostgrestError } from "@supabase/supabase-js";

export const REQUEST_STATUSES = [
  "open",
  "matching",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export type TfRequestRow = {
  id: string;
  company_id: string;
  title: string;
  field: string;
  duration_weeks: number;
  budget_min: number | null;
  budget_max: number | null;
  goals: string;
  region: string;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  open: "접수중",
  matching: "매칭중",
  in_progress: "진행중",
  completed: "완료",
  cancelled: "취소",
};

export function isRequestStatus(v: string | null | undefined): v is RequestStatus {
  return !!v && (REQUEST_STATUSES as readonly string[]).includes(v);
}

export function mapPostgrestError(err: PostgrestError): string {
  if (err.code === "42501" || /permission denied|RLS/i.test(err.message ?? "")) {
    return "권한이 없습니다. 다시 로그인한 뒤 시도해 주세요.";
  }
  if (/column|schema cache|Could not find/i.test(err.message ?? "")) {
    return "DB 스키마가 최신이 아닐 수 있습니다. `tf_requests` 마이그레이션 적용 여부를 확인해 주세요.";
  }
  return err.message || "처리 중 오류가 발생했습니다.";
}
