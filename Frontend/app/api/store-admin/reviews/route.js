import { NextResponse } from "next/server";

import { requireAdminUser } from "@/lib/security/auth";
import { toErrorResponse } from "@/lib/security/errors";
import { adminGetReviews } from "@/services/supabase/reviews";

export async function GET() {
  try {
    const { admin } = await requireAdminUser();
    const { data, error } = await adminGetReviews(admin);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    return toErrorResponse(error, "Failed to load reviews.");
  }
}
