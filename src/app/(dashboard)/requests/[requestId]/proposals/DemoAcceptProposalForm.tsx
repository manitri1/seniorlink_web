"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { demoAcceptProposal } from "@/app/(dashboard)/requests/[requestId]/proposal-actions";
import { Button } from "@/components/ui/Button";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" disabled={pending}>
      {pending ? "처리 중…" : "데모: 수락 처리"}
    </Button>
  );
}

export function DemoAcceptProposalForm({ proposalId }: { proposalId: string }) {
  const router = useRouter();
  const [state, formAction] = useActionState(demoAcceptProposal, null);

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state?.success, router]);

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <input type="hidden" name="proposal_id" value={proposalId} />
      {state?.error ? (
        <span className="sl-field__error" role="alert" style={{ fontSize: "0.8125rem" }}>
          {state.error}
        </span>
      ) : null}
      {state?.success ? (
        <span className="sl-field__hint" role="status" style={{ fontSize: "0.8125rem" }}>
          {state.success}
        </span>
      ) : null}
      <Submit />
    </form>
  );
}
