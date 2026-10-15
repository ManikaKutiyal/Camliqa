import { NextResponse } from "next/server";

import { getSafeInternalPath } from "@/lib/security/urls";
import { createClient } from "@/lib/supabase/server";

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  // Default to /profile so email-verified users land on their dashboard
  const next = getSafeInternalPath(requestUrl.searchParams.get("next"), "/profile");

  const supabase = await createClient();

  let sessionError = null;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    sessionError = error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    sessionError = error;
  }

  if (sessionError) {
    console.error("Auth callback session error:", sessionError);
    return NextResponse.redirect(
      new URL(`/login?error=auth_callback_failed`, requestUrl.origin)
    );
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
