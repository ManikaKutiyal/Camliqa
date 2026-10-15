import { NextResponse } from "next/server";
import { getShiprocketEnv } from "@/lib/server/env";
import { createAdminClient } from "@/lib/server/supabase-admin";
import { SUPABASE_TABLES, ORDER_STATUS } from "@/lib/supabase/schema";

// Helper to map Shiprocket tracking status to internal DB order status
function mapShiprocketStatus(shiprocketStatus) {
  const status = (shiprocketStatus || "").toUpperCase();

  if (["DELIVERED"].includes(status)) {
    return ORDER_STATUS.delivered;
  }
  if (["CANCELED", "CANCELLED", "RTO INITIATED", "RTO DELIVERED", "RTO ACKNOWLEDGED"].includes(status)) {
    return ORDER_STATUS.cancelled;
  }
  if (["PICKED UP", "IN TRANSIT", "OUT FOR DELIVERY", "SHIPPED"].includes(status)) {
    return ORDER_STATUS.shipped;
  }
  
  // By default if we don't know, we might just consider it processing still
  return null;
}

export async function POST(request) {
  try {
    const { webhookSecret } = getShiprocketEnv();
    
    // Verify Webhook Secret
    const apiKeyHeader = request.headers.get("x-api-key");
    if (webhookSecret && apiKeyHeader !== webhookSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const { awb, current_status, shipment_id } = payload;

    if (!awb || !current_status) {
      return NextResponse.json({ received: true, ignored: true, reason: "Missing awb or status" });
    }

    const supabase = createAdminClient();

    // 1. Find the Shiprocket order in our DB
    const { data: srOrder, error: srError } = await supabase
      .from(SUPABASE_TABLES.shiprocketOrders)
      .select("order_id, id")
      .eq("awb_code", awb)
      .maybeSingle();

    if (srError) {
      console.error("Shiprocket webhook DB error:", srError);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    if (!srOrder) {
      console.warn(`Shiprocket webhook received for unknown AWB: ${awb}`);
      return NextResponse.json({ received: true, ignored: true, reason: "AWB not found" });
    }

    // 2. Map status
    const internalStatus = mapShiprocketStatus(current_status);

    // 3. Update shiprocket_orders table with the exact status string
    await supabase
      .from(SUPABASE_TABLES.shiprocketOrders)
      .update({
        status: current_status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", srOrder.id);

    // 4. Update core orders table if we have a mapped internal status
    if (internalStatus) {
      await supabase
        .from(SUPABASE_TABLES.orders)
        .update({
          status: internalStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", srOrder.order_id);
    }

    return NextResponse.json({ received: true, updated: true });
  } catch (error) {
    console.error("Shiprocket webhook error:", error);
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}
