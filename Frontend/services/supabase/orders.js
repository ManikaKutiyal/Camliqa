import { SUPABASE_TABLES } from "@/lib/supabase/schema"

export async function getCustomerOrders(supabase, userId) {
  return supabase
    .from(SUPABASE_TABLES.orders)
    .select(`
      id,
      user_id,
      status,
      total_amount,
      created_at,
      shipping_address_snapshot,
      awb_code,
      courier_name,
      shiprocket_order_id,
      payments (
        id,
        amount,
        status,
        method,
        created_at
      ),
      order_items (
        id,
        product_id,
        product_title,
        variant_label,
        quantity,
        unit_price,
        total_price,
        products (
          image_url
        )
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
}

/** Full order row for PDF / invoice (RLS + user_id must match the signed-in customer). */
export function getCustomerOrderForInvoice(supabase, orderId, userId) {
  return supabase
    .from(SUPABASE_TABLES.orders)
    .select(
      `
      *,
      profiles(full_name, email, phone),
      order_items(*, products(title, image_url)),
      payments(id, status, method, amount, created_at)
    `
    )
    .eq("id", orderId)
    .eq("user_id", userId)
    .single()
}

export async function adminGetFullOrders(supabase) {
  return supabase
    .from(SUPABASE_TABLES.orders)
    .select(`
      id,
      user_id,
      status,
      total_amount,
      created_at,
      profiles (
        full_name,
        email
      ),
      payments (
        id,
        amount,
        status,
        method,
        created_at
      )
    `)
    .order("created_at", { ascending: false })
}

export async function adminUpdateOrderStatus(supabase, orderId, status) {
  return supabase
    .from(SUPABASE_TABLES.orders)
    .update({ status })
    .eq("id", orderId)
    .select()
    .single()
}

export async function createCheckoutOrder(supabase, orderValues, paymentValues, orderItems = []) {
  void supabase;
  void orderValues;
  void paymentValues;
  void orderItems;

  return {
    data: null,
    error: {
      message: "Direct checkout inserts are disabled. Use /api/checkout/create-order instead.",
    },
  };
}

export async function decrementVariantStock(supabase, variantId, nextStockCount) {
  return supabase
    .from(SUPABASE_TABLES.productVariants)
    .update({ stock_count: nextStockCount })
    .eq("id", variantId)
    .select()
    .single();
}
