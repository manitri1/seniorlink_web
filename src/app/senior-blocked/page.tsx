import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** 이전 차단 URL 호환: 시니어 웹으로 이동합니다. */
export default async function SeniorBlockedRedirectPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?returnUrl=/senior/dashboard");
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role === "senior") {
    redirect("/senior/dashboard");
  }
  redirect("/dashboard");
}
