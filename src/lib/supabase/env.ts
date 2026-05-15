/**
 * Supabase 공개 환경 변수.
 * 대시보드에 따라 JWT `anon` 키 또는 `sb_publishable_…` 키가 제공되므로 둘 다 지원합니다.
 * @see https://supabase.com/docs/guides/api/api-keys
 */
export function getPublicSupabaseUrl(): string | undefined {
  const v = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  return v || undefined;
}

export function getPublicSupabasePublishableKey(): string | undefined {
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (anon) return anon;
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  return publishable || undefined;
}

export const SUPABASE_PUBLIC_ENV_HINT =
  "NEXT_PUBLIC_SUPABASE_URL 과 NEXT_PUBLIC_SUPABASE_ANON_KEY 또는 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 를 설정하세요. (.env.example 참고)";
