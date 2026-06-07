"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { generateContractPdf } from "@/app/(dashboard)/contracts/actions";
import { Button } from "@/components/ui/Button";

function PdfSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" disabled={pending}>
      {pending ? "생성 중…" : "PDF 생성"}
    </Button>
  );
}

export function GeneratePdfForm({ contractId }: { contractId: string }) {
  const router = useRouter();
  const [state, formAction] = useActionState(generateContractPdf, null);

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state?.success, router]);

  return (
    <form
      action={formAction}
      style={{ display: "inline-flex", flexDirection: "column", gap: "6px" }}
    >
      <input type="hidden" name="contract_id" value={contractId} />
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
      <PdfSubmit />
    </form>
  );
}
