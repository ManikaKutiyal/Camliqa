import { SUPABASE_TABLES, SUPABASE_BUCKETS } from "@/lib/supabase/schema"

/**
 * Fetch all active categories for the storefront.
 */
export async function getCategories(supabase) {
  return supabase
    .from(SUPABASE_TABLES.categories)
    .select("id, name, slug, image_url, price_under")
    .eq("active", true)
    .is("parent_id", null)
    .order("sort_order", { ascending: true })
}

/**
 * Fetch all active brands with their discount labels for BrandDeals / CategorySection.
 */
export async function getBrands(supabase) {
  return supabase
    .from(SUPABASE_TABLES.brands)
    .select("id, name, slug, image_url, discount_label, logo_url")
    .eq("active", true)
    .order("sort_order", { ascending: true })
}

/**
 * Fetch products filtered by category slug for TrendingSection.
 */
export async function getProductsByCategory(supabase, categorySlug, limit = 12) {
  return supabase
    .from(SUPABASE_TABLES.products)
    .select(`
      id,
      title,
      slug,
      price,
      stock,
      compare_at_price,
      discount_price,
      image_url,
      discount_percent,
      category,
      product_variants (
        id,
        sku,
        stock_count,
        color,
        size,
        active
      )
    `)
    .eq("active", true)
    .ilike("category", `%${categorySlug}%`)
    .order("created_at", { ascending: false })
    .limit(limit)
}

/**
 * Fetch all categories for admin (including inactive).
 */
export async function adminGetCategories(supabase) {
  return supabase
    .from(SUPABASE_TABLES.categories)
    .select("*")
    .order("name", { ascending: true })
}

/**
 * Fetch only top-level (parent) categories for the admin product form.
 */
export async function adminGetParentCategories(supabase) {
  return supabase
    .from(SUPABASE_TABLES.categories)
    .select("*")
    .is("parent_id", null)
    .order("name", { ascending: true })
}

/**
 * Fetch sub-categories (children) for a given parent category id.
 */
export async function adminGetSubcategories(supabase, parentId) {
  if (!parentId) return { data: [], error: null };
  return supabase
    .from(SUPABASE_TABLES.categories)
    .select("*")
    .eq("parent_id", parentId)
    .order("name", { ascending: true })
}

/**
 * Create or update a category in Supabase.
 */
export async function adminUpsertCategory(supabase, categoryData) {
  // If id is a timestamp (from our dummy local state logic), remove it so Supabase generates one.
  const isNew = typeof categoryData.id === 'number' && categoryData.id > 10000;
  
  const payload = { ...categoryData };
  if (isNew || !payload.id) {
    delete payload.id;
  }
  
  // Transform camelCase front-end to snake_case db
  if (payload.productCount !== undefined) {
    payload.product_count = payload.productCount;
    delete payload.productCount;
  }
  
  const { data, error } = await supabase
    .from(SUPABASE_TABLES.categories)
    .upsert(payload)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

/**
 * Delete a category from Supabase.
 */
export async function adminDeleteCategory(supabase, categoryId) {
  const { error } = await supabase
    .from(SUPABASE_TABLES.categories)
    .delete()
    .eq("id", categoryId);
    
  if (error) throw error;
  return true;
}

/**
 * Upload a category image to Supabase Storage.
 */
export async function uploadCategoryImage(supabase, filePath, file, options = {}) {
  return supabase.storage
    .from(SUPABASE_BUCKETS.categoryImages)
    .upload(filePath, file, options)
}

/**
 * Get public URL for a category image.
 */
export function getCategoryImagePublicUrl(supabase, filePath) {
  return supabase.storage
    .from(SUPABASE_BUCKETS.categoryImages)
    .getPublicUrl(filePath)
}

/**
 * Recalculates and updates product_count for the given category slugs.
 * Counts by category_id UUID (the proper FK) for accuracy.
 */
export async function adminSyncCategoryProductCount(supabase, categorySlugs) {
  const validSlugs = (categorySlugs || []).filter(
    (s) => s && s !== 'Select category'
  );
  if (validSlugs.length === 0) return;

  // Fetch the category UUIDs for these slugs
  const { data: cats } = await supabase
    .from(SUPABASE_TABLES.categories)
    .select('id, slug')
    .in('slug', validSlugs);

  if (!cats || cats.length === 0) return;

  await Promise.all(
    cats.map(async (cat) => {
      // Count by category_id UUID (reliable) OR by category text slug (legacy)
      const { count: countById } = await supabase
        .from(SUPABASE_TABLES.products)
        .select('id', { count: 'exact', head: true })
        .eq('category_id', cat.id);

      const { count: countBySlug } = await supabase
        .from(SUPABASE_TABLES.products)
        .select('id', { count: 'exact', head: true })
        .eq('category', cat.slug)
        .is('category_id', null); // only count slug-only rows to avoid double-counting

      const total = (countById ?? 0) + (countBySlug ?? 0);

      // Only update if the column exists (ignore error silently)
      await supabase
        .from(SUPABASE_TABLES.categories)
        .update({ product_count: total })
        .eq('id', cat.id);
    })
  );
}
