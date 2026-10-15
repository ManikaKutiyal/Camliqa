import "server-only";

import { hasShiprocketEnv, getShiprocketEnv } from "@/lib/server/env";
import { createShiprocketOrder, assignAwb, requestPickup } from "@/lib/server/shiprocket-client";
import { SUPABASE_TABLES } from "@/lib/supabase/schema";

export async function processShiprocketFulfillment(supabase, orderId) {
  try {
    // 1. Fetch full order and address details
    const { data: order, error } = await supabase
      .from(SUPABASE_TABLES.orders)
      .select(`
        *,
        profiles(full_name, email, phone),
        order_items(*, products(title, image_url))
      `)
      .eq("id", orderId)
      .single();

    if (error || !order) {
      throw new Error(`Order not found or fetch failed: ${error?.message}`);
    }

    // Graceful degradation if keys are missing
    if (!hasShiprocketEnv()) {
      console.warn("SHIPROCKET API KEYS MISSING. Simulating fulfillment for order:", orderId);
      return { success: true, simulated: true };
    }

    const { pickupLocationId } = getShiprocketEnv();
    const address = order.shipping_address_snapshot || {};
    
    // 2. Format data for Shiprocket API
    const shiprocketPayload = {
      order_id: order.id,
      order_date: new Date(order.created_at).toISOString(),
      pickup_location: pickupLocationId,
      billing_customer_name: address.firstName || "Customer",
      billing_last_name: address.lastName || "",
      billing_address: address.addressLine1 || "N/A",
      billing_address_2: address.addressLine2 || "",
      billing_city: address.city || "N/A",
      billing_pincode: address.pincode || "000000",
      billing_state: address.state || "N/A",
      billing_country: address.country || "India",
      billing_email: order.profiles?.email || "anonymous@example.com",
      billing_phone: address.phone || order.profiles?.phone || "0000000000",
      shipping_is_billing: true,
      order_items: (order.order_items || []).map(item => ({
        name: item.products?.title || item.product_title || "Item",
        sku: item.sku || "N/A",
        units: item.quantity,
        selling_price: item.unit_price,
      })),
      payment_method: "Prepaid",
      sub_total: order.total_amount,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5,
    };

    // 3. Create Server-side Order
    const createRes = await createShiprocketOrder(shiprocketPayload);
    const shiprocketOrderId = createRes.order_id;
    const shipmentId = createRes.shipment_id;

    if (!shiprocketOrderId || !shipmentId) {
      throw new Error("Shiprocket failed to return order_id or shipment_id.");
    }

    // 4. AWB & Courier Assignment
    const awbRes = await assignAwb(shipmentId);
    const awbCode = awbRes.response?.data?.awb_code;
    const courierName = awbRes.response?.data?.courier_name;

    // 5. Pickup Scheduling
    await requestPickup(shipmentId);

    // 6. Update DB
    await supabase.from(SUPABASE_TABLES.shiprocketOrders).insert({
      order_id: order.id,
      shiprocket_order_id: shiprocketOrderId.toString(),
      shipment_id: shipmentId.toString(),
      awb_code: awbCode || null,
      courier_name: courierName || null,
      status: "PICKUP SCHEDULED",
    });

    await supabase.from(SUPABASE_TABLES.orders)
      .update({
        shiprocket_order_id: shiprocketOrderId.toString(),
        awb_code: awbCode || null,
        courier_name: courierName || null,
      })
      .eq("id", order.id);

    return { success: true, shiprocketOrderId, shipmentId, awbCode, courierName };

  } catch (error) {
    console.error("Failed to process Shiprocket fulfillment for order", orderId, error);
    // Return graceful failure, we don't want to crash the payment webhook
    return { success: false, error: error.message };
  }
}
