import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/supabase/env";

export function updateSession(request) {
  let response = NextResponse.next({
    request,
  });

  // Allow the app shell to run locally before Supabase credentials are configured.
  if (!hasSupabaseEnv()) {
    return response;
  }

  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  supabase.auth.getUser().catch(() => null);

  return response;
}
