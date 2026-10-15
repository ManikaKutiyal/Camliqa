import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabaseAdminEnv } from "@/lib/server/env";

export function createAdminClient() {
  const { url, serviceRoleKey } = getSupabaseAdminEnv();

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
