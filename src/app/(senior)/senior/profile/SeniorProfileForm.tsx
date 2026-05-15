"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  saveSeniorProfile,
  type SeniorProfileState,
} from "@/app/(senior)/senior/profile/actions";
import { Button } from "@/components/ui/Button";
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
  initial: {
    display_name: string;
    headline: string | null;
    region: string;
    years_experience: number;
    fields: string[];
  };
};

export function SeniorProfileForm({ initial }: Props) {
  const [state, formAction] = useActionState(saveSeniorProfile, null as SeniorProfileState | null);

  return (
    <form action={formAction} className="sl-stack">
      <Input
        id="display_name"
        name="display_name"
        label="표시 이름"
        defaultValue={initial.display_name}
        required
      />
      <Textarea
        id="headline"
        name="headline"
        label="한 줄 소개"
        rows={3}
        defaultValue={initial.headline ?? ""}
      />
      <Input id="region" name="region" label="활동 지역" defaultValue={initial.region} required />
      <Input
        id="years_experience"
        name="years_experience"
        label="경력 연수"
        type="number"
        min={0}
        max={80}
        defaultValue={String(initial.years_experience)}
        required
      />
      <Textarea
        id="fields"
        name="fields"
        label="전문 분야 (쉼표로 구분)"
        rows={3}
        defaultValue={initial.fields.join(", ")}
        required
      />
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
