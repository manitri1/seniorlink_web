"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SeniorProfileState = { error?: string; success?: string };

export async function saveSeniorProfile(
  _prev: SeniorProfileState | null,
  formData: FormData
): Promise<SeniorProfileState> {
  const displayName = String(formData.get("display_name") ?? "").trim();
  const headline = String(formData.get("headline") ?? "").trim();
  const region = String(formData.get("region") ?? "").trim();
  const yearsRaw = String(formData.get("years_experience") ?? "").trim();
  const fieldsRaw = String(formData.get("fields") ?? "").trim();

  if (!displayName) {
    return { error: "표시 이름을 입력하세요." };
  }
  const years = Number.parseInt(yearsRaw, 10);
  if (Number.isNaN(years) || years < 0 || years > 80) {
    return { error: "경력 연수는 0~80 사이 숫자로 입력하세요." };
  }

  const fields = fieldsRaw
    .split(/[,，]/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (fields.length === 0) {
    return { error: "전문 분야를 쉼표로 하나 이상 입력하세요." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { error } = await supabase
    .from("senior_profiles")
    .update({
      display_name: displayName,
      headline: headline || null,
      region: region || "서울",
      years_experience: years,
      fields,
    })
    .eq("profile_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/senior/profile");
  return { success: "저장했습니다." };
}
