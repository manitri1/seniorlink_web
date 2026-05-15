"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { demoAcceptProposal } from "@/app/(dashboard)/requests/[requestId]/proposal-actions";
import { Button } from "@/components/ui/Button";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} variant="cta">
      {pending ? "처리 중…" : label}
    </Button>
  );
}

export function SeniorAcceptProposalForm({ proposalId }: { proposalId: string }) {
  const [state, formAction] = useActionState(demoAcceptProposal, null);

  return (
    <form action={formAction} className="sl-stack" style={{ maxWidth: "20rem" }}>
      <input type="hidden" name="proposal_id" value={proposalId} />
      <SubmitButton label="제안 수락" />
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
