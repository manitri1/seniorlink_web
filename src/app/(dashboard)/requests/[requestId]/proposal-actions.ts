"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { mapProposalDbError } from "@/lib/proposal";

export type ProposalActionState = {
  error?: string;
  success?: string;
};

export async function createProposal(
  _prev: ProposalActionState | null,
  formData: FormData
): Promise<ProposalActionState> {
  const requestId = String(formData.get("request_id") ?? "").trim();
  const seniorId = String(formData.get("senior_id") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!requestId || !seniorId) {
    return { error: "후보 정보가 올바르지 않습니다." };
  }
  if (!message) {
    return { error: "제안 메시지를 입력해 주세요." };
  }
  if (message.length > 1000) {
    return { error: "제안 메시지는 1000자 이내입니다." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { data: match, error: mErr } = await supabase
    .from("request_matches")
    .select("fit_score, match_reasons")
    .eq("request_id", requestId)
    .eq("senior_id", seniorId)
    .maybeSingle();

  if (mErr) {
    return { error: mapProposalDbError(mErr) };
  }
  if (!match) {
    return {
      error:
        "해당 후보의 매칭 정보가 없습니다. 매칭 결과 화면을 새로고침한 뒤 다시 시도해 주세요.",
    };
  }

  const { data: dup, error: dErr } = await supabase
    .from("proposals")
    .select("id")
    .eq("request_id", requestId)
    .eq("senior_id", seniorId)
    .eq("status", "pending")
    .maybeSingle();

  if (dErr) {
    return { error: mapProposalDbError(dErr) };
  }
  if (dup) {
    return { error: "이미 제안을 보낸 후보입니다." };
  }

  const { error } = await supabase.from("proposals").insert({
    request_id: requestId,
    senior_id: seniorId,
    fit_score: match.fit_score,
    match_reasons: match.match_reasons,
    message,
    status: "pending",
  });

  if (error) {
    return { error: mapProposalDbError(error) };
  }

  revalidatePath(`/requests/${requestId}/proposals`);
  revalidatePath(`/requests/${requestId}/matches`);
  return { success: "제안이 발송되었습니다." };
}

export async function withdrawProposal(
  _prev: ProposalActionState | null,
  formData: FormData
): Promise<ProposalActionState> {
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
    return { error: "대기중인 제안만 철회할 수 있습니다." };
  }

  const { error } = await supabase
    .from("proposals")
    .update({
      status: "withdrawn",
      updated_at: new Date().toISOString(),
    })
    .eq("id", proposalId)
    .eq("status", "pending");

  if (error) {
    return { error: mapProposalDbError(error) };
  }

  revalidatePath(`/requests/${row.request_id}/proposals`);
  revalidatePath(`/requests/${row.request_id}/matches`);
  return { success: "제안을 철회했습니다." };
}

/**
 * 베타 데모: 시니어 앱에서 제안을 수락한 뒤 계약을 진행한다는 가정으로 `accepted`로 바꿉니다.
 * 운영에서는 시니어 클라이언트·알림만으로 상태를 바꿉니다.
 */
export async function demoAcceptProposal(
  _prev: ProposalActionState | null,
  formData: FormData
): Promise<ProposalActionState> {
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
    return { error: "대기중인 제안만 데모 수락을 적용할 수 있습니다." };
  }

  const { error } = await supabase
    .from("proposals")
    .update({
      status: "accepted",
      updated_at: new Date().toISOString(),
    })
    .eq("id", proposalId)
    .eq("status", "pending");

  if (error) {
    return { error: mapProposalDbError(error) };
  }

  revalidatePath(`/requests/${row.request_id}/proposals`);
  revalidatePath(`/requests/${row.request_id}/matches`);
  revalidatePath("/contracts");
  revalidatePath("/senior/dashboard");
  revalidatePath("/senior/proposals");
  revalidatePath(`/senior/proposals/${proposalId}`);
  return { success: "제안을 수락된 것으로 표시했습니다. 계약을 만들 수 있습니다." };
}
