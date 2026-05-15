"use client";

import { useActionState, useMemo } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { createContract } from "@/app/(dashboard)/contracts/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Toast } from "@/components/ui/Toast";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "저장 중…" : "계약 생성"}
    </Button>
  );
}

type Props = { proposalId: string };

export function CreateContractForm({ proposalId }: Props) {
  const [state, formAction] = useActionState(createContract, null);

  const defaults = useMemo(() => {
    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + 28);
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    return { start: iso(start), end: iso(end) };
  }, []);

  return (
    <Card title="계약 작성">
      <p style={{ margin: "0 0 var(--space-stack)", color: "var(--color-on-surface-variant)" }}>
        <Link href="/contracts" style={{ fontSize: "0.9375rem" }}>
          ← 계약 목록
        </Link>
      </p>
      <form action={formAction} className="sl-stack">
        <input type="hidden" name="proposal_id" value={proposalId} />
        {state?.error ? (
          <Toast variant="error" title="생성 실패">
            {state.error}
          </Toast>
        ) : null}
        <Input
          id="start_date"
          name="start_date"
          type="text"
          label="시작일"
          defaultValue={defaults.start}
          required
          hint="YYYY-MM-DD"
        />
        <Input
          id="end_date"
          name="end_date"
          type="text"
          label="종료일"
          defaultValue={defaults.end}
          required
          hint="YYYY-MM-DD"
        />
        <Textarea
          id="role_scope"
          name="role_scope"
          label="역할·업무 범위"
          required
          rows={5}
          defaultValue="MVP 데모: TF 기간 중 담당 역할·산출물·회의 주기를 구체화해 주세요."
          hint="계약서 본문은 추후 PDF·법무 검토와 연동합니다."
        />
        <Input
          id="compensation"
          name="compensation"
          type="text"
          inputMode="numeric"
          label="총 보수 (원)"
          defaultValue="5000000"
          required
        />
        <SubmitButton />
      </form>
    </Card>
  );
}
