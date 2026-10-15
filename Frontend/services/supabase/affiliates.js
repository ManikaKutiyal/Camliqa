import { SUPABASE_TABLES, AFFILIATE_STATUS } from "@/lib/supabase/schema"

/**
 * Generate a unique affiliate code from user's name or email.
 */
function generateAffiliateCode(seed = "") {
  const base = String(seed)
    .replace(/[^a-z0-9]/gi, "")
    .toUpperCase()
    .slice(0, 6)
    .padEnd(4, "X");
  const suffix = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `${base}${suffix}`;
}

/**
 * Register a new affiliate for the signed-in user.
 * Generates a unique code automatically.
 */
export async function registerAffiliate(supabase, userId, nameSeed = "") {
  // Check if already an affiliate
  const { data: existing } = await supabase
    .from(SUPABASE_TABLES.affiliates)
    .select("id, code, status")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    return { data: existing, error: null, alreadyRegistered: true };
  }

  let code = generateAffiliateCode(nameSeed);

  // Ensure code uniqueness
  let attempt = 0;
  while (attempt < 5) {
    const { data: taken } = await supabase
      .from(SUPABASE_TABLES.affiliates)
      .select("id")
      .eq("code", code)
      .maybeSingle();
    if (!taken) break;
    code = generateAffiliateCode(nameSeed + attempt);
    attempt++;
  }

  const { data, error } = await supabase
    .from(SUPABASE_TABLES.affiliates)
    .insert({
      user_id: userId,
      code,
      commission_rate: 0.10,
      status: AFFILIATE_STATUS.pending,
    })
    .select()
    .single();

  // Also store affiliate_id in profiles
  if (data) {
    await supabase
      .from(SUPABASE_TABLES.profiles)
      .update({ affiliate_id: code })
      .eq("id", userId);
  }

  return { data, error, alreadyRegistered: false };
}

/**
 * Get affiliate details for the signed-in user.
 */
export async function getAffiliateByUserId(supabase, userId) {
  return supabase
    .from(SUPABASE_TABLES.affiliates)
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
}

/**
 * Get affiliate by referral code (used at checkout to credit commission).
 */
export async function getAffiliateByCode(supabase, code) {
  if (!code) return { data: null, error: null };
  return supabase
    .from(SUPABASE_TABLES.affiliates)
    .select("id, user_id, code, commission_rate, status")
    .eq("code", String(code).toUpperCase())
    .eq("status", AFFILIATE_STATUS.active)
    .maybeSingle();
}

/**
 * Get orders placed with a specific affiliate code (for stats).
 */
export async function getAffiliateOrders(supabase, affiliateCode) {
  return supabase
    .from(SUPABASE_TABLES.orders)
    .select("id, total_amount, affiliate_commission, status, created_at")
    .eq("affiliate_code", affiliateCode)
    .order("created_at", { ascending: false });
}

/**
 * Update affiliate earnings after an order is paid.
 * Called server-side only (admin client).
 */
export async function creditAffiliateCommission(supabase, affiliateCode, commissionAmount) {
  if (!affiliateCode || !commissionAmount) return { error: null };
  return supabase
    .from(SUPABASE_TABLES.affiliates)
    .update({
      total_earnings:   supabase.rpc("increment_affiliate_earnings", {
        p_code: affiliateCode, p_amount: commissionAmount,
      }),
      pending_earnings: supabase.rpc("increment_affiliate_pending", {
        p_code: affiliateCode, p_amount: commissionAmount,
      }),
    })
    .eq("code", affiliateCode);
}

// ─────────────────────────────────────────────────────────────
// Admin
// ─────────────────────────────────────────────────────────────

/**
 * Fetch all affiliates for the admin panel.
 */
export async function adminGetAffiliates(supabase) {
  return supabase
    .from(SUPABASE_TABLES.affiliates)
    .select(`
      id,
      code,
      commission_rate,
      total_earnings,
      paid_earnings,
      pending_earnings,
      status,
      created_at,
      profiles (
        id,
        full_name,
        email,
        phone
      )
    `)
    .order("created_at", { ascending: false });
}

/**
 * Approve or deactivate an affiliate.
 */
export async function adminUpdateAffiliateStatus(supabase, affiliateId, status) {
  return supabase
    .from(SUPABASE_TABLES.affiliates)
    .update({ status })
    .eq("id", affiliateId)
    .select()
    .single();
}

/**
 * Mark affiliate earnings as paid.
 */
export async function adminMarkAffiliatePaid(supabase, affiliateId, amount) {
  const { data: aff } = await supabase
    .from(SUPABASE_TABLES.affiliates)
    .select("paid_earnings, pending_earnings")
    .eq("id", affiliateId)
    .single();

  if (!aff) return { error: { message: "Affiliate not found" } };

  return supabase
    .from(SUPABASE_TABLES.affiliates)
    .update({
      paid_earnings:    Number(aff.paid_earnings) + Number(amount),
      pending_earnings: Math.max(0, Number(aff.pending_earnings) - Number(amount)),
    })
    .eq("id", affiliateId)
    .select()
    .single();
}
