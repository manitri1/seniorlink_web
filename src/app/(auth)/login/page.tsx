"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "로그인 중…" : "로그인"}
    </Button>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Card title="로그인">불러오는 중…</Card>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") ?? "/dashboard";
  const [state, formAction] = useActionState(login, null);

  return (
    <Card title="로그인">
      <form action={formAction} className="sl-stack">
        <input type="hidden" name="returnUrl" value={returnUrl} />
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
          autoComplete="current-password"
          label="비밀번호"
          required
        />
        {state?.error ? (
          <p className="sl-field__error" role="alert">
            {state.error}
          </p>
        ) : null}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <SubmitButton />
          <Link href="/signup" className="sl-button sl-button--outline">
            회원가입
          </Link>
        </div>
        <p style={{ margin: 0, fontSize: "0.875rem" }}>
          <Link href="/">← 공개 홈</Link>
        </p>
      </form>
    </Card>
  );
}
