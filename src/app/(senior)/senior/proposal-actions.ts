"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { mapProposalDbError } from "@/lib/proposal";

export type SeniorProposalActionState = {
  error?: string;
  success?: string;
};

/** 시니어 본인의 대기 제안을 거절합니다. */
export async function seniorRejectProposal(
  _prev: SeniorProposalActionState | null,
  formData: FormData
): Promise<SeniorProposalActionState> {
  const proposalId = String(formData.get("proposal_id") ?? "").trim();
  if (!proposalId) {
    return { error: "제안 정보가 없습니다." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { data: row, error: fErr } = await supabase
    .from("proposals")
    .select("id, status, request_id")
    .eq("id", proposalId)
    .maybeSingle();

  if (fErr) {
    return { error: mapProposalDbError(fErr) };
  }
  if (!row) {
    return { error: "제안을 찾을 수 없습니다." };
  }
  if (row.status !== "pending") {
    return { error: "대기중인 제안만 거절할 수 있습니다." };
  }

  const { error } = await supabase
    .from("proposals")
    .update({
      status: "rejected",
      updated_at: new Date().toISOString(),
    })
    .eq("id", proposalId)
    .eq("status", "pending");

  if (error) {
    return { error: mapProposalDbError(error) };
  }

  revalidatePath("/senior/dashboard");
  revalidatePath("/senior/proposals");
  revalidatePath(`/senior/proposals/${proposalId}`);
  revalidatePath(`/requests/${row.request_id}/proposals`);
  return { success: "제안을 거절했습니다." };
}
