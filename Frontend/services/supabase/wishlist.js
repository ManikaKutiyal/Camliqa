import { SUPABASE_TABLES } from "@/lib/supabase/schema"

/**
 * Get or create the wishlist for the signed-in user.
 * Returns { wishlistId, error }.
 */
async function getOrCreateWishlist(supabase, userId) {
  // Try to find existing wishlist
  const { data: existing, error: findError } = await supabase
    .from(SUPABASE_TABLES.wishlists)
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (findError) return { wishlistId: null, error: findError };
  if (existing) return { wishlistId: existing.id, error: null };

  // Create one if not found
  const { data: created, error: createError } = await supabase
    .from(SUPABASE_TABLES.wishlists)
    .insert({ user_id: userId })
    .select("id")
    .single();

  if (createError) return { wishlistId: null, error: createError };
  return { wishlistId: created.id, error: null };
}

/**
 * Fetch all wishlist items for the signed-in user, joined with product data.
 */
export async function getWishlistItems(supabase, userId) {
  const { wishlistId, error: wErr } = await getOrCreateWishlist(supabase, userId);
  if (wErr) return { data: null, error: wErr };

  return supabase
    .from(SUPABASE_TABLES.wishlistItems)
    .select(`
      id,
      product_id,
      created_at,
      products (
        id,
        title,
        slug,
        price,
        compare_at_price,
        discount_price,
        discount_percent,
        image_url,
        rating,
        stock,
        active,
        skin_type,
        concern,
        product_variants (
          id,
          sku,
          stock_count,
          color,
          size,
          active
        )
      )
    `)
    .eq("wishlist_id", wishlistId)
    .order("created_at", { ascending: false })
}

/**
 * Add a product to the user's wishlist.
 * Silently succeeds if it already exists.
 */
export async function addToWishlist(supabase, userId, productId) {
  const { wishlistId, error: wErr } = await getOrCreateWishlist(supabase, userId);
  if (wErr) return { data: null, error: wErr };

  const { data, error } = await supabase
    .from(SUPABASE_TABLES.wishlistItems)
    .insert({ wishlist_id: wishlistId, product_id: productId })
    .select()
    .single();

  // Ignore unique constraint violation (item already in wishlist)
  if (error && (error.code === "23505" || /unique constraint/i.test(error.message))) {
    return { data: null, error: null, alreadyExists: true };
  }

  return { data, error, alreadyExists: false };
}

/**
 * Remove a product from the user's wishlist.
 */
export async function removeFromWishlist(supabase, userId, productId) {
  const { wishlistId, error: wErr } = await getOrCreateWishlist(supabase, userId);
  if (wErr) return { error: wErr };

  return supabase
    .from(SUPABASE_TABLES.wishlistItems)
    .delete()
    .eq("wishlist_id", wishlistId)
    .eq("product_id", productId)
}

/**
 * Check if a specific product is in the user's wishlist.
 * Returns { isWishlisted: boolean, error }.
 */
export async function isProductWishlisted(supabase, userId, productId) {
  const { wishlistId, error: wErr } = await getOrCreateWishlist(supabase, userId);
  if (wErr) return { isWishlisted: false, error: wErr };

  const { data, error } = await supabase
    .from(SUPABASE_TABLES.wishlistItems)
    .select("id")
    .eq("wishlist_id", wishlistId)
    .eq("product_id", productId)
    .maybeSingle();

  return { isWishlisted: Boolean(data), error };
}

/**
 * Get wishlist item count for the user (for badge display).
 */
export async function getWishlistCount(supabase, userId) {
  const { wishlistId, error: wErr } = await getOrCreateWishlist(supabase, userId);
  if (wErr) return { count: 0, error: wErr };

  const { count, error } = await supabase
    .from(SUPABASE_TABLES.wishlistItems)
    .select("id", { count: "exact", head: true })
    .eq("wishlist_id", wishlistId);

  return { count: count ?? 0, error };
}

/**
 * Clear all items from the user's wishlist.
 */
export async function clearWishlist(supabase, userId) {
  const { wishlistId, error: wErr } = await getOrCreateWishlist(supabase, userId);
  if (wErr) return { error: wErr };

  return supabase
    .from(SUPABASE_TABLES.wishlistItems)
    .delete()
    .eq("wishlist_id", wishlistId)
}

/**
 * Admin: get all wishlist items with user info (for analytics).
 */
export async function adminGetWishlistStats(supabase) {
  return supabase
    .from(SUPABASE_TABLES.wishlistItems)
    .select(`
      id,
      product_id,
      created_at,
      products ( id, title, image_url ),
      wishlists ( user_id )
    `)
    .order("created_at", { ascending: false })
}
