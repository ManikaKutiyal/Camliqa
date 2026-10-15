import { SUPABASE_TABLES } from "@/lib/supabase/schema";

export async function adminGetHomeSections(supabase, { sectionType } = {}) {
  let query = supabase
    .from(SUPABASE_TABLES.homeSections)
    .select(`
      *,
      promotion_id,
      home_section_items (
        id,
        product_id,
        sort_order,
        products (
          id,
          title,
          slug,
          price,
          stock,
          image_url,
          category,
          rating,
          discount_percent,
          compare_at_price,
          discount_price,
          product_variants (
            id,
            sku,
            stock_count,
            color,
            size,
            active
          )
        )
      )
    `);

  if (sectionType) {
    query = query.eq("section_type", sectionType);
  } else {
    query = query.neq("section_type", "products_page");
  }

  return query.order("sort_order", { ascending: true });
}

export async function adminCreateHomeSection(supabase, values) {
  return supabase
    .from(SUPABASE_TABLES.homeSections)
    .insert(values)
    .select()
    .single();
}

export async function adminUpdateHomeSection(supabase, sectionId, values) {
  return supabase
    .from(SUPABASE_TABLES.homeSections)
    .update(values)
    .eq("id", sectionId)
    .select()
    .single();
}

export async function adminDeleteHomeSection(supabase, sectionId) {
  return supabase
    .from(SUPABASE_TABLES.homeSections)
    .delete()
    .eq("id", sectionId);
}

export async function adminReplaceHomeSectionProducts(supabase, sectionId, productIds = []) {
  const { error: removeError } = await supabase
    .from(SUPABASE_TABLES.homeSectionItems)
    .delete()
    .eq("section_id", sectionId);
  if (removeError) return { data: null, error: removeError };

  const uniqueProductIds = [...new Set((productIds || []).filter(Boolean))];

  if (!uniqueProductIds.length) return { data: [], error: null };

  const rows = uniqueProductIds.map((productId, idx) => ({
    section_id: sectionId,
    product_id: productId,
    sort_order: idx + 1,
  }));

  return supabase
    .from(SUPABASE_TABLES.homeSectionItems)
    .insert(rows)
    .select();
}

export async function getStorefrontHomeSections(supabase) {
  return supabase
    .from(SUPABASE_TABLES.homeSections)
    .select(`
      id,
      title,
      section_type,
      sort_order,
      active,
      promotion_id,
      home_section_items (
        id,
        product_id,
        sort_order,
        products (
          id,
          title,
          slug,
          price,
          stock,
          image_url,
          category,
          rating,
          discount_percent,
          compare_at_price,
          discount_price,
          product_variants (
            id,
            sku,
            stock_count,
            color,
            size,
            active
          )
        )
      )
    `)
    .eq("active", true)
    .neq("section_type", "products_page")
    .order("sort_order", { ascending: true });
}

export async function adminGetProductSections(supabase) {
  return supabase
    .from(SUPABASE_TABLES.homeSections)
    .select(`
      *,
      promotion_id,
      home_section_items (
        id,
        product_id,
        sort_order,
        products (
          id,
          title,
          slug,
          price,
          stock,
          image_url,
          category,
          discount_price,
          product_variants (
            id,
            sku,
            stock_count,
            color,
            size,
            active
          )
        )
      )
    `)
    .eq("section_type", "products_page")
    .order("sort_order", { ascending: true });
}

export async function adminGetStorefrontProductSections(supabase) {
  return supabase
    .from(SUPABASE_TABLES.homeSections)
    .select(`
      id,
      title,
      section_type,
      sort_order,
      active,
      promotion_id,
      home_section_items (
        id,
        product_id,
        sort_order,
        products (
          id,
          title,
          slug,
          price,
          stock,
          image_url,
          category,
          discount_price,
          product_variants (
            id,
            sku,
            stock_count,
            color,
            size,
            active
          )
        )
      )
    `)
    .eq("section_type", "products_page")
    .eq("active", true)
    .order("sort_order", { ascending: true });
}
