import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSuggestedCoupons } from "@/services/supabase/coupons";

export async function POST(request) {
  try {
    const body = await request.json();
    const { subtotal = 0, shipping = 0 } = body;

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await getSuggestedCoupons(supabase, {
      userId: user?.id || null,
      subtotal: Number(subtotal) || 0,
      shipping: Number(shipping) || 0,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Best = highest savings (already sorted desc by savings in getSuggestedCoupons)
    const best = data?.[0] || null;
    const others = data?.slice(1) || [];

    return NextResponse.json({ data: { best, others, all: data || [] } });
  } catch (err) {
    console.error("[coupons/suggest]", err);
    return NextResponse.json(
      { error: "Unable to fetch coupons. Please try again." },
      { status: 500 }
    );
  }
}
