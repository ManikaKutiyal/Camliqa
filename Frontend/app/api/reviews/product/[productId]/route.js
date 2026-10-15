import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getProductReviews } from "@/services/supabase/reviews";

export async function GET(_request, { params }) {
  const supabase = await createClient();
  const { productId } = await params;

  if (!productId) {
    return NextResponse.json({ error: "Product id is required." }, { status: 400 });
  }

  const { data, error } = await getProductReviews(supabase, productId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data: data || [] });
}
