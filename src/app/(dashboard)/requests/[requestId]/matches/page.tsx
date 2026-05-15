import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ensureRequestMatches } from "@/lib/request-matches";
import { Card } from "@/components/ui/Card";

type SeniorEmbed = {
  display_name: string;
  headline: string | null;
  fields: string[] | null;
  region: string;
  years_experience: number | null;
};

type MatchListRow = {
  id: string;
  senior_id: string;
  fit_score: number | string;
  match_reasons: string[] | null;
  senior_profiles: SeniorEmbed | SeniorEmbed[] | null;
};

function unwrapSenior(
  s: SeniorEmbed | SeniorEmbed[] | null | undefined
): SeniorEmbed | null {
  if (s == null) return null;
  return Array.isArray(s) ? (s[0] ?? null) : s;
}

function fitPct(score: number | string) {
  const n = typeof score === "string" ? Number.parseFloat(score) : score;
  if (!Number.isFinite(n)) return "—";
  return `${Math.round(n * 100)}%`;
}

export default async function RequestMatchesPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  const supabase = await createClient();

  const ensured = await ensureRequestMatches(supabase, requestId);
  if ("error" in ensured) {
    return (
      <p className="sl-field__error" role="alert">
        {ensured.error}
      </p>
    );
  }

  const { data: rows, error } = await supabase
    .from("request_matches")
    .select(
      "id, senior_id, fit_score, match_reasons, senior_profiles ( display_name, headline, fields, region, years_experience )"
    )
    .eq("request_id", requestId)
    .order("fit_score", { ascending: false });

  if (error) {
    return (
      <p className="sl-field__error" role="alert">
        매칭 결과를 불러오지 못했습니다: {error.message}
      </p>
    );
  }

  const list = (rows ?? []) as unknown as MatchListRow[];

  const { data: pendingRows } = await supabase
    .from("proposals")
    .select("senior_id")
    .eq("request_id", requestId)
    .eq("status", "pending");

  const pendingSeniorIds = new Set(
    (pendingRows ?? []).map((p) => p.senior_id as string)
  );

  return (
    <div className="sl-stack">
      <p style={{ margin: 0 }}>
        <Link href={`/requests/${requestId}`} style={{ fontSize: "0.9375rem" }}>
          ← 요청 개요
        </Link>
      </p>

      <Card title="매칭 결과">
        <p style={{ margin: "0 0 var(--space-stack)", color: "var(--color-on-surface-variant)" }}>
          MVP 데모: 시니어 풀과 요청을 바탕으로 후보를 자동 채웁니다. 실제 서비스에서는
          RPC·외부 엔진 결과를 동기화합니다.
        </p>

        {list.length === 0 ? (
          <p style={{ margin: 0 }}>표시할 후보가 없습니다.</p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}
          >
            {list.map((row, index) => {
              const sp = unwrapSenior(row.senior_profiles);
              const name = sp?.display_name ?? "이름 미상";
              const headline = sp?.headline ?? "";
              const fields = (sp?.fields ?? []).join(" · ");
              const region = sp?.region ?? "—";
              const reasons = row.match_reasons ?? [];
              const hasPending = pendingSeniorIds.has(row.senior_id);
              const isLast = index === list.length - 1;

              return (
                <li
                  key={row.id}
                  style={{
                    padding: "24px 0",
                    borderBottom: isLast
                      ? "none"
                      : "1px solid var(--color-outline-variant)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "16px",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                      <h2 style={{ margin: "0 0 6px", fontSize: "1.125rem" }}>{name}</h2>
                      {headline ? (
                        <p
                          style={{
                            margin: "0 0 8px",
                            color: "var(--color-on-surface-variant)",
                            fontSize: "0.9375rem",
                          }}
                        >
                          {headline}
                        </p>
                      ) : null}
                      <p style={{ margin: 0, fontSize: "0.875rem" }}>
                        <span style={{ color: "var(--color-on-surface-variant)" }}>분야</span>{" "}
                        {fields || "—"}
                      </p>
                      <p style={{ margin: "6px 0 0", fontSize: "0.875rem" }}>
                        <span style={{ color: "var(--color-on-surface-variant)" }}>지역</span>{" "}
                        {region} · 경력{" "}
                        {typeof sp?.years_experience === "number"
                          ? `${sp.years_experience}년`
                          : "—"}
                      </p>
                      {reasons.length > 0 ? (
                        <ul style={{ margin: "12px 0 0", paddingLeft: "1.25rem" }}>
                          {reasons.map((r) => (
                            <li key={r} style={{ fontSize: "0.875rem" }}>
                              {r}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                    <div
                      style={{
                        flex: "0 0 auto",
                        textAlign: "right",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        alignItems: "flex-end",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "1.25rem",
                          fontWeight: 700,
                          color: "var(--color-primary)",
                        }}
                        aria-label="적합도"
                      >
                        {fitPct(row.fit_score)}
                      </span>
                      {hasPending ? (
                        <span
                          style={{
                            fontSize: "0.875rem",
                            color: "var(--color-on-surface-variant)",
                          }}
                        >
                          제안 대기중
                        </span>
                      ) : (
                        <Link
                          href={`/requests/${requestId}/proposals?senior=${row.senior_id}`}
                          className="sl-button sl-button--cta"
                          style={{ display: "inline-flex", textDecoration: "none" }}
                        >
                          이 후보에게 제안
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
