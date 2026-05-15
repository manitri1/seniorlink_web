import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ContractStatusBadge } from "@/components/contracts/ContractStatusBadge";
import { Card } from "@/components/ui/Card";
import { isContractStatus } from "@/lib/contract";

type ListRow = {
  id: string;
  status: string;
  progress: number;
  start_date: string;
  end_date: string;
  compensation: number;
  proposals: {
    senior_profiles: { display_name: string } | { display_name: string }[] | null;
    tf_requests: { title: string } | { title: string }[] | null;
  } | null;
};

function unwrap<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default async function ContractsPage() {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("contracts")
    .select(
      `
      id,
      status,
      progress,
      start_date,
      end_date,
      compensation,
      proposals (
        senior_profiles ( display_name ),
        tf_requests ( title )
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <p className="sl-field__error" role="alert">
        계약 목록을 불러오지 못했습니다: {error.message}
      </p>
    );
  }

  const list = (rows ?? []) as unknown as ListRow[];

  return (
    <div className="sl-stack">
      <h1 style={{ margin: 0 }}>계약</h1>
      <p style={{ margin: 0, color: "var(--color-on-surface-variant)" }}>
        수락된 제안에서 계약을 만들고, 진행·정산·후기까지 이어집니다.
      </p>

      {list.length === 0 ? (
        <Card title="계약이 없습니다">
          <p style={{ margin: "0 0 var(--space-stack)" }}>
            제안 탭에서 <strong>데모: 수락 처리</strong> 후 계약을 생성해 보세요.
          </p>
          <Link href="/requests" className="sl-button sl-button--primary" style={{ display: "inline-flex", textDecoration: "none" }}>
            TF 요청으로 이동
          </Link>
        </Card>
      ) : (
        <Card title="계약 목록">
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
              const st = isContractStatus(row.status) ? row.status : null;
              const sp = unwrap(row.proposals?.senior_profiles);
              const tr = unwrap(row.proposals?.tf_requests);
              const title = tr?.title ?? "—";
              const name = sp?.display_name ?? "—";
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
                      gap: "12px",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <Link href={`/contracts/${row.id}`} style={{ fontWeight: 600 }}>
                        {title}
                      </Link>
                      <p style={{ margin: "6px 0 0", fontSize: "0.875rem" }}>
                        시니어 {name} · {row.start_date} ~ {row.end_date}
                      </p>
                      <p style={{ margin: "4px 0 0", fontSize: "0.875rem" }}>
                        보수 {row.compensation.toLocaleString("ko-KR")}원 · 진행률{" "}
                        {row.progress}%
                      </p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                      {st ? <ContractStatusBadge status={st} /> : row.status}
                      <Link
                        href={`/contracts/${row.id}/settlement`}
                        className="sl-button sl-button--outline"
                        style={{ display: "inline-flex", textDecoration: "none", minHeight: "40px" }}
                      >
                        정산
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
