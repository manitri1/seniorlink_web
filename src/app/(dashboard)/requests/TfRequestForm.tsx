"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import {
  createTfRequest,
  updateTfRequest,
} from "@/app/(dashboard)/requests/actions";
import type { TfRequestRow } from "@/lib/tf-request";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "처리 중…" : label}
    </Button>
  );
}

type Props = { mode: "create" } | { mode: "edit"; initial: TfRequestRow };

function emptyFromRow(row: TfRequestRow | null) {
  return {
    title: row?.title ?? "",
    field: row?.field ?? "",
    duration_weeks: row ? String(row.duration_weeks) : "",
    budget_min: row?.budget_min != null ? String(row.budget_min) : "",
    budget_max: row?.budget_max != null ? String(row.budget_max) : "",
    goals: row?.goals ?? "",
    region: row?.region ?? "",
  };
}

export function TfRequestForm(props: Props) {
  const router = useRouter();
  const action = props.mode === "create" ? createTfRequest : updateTfRequest;
  const [state, formAction] = useActionState(action, null);

  const initial = props.mode === "edit" ? props.initial : null;
  const [title, setTitle] = useState(() => emptyFromRow(initial).title);
  const [field, setField] = useState(() => emptyFromRow(initial).field);
  const [durationWeeks, setDurationWeeks] = useState(
    () => emptyFromRow(initial).duration_weeks
  );
  const [budgetMin, setBudgetMin] = useState(
    () => emptyFromRow(initial).budget_min
  );
  const [budgetMax, setBudgetMax] = useState(
    () => emptyFromRow(initial).budget_max
  );
  const [goals, setGoals] = useState(() => emptyFromRow(initial).goals);
  const [region, setRegion] = useState(() => emptyFromRow(initial).region);

  useEffect(() => {
    const e = emptyFromRow(initial);
    setTitle(e.title);
    setField(e.field);
    setDurationWeeks(e.duration_weeks);
    setBudgetMin(e.budget_min);
    setBudgetMax(e.budget_max);
    setGoals(e.goals);
    setRegion(e.region);
  }, [initial]);

  useEffect(() => {
    if (state?.success && props.mode === "edit") {
      router.refresh();
    }
  }, [state?.success, props.mode, router]);

  const fe = state?.fieldErrors;

  return (
    <Card title={props.mode === "create" ? "새 TF 요청" : "요청 수정"}>
      <form action={formAction} className="sl-stack">
        {props.mode === "edit" ? (
          <input type="hidden" name="id" value={props.initial.id} />
        ) : null}

        {state?.error ? (
          <p className="sl-field__error" role="alert">
            {state.error}
          </p>
        ) : null}
        {state?.success ? (
          <p className="sl-field__hint" role="status">
            저장되었습니다.
          </p>
        ) : null}

        <Input
          id="title"
          name="title"
          label="요청 제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          error={fe?.title}
        />
        <Input
          id="field"
          name="field"
          label="주요 전문 분야"
          value={field}
          onChange={(e) => setField(e.target.value)}
          required
          maxLength={100}
          hint="예: 재무·전략·DX"
          error={fe?.field}
        />
        <Input
          id="duration_weeks"
          name="duration_weeks"
          type="text"
          inputMode="numeric"
          label="예상 기간 (주)"
          value={durationWeeks}
          onChange={(e) => setDurationWeeks(e.target.value)}
          required
          hint="1주 이상 104주 이하"
          error={fe?.duration_weeks}
        />
        <div className="tf-request-budget-grid">
          <Input
            id="budget_min"
            name="budget_min"
            type="text"
            inputMode="numeric"
            label="예산 최소 (원)"
            value={budgetMin}
            onChange={(e) => setBudgetMin(e.target.value)}
            hint="선택"
            error={fe?.budget_min}
          />
          <Input
            id="budget_max"
            name="budget_max"
            type="text"
            inputMode="numeric"
            label="예산 최대 (원)"
            value={budgetMax}
            onChange={(e) => setBudgetMax(e.target.value)}
            hint="선택"
            error={fe?.budget_max}
          />
        </div>
        <Input
          id="region"
          name="region"
          label="근무·협업 지역"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          required
          maxLength={80}
          placeholder="예: 서울, 전국(원격)"
          error={fe?.region}
        />
        <Textarea
          id="goals"
          name="goals"
          label="프로젝트 목표·배경"
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
          required
          maxLength={5000}
          rows={8}
          hint={`${goals.length} / 5000자`}
          error={fe?.goals}
        />

        <SubmitButton
          label={props.mode === "create" ? "요청 등록" : "변경 저장"}
        />
      </form>
    </Card>
  );
}
