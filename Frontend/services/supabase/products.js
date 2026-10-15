import { SUPABASE_BUCKETS, SUPABASE_TABLES } from "@/lib/supabase/schema"

// ─────────────────────────────────────────────────────────────
// Skincare-specific SELECT fragment reused by storefront queries
// ─────────────────────────────────────────────────────────────
const STOREFRONT_PRODUCT_FIELDS = `
  id,
  title,
  slug,
  description,
  short_description,
  price,
  compare_at_price,
  discount_price,
  discount_percent,
  image_url,
  category,
  category_id,
  sub_category,
  stock,
  active,
  status,
  rating,
  featured,
  skin_type,
  concern,
  suitable_for,
  tags,
  key_benefits,
  how_to_use,
  seo_title,
  seo_description,
  product_variants (
    id,
    sku,
    stock_count,
    size,
    color,
    price_override,
    active
  ),
  product_images (
    id,
    url,
    sort_order
  )
`

function slugifyProductTitle(value) {
  const slug = String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "product";
}

async function getUniqueProductSlug(supabase, requestedSlug, currentProductId = null) {
  const baseSlug = slugifyProductTitle(requestedSlug);
  const { data, error } = await supabase
    .from(SUPABASE_TABLES.products)
    .select("id, slug")
    .like("slug", `${baseSlug}%`);

  if (error) {
    throw error;
  }

  const taken = new Set(
    (data || [])
      .filter((row) => row.id !== currentProductId)
      .map((row) => row.slug),
  );

  if (!taken.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;
  while (taken.has(`${baseSlug}-${suffix}`)) {
    suffix += 1;
  }
  return `${baseSlug}-${suffix}`;
}

// ─────────────────────────────────────────────────────────────
// Storefront queries (use STOREFRONT_PRODUCT_FIELDS)
// ─────────────────────────────────────────────────────────────

export async function getStorefrontProducts(supabase) {
  return supabase
    .from(SUPABASE_TABLES.products)
    .select(STOREFRONT_PRODUCT_FIELDS)
    .eq("active", true)
    .eq("status", "active")
    .order("created_at", { ascending: false })
}

export async function getStorefrontProductBySlug(supabase, slug) {
  return supabase
    .from(SUPABASE_TABLES.products)
    .select(STOREFRONT_PRODUCT_FIELDS)
    .or(`slug.eq.${slug},id.eq.${slug}`)
    .single()
}

export async function getStorefrontProductById(supabase, id) {
  return supabase
    .from(SUPABASE_TABLES.products)
    .select(STOREFRONT_PRODUCT_FIELDS)
    .eq("id", id)
    .single()
}

/**
 * Fetch featured products for the homepage hero / featured section.
 */
export async function getFeaturedProducts(supabase, limit = 8) {
  return supabase
    .from(SUPABASE_TABLES.products)
    .select(STOREFRONT_PRODUCT_FIELDS)
    .eq("active", true)
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(limit)
}

/**
 * Fetch top-rated products for the customer home page "Top Sellers" section.
 */
export async function getTopSellerProducts(supabase, limit = 3) {
  return supabase
    .from(SUPABASE_TABLES.products)
    .select(STOREFRONT_PRODUCT_FIELDS)
    .eq("active", true)
    .order("rating", { ascending: false })
    .limit(limit)
}

/**
 * Fetch discounted products for the customer home page "Deals of the Day" section.
 */
export async function getDiscountedProducts(supabase, limit = 2) {
  return supabase
    .from(SUPABASE_TABLES.products)
    .select(STOREFRONT_PRODUCT_FIELDS)
    .eq("active", true)
    .not("discount_percent", "is", null)
    .gt("discount_percent", 0)
    .order("discount_percent", { ascending: false })
    .limit(limit)
}

/**
 * Fetch products filtered by skin type (e.g. "oily", "dry", "combination").
 */
export async function getProductsBySkinType(supabase, skinType, limit = 12) {
  return supabase
    .from(SUPABASE_TABLES.products)
    .select(STOREFRONT_PRODUCT_FIELDS)
    .eq("active", true)
    .contains("skin_type", [skinType])
    .order("created_at", { ascending: false })
    .limit(limit)
}

/**
 * Fetch products filtered by concern (e.g. "acne", "pigmentation", "anti-aging").
 */
export async function getProductsByConcern(supabase, concern, limit = 12) {
  return supabase
    .from(SUPABASE_TABLES.products)
    .select(STOREFRONT_PRODUCT_FIELDS)
    .eq("active", true)
    .contains("concern", [concern])
    .order("created_at", { ascending: false })
    .limit(limit)
}

// ─────────────────────────────────────────────────────────────
// Admin queries
// ─────────────────────────────────────────────────────────────

/**
 * Fetch all products for the admin panel.
 */
export async function adminGetProducts(supabase) {
  return supabase
    .from(SUPABASE_TABLES.products)
    .select("*")
    .order("created_at", { ascending: false })
}

/**
 * Create a new product in Supabase.
 */
export async function adminCreateProduct(supabase, productValues) {
  // Strip out UI-specific or legacy keys and map them correctly
  const { sku, stock, variants, name, image, gallery, ingredients, ...rest } = productValues;
  
  if (name && !rest.title) rest.title = name;
  if (image && !rest.image_url) rest.image_url = image;

  const numericStock = typeof stock === 'number' ? stock : (stock === 'in-stock' ? 100 : (stock === 'out-of-stock' ? 0 : parseInt(stock) || 0));
  rest.stock = numericStock;

  const uniqueSlug = await getUniqueProductSlug(
    supabase,
    rest.slug || rest.title || name,
  );

  const result = await supabase
    .from(SUPABASE_TABLES.products)
    .insert({ ...rest, slug: uniqueSlug })
    .select();

  if (result.error) throw result.error;
  if (!result.data || result.data.length === 0) {
    throw new Error(`Permission denied. Your database session may have expired. Please log out and log back in.`);
  }
  
  result.data = result.data[0];

  if (result.data && result.data.id) {
    if (variants && variants.length > 0) {
      const variantPayload = variants.map(v => ({
        product_id: result.data.id,
        sku: v.sku || null,
        stock_count: parseInt(v.stock_count) || 0,
        price_override: v.price_override != null && v.price_override !== '' ? parseFloat(v.price_override) : null,
        size: v.size || null,
        color: v.color || null,
        active: true
      }));
      const { error: variantError } = await supabase.from(SUPABASE_TABLES.productVariants).insert(variantPayload);
      if (variantError) throw variantError;
    } else {
      const { error: variantError } = await supabase.from(SUPABASE_TABLES.productVariants).insert({
        product_id: result.data.id,
        sku: sku || null,
        stock_count: numericStock,
        active: true
      });
      if (variantError) throw variantError;
    }

    if (gallery && gallery.length > 0) {
      const imagesData = gallery.map((img, idx) => ({
        product_id: result.data.id,
        url: img.url || img,
        sort_order: img.sort_order ?? idx
      }));
      await supabase.from(SUPABASE_TABLES.productImages).insert(imagesData);
    }

    if (ingredients && ingredients.length > 0) {
      const ingData = ingredients.map((ing, idx) => ({
        product_id: result.data.id,
        name: ing.name,
        description: ing.description || null,
        sort_order: ing.sort_order ?? idx
      }));
      await supabase.from(SUPABASE_TABLES.productIngredients).insert(ingData);
    }
  }
  return result;
}

export async function adminUpdateProduct(supabase, productId, values) {
  // Strip out UI-specific or legacy keys and map them correctly
  const { sku, stock, variants, name, image, gallery, ingredients, ...rest } = values;
  
  if (name && !rest.title) rest.title = name;
  if (image && !rest.image_url) rest.image_url = image;

  const numericStock = typeof stock === 'number' ? stock : (stock === 'in-stock' ? 100 : (stock === 'out-of-stock' ? 0 : parseInt(stock) || 0));
  if (stock !== undefined) {
    rest.stock = numericStock;
  }

  const nextSlug = rest.slug || rest.title || name;
  const uniqueSlug = nextSlug
    ? await getUniqueProductSlug(supabase, nextSlug, productId)
    : undefined;
  const updatePayload = uniqueSlug ? { ...rest, slug: uniqueSlug } : rest;
  
  const result = await supabase
    .from(SUPABASE_TABLES.products)
    .update(updatePayload)
    .eq("id", productId)
    .select();

  if (result.error) throw result.error;
  if (!result.data || result.data.length === 0) {
    throw new Error(`Permission denied or product not found. Your database session may have expired. Please log out and log back in.`);
  }
  
  result.data = result.data[0];

  if (variants && variants.length > 0) {
    const { data: existingVariants } = await supabase
      .from(SUPABASE_TABLES.productVariants)
      .select("id, size, color")
      .eq("product_id", productId);
      
    const existingMap = new Map(
      (existingVariants || []).map(v => [`${v.size || ''}-${v.color || ''}`, v.id])
    );

    const toInsert = [];
    const toUpdate = [];

    for (const v of variants) {
      const key = `${v.size || ''}-${v.color || ''}`;
      const vStock = parseInt(v.stock_count) || 0;
      const vPrice = v.price_override != null && v.price_override !== '' ? parseFloat(v.price_override) : null;
      
      if (existingMap.has(key)) {
        toUpdate.push({
          id: existingMap.get(key),
          sku: v.sku || null,
          stock_count: vStock,
          price_override: vPrice,
          active: true
        });
        existingMap.delete(key);
      } else {
        toInsert.push({
          product_id: productId,
          sku: v.sku || null,
          stock_count: vStock,
          price_override: vPrice,
          size: v.size || null,
          color: v.color || null,
          active: true
        });
      }
    }

    if (toInsert.length > 0) {
      const { error: insertError } = await supabase.from(SUPABASE_TABLES.productVariants).insert(toInsert);
      if (insertError) throw insertError;
    }
    
    for (const update of toUpdate) {
      const { error: updateError } = await supabase.from(SUPABASE_TABLES.productVariants).update(update).eq("id", update.id);
      if (updateError) throw updateError;
    }

    const obsoleteIds = Array.from(existingMap.values());
    if (obsoleteIds.length > 0) {
      const { error: obsoleteError } = await supabase.from(SUPABASE_TABLES.productVariants)
        .update({ active: false })
        .in("id", obsoleteIds);
      if (obsoleteError) throw obsoleteError;
    }
  } else if (sku !== undefined || stock !== undefined) {
    const { data: existingVariants } = await supabase
      .from(SUPABASE_TABLES.productVariants)
      .select("id")
      .eq("product_id", productId);
      
    if (existingVariants && existingVariants.length > 0) {
      const { error: existingUpdateError } = await supabase.from(SUPABASE_TABLES.productVariants)
        .update({
          ...(sku !== undefined ? { sku } : {}),
          ...(stock !== undefined ? { stock_count: numericStock } : {})
        })
        .eq("id", existingVariants[0].id);
      if (existingUpdateError) throw existingUpdateError;
    } else {
      const { error: insertVariantError } = await supabase.from(SUPABASE_TABLES.productVariants).insert({
        product_id: productId,
        sku: sku || null,
        stock_count: numericStock,
        active: true
      });
      if (insertVariantError) throw insertVariantError;
    }
  }

  if (gallery !== undefined) {
    await supabase.from(SUPABASE_TABLES.productImages).delete().eq('product_id', productId);
    if (gallery.length > 0) {
      const imagesData = gallery.map((img, idx) => ({
        product_id: productId,
        url: img.url || img,
        sort_order: img.sort_order ?? idx
      }));
      await supabase.from(SUPABASE_TABLES.productImages).insert(imagesData);
    }
  }

  if (ingredients !== undefined) {
    await supabase.from(SUPABASE_TABLES.productIngredients).delete().eq('product_id', productId);
    if (ingredients.length > 0) {
      const ingData = ingredients.map((ing, idx) => ({
        product_id: productId,
        name: ing.name,
        description: ing.description || null,
        sort_order: ing.sort_order ?? idx
      }));
      await supabase.from(SUPABASE_TABLES.productIngredients).insert(ingData);
    }
  }

  return result;
}

export async function adminUpdateProductVariant(supabase, variantId, values) {
  return supabase
    .from(SUPABASE_TABLES.productVariants)
    .update(values)
    .eq("id", variantId)
    .select()
    .single()
}

export async function uploadProductImage(supabase, filePath, file, options = {}) {
  return supabase.storage
    .from(SUPABASE_BUCKETS.productImages)
    .upload(filePath, file, options)
}

export function getProductImagePublicUrl(supabase, filePath) {
  return supabase.storage
    .from(SUPABASE_BUCKETS.productImages)
    .getPublicUrl(filePath)
}

export async function adminUpdateProductsCategory(supabase, productIds, categorySlug, categoryId) {
  if (!productIds || productIds.length === 0) return;
  const updatePayload = { category: categorySlug };
  if (categoryId) updatePayload.category_id = categoryId;
  const { error } = await supabase
    .from(SUPABASE_TABLES.products)
    .update(updatePayload)
    .in("id", productIds);
  if (error) throw error;
}

export async function adminClearProductsCategory(supabase, productIds) {
  if (!productIds || productIds.length === 0) return;
  const { error } = await supabase
    .from(SUPABASE_TABLES.products)
    .update({ category: null, category_id: null })
    .in("id", productIds);
  if (error) throw error;
}

export async function adminDeleteProduct(supabase, productId) {
  const { data, error } = await supabase
    .from(SUPABASE_TABLES.products)
    .delete()
    .eq("id", productId)
    .select();
  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error("Product was not deleted. Permission denied (RLS) or product not found.");
  }
  return true;
}

