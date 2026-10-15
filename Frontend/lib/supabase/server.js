import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseEnv } from "@/lib/supabase/env";

export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          const rememberMeCookie = cookieStore.get("auth_remember_me")?.value;
          const isRememberMe = rememberMeCookie !== "false";
          
          cookiesToSet.forEach(({ name, value, options }) => {
            const finalOptions = { ...options };
            if (!isRememberMe) {
              delete finalOptions.maxAge;
              delete finalOptions.expires;
            }
            cookieStore.set(name, value, finalOptions);
          });
        } catch {
          // Middleware handles auth cookie refresh when writes are blocked.
        }
      },
    },
  });
}
