"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { runMatching } from "@/app/(dashboard)/requests/[requestId]/proposal-actions";
import { Button } from "@/components/ui/Button";

function RunSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" disabled={pending}>
      {pending ? "매칭 중…" : "매칭 다시 실행"}
    </Button>
  );
}

export function RunMatchingForm({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [state, formAction] = useActionState(runMatching, null);

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state?.success, router]);

  return (
    <form
      action={formAction}
      style={{ display: "inline-flex", flexDirection: "column", gap: "8px" }}
    >
      <input type="hidden" name="request_id" value={requestId} />
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
      <RunSubmit />
    </form>
  );
}