export async function adminAddProductImages(supabase, imagesData) {
  return supabase
    .from(SUPABASE_TABLES.productImages)
    .insert(imagesData)
    .select()
}

export async function adminDeleteProductImage(supabase, imageId) {
  return supabase
    .from(SUPABASE_TABLES.productImages)
    .delete()
    .eq("id", imageId)
}

export async function adminDeleteProductImagesByProduct(supabase, productId) {
  return supabase
    .from(SUPABASE_TABLES.productImages)
    .delete()
    .eq("product_id", productId)
}

/** Update sub_category text on products (used when a subcategory is renamed). */
export async function adminUpdateProductsSubcategoryName(supabase, oldName, newName) {
  if (!oldName) return;
  const { error } = await supabase
    .from(SUPABASE_TABLES.products)
    .update({ sub_category: newName })
    .eq('sub_category', oldName);
  if (error) throw error;
}

/** Clear sub_category on products that belonged to a deleted subcategory. */
export async function adminClearProductsSubcategory(supabase, subCategoryName) {
  if (!subCategoryName) return;
  const { error } = await supabase
    .from(SUPABASE_TABLES.products)
    .update({ sub_category: null })
    .eq('sub_category', subCategoryName);
  if (error) throw error;
}

// ─────────────────────────────────────────────────────────────
// Product Ingredients (admin CRUD)
// ─────────────────────────────────────────────────────────────

export async function getProductIngredients(supabase, productId) {
  return supabase
    .from(SUPABASE_TABLES.productIngredients)
    .select("id, name, description, sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true })
}

export async function adminUpsertProductIngredients(supabase, productId, ingredients = []) {
  const { error: deleteError } = await supabase
    .from(SUPABASE_TABLES.productIngredients)
    .delete()
    .eq("product_id", productId);
  if (deleteError) throw deleteError;

  if (ingredients.length === 0) return { data: [], error: null };

  return supabase
    .from(SUPABASE_TABLES.productIngredients)
    .insert(
      ingredients.map((ing, idx) => ({
        product_id: productId,
        name: ing.name,
        description: ing.description || null,
        sort_order: ing.sort_order ?? idx,
      }))
    )
    .select();
}
