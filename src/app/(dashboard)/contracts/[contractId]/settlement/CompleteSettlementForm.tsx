"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { completeSettlementDemo } from "@/app/(dashboard)/contracts/actions";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="cta" disabled={pending}>
      {pending ? "처리 중…" : "정산 확정·계약 완료"}
    </Button>
  );
}

export function CompleteSettlementForm({ contractId }: { contractId: string }) {
  const router = useRouter();
  const [state, formAction] = useActionState(completeSettlementDemo, null);

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state?.success, router]);

  return (
    <form action={formAction} className="sl-stack">
      <input type="hidden" name="contract_id" value={contractId} />
      {state?.error ? (
        <Toast variant="error" title="실패">
          {state.error}
        </Toast>
      ) : null}
      {state?.success ? (
        <Toast variant="success" title={state.success} />
      ) : null}
      <Submit />
    </form>
  );
}
