import { SUPABASE_TABLES } from "@/lib/supabase/schema"

function isMissingFeaturedColumnError(error) {
  const message = String(error?.message || "");
  return error?.code === "42703" || /is_featured.*does not exist/i.test(message);
}

/**
 * Fetch all product reviews with user and product details for admin moderation.
 */
export async function adminGetReviews(supabase) {
  const selectWithFeatured = `
      id,
      product_id,
      user_id,
      rating,
      title,
      review,
      status,
      is_featured,
      created_at,
      profiles (
        id,
        full_name,
        avatar_url
      ),
      products (
        id,
        title
      )
    `;

  const { data, error } = await supabase
    .from(SUPABASE_TABLES.productReviews)
    .select(selectWithFeatured)
    .order("created_at", { ascending: false });

  if (!error) {
    return { data, error: null };
  }

  if (!isMissingFeaturedColumnError(error)) {
    return { data: null, error };
  }

  const selectLegacy = `
      id,
      product_id,
      user_id,
      rating,
      title,
      review,
      status,
      created_at,
      profiles (
        id,
        full_name,
        avatar_url
      ),
      products (
        id,
        title
      )
    `;

  const { data: legacyData, error: legacyError } = await supabase
    .from(SUPABASE_TABLES.productReviews)
    .select(selectLegacy)
    .order("created_at", { ascending: false });

  if (legacyError) {
    return { data: null, error: legacyError };
  }
    

  return {
    data: (legacyData || []).map((row) => ({
      ...row,
      is_featured: row.status === "approved",
    })),
    error: null,
  };
}

/**
 * Get review counts grouped by status for the stats cards.
 */
export async function adminGetReviewStats(supabase) {
  const { data, error } = await supabase
    .from(SUPABASE_TABLES.productReviews)
    .select("status")

  if (error) return { data: null, error }

  const total = data.length
  const pending = data.filter((r) => r.status === "pending").length
  const approved = data.filter((r) => r.status === "approved").length
  const rejected = data.filter((r) => r.status === "rejected").length

  return { data: { total, pending, approved, rejected }, error: null }
}

/**
 * Update review fields (status / featured) in one call.
 */
export async function adminUpdateReview(supabase, reviewId, values) {
  return supabase
    .from(SUPABASE_TABLES.productReviews)
    .update(values)
    .eq("id", reviewId)
    .select()
    .single()
}

/**
 * Backward-compatible status-only updater.
 */
export async function adminUpdateReviewStatus(supabase, reviewId, status) {
  return adminUpdateReview(supabase, reviewId, { status })
}

/**
 * Delete a review by id.
 */
export async function adminDeleteReview(supabase, reviewId) {
  return supabase
    .from(SUPABASE_TABLES.productReviews)
    .delete()
    .eq("id", reviewId)
}

/**
 * Homepage testimonials: admin-selected featured reviews.
 */
export async function getFeaturedReviews(supabase, limit = 8) {
  const selectShape = `
      id,
      rating,
      review,
      created_at,
      profiles (
        id,
        full_name,
        avatar_url
      ),
      products (
        id,
        title
      )
    `;

  const { data, error } = await supabase
    .from(SUPABASE_TABLES.productReviews)
    .select(selectShape)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!error) {
    return { data, error: null };
  }

  if (!isMissingFeaturedColumnError(error)) {
    return { data: null, error };
  }

  // Backward compatibility for DBs where `is_featured` migration isn't applied yet.
  return supabase
    .from(SUPABASE_TABLES.productReviews)
    .select(selectShape)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);
}

/**
 * Product detail reviews: approved reviews for one product.
 */
export async function getProductReviews(supabase, productId) {
  return supabase
    .from(SUPABASE_TABLES.productReviews)
    .select(`
      id,
      product_id,
      rating,
      title,
      review,
      created_at,
      profiles (
        id,
        full_name
      )
    `)
    .eq("product_id", productId)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
}
