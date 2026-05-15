import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { CompanyProfileRow } from "@/app/(dashboard)/company/actions";
import { CompanyProfileForm } from "./CompanyProfileForm";

export default async function CompanyProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?returnUrl=/company/profile");
  }

  const { data: company, error } = await supabase
    .from("companies")
    .select("id, name, industry, description, website_url, updated_at")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error) {
    return (
      <div className="sl-stack">
        <p className="sl-field__error" role="alert">
          기업 정보를 불러오지 못했습니다: {error.message}
        </p>
      </div>
    );
  }

  const initial = company as CompanyProfileRow | null;

  return (
    <div className="sl-stack">
      <p style={{ margin: 0, color: "var(--color-on-surface-variant)" }}>
        TF 요청·매칭 시 참고되는 기본 정보입니다. 저장 후에도 언제든 수정할 수
        있습니다.
      </p>
      <CompanyProfileForm
        key={initial ? `${initial.id}-${initial.updated_at}` : "new"}
        initial={initial}
      />
    </div>
  );
}
