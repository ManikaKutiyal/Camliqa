import { createClient } from "@/lib/supabase/server";
import { getFeaturedProducts } from "@/services/supabase/products";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "8", 10);

    const supabase = await createClient();
    const { data, error } = await getFeaturedProducts(supabase, limit);

    if (error) {
      console.error("[/api/products/featured] Supabase error:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch featured products." },
        { status: 500 }
      );
    }

    return NextResponse.json({ products: data || [] });
  } catch (err) {
    console.error("[/api/products/featured] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
