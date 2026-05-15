"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  mapPostgrestError,
} from "@/lib/tf-request";

export type TfRequestFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

async function getMyCompanyId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<string | null> {
  const { data } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_id", userId)
    .maybeSingle();
  return data?.id ?? null;
}

function parseIntOrNull(raw: FormDataEntryValue | null): number | null {
  if (raw === null || raw === "") return null;
  const n = Number.parseInt(String(raw), 10);
  if (!Number.isFinite(n)) return null;
  return n;
}

function validateTfRequestFields(formData: FormData): {
  fieldErrors: Record<string, string>;
  values: {
    title: string;
    field: string;
    duration_weeks: number;
    budget_min: number | null;
    budget_max: number | null;
    goals: string;
    region: string;
  } | null;
} {
  const title = String(formData.get("title") ?? "").trim();
  const field = String(formData.get("field") ?? "").trim();
  const region = String(formData.get("region") ?? "").trim();
  const goals = String(formData.get("goals") ?? "").trim();
  const durationRaw = String(formData.get("duration_weeks") ?? "").trim();
  const budgetMinRaw = formData.get("budget_min");
  const budgetMaxRaw = formData.get("budget_max");

  const fieldErrors: Record<string, string> = {};

  if (!title) fieldErrors.title = "요청 제목을 입력해 주세요.";
  else if (title.length > 200) fieldErrors.title = "제목은 200자 이내입니다.";

  if (!field) fieldErrors.field = "주요 분야를 입력해 주세요.";
  else if (field.length > 100) fieldErrors.field = "분야는 100자 이내입니다.";

  if (!region) fieldErrors.region = "지역을 입력해 주세요.";
  else if (region.length > 80) fieldErrors.region = "지역은 80자 이내입니다.";

  if (!goals) fieldErrors.goals = "프로젝트 목표를 입력해 주세요.";
  else if (goals.length > 5000) fieldErrors.goals = "목표는 5000자 이내입니다.";

  const duration_weeks = Number.parseInt(durationRaw, 10);
  if (!durationRaw || !Number.isFinite(duration_weeks)) {
    fieldErrors.duration_weeks = "기간(주)을 숫자로 입력해 주세요.";
  } else if (duration_weeks < 1 || duration_weeks > 104) {
    fieldErrors.duration_weeks = "기간은 1주 이상 104주 이하로 입력해 주세요.";
  }

  const budget_min = parseIntOrNull(budgetMinRaw);
  const budget_max = parseIntOrNull(budgetMaxRaw);
  if (budget_min !== null && budget_min < 0) {
    fieldErrors.budget_min = "0 이상의 숫자를 입력해 주세요.";
  }
  if (budget_max !== null && budget_max < 0) {
    fieldErrors.budget_max = "0 이상의 숫자를 입력해 주세요.";
  }
  if (
    budget_min !== null &&
    budget_max !== null &&
    budget_max < budget_min
  ) {
    fieldErrors.budget_max = "최대 예산이 최소 예산보다 작을 수 없습니다.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, values: null };
  }

  return {
    fieldErrors,
    values: {
      title,
      field,
      duration_weeks,
      budget_min,
      budget_max,
      goals,
      region,
    },
  };
}

export async function createTfRequest(
  _prev: TfRequestFormState | null,
  formData: FormData
): Promise<TfRequestFormState> {
  const { fieldErrors, values } = validateTfRequestFields(formData);
  if (!values) return { fieldErrors };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const company_id = await getMyCompanyId(supabase, user.id);
  if (!company_id) {
    return {
      error: "기업 정보가 없습니다. 먼저 기업 프로필을 저장해 주세요.",
    };
  }

  const { data, error } = await supabase
    .from("tf_requests")
    .insert({
      company_id,
      title: values.title,
      field: values.field,
      duration_weeks: values.duration_weeks,
      budget_min: values.budget_min,
      budget_max: values.budget_max,
      goals: values.goals,
      region: values.region,
    })
    .select("id")
    .single();

  if (error) return { error: mapPostgrestError(error) };

  revalidatePath("/requests");
  redirect(`/requests/${data.id}`);
}

export async function updateTfRequest(
  _prev: TfRequestFormState | null,
  formData: FormData
): Promise<TfRequestFormState> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "요청 ID가 없습니다." };

  const { fieldErrors, values } = validateTfRequestFields(formData);
  if (!values) return { fieldErrors };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { data: existing, error: fetchErr } = await supabase
    .from("tf_requests")
    .select("id, status")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr) return { error: mapPostgrestError(fetchErr) };
  if (!existing) return { error: "요청을 찾을 수 없습니다." };

  if (existing.status !== "open") {
    return { error: "접수중 상태일 때만 수정할 수 있습니다." };
  }

  const { error } = await supabase
    .from("tf_requests")
    .update({
      title: values.title,
      field: values.field,
      duration_weeks: values.duration_weeks,
      budget_min: values.budget_min,
      budget_max: values.budget_max,
      goals: values.goals,
      region: values.region,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: mapPostgrestError(error) };

  revalidatePath("/requests");
  revalidatePath(`/requests/${id}`);
  return { success: true };
}
