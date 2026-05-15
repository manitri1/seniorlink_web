import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  getPublicSupabasePublishableKey,
  getPublicSupabaseUrl,
  SUPABASE_PUBLIC_ENV_HINT,
} from "@/lib/supabase/env";

export async function createClient() {
  const url = getPublicSupabaseUrl();
  const key = getPublicSupabasePublishableKey();
  if (!url || !key) {
    throw new Error(SUPABASE_PUBLIC_ENV_HINT);
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          /* Server Component 등 set 불가 컨텍스트 — 미들웨어에서 세션 갱신 */
        }
      },
    },
  });
}
