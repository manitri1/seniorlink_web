"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function safeReturnUrl(raw: string | null) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

export async function login(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const returnUrl = safeReturnUrl(String(formData.get("returnUrl") ?? ""));

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력하세요." };
  }

  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return { error: error.message };

  const uid = authData.user?.id;
  if (!uid) {
    redirect(returnUrl);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", uid)
    .maybeSingle();

  // profiles 행이 없으면(마이그레이션 미적용 등) auth 메타데이터로 폴백
  const effectiveRole =
    profile?.role ??
    (authData.user?.user_metadata?.role === "senior" ? "senior" : "company");

  let dest = returnUrl;
  if (effectiveRole === "senior") {
    if (!dest.startsWith("/senior")) {
      dest = "/senior/dashboard";
    }
  } else if (dest.startsWith("/senior")) {
    dest = "/dashboard";
  }

  redirect(dest);
}

export async function signup(
  _prev: { error?: string; info?: string } | null,
  formData: FormData
): Promise<{ error?: string; info?: string } | null> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const roleRaw = String(formData.get("role") ?? "").trim();
  const role = roleRaw === "senior" ? "senior" : "company";

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력하세요." };
  }
  if (password.length < 8) {
    return { error: "비밀번호는 8자 이상이어야 합니다." };
  }

  const supabase = await createClient();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
  const nextPath = role === "senior" ? "/senior/dashboard" : "/dashboard";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role, name },
      emailRedirectTo: siteUrl ? `${siteUrl}/auth/callback?next=${encodeURIComponent(nextPath)}` : undefined,
    },
  });

  if (error) return { error: error.message };

  // 트리거(handle_new_user)가 Supabase 프로젝트에 미적용된 환경 대비.
  // 이미 트리거가 행을 만들었다면 ignoreDuplicates: true 로 덮어쓰지 않습니다.
  if (data.user) {
    await supabase.from("profiles").upsert(
      { id: data.user.id, role, full_name: name || null },
      { onConflict: "id", ignoreDuplicates: true }
    );
  }

  if (data.user && !data.session) {
    return {
      info: "가입 확인 이메일을 발송했습니다. 메일함을 확인한 뒤 로그인하세요.",
    };
  }

  redirect(role === "senior" ? "/senior/dashboard" : "/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
