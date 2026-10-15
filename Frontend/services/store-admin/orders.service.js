import { createClient } from "@/lib/supabase/client";
import { SUPABASE_TABLES } from "@/lib/supabase/schema";

const TIMELINE_STAGES = [
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
];

/** Format `orders.shipping_address_snapshot` (same JSON as checkout) for admin UI. */
export function formatShippingAddressSnapshot(snapshot) {
  if (snapshot == null || snapshot === "") return "—";
  let obj = snapshot;
  if (typeof snapshot === "string") {
    try {
      obj = JSON.parse(snapshot);
    } catch {
      return snapshot.trim() || "—";
    }
  }
  if (typeof obj !== "object" || obj === null) return "—";
  const lines = [];
  if (obj.fullName) lines.push(String(obj.fullName));
  if (obj.phone) lines.push(String(obj.phone));
  const street = [obj.addressLine1, obj.addressLine2].filter(Boolean).join(", ");
  if (street) lines.push(street);
  const locality = [obj.city, obj.state, obj.postalCode].filter(Boolean).join(", ");
  if (locality) lines.push(locality);
  if (obj.country) lines.push(String(obj.country));
  return lines.length > 0 ? lines.join("\n") : "—";
}

function formatPaymentMethod(method) {
  if (method == null || method === "") return "—";
  const s = String(method).replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/**
 * Single source of truth for admin order detail + drawer (matches storefront line items: product_title, variant_label).
 */
export function mapDbOrderToAdminViewModel(data) {
  if (!data) return null;

  const profile = data.profiles || {};
  const rawStatus = String(data.status || "pending").toLowerCase();

  const items = (data.order_items || []).map((oi) => {
    const title =
      oi.product_title ||
      oi.products?.title ||
      (oi.product_id ? `Product #${String(oi.product_id).slice(0, 8)}` : "Product");
    const variantRaw =
      oi.variant_label != null && String(oi.variant_label).trim() !== ""
        ? String(oi.variant_label).trim()
        : null;
    const unit = Number(oi.unit_price || 0);
    const qty = Number(oi.quantity || 1);
    const lineNum = Number(oi.total_price ?? unit * qty);

    return {
      id: oi.id,
      name: title,
      variantLabel: variantRaw,
      price: `₹${unit.toLocaleString("en-IN")}`,
      lineTotal: `₹${lineNum.toLocaleString("en-IN")}`,
      quantity: oi.quantity,
      unitAmount: unit,
      lineAmount: lineNum,
      image: oi.products?.image_url || null,
      sku: oi.sku || "—",
    };
  });

  const paymentRow = Array.isArray(data.payments) ? data.payments[0] : data.payments;
  const payStatusRaw = paymentRow?.status ?? data.payment_status ?? "—";
  const payMethodRaw = paymentRow?.method ?? data.payment_method ?? "—";
  const payStatusLabel =
    typeof payStatusRaw === "string"
      ? payStatusRaw.charAt(0).toUpperCase() + payStatusRaw.slice(1).toLowerCase()
      : String(payStatusRaw);

  const shippingAddr = formatShippingAddressSnapshot(data.shipping_address_snapshot);

  let timeline = [];
  if (rawStatus === "cancelled") {
    timeline = [
      {
        status: "Placed",
        completed: true,
        date: new Date(data.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      },
      {
        status: "Cancelled",
        completed: true,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      },
    ];
  } else {
    const stageIdx = TIMELINE_STAGES.findIndex((s) => s.value === rawStatus);
    const placed = new Date(data.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    timeline = TIMELINE_STAGES.map((stage, idx) => ({
      status: stage.label,
      completed: stageIdx !== -1 && idx <= stageIdx,
      date: placed,
    }));
  }

  const subtotalNum = Number(data.subtotal ?? data.total_amount ?? 0);
  const taxNum = Number(data.tax_amount || 0);
  const shipNum = Number(data.shipping_amount ?? 0);
  const totalNum = Number(data.total_amount || 0);

  return {
    id: data.id.substring(0, 8).toUpperCase(),
    rawId: data.id,
    createdAt: data.created_at,
    customer: profile.full_name || profile.email || "Unknown",
    email: profile.email || "—",
    phone: profile.phone || "—",
    date: new Date(data.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: new Date(data.created_at).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    total: `₹${Number(data.total_amount || 0).toLocaleString("en-IN")}`,
    subtotal: `₹${Number(data.subtotal ?? data.total_amount ?? 0).toLocaleString("en-IN")}`,
    tax: `₹${Number(data.tax_amount || 0).toLocaleString("en-IN")}`,
    shipping:
      data.shipping_amount != null
        ? `₹${Number(data.shipping_amount).toLocaleString("en-IN")}`
        : "₹0",
    status: rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1),
    statusValue: rawStatus,
    paymentStatus: payStatusLabel,
    paymentMethod: formatPaymentMethod(payMethodRaw),
    shippingAddress: shippingAddr,
    billingAddress: shippingAddr,
    shippingMethod: data.shipping_method || "—",
    shippingSnapshot: data.shipping_address_snapshot ?? null,
    amounts: {
      subtotal: subtotalNum,
      tax: taxNum,
      shipping: shipNum,
      total: totalNum,
    },
    items,
    timeline,
  };
}

export const ordersService = {
  async getAllOrders() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.orders)
      .select("*, profiles(full_name, email, phone)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getOrderById(id) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.orders)
      .select(`
        *,
        profiles(full_name, email, phone),
        order_items(*, products(title, image_url)),
        payments(id, status, method, amount, created_at)
      `)
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async updateStatus(id, status) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.orders)
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
