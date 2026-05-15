import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isContractStatus } from "@/lib/contract";

export type ContractDetailRow = {
  id: string;
  proposal_id: string;
  start_date: string;
  end_date: string;
  role_scope: string;
  compensation: number;
  status: string;
  pdf_url: string | null;
  progress: number;
  created_at: string;
  updated_at: string;
  proposals: {
    id: string;
    senior_id: string;
    request_id: string;
    senior_profiles: { display_name: string } | { display_name: string }[] | null;
    tf_requests: { id: string; title: string } | { id: string; title: string }[] | null;
  } | null;
};

function unwrap<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export const getContractById = cache(
  async (
    contractId: string
  ): Promise<{ row: ContractDetailRow | null; error?: string }> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("contracts")
      .select(
        `
        *,
        proposals (
          id,
          senior_id,
          request_id,
          senior_profiles ( display_name ),
          tf_requests ( id, title )
        )
      `
      )
      .eq("id", contractId)
      .maybeSingle();

    if (error) {
      return { row: null, error: error.message };
    }
    if (!data) {
      return { row: null };
    }
    if (!isContractStatus(data.status)) {
      return { row: null, error: "알 수 없는 계약 상태입니다." };
    }
    return { row: data as ContractDetailRow };
  }
);

export function nestedSeniorName(row: ContractDetailRow): string {
  const sp = unwrap(row.proposals?.senior_profiles);
  return sp?.display_name ?? "—";
}

export function nestedRequestTitle(row: ContractDetailRow): string {
  const tr = unwrap(row.proposals?.tf_requests);
  return tr?.title ?? "—";
}
