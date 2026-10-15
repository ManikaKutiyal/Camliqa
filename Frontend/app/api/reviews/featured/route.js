import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getFeaturedReviews } from "@/services/supabase/reviews";

export async function GET(request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const rawLimit = Number(searchParams.get("limit") || 8);
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 8) : 8;

  const { data, error } = await getFeaturedReviews(supabase, limit);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data: data || [] });
}
