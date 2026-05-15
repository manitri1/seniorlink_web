"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { updateContractProgress } from "@/app/(dashboard)/contracts/actions";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "저장 중…" : "진행률 저장"}
    </Button>
  );
}

type Props = { contractId: string; initialProgress: number };

export function ContractProgressForm({ contractId, initialProgress }: Props) {
  const router = useRouter();
  const [state, formAction] = useActionState(updateContractProgress, null);
  const [value, setValue] = useState(String(initialProgress));

  useEffect(() => {
    setValue(String(initialProgress));
  }, [initialProgress]);

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state?.success, router]);

  return (
    <form action={formAction} className="sl-stack">
      <input type="hidden" name="contract_id" value={contractId} />
      <input type="hidden" name="progress" value={value} />
      {state?.error ? (
        <Toast variant="error" title="실패">
          {state.error}
        </Toast>
      ) : null}
      {state?.success ? (
        <Toast variant="success" title={state.success} />
      ) : null}
      <div className="sl-field">
        <label className="sl-label" htmlFor="progress_slider">
          진행률 ({value}%)
        </label>
        <input
          id="progress_slider"
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="sl-input"
          style={{ width: "100%", minHeight: "auto" }}
        />
      </div>
      <Submit />
    </form>
  );
}
