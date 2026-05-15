"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import {
  saveCompanyProfile,
  type CompanyProfileRow,
} from "@/app/(dashboard)/company/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "저장 중…" : "저장"}
    </Button>
  );
}

type Props = {
  initial: CompanyProfileRow | null;
};

export function CompanyProfileForm({ initial }: Props) {
  const router = useRouter();
  const [state, formAction] = useActionState(saveCompanyProfile, null);

  const [name, setName] = useState(initial?.name ?? "");
  const [industry, setIndustry] = useState(initial?.industry ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(initial?.website_url ?? "");

  useEffect(() => {
    setName(initial?.name ?? "");
    setIndustry(initial?.industry ?? "");
    setDescription(initial?.description ?? "");
    setWebsiteUrl(initial?.website_url ?? "");
  }, [initial]);

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state?.success, router]);

  return (
    <Card title="기업 프로필">
      <form action={formAction} className="sl-stack">
        {state?.success ? (
          <p className="sl-field__hint" role="status">
            저장되었습니다.
          </p>
        ) : null}
        {state?.error ? (
          <p className="sl-field__error" role="alert">
            {state.error}
          </p>
        ) : null}

        <Input
          id="name"
          name="name"
          label="회사명"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={120}
          autoComplete="organization"
          error={state?.fieldErrors?.name}
        />
        <Input
          id="industry"
          name="industry"
          label="업종"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          maxLength={80}
          placeholder="예: 제조, IT 서비스"
          hint="선택 사항입니다."
          error={state?.fieldErrors?.industry}
        />
        <Textarea
          id="description"
          name="description"
          label="회사 소개"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          rows={6}
          placeholder="TF 요청 시 참고할 수 있는 회사·사업 개요를 적어 주세요."
          hint={`${description.length} / 2000자`}
          error={state?.fieldErrors?.description}
        />
        <Input
          id="website_url"
          name="website_url"
          type="text"
          label="웹사이트"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://example.com"
          inputMode="url"
          autoComplete="url"
          hint="비워 두거나 https:// 로 시작하는 주소를 입력하세요."
          error={state?.fieldErrors?.website_url}
        />

        <SubmitButton />
      </form>
    </Card>
  );
}
