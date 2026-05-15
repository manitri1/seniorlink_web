"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PostgrestError } from "@supabase/supabase-js";

export type CompanyProfileRow = {
  id: string;
  name: string;
  industry: string | null;
  description: string | null;
  website_url: string | null;
  updated_at: string;
};

export type CompanyProfileState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Partial<
    Record<"name" | "industry" | "description" | "website_url", string>
  >;
};

function mapPostgrestError(err: PostgrestError): string {
  if (err.code === "23505") return "중복된 값이 있어 저장할 수 없습니다.";
  if (err.code === "42501" || /permission denied|RLS/i.test(err.message ?? "")) {
    return "저장 권한이 없습니다. 다시 로그인한 뒤 시도해 주세요.";
  }
  if (
    /column|schema cache|Could not find/i.test(err.message ?? "")
  ) {
    return "DB 스키마가 최신이 아닐 수 있습니다. `supabase/migrations`의 기업 프로필 확장 마이그레이션을 적용했는지 확인해 주세요.";
  }
  return err.message || "저장 중 오류가 발생했습니다.";
}

/** 빈 문자열이면 null, 유효하지 않으면 `__invalid__` */
function normalizeWebsite(raw: string): string | null | "__invalid__" {
  const t = raw.trim();
  if (!t) return null;
  const withScheme = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  try {
    const u = new URL(withScheme);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "__invalid__";
    return u.toString();
  } catch {
    return "__invalid__";
  }
}

export async function saveCompanyProfile(
  _prev: CompanyProfileState | null,
  formData: FormData
): Promise<CompanyProfileState> {
  const name = String(formData.get("name") ?? "").trim();
  const industry = String(formData.get("industry") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const websiteRaw = String(formData.get("website_url") ?? "").trim();

  const fieldErrors: NonNullable<CompanyProfileState["fieldErrors"]> = {};

  if (!name) fieldErrors.name = "회사명을 입력해 주세요.";
  else if (name.length > 120)
    fieldErrors.name = "회사명은 120자 이내로 입력해 주세요.";

  if (industry.length > 80)
    fieldErrors.industry = "업종은 80자 이내로 입력해 주세요.";

  if (description.length > 2000)
    fieldErrors.description = "회사 소개는 2000자 이내로 입력해 주세요.";

  let website_url: string | null = null;
  if (websiteRaw) {
    const normalized = normalizeWebsite(websiteRaw);
    if (normalized === "__invalid__") {
      fieldErrors.website_url =
        "올바른 웹사이트 주소를 입력해 주세요. (예: https://example.com)";
    } else {
      website_url = normalized;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { error } = await supabase.from("companies").upsert(
    {
      owner_id: user.id,
      name,
      industry: industry || null,
      description: description || null,
      website_url,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "owner_id" }
  );

  if (error) {
    return { error: mapPostgrestError(error) };
  }

  revalidatePath("/company/profile");
  return { success: true };
}
