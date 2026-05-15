import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { RequestStatusBadge } from "@/components/requests/RequestStatusBadge";
import { getDashboardSnapshot } from "@/lib/dashboard-server";
import { isRequestStatus } from "@/lib/tf-request";

function StatCard({
  title,
  value,
  description,
  href,
}: {
  title: string;
  value: number;
  description: string;
  href: string;
}) {
  return (
    <Card title={title}>
      <Link
        href={href}
        style={{
          display: "block",
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontSize: "2.25rem",
            fontWeight: 700,
            color: "var(--color-primary)",
            lineHeight: 1.1,
          }}
          aria-label={`${title} ${value}건`}
        >
          {value}
        </p>
        <p
          style={{
            margin: "12px 0 0",
            fontSize: "0.9375rem",
            color: "var(--color-on-surface-variant)",
          }}
        >
          {description}
        </p>
        <span
          style={{
            display: "inline-block",
            marginTop: "16px",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "var(--color-primary-container)",
          }}
        >
          자세히 보기 →
        </span>
      </Link>
    </Card>
  );
}

export default async function DashboardHomePage() {
  const { counts, recentRequests, loadError } = await getDashboardSnapshot();
  const hasActivity =
    counts.tfActive +
      counts.proposalsPending +
      counts.contractsPipeline >
    0;

  return (
    <div className="sl-stack">
      <div>
        <h1 style={{ margin: "0 0 8px", fontSize: "1.5rem" }}>대시보드</h1>
        <p style={{ margin: 0, color: "var(--color-on-surface-variant)" }}>
          진행 중인 TF·제안·계약을 한눈에 보고, 주요 작업으로 바로 이동합니다.
        </p>
      </div>

      {loadError ? (
        <p className="sl-field__error" role="alert">
          집계를 불러오지 못했습니다: {loadError}
        </p>
      ) : null}

      <div
        className="sl-dashboard-stat-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "var(--space-stack)",
          alignItems: "stretch",
        }}
      >
        <StatCard
          title="진행 중 TF 요청"
          value={counts.tfActive}
          description="접수·매칭·진행 단계(완료·취소 제외)"
          href="/requests"
        />
        <StatCard
          title="대기 중인 제안"
          value={counts.proposalsPending}
          description="시니어에게 보낸 제안 중 응답 대기"
          href="/requests"
        />
        <StatCard
          title="진행 중 계약"
          value={counts.contractsPipeline}
          description="초안·활성·정산 요청까지"
          href="/contracts"
        />
      </div>

      {!loadError && !hasActivity ? (
        <Card title="시작하기">
          <p style={{ margin: 0, color: "var(--color-on-surface-variant)" }}>
            아직 등록된 진행 건이 없습니다. TF 요청을 만들면 매칭·제안으로
            이어집니다.
          </p>
          <div style={{ marginTop: "var(--space-stack)" }}>
            <Link href="/requests/new" className="sl-button sl-button--cta">
              새 TF 요청 작성
            </Link>
          </div>
        </Card>
      ) : null}

      <Card title="최근 TF 요청">
        {recentRequests.length === 0 ? (
          <p style={{ margin: 0, color: "var(--color-on-surface-variant)" }}>
            등록된 요청이 없습니다.{" "}
            <Link href="/requests/new">첫 요청을 등록해 보세요.</Link>
          </p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-unit)",
            }}
          >
            {recentRequests.map((row) => (
              <li
                key={row.id}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  padding: "12px 0",
                  borderBottom: "1px solid var(--color-outline-variant)",
                }}
              >
                <Link
                  href={`/requests/${row.id}`}
                  style={{ fontWeight: 600, flex: "1 1 200px" }}
                >
                  {row.title}
                </Link>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {isRequestStatus(row.status) ? (
                    <RequestStatusBadge status={row.status} />
                  ) : (
                    <span style={{ fontSize: "0.875rem" }}>{row.status}</span>
                  )}
                  <time
                    dateTime={row.created_at}
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--color-on-surface-variant)",
                    }}
                  >
                    {new Date(row.created_at).toLocaleDateString("ko-KR")}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p style={{ margin: "var(--space-stack) 0 0", fontSize: "0.875rem" }}>
          <Link href="/requests">전체 요청 목록</Link>
          {" · "}
          <Link href="/company/profile">기업 프로필</Link>
          {" · "}
          <Link href="/settings">설정</Link>
        </p>
      </Card>
    </div>
  );
}
