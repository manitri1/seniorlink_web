"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { submitContractReview } from "@/app/(dashboard)/contracts/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Toast } from "@/components/ui/Toast";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "등록 중…" : "후기 등록"}
    </Button>
  );
}

type Props = { contractId: string; seniorId: string };

export function ContractReviewSection({ contractId, seniorId }: Props) {
  const router = useRouter();
  const [state, formAction] = useActionState(submitContractReview, null);
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (state?.success) {
      setComment("");
      router.refresh();
    }
  }, [state?.success, router]);

  return (
    <Card title="계약 후기">
      <p style={{ margin: "0 0 var(--space-stack)", color: "var(--color-on-surface-variant)" }}>
        완료된 계약에 대해 10자 이상 코멘트와 별점을 남겨 주세요.
      </p>
      <form action={formAction} className="sl-stack">
        <input type="hidden" name="contract_id" value={contractId} />
        <input type="hidden" name="senior_id" value={seniorId} />
        {state?.error ? (
          <Toast variant="error" title="등록 실패">
            {state.error}
          </Toast>
        ) : null}
        {state?.success ? (
          <Toast variant="success" title={state.success} />
        ) : null}
        <div className="sl-field">
          <label className="sl-label" htmlFor="rating_select">
            별점
          </label>
          <select
            id="rating_select"
            name="rating"
            className="sl-input"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            style={{ width: "100%", minHeight: "48px" }}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={String(n)}>
                {n}점
              </option>
            ))}
          </select>
        </div>
        <Textarea
          id="review_comment"
          name="comment"
          label="코멘트"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          minLength={10}
          maxLength={500}
          rows={4}
          hint={`${comment.length} / 500자 (최소 10자)`}
        />
        <Submit />
      </form>
    </Card>
  );
}
