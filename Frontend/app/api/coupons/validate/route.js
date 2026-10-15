import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { validateCouponCode } from "@/services/supabase/coupons";

export async function POST(request) {
  try {
    const body = await request.json();
    const { code, subtotal = 0, shipping = 0 } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Please enter a coupon code." }, { status: 400 });
    }

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

    const { data, error } = await validateCouponCode(supabase, {
      code: code.trim().toUpperCase(),
      userId: user?.id || null,
      subtotal: Number(subtotal) || 0,
      shipping: Number(shipping) || 0,
    });

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || "Invalid coupon code." },
        { status: 400 }
      );
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("[coupon/validate]", err);
    return NextResponse.json(
      { error: "Unable to validate coupon. Please try again." },
      { status: 500 }
    );
  }
}
