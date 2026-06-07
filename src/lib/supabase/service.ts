import { createClient } from "@supabase/supabase-js";
import { getPublicSupabaseUrl } from "@/lib/supabase/env";

/**
 * Service Role 클라이언트 — 서버 전용 (Route Handler, Server Action).
 * 절대 NEXT_PUBLIC_ 변수로 노출하지 않는다.
 */
export function createServiceClient() {
  const url = getPublicSupabaseUrl();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL 과 SUPABASE_SERVICE_ROLE_KEY 를 설정하세요.",
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
