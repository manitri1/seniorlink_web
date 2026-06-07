"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { mapProposalDbError } from "@/lib/proposal";

export type ContractActionState = {
  error?: string;
  success?: string;
};

function parseIsoDate(raw: string): string | null {
  const t = raw.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
  const d = new Date(`${t}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  return t;
}

export async function createContract(
  _prev: ContractActionState | null,
  formData: FormData
): Promise<ContractActionState> {
  const proposalId = String(formData.get("proposal_id") ?? "").trim();
  const startRaw = String(formData.get("start_date") ?? "").trim();
  const endRaw = String(formData.get("end_date") ?? "").trim();
  const role_scope = String(formData.get("role_scope") ?? "").trim();
  const compensationRaw = String(formData.get("compensation") ?? "").trim();

  if (!proposalId) return { error: "제안 정보가 없습니다." };
  const start_date = parseIsoDate(startRaw);
  const end_date = parseIsoDate(endRaw);
  if (!start_date || !end_date) {
    return { error: "시작일·종료일은 YYYY-MM-DD 형식으로 입력해 주세요." };
  }
  if (end_date < start_date) {
    return { error: "종료일은 시작일 이후여야 합니다." };
  }
  if (!role_scope || role_scope.length > 4000) {
    return { error: "역할·업무 범위를 입력해 주세요. (4000자 이내)" };
  }
  const compensation = Number.parseInt(compensationRaw, 10);
  if (!Number.isFinite(compensation) || compensation <= 0) {
    return { error: "총 보수(원)를 올바르게 입력해 주세요." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { data: prop, error: pErr } = await supabase
    .from("proposals")
    .select("id, status, request_id")
    .eq("id", proposalId)
    .maybeSingle();

  if (pErr) return { error: mapProposalDbError(pErr) };
  if (!prop) return { error: "제안을 찾을 수 없습니다." };
  if (prop.status !== "accepted") {
    return { error: "수락된 제안만 계약을 만들 수 있습니다." };
  }

  const { data: existing } = await supabase
    .from("contracts")
    .select("id")
    .eq("proposal_id", proposalId)
    .maybeSingle();
  if (existing) {
    return { error: "이 제안에 대한 계약이 이미 존재합니다." };
  }

  const { data: inserted, error: cErr } = await supabase
    .from("contracts")
    .insert({
      proposal_id: proposalId,
      start_date,
      end_date,
      role_scope,
      compensation,
      status: "draft",
      progress: 0,
    })
    .select("id")
    .single();

  if (cErr) {
    return { error: cErr.message };
  }

  revalidatePath("/contracts");
  revalidatePath(`/requests/${prop.request_id}/proposals`);
  redirect(`/contracts/${inserted.id}`);
}

export async function activateContract(
  _prev: ContractActionState | null,
  formData: FormData
): Promise<ContractActionState> {
  const contractId = String(formData.get("contract_id") ?? "").trim();
  if (!contractId) return { error: "계약 ID가 없습니다." };

  const supabase = await createClient();
  const { data: row, error: fErr } = await supabase
    .from("contracts")
    .select("id, status, compensation, proposal_id")
    .eq("id", contractId)
    .maybeSingle();

  if (fErr) return { error: fErr.message };
  if (!row) return { error: "계약을 찾을 수 없습니다." };
  if (row.status !== "draft") {
    return { error: "초안 상태의 계약만 시작할 수 있습니다." };
  }

  const { data: pr } = await supabase
    .from("proposals")
    .select("request_id")
    .eq("id", row.proposal_id)
    .maybeSingle();
  const requestId = pr?.request_id;

  const { error: uErr } = await supabase
    .from("contracts")
    .update({
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", contractId);

  if (uErr) return { error: uErr.message };

  const { data: st } = await supabase
    .from("settlements")
    .select("id")
    .eq("contract_id", contractId)
    .maybeSingle();

  if (!st) {
    const { error: sErr } = await supabase.from("settlements").insert({
      contract_id: contractId,
      amount: row.compensation,
      status: "pending",
    });
    if (sErr) return { error: sErr.message };
  }

  revalidatePath("/contracts");
  revalidatePath(`/contracts/${contractId}`);
  revalidatePath(`/contracts/${contractId}/settlement`);
  if (requestId) {
    revalidatePath(`/requests/${requestId}/proposals`);
  }
  return { success: "계약이 시작되었습니다. 정산 정보가 생성되었습니다." };
}

export async function updateContractProgress(
  _prev: ContractActionState | null,
  formData: FormData
): Promise<ContractActionState> {
  const contractId = String(formData.get("contract_id") ?? "").trim();
  const progress = Number.parseInt(String(formData.get("progress") ?? ""), 10);
  if (!contractId) return { error: "계약 ID가 없습니다." };
  if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
    return { error: "진행률은 0~100 사이 정수입니다." };
  }

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("contracts")
    .select("status")
    .eq("id", contractId)
    .maybeSingle();
  if (!row) return { error: "계약을 찾을 수 없습니다." };
  if (row.status !== "active") {
    return { error: "진행중인 계약만 진행률을 수정할 수 있습니다." };
  }

  const { error } = await supabase
    .from("contracts")
    .update({
      progress,
      updated_at: new Date().toISOString(),
    })
    .eq("id", contractId);

  if (error) return { error: error.message };
  revalidatePath(`/contracts/${contractId}`);
  return { success: "진행률을 저장했습니다." };
}

export async function requestSettlement(
  _prev: ContractActionState | null,
  formData: FormData
): Promise<ContractActionState> {
  const contractId = String(formData.get("contract_id") ?? "").trim();
  if (!contractId) return { error: "계약 ID가 없습니다." };

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("contracts")
    .select("id, status")
    .eq("id", contractId)
    .maybeSingle();
  if (!row) return { error: "계약을 찾을 수 없습니다." };
  if (row.status !== "active") {
    return { error: "진행중인 계약만 정산을 요청할 수 있습니다." };
  }

  const { data: st } = await supabase
    .from("settlements")
    .select("id, status")
    .eq("contract_id", contractId)
    .maybeSingle();
  if (!st) return { error: "정산 행이 없습니다. 계약을 먼저 시작해 주세요." };
  if (st.status !== "pending") {
    return { error: "정산이 이미 진행 중이거나 완료되었습니다." };
  }

  const now = new Date().toISOString();
  const { error: cErr } = await supabase
    .from("contracts")
    .update({ status: "settlement_requested", updated_at: now })
    .eq("id", contractId);
  if (cErr) return { error: cErr.message };

  const { error: sErr } = await supabase
    .from("settlements")
    .update({
      status: "held",
      held_at: now,
      requested_at: now,
      updated_at: now,
    })
    .eq("id", st.id);
  if (sErr) return { error: sErr.message };

  revalidatePath(`/contracts/${contractId}`);
  revalidatePath(`/contracts/${contractId}/settlement`);
  return { success: "정산을 요청했습니다. (데모: 에스크로 보관 상태)" };
}

export async function completeSettlementDemo(
  _prev: ContractActionState | null,
  formData: FormData
): Promise<ContractActionState> {
  const contractId = String(formData.get("contract_id") ?? "").trim();
  if (!contractId) return { error: "계약 ID가 없습니다." };

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("contracts")
    .select("id, status")
    .eq("id", contractId)
    .maybeSingle();
  if (!row) return { error: "계약을 찾을 수 없습니다." };
  if (row.status !== "settlement_requested") {
    return { error: "정산 요청 상태에서만 완료 처리할 수 있습니다." };
  }

  const { data: st } = await supabase
    .from("settlements")
    .select("id, status")
    .eq("contract_id", contractId)
    .maybeSingle();
  if (!st || st.status !== "held") {
    return { error: "에스크로 보관 중인 정산만 완료할 수 있습니다." };
  }

  const now = new Date().toISOString();
  const { error: sErr } = await supabase
    .from("settlements")
    .update({
      status: "released",
      released_at: now,
      updated_at: now,
    })
    .eq("id", st.id);
  if (sErr) return { error: sErr.message };

  const { error: cErr } = await supabase
    .from("contracts")
    .update({
      status: "completed",
      progress: 100,
      updated_at: now,
    })
    .eq("id", contractId);
  if (cErr) return { error: cErr.message };

  revalidatePath(`/contracts/${contractId}`);
  revalidatePath(`/contracts/${contractId}/settlement`);
  revalidatePath("/contracts");
  return { success: "정산이 완료되었습니다. 계약이 종료 처리되었습니다." };
}

// PDF 텍스트에 포함되면 안 되는 문자 이스케이프 (PDF 문자열 리터럴 규칙)
function escPdf(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

/**
 * 의존성 없는 최소 PDF 생성기 (Courier, ASCII 전용).
 * xref 오프셋을 런타임에 계산하므로 내용이 바뀌어도 안전하다.
 */
function buildContractPdfBytes(data: {
  contractId: string;
  startDate: string;
  endDate: string;
  compensation: number;
  status: string;
  progress: number;
}): Buffer {
  const lines = [
    "SENIORLINK CONTRACT SUMMARY",
    "",
    `Contract ID  : ${data.contractId}`,
    `Period       : ${data.startDate} - ${data.endDate}`,
    `Compensation : ${data.compensation.toLocaleString("en-US")} KRW`,
    `Status       : ${data.status}`,
    `Progress     : ${data.progress}%`,
    "",
    `Generated    : ${new Date().toISOString().slice(0, 19)}Z`,
    "",
    "This document is an automated summary for reference only.",
  ];

  const cmds: string[] = ["BT", "/F1 16 Tf", "72 760 Td"];
  cmds.push(`(${escPdf(lines[0])}) Tj`);
  cmds.push("0 -32 Td /F1 11 Tf");
  for (let i = 1; i < lines.length; i++) {
    cmds.push(`(${escPdf(lines[i])}) Tj`);
    cmds.push("0 -18 Td");
  }
  cmds.push("ET");

  const streamBuf = Buffer.from(cmds.join("\n"), "latin1");

  const chunks: Buffer[] = [];
  const offsets = new Array<number>(6).fill(0);
  let pos = 0;

  function p(s: string): void {
    const b = Buffer.from(s, "latin1");
    chunks.push(b);
    pos += b.length;
  }

  p("%PDF-1.4\n");

  offsets[1] = pos;
  p("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  offsets[2] = pos;
  p("2 0 obj\n<< /Type /Pages /Kids [5 0 R] /Count 1 >>\nendobj\n");

  offsets[3] = pos;
  p(
    "3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>\nendobj\n",
  );

  offsets[4] = pos;
  p(`4 0 obj\n<< /Length ${streamBuf.length} >>\nstream\n`);
  chunks.push(streamBuf);
  pos += streamBuf.length;
  p("\nendstream\nendobj\n");

  offsets[5] = pos;
  p(
    "5 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 3 0 R >> >> >>\nendobj\n",
  );

  const xrefOffset = pos;
  p("xref\n0 6\n");
  p("0000000000 65535 f\r\n");
  for (let i = 1; i <= 5; i++) {
    p(`${offsets[i].toString().padStart(10, "0")} 00000 n\r\n`);
  }
  p(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);

  return Buffer.concat(chunks);
}

export async function generateContractPdf(
  _prev: ContractActionState | null,
  formData: FormData,
): Promise<ContractActionState> {
  const contractId = String(formData.get("contract_id") ?? "").trim();
  if (!contractId) return { error: "계약 ID가 없습니다." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { data: row, error: fetchErr } = await supabase
    .from("contracts")
    .select("id, start_date, end_date, compensation, status, progress")
    .eq("id", contractId)
    .maybeSingle();

  if (fetchErr) return { error: fetchErr.message };
  if (!row) return { error: "계약을 찾을 수 없습니다." };

  const pdfBytes = buildContractPdfBytes({
    contractId: row.id as string,
    startDate: row.start_date as string,
    endDate: row.end_date as string,
    compensation: row.compensation as number,
    status: row.status as string,
    progress: row.progress as number,
  });

  const service = createServiceClient();
  const storagePath = `${contractId}.pdf`;

  const { error: uploadErr } = await service.storage
    .from("contracts")
    .upload(storagePath, pdfBytes, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadErr) return { error: `Storage 업로드 실패: ${uploadErr.message}` };

  // 1년 유효 서명 URL
  const { data: signedData, error: signErr } = await service.storage
    .from("contracts")
    .createSignedUrl(storagePath, 31_536_000);

  if (signErr || !signedData?.signedUrl) {
    return { error: "서명 URL 생성에 실패했습니다." };
  }

  const { error: updateErr } = await service
    .from("contracts")
    .update({ pdf_url: signedData.signedUrl, updated_at: new Date().toISOString() })
    .eq("id", contractId);

  if (updateErr) return { error: `계약 업데이트 실패: ${updateErr.message}` };

  revalidatePath(`/contracts/${contractId}`);
  return { success: "PDF가 생성되었습니다." };
}

export async function submitContractReview(
  _prev: ContractActionState | null,
  formData: FormData
): Promise<ContractActionState> {
  const contractId = String(formData.get("contract_id") ?? "").trim();
  const seniorId = String(formData.get("senior_id") ?? "").trim();
  const ratingRaw = String(formData.get("rating") ?? "").trim();
  const comment = String(formData.get("comment") ?? "").trim();

  if (!contractId || !seniorId) return { error: "필수 값이 없습니다." };
  const rating = Number.parseInt(ratingRaw, 10);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return { error: "별점은 1~5입니다." };
  }
  if (comment.length < 10 || comment.length > 500) {
    return { error: "코멘트는 10자 이상 500자 이하로 입력해 주세요." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { data: ct } = await supabase
    .from("contracts")
    .select("id, status, proposal_id")
    .eq("id", contractId)
    .maybeSingle();
  if (!ct) return { error: "계약을 찾을 수 없습니다." };
  if (ct.status !== "completed") {
    return { error: "완료된 계약에만 후기를 남길 수 있습니다." };
  }

  const { data: prop } = await supabase
    .from("proposals")
    .select("senior_id")
    .eq("id", ct.proposal_id)
    .maybeSingle();
  if (!prop || prop.senior_id !== seniorId) {
    return { error: "후보 정보가 계약과 일치하지 않습니다." };
  }

  const { error } = await supabase.from("contract_reviews").insert({
    contract_id: contractId,
    reviewer_id: user.id,
    senior_id: seniorId,
    rating,
    comment,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "이미 이 계약에 후기를 등록했습니다." };
    }
    return { error: error.message };
  }

  revalidatePath(`/contracts/${contractId}`);
  return { success: "후기가 등록되었습니다." };
}
