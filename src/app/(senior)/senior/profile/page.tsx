import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SeniorProfileForm } from "@/app/(senior)/senior/profile/SeniorProfileForm";

export default async function SeniorProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?returnUrl=/senior/profile");

  const { data: row } = await supabase
    .from("senior_profiles")
    .select("display_name, headline, region, years_experience, fields")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!row) {
    return <p>시니어 프로필이 없습니다.</p>;
  }

  return (
    <div className="sl-stack">
      <h1 style={{ margin: 0, fontSize: "1.5rem" }}>내 프로필</h1>
      <p style={{ margin: 0, color: "var(--color-on-surface-variant)" }}>
        기업 매칭에 노출되는 기본 정보입니다.
      </p>

      <Card title="프로필 편집">
        <SeniorProfileForm
          initial={{
            display_name: row.display_name,
            headline: row.headline,
            region: row.region,
            years_experience: row.years_experience,
            fields: row.fields as string[],
          }}
        />
      </Card>
    </div>
  );
}
