import type { SupabaseClient } from "@supabase/supabase-js";

const DEMO_REASONS = [
  "요청 분야·키워드와 경력 키워드가 유사합니다.",
  "근무 지역·가용 형태가 요청과 맞습니다.",
  "유사 규모 프로젝트 수행 이력이 있습니다.",
  "TF 기간·역할 범위가 요청과 정합합니다.",
];

/**
 * 매칭 후보가 없으면 시니어 풀에서 최대 5명까지 데모 행을 채웁니다(MVP).
 * `ignoreDuplicates`로 동시 요청·재진입 시에도 안전하게 처리합니다.
 */
export async function ensureRequestMatches(
  supabase: SupabaseClient,
  requestId: string
): Promise<{ ok: true } | { error: string }> {
  const { count, error: countErr } = await supabase
    .from("request_matches")
    .select("*", { head: true, count: "exact" })
    .eq("request_id", requestId);

  if (countErr) {
    return { error: countErr.message };
  }
  if ((count ?? 0) > 0) {
    return { ok: true };
  }

  const { data: seniors, error: senErr } = await supabase
    .from("senior_profiles")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(5);

  if (senErr) {
    return { error: senErr.message };
  }
  if (!seniors?.length) {
    return {
      error:
        "시니어 풀 데이터가 없습니다. `20260516000000_matches_proposals` 마이그레이션을 적용했는지 확인해 주세요.",
    };
  }

  const rows = seniors.map((s, i) => ({
    request_id: requestId,
    senior_id: s.id,
    fit_score: Math.max(0.58, 0.93 - i * 0.07),
    match_reasons: [DEMO_REASONS[i % DEMO_REASONS.length]],
  }));

  const { error: insErr } = await supabase.from("request_matches").upsert(rows, {
    onConflict: "request_id,senior_id",
    ignoreDuplicates: true,
  });

  if (insErr) {
    return { error: insErr.message };
  }
  return { ok: true };
}
