"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signup } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "가입 중…" : label}
    </Button>
  );
}

type Props = {
  defaultRole: "company" | "senior";
};

export function SignupForm({ defaultRole }: Props) {
  const [state, formAction] = useActionState(signup, null);
  const isSenior = defaultRole === "senior";
  const title = isSenior ? "회원가입 (시니어)" : "회원가입 (기업)";
  const submitLabel = isSenior ? "시니어로 가입" : "기업으로 가입";

  return (
    <Card title={title}>
      <form action={formAction} className="sl-stack">
        <input type="hidden" name="role" value={defaultRole} />
        <Input id="name" name="name" label={isSenior ? "이름" : "담당자 이름"} autoComplete="name" />
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          label="이메일"
          required
        />
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          label="비밀번호"
          hint="8자 이상"
          required
        />
        {state?.error ? (
          <p className="sl-field__error" role="alert">
            {state.error}
          </p>
        ) : null}
        {state?.info ? (
          <p className="sl-field__hint" role="status">
            {state.info}
          </p>
        ) : null}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <SubmitButton label={submitLabel} />
          <Link href="/login" className="sl-button sl-button--outline">
            로그인
          </Link>
        </div>
        <p style={{ margin: 0, fontSize: "0.875rem" }}>
          {isSenior ? (
            <>
              기업 담당자이신가요? <Link href="/signup">기업 회원가입</Link>
            </>
          ) : (
            <>
              시니어 전문가이신가요? <Link href="/signup?role=senior">시니어 회원가입</Link>
            </>
          )}
        </p>
        <p style={{ margin: 0, fontSize: "0.875rem" }}>
          <Link href="/">← 공개 홈</Link>
        </p>
      </form>
    </Card>
  );
}
