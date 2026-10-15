import { SUPABASE_TABLES } from "@/lib/supabase/schema";

export async function adminGetPromotions(supabase) {
  const { data, error } = await supabase
    .from(SUPABASE_TABLES.promotions)
    .select("*, promotion_targets(id, product_id, category_id, category)")
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function adminCreatePromotion(supabase, promotionData, targets) {
  const shouldActivate = Boolean(promotionData?.active);

  // Insert promotion
  const { data: promo, error: promoError } = await supabase
    .from(SUPABASE_TABLES.promotions)
    .insert({ ...promotionData, active: false })
    .select()
    .single();

  if (promoError) return { data: null, error: promoError };

  // Insert targets
  if (targets && targets.length > 0) {
    const targetData = targets.map((t) => ({
      promotion_id: promo.id,
      product_id: t.product_id || null,
      category_id: t.category_id || null,
      category: t.category || null,
    }));
    const { error: targetError } = await supabase
      .from(SUPABASE_TABLES.promotionTargets)
      .insert(targetData);
      
    if (targetError) {
      // rollback?
      await supabase.from(SUPABASE_TABLES.promotions).delete().eq("id", promo.id);
      return { data: null, error: targetError };
    }
  }

  if (shouldActivate) {
    const { error: deactivateError } = await supabase
      .from(SUPABASE_TABLES.promotions)
      .update({ active: false })
      .eq("active", true);

    if (deactivateError) {
      await supabase.from(SUPABASE_TABLES.promotions).delete().eq("id", promo.id);
      return { data: null, error: deactivateError };
    }

    const { data: activePromo, error: activateError } = await adminSetPromotionActive(supabase, promo.id, true);
    if (activateError) {
      await supabase.from(SUPABASE_TABLES.promotions).delete().eq("id", promo.id);
      return { data: null, error: activateError };
    }

    return { data: activePromo, error: null };
  }

  return { data: promo, error: null };
}

export async function adminDeletePromotion(supabase, promotionId) {
  const { error } = await supabase
    .from(SUPABASE_TABLES.promotions)
    .delete()
    .eq("id", promotionId);
  return { error };
}

export async function adminSetPromotionActive(supabase, promotionId, active) {
  if (active) {
    const { error: deactivateError } = await supabase
      .from(SUPABASE_TABLES.promotions)
      .update({ active: false })
      .neq("id", promotionId)
      .eq("active", true);

    if (deactivateError) return { data: null, error: deactivateError };
  }

  const { data, error } = await supabase
    .from(SUPABASE_TABLES.promotions)
    .update({ active: Boolean(active) })
    .eq("id", promotionId)
    .select()
    .single();
  return { data, error };
}

export async function getActivePromotionsWithTargets(supabase) {
  const { data, error } = await supabase
    .from(SUPABASE_TABLES.promotions)
    .select("*, promotion_targets(product_id, category_id, category)")
    .eq("active", true)
    .gte("ends_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1);
  return { data, error };
}
