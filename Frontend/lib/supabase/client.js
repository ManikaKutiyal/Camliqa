import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseEnv } from "@/lib/supabase/env";

let browserClient;

export function createClient() {
  if (browserClient) {
    return browserClient;
  }

  const { url, anonKey } = getSupabaseEnv();
  browserClient = createBrowserClient(url, anonKey);

  return browserClient;
}
