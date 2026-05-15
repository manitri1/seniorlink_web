import Link from "next/link";
import { TfRequestForm } from "@/app/(dashboard)/requests/TfRequestForm";
import { RequestStatusBadge } from "@/components/requests/RequestStatusBadge";
import { Card } from "@/components/ui/Card";
import { getTfRequestById } from "@/lib/tf-request-server";

function formatBudget(min: number | null, max: number | null) {
  if (min === null && max === null) return "미입력";
  if (min !== null && max !== null) {
    return `${min.toLocaleString("ko-KR")}원 ~ ${max.toLocaleString("ko-KR")}원`;
  }
  if (min !== null) return `${min.toLocaleString("ko-KR")}원 이상`;
  return `${max!.toLocaleString("ko-KR")}원 이하`;
}

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  const { row, error } = await getTfRequestById(requestId);

  if (error || !row) {
    return (
      <p className="sl-field__error" role="alert">
        {error ?? "요청을 찾을 수 없습니다."}
      </p>
    );
  }

  const updated = new Date(row.updated_at).toLocaleString("ko-KR", {
    dateStyle: "short",
    timeStyle: "short",
  });

  return (
    <div className="sl-stack">
      <p style={{ margin: 0 }}>
        <Link href="/requests" style={{ fontSize: "0.9375rem" }}>
          ← 요청 목록
        </Link>
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1 style={{ margin: 0 }}>{row.title}</h1>
        <RequestStatusBadge status={row.status} />
      </div>

      <Card title="요약">
        <dl
          style={{
            margin: 0,
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: "8px 20px",
            fontSize: "0.9375rem",
          }}
        >
          <dt style={{ color: "var(--color-on-surface-variant)" }}>주요 분야</dt>
          <dd style={{ margin: 0 }}>{row.field}</dd>
          <dt style={{ color: "var(--color-on-surface-variant)" }}>지역</dt>
          <dd style={{ margin: 0 }}>{row.region}</dd>
          <dt style={{ color: "var(--color-on-surface-variant)" }}>기간</dt>
          <dd style={{ margin: 0 }}>{row.duration_weeks}주</dd>
          <dt style={{ color: "var(--color-on-surface-variant)" }}>예산</dt>
          <dd style={{ margin: 0 }}>{formatBudget(row.budget_min, row.budget_max)}</dd>
          <dt style={{ color: "var(--color-on-surface-variant)" }}>최종 수정</dt>
          <dd style={{ margin: 0 }}>{updated}</dd>
        </dl>
        <div style={{ marginTop: "var(--space-stack)" }}>
          <h3 style={{ margin: "0 0 8px", fontSize: "1rem" }}>프로젝트 목표</h3>
          <p style={{ margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
            {row.goals}
          </p>
        </div>
      </Card>

      {row.status === "open" ? (
        <TfRequestForm
          key={row.updated_at}
          mode="edit"
          initial={row}
        />
      ) : (
        <Card title="수정 안내">
          <p style={{ margin: 0, color: "var(--color-on-surface-variant)" }}>
            접수중 상태일 때만 내용을 수정할 수 있습니다. 변경이 필요하면
            운영 정책에 따라 별도 요청을 주세요.
          </p>
        </Card>
      )}
    </div>
  );
}
