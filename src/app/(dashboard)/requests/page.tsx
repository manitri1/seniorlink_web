import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RequestStatusBadge } from "@/components/requests/RequestStatusBadge";
import { Card } from "@/components/ui/Card";
import {
  isRequestStatus,
  REQUEST_STATUS_LABELS,
  type RequestStatus,
} from "@/lib/tf-request";

const FILTER_KEYS: (RequestStatus | "all")[] = [
  "all",
  "open",
  "matching",
  "in_progress",
  "completed",
  "cancelled",
];

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const statusFilter = isRequestStatus(sp.status) ? sp.status : null;

  const supabase = await createClient();
  let q = supabase
    .from("tf_requests")
    .select(
      "id, title, field, status, region, duration_weeks, created_at"
    )
    .order("created_at", { ascending: false });
  if (statusFilter) {
    q = q.eq("status", statusFilter);
  }
  const { data: rows, error } = await q;

  if (error) {
    return (
      <p className="sl-field__error" role="alert">
        목록을 불러오지 못했습니다: {error.message}
      </p>
    );
  }

  const list = rows ?? [];

  return (
    <div className="sl-stack">
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1 style={{ margin: 0 }}>TF 요청</h1>
        <Link
          href="/requests/new"
          className="sl-button sl-button--primary"
          style={{ display: "inline-flex", textDecoration: "none" }}
        >
          새 요청 작성
        </Link>
      </div>

      <nav aria-label="상태 필터" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {FILTER_KEYS.map((s) => {
          const active = s === "all" ? !statusFilter : statusFilter === s;
          const href = s === "all" ? "/requests" : `/requests?status=${s}`;
          return (
            <Link
              key={s}
              href={href}
              className={
                active ? "sl-button sl-button--primary" : "sl-button sl-button--outline"
              }
              style={{
                display: "inline-flex",
                minHeight: "40px",
                padding: "8px 14px",
                textDecoration: "none",
              }}
              aria-current={active ? "page" : undefined}
            >
              {s === "all" ? "전체" : REQUEST_STATUS_LABELS[s]}
            </Link>
          );
        })}
      </nav>

      {list.length === 0 ? (
        <Card title="등록된 요청이 없습니다">
          <p style={{ margin: "0 0 var(--space-stack)" }}>
            {statusFilter
              ? "이 상태에 해당하는 요청이 없습니다. 필터를 바꾸거나 새 요청을 등록해 보세요."
              : "단기 TF가 필요할 때 새 요청을 등록해 보세요."}
          </p>
          <Link
            href="/requests/new"
            className="sl-button sl-button--cta"
            style={{ display: "inline-flex", textDecoration: "none" }}
          >
            새 요청 작성
          </Link>
        </Card>
      ) : (
        <Card title="요청 목록">
          <div style={{ overflowX: "auto" }}>
            <table
              aria-label="TF 요청 목록"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.9375rem",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-outline-variant)" }}>
                  <th scope="col" style={{ textAlign: "left", padding: "12px 8px" }}>
                    제목
                  </th>
                  <th scope="col" style={{ textAlign: "left", padding: "12px 8px" }}>
                    분야
                  </th>
                  <th scope="col" style={{ textAlign: "left", padding: "12px 8px" }}>
                    지역
                  </th>
                  <th scope="col" style={{ textAlign: "right", padding: "12px 8px" }}>
                    기간(주)
                  </th>
                  <th scope="col" style={{ textAlign: "left", padding: "12px 8px" }}>
                    상태
                  </th>
                  <th scope="col" style={{ textAlign: "left", padding: "12px 8px" }}>
                    등록일
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((r) => {
                  const st = isRequestStatus(r.status) ? r.status : null;
                  const created = new Date(r.created_at).toLocaleString("ko-KR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  });
                  return (
                    <tr
                      key={r.id}
                      style={{ borderBottom: "1px solid var(--color-outline-variant)" }}
                    >
                      <td style={{ padding: "12px 8px" }}>
                        <Link href={`/requests/${r.id}`}>{r.title}</Link>
                      </td>
                      <td style={{ padding: "12px 8px" }}>{r.field}</td>
                      <td style={{ padding: "12px 8px" }}>{r.region}</td>
                      <td style={{ padding: "12px 8px", textAlign: "right" }}>
                        {r.duration_weeks}
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        {st ? <RequestStatusBadge status={st} /> : r.status}
                      </td>
                      <td style={{ padding: "12px 8px", whiteSpace: "nowrap" }}>
                        {created}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
