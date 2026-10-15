import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabase-admin";
import { SUPABASE_TABLES } from "@/lib/supabase/schema";

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Order ID and status are required" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data, error } = await admin
      .from(SUPABASE_TABLES.orders)
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, status")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("Admin order PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
