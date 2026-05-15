"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { createProposal } from "@/app/(dashboard)/requests/[requestId]/proposal-actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Toast } from "@/components/ui/Toast";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "발송 중…" : "제안 발송"}
    </Button>
  );
}

type Props = {
  requestId: string;
  defaultSeniorId: string | null;
};

export function ProposalComposer({ requestId, defaultSeniorId }: Props) {
  const router = useRouter();
  const [state, formAction] = useActionState(createProposal, null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (state?.success) {
      setMessage("");
      router.refresh();
    }
  }, [state?.success, router]);

  if (!defaultSeniorId) {
    return (
      <Card title="제안 보내기">
        <p style={{ margin: 0, color: "var(--color-on-surface-variant)" }}>
          <strong>매칭 결과</strong> 탭에서 후보를 고른 뒤, 해당 행의「이 후보에게
          제안」링크를 누르면 이 화면으로 돌아와 메시지를 작성할 수 있습니다.
        </p>
      </Card>
    );
  }

  return (
    <Card title="제안 보내기">
      <form action={formAction} className="sl-stack">
        <input type="hidden" name="request_id" value={requestId} />
        <input type="hidden" name="senior_id" value={defaultSeniorId} />

        {state?.success ? (
          <Toast variant="success" title={state.success} />
        ) : null}
        {state?.error ? (
          <Toast variant="error" title="발송 실패">
            {state.error}
          </Toast>
        ) : null}

        <Textarea
          id="proposal_message"
          name="message"
          label="제안 메시지"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          maxLength={1000}
          rows={5}
          hint={`${message.length} / 1000자 · 시니어에게 전달됩니다.`}
        />
        <SubmitButton />
      </form>
    </Card>
  );
}
