import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabase-admin";
import { SUPABASE_TABLES } from "@/lib/supabase/schema";

export async function GET() {
  try {
    const admin = createAdminClient();

    const { data, error } = await admin
      .from(SUPABASE_TABLES.orders)
      .select(`
        id,
        status,
        total_amount,
        created_at,
        shipping_address_snapshot,
        shiprocket_order_id,
        awb_code,
        courier_name,
        profiles (
          full_name,
          email,
          phone
        ),
        order_items (
          id,
          product_title,
          variant_label,
          quantity,
          unit_price,
          total_price,
          products (
            image_url
          )
        ),
        payments (
          id,
          status,
          method,
          amount
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("Admin orders GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
