import { SUPABASE_TABLES } from "@/lib/supabase/schema"

function asDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseCouponMeta(description) {
  if (!description || typeof description !== "string") {
    return { hidden: false, firstOrderOnly: false, note: "", maxDiscountAmount: 0 };
  }
  try {
    const parsed = JSON.parse(description);
    if (parsed && typeof parsed === "object") {
      return {
        hidden: Boolean(parsed.hidden || parsed.private),
        firstOrderOnly: Boolean(parsed.firstOrderOnly),
        maxDiscountAmount: Number(parsed.maxDiscountAmount) || 0,
        note: typeof parsed.note === "string" ? parsed.note : "",
      };
    }
  } catch {
    // Non-JSON descriptions are treated as plain notes.
  }
  return { hidden: false, firstOrderOnly: false, note: description, maxDiscountAmount: 0 };
}

function getDealTypeLabel(dealType) {
  const t = String(dealType || "").toLowerCase();
  if (t === "free_shipping") return "free_shipping";
  if (t === "fixed_amount") return "fixed_amount";
  return "discount";
}

function normalizeCouponRow(coupon) {
  const meta = parseCouponMeta(coupon.description);
  return {
    id: coupon.id,
    code: String(coupon.code || "").toUpperCase(),
    name: coupon.name || "Coupon",
    dealType: getDealTypeLabel(coupon.deal_type),
    discountPercent: Number(coupon.discount_percent || 0),
    discountAmount: Number(coupon.discount_amount || 0),
    minimumOrderAmount: Number(coupon.minimum_order_amount || 0),
    usageLimit: coupon.usage_limit != null ? Number(coupon.usage_limit) : null,
    timesUsed: Number(coupon.times_used || coupon.used_count || 0),
    startsAt: coupon.starts_at || coupon.start_date || null,
    endsAt: coupon.ends_at || coupon.end_date || null,
    active: Boolean(coupon.active),
    hidden: meta.hidden,
    firstOrderOnly: meta.firstOrderOnly,
    maxDiscountAmount: meta.maxDiscountAmount,
    note: meta.note || coupon.name || "",
  };
}

function getCouponInvalidReason(coupon, subtotal, isFirstOrder) {
  const now = new Date();
  if (!coupon.active) return "Coupon is not active.";
  const start = asDate(coupon.startsAt);
  const end = asDate(coupon.endsAt);
  if (start && now < start) return "Coupon is not active yet.";
  if (end && now > end) return "Coupon has expired.";
  if (coupon.minimumOrderAmount > 0 && subtotal < coupon.minimumOrderAmount) {
    return `Minimum order amount is ₹${coupon.minimumOrderAmount.toLocaleString("en-IN")}.`;
  }
  if (coupon.usageLimit != null && coupon.timesUsed >= coupon.usageLimit) {
    return "Coupon usage limit reached.";
  }
  if (coupon.firstOrderOnly && !isFirstOrder) {
    return "This coupon is only for first order users.";
  }
  return null;
}

function calculateCouponSavings(coupon, subtotal, shipping) {
  if (!coupon) return 0;
  if (coupon.dealType === "free_shipping") return Math.max(0, shipping || 0);
  if (coupon.dealType === "fixed_amount") {
    return Math.max(0, Math.min(subtotal, coupon.discountAmount || 0));
  }
  // default percent discount
  const pct = Math.max(0, Math.min(100, coupon.discountPercent || 0));
  let savings = Number(((subtotal * pct) / 100).toFixed(2));
  if (coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0) {
    savings = Math.min(savings, coupon.maxDiscountAmount);
  }
  return savings;
}

/**
 * Fetch all coupons ordered by creation date descending.
 */
export async function adminGetCoupons(supabase) {
  return supabase
    .from(SUPABASE_TABLES.coupons)
    .select(`
      id,
      name,
      code,
      description,
      discount_percent,
      discount_amount,
      deal_type,
      starts_at,
      ends_at,
      start_date,
      end_date,
      minimum_order_amount,
      active,
      usage_limit,
      used_count,
      times_used,
      created_at
    `)
    .order("created_at", { ascending: false })
}

/**
 * Create a new coupon in Supabase.
 */
export async function adminCreateCoupon(supabase, couponValues) {
  return supabase
    .from(SUPABASE_TABLES.coupons)
    .insert(couponValues)
    .select()
    .single()
}

/**
 * Delete a coupon by id.
 */
export async function adminDeleteCoupon(supabase, couponId) {
  return supabase
    .from(SUPABASE_TABLES.coupons)
    .delete()
    .eq("id", couponId)
}

export async function hasCustomerPlacedOrders(supabase, userId) {
  if (!userId) return false;
  const { count } = await supabase
    .from(SUPABASE_TABLES.orders)
    .select("id", { head: true, count: "exact" })
    .eq("user_id", userId);
  return (count || 0) > 0;
}

async function fetchCouponByCode(supabase, code) {
  const normalized = String(code || "").trim().toUpperCase();
  if (!normalized) return { data: null, error: null };
  const { data, error } = await supabase
    .from(SUPABASE_TABLES.coupons)
    .select("*")
    .eq("code", normalized)
    .limit(1)
    .maybeSingle();
  return { data, error };
}

async function fetchCandidateCoupons(supabase) {
  const { data, error } = await supabase
    .from(SUPABASE_TABLES.coupons)
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function validateCouponCode(supabase, { code, userId, subtotal, shipping = 0 }) {
  const { data, error } = await fetchCouponByCode(supabase, code);
  if (error) return { data: null, error };
  if (!data) return { data: null, error: { message: "Invalid coupon code." } };

  const coupon = normalizeCouponRow(data);
  const isFirstOrder = userId ? !(await hasCustomerPlacedOrders(supabase, userId)) : false;
  const invalid = getCouponInvalidReason(coupon, subtotal, isFirstOrder);
  if (invalid) return { data: null, error: { message: invalid } };

  const savings = calculateCouponSavings(coupon, subtotal, shipping);
  return {
    data: {
      ...coupon,
      isFirstOrderEligible: isFirstOrder,
      savings,
    },
    error: null,
  };
}

export async function getSuggestedCoupons(supabase, { userId, subtotal, shipping = 0 }) {
  const { data, error } = await fetchCandidateCoupons(supabase);
  if (error) return { data: [], error };

  const isFirstOrder = userId ? !(await hasCustomerPlacedOrders(supabase, userId)) : false;
  const coupons = (data || [])
    .map(normalizeCouponRow)
    .filter((c) => !c.hidden)
    .filter((c) => !getCouponInvalidReason(c, subtotal, isFirstOrder))
    .map((c) => ({ ...c, savings: calculateCouponSavings(c, subtotal, shipping) }))
    .sort((a, b) => b.savings - a.savings)
    .slice(0, 5);

  return { data: coupons, error: null };
}

export async function getBestAvailableCoupon(
  supabase,
  { userId, subtotal, shipping = 0, preferFirstOrder = false },
) {
  const suggested = await getSuggestedCoupons(supabase, { userId, subtotal, shipping });
  if (suggested.error) return { data: null, error: suggested.error };
  if (!suggested.data || suggested.data.length === 0) return { data: null, error: null };

  if (preferFirstOrder) {
    const firstOrderCoupon = suggested.data.find((c) => c.firstOrderOnly);
    if (firstOrderCoupon) return { data: firstOrderCoupon, error: null };
  }
  return { data: suggested.data[0], error: null };
}
