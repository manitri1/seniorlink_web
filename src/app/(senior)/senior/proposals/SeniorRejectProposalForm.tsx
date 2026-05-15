"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { seniorRejectProposal } from "@/app/(senior)/senior/proposal-actions";
import { Button } from "@/components/ui/Button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} variant="outline">
      {pending ? "처리 중…" : "제안 거절"}
    </Button>
  );
}

export function SeniorRejectProposalForm({ proposalId }: { proposalId: string }) {
  const [state, formAction] = useActionState(seniorRejectProposal, null);

  return (
    <form action={formAction} className="sl-stack" style={{ maxWidth: "20rem" }}>
      <input type="hidden" name="proposal_id" value={proposalId} />
      <SubmitButton />
      {state?.error ? (
        <p className="sl-field__error" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="sl-field__hint" role="status">
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
