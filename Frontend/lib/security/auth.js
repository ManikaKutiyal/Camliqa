import "server-only";

import { createClient } from "@/lib/supabase/server";
import { SUPABASE_TABLES } from "@/lib/supabase/schema";
import { HttpError } from "@/lib/security/errors";
import { createAdminClient } from "@/lib/server/supabase-admin";

export async function requireAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new HttpError(401, "Unauthorized");
  }

  return { supabase, user };
}

export async function requireAdminUser() {
  const { supabase, user } = await requireAuthenticatedUser();
  const { data: profile, error } = await supabase
    .from(SUPABASE_TABLES.profiles)
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !profile || !["admin", "superadmin"].includes(String(profile.role || "").toLowerCase())) {
    throw new HttpError(403, "Forbidden");
  }

  return {
    supabase,
    user,
    profile,
    admin: createAdminClient(),
  };
}
