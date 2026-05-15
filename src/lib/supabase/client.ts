import { createBrowserClient } from "@supabase/ssr";
import {
  getPublicSupabasePublishableKey,
  getPublicSupabaseUrl,
  SUPABASE_PUBLIC_ENV_HINT,
} from "@/lib/supabase/env";

export function createClient() {
  const url = getPublicSupabaseUrl();
  const key = getPublicSupabasePublishableKey();
  if (!url || !key) {
    throw new Error(SUPABASE_PUBLIC_ENV_HINT);
  }
  return createBrowserClient(url, key);
}
