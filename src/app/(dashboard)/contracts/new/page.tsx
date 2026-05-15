import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateContractForm } from "./CreateContractForm";

export default async function NewContractPage({
  searchParams,
}: {
  searchParams: Promise<{ proposalId?: string }>;
}) {
  const sp = await searchParams;
  const proposalId = typeof sp.proposalId === "string" ? sp.proposalId.trim() : "";
  if (!proposalId) {
    redirect("/contracts");
  }

  const supabase = await createClient();
  const { data: prop } = await supabase
    .from("proposals")
    .select("id, status, request_id")
    .eq("id", proposalId)
    .maybeSingle();

  if (!prop || prop.status !== "accepted") {
    return (
      <p className="sl-field__error" role="alert">
        수락된 제안만 계약을 만들 수 있습니다. 제안 화면에서 데모 수락을 먼저 적용해 주세요.
      </p>
    );
  }

  const { data: existing } = await supabase
    .from("contracts")
    .select("id")
    .eq("proposal_id", proposalId)
    .maybeSingle();
  if (existing) {
    redirect(`/contracts/${existing.id}`);
  }

  return (
    <div className="sl-stack">
      <p style={{ margin: 0 }}>
        <Link href={`/requests/${prop.request_id}/proposals`} style={{ fontSize: "0.9375rem" }}>
          ← 제안으로 돌아가기
        </Link>
      </p>
      <CreateContractForm proposalId={proposalId} />
    </div>
  );
}
