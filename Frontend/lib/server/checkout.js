import "server-only";

import { SUPABASE_TABLES } from "@/lib/supabase/schema";
import { validateCouponCode } from "@/services/supabase/coupons";
import { HttpError } from "@/lib/security/errors";
import { calculatePromotionDiscount } from "@/lib/promotions";

export const CHECKOUT_TAX_RATE = 0.15;
export const CHECKOUT_SHIPPING_RATES = {
  standard: 45,
  express: 120,
};
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function normalizeShippingMethod(value) {
  return value === "standard" ? "standard" : "express";
}

export function sanitizeCheckoutItems(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new HttpError(400, "Your cart is empty.");
  }

  const merged = new Map();

  for (const rawItem of rawItems) {
    const productRef = String(
      rawItem?.productId || rawItem?.product_id || rawItem?.slug || rawItem?.id || "",
    ).trim();
    const variantId = rawItem?.variantId || rawItem?.variant_id || null;
    const size = String(rawItem?.size || "").trim();
    const color = String(rawItem?.color || "").trim();
    const quantity = Number(rawItem?.quantity);

    if (!productRef) {
      throw new HttpError(400, "Each cart item must include a product reference.");
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new HttpError(400, "Cart quantities must be whole numbers between 1 and 99.");
    }

    const key = `${productRef}:${variantId || "default"}`;
    const current = merged.get(key);
    if (current) {
      current.quantity += quantity;
      if (current.quantity > 99) {
        throw new HttpError(400, "Combined item quantity cannot exceed 99.");
      }
      continue;
    }

    merged.set(key, {
      productRef,
      variantId: variantId ? String(variantId) : null,
      size: size || null,
      color: color || null,
      quantity,
    });
  }

  return Array.from(merged.values());
}

export function sanitizeShippingAddress(rawAddress) {
  const fields = {
    fullName: String(rawAddress?.fullName || "").trim(),
    phone: String(rawAddress?.phone || "").trim(),
    addressLine1: String(rawAddress?.addressLine1 || "").trim(),
    addressLine2: String(rawAddress?.addressLine2 || "").trim(),
    city: String(rawAddress?.city || "").trim(),
    state: String(rawAddress?.state || "").trim(),
    postalCode: String(rawAddress?.postalCode || "").trim(),
    country: String(rawAddress?.country || "").trim(),
  };

  const required = ["fullName", "phone", "addressLine1", "city", "state", "postalCode", "country"];
  const missing = required.find((field) => !fields[field]);
  if (missing) {
    throw new HttpError(400, "Please provide a complete delivery address.");
  }

  if (fields.fullName.length > 120 || fields.addressLine1.length > 200 || fields.city.length > 120) {
    throw new HttpError(400, "Delivery address is too long.");
  }

  return fields;
}

export async function buildCheckoutQuote({ supabase, userId, items, couponCode, shippingMethod }) {
  const normalizedItems = sanitizeCheckoutItems(items);
  const method = normalizeShippingMethod(shippingMethod);

  const productRefs = [...new Set(normalizedItems.map((item) => item.productRef))];
  const productIds = productRefs.filter((ref) => UUID_REGEX.test(ref));
  const productSlugs = productRefs.filter((ref) => !UUID_REGEX.test(ref));

  const { data: products, error: productError } = await (() => {
    let query = supabase
      .from(SUPABASE_TABLES.products)
      .select("id, slug, title, price, discount_price, stock, active, status, category, category_id");

    if (productIds.length > 0 && productSlugs.length > 0) {
      const encodedIds = productIds.map((value) => `"${value}"`).join(",");
      const encodedSlugs = productSlugs.map((value) => `"${value.replace(/"/g, '\\"')}"`).join(",");
      query = query.or(`id.in.(${encodedIds}),slug.in.(${encodedSlugs})`);
    } else if (productIds.length > 0) {
      query = query.in("id", productIds);
    } else if (productSlugs.length > 0) {
      query = query.in("slug", productSlugs);
    } else {
      return Promise.resolve({ data: [], error: null });
    }

    return query;
  })();

  if (productError) {
    throw new HttpError(400, "Unable to load product pricing.");
  }

  const productMap = new Map();
  for (const product of products || []) {
    productMap.set(product.id, product);
    if (product.slug) {
      productMap.set(product.slug, product);
    }
  }

  const resolvedProductIds = [...new Set((products || []).map((product) => product.id).filter(Boolean))];
  const { data: variants, error: variantError } = resolvedProductIds.length
    ? await supabase
        .from(SUPABASE_TABLES.productVariants)
        .select("id, product_id, price_override, stock_count, size, color, sku, active")
        .in("product_id", resolvedProductIds)
    : { data: [], error: null };

  if (variantError) {
    throw new HttpError(400, "Unable to load product variants.");
  }

  const variantMap = new Map((variants || []).map((variant) => [variant.id, variant]));
  const variantsByProduct = new Map();
  for (const variant of variants || []) {
    const current = variantsByProduct.get(variant.product_id) || [];
    current.push(variant);
    variantsByProduct.set(variant.product_id, current);
  }

  function normalizeVariantOption(value) {
    return String(value || "")
      .trim()
      .replace(/^size\s*:\s*/i, "")
      .replace(/^color\s*:\s*/i, "")
      .toLowerCase();
  }

  function resolveVariantForItem(item, product) {
    const activeVariants = (variantsByProduct.get(product.id) || []).filter((variant) => variant.active);

    if (!activeVariants.length) {
      return { variant: null, activeVariants };
    }

    if (item.variantId) {
      const variant = variantMap.get(item.variantId);
      return { variant, activeVariants };
    }

    if (item.size || item.color) {
      const normalizedSize = normalizeVariantOption(item.size);
      const normalizedColor = normalizeVariantOption(item.color);

      const matches = activeVariants.filter((variant) => {
        const variantSize = normalizeVariantOption(variant.size);
        const variantColor = normalizeVariantOption(variant.color);

        if (normalizedSize && variantSize !== normalizedSize) {
          return false;
        }

        if (normalizedColor && variantColor !== normalizedColor) {
          return false;
        }

        return true;
      });

      if (matches.length === 1) {
        return { variant: matches[0], activeVariants };
      }
    }

    if (activeVariants.length === 1) {
      return { variant: activeVariants[0], activeVariants };
    }

    return { variant: null, activeVariants };
  }

  const pricedItems = normalizedItems.map((item) => {
    const product = productMap.get(item.productRef);
    if (!product || !product.active || product.status !== "active") {
      throw new HttpError(400, "One or more items in your cart are no longer available.");
    }

    const { variant, activeVariants } = resolveVariantForItem(item, product);

    if (activeVariants.length > 0) {
      if (!variant || variant.product_id !== product.id || !variant.active) {
        throw new HttpError(
          409,
          `Please reselect ${product.title} and choose an available size or color before checkout.`,
        );
      }
      if (Number(variant.stock_count || 0) < item.quantity) {
        throw new HttpError(
          409,
          `Only ${variant.stock_count || 0} left for ${product.title}. Please update your cart selection.`,
        );
      }

      const unitPrice = Number(variant.price_override ?? product.discount_price ?? product.price ?? 0);
      return {
        productId: product.id,
        id: product.id,
        productSlug: product.slug || null,
        variantId: variant.id,
        quantity: item.quantity,
        title: product.title,
        unitPrice,
        price: unitPrice,
        category: product.category || null,
        category_id: product.category_id || null,
        variantLabel: [variant.color, variant.size].filter(Boolean).join(" / ") || "Default",
        sku: variant.sku || null,
      };
    }

    if (Number(product.stock || 0) < item.quantity) {
      throw new HttpError(
        409,
        `Only ${product.stock || 0} left for ${product.title}. Please update your cart quantity.`,
      );
    }

    return {
      productId: product.id,
      id: product.id,
      productSlug: product.slug || null,
      variantId: null,
      quantity: item.quantity,
      title: product.title,
      unitPrice: Number(product.discount_price ?? product.price ?? 0),
      price: Number(product.discount_price ?? product.price ?? 0),
      category: product.category || null,
      category_id: product.category_id || null,
      variantLabel: "Default",
      sku: null,
    };
  });

  const subtotal = Number(
    pricedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0).toFixed(2),
  );
  const baseShipping = subtotal > 0 ? CHECKOUT_SHIPPING_RATES[method] : 0;

  const { data: activePromotions } = await supabase
    .from(SUPABASE_TABLES.promotions)
    .select("*, promotion_targets(product_id, category_id, category)")
    .eq("active", true)
    .gte("ends_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1);

  const activePromotion = activePromotions?.[0] || null;
  const promotionDiscount = calculatePromotionDiscount(pricedItems, activePromotion);

  let coupon = null;
  let couponDiscount = 0;
  if (couponCode) {
    const { data, error } = await validateCouponCode(supabase, {
      code: couponCode,
      userId,
      subtotal: Math.max(0, subtotal - promotionDiscount),
      shipping: baseShipping,
    });

    if (error || !data) {
      throw new HttpError(400, error?.message || "Invalid coupon code.");
    }

    coupon = data;
    couponDiscount = Number(data.savings || 0);
  }

  const shipping = coupon?.dealType === "free_shipping" ? 0 : baseShipping;
  const discount = Math.min(subtotal, promotionDiscount + couponDiscount);
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Number((taxableAmount * CHECKOUT_TAX_RATE).toFixed(2));
  const total = Number((taxableAmount + tax + shipping).toFixed(2));

  return {
    shippingMethod: method,
    currency: "INR",
    coupon,
    items: pricedItems,
    amounts: {
      subtotal,
      discount: Number(discount.toFixed(2)),
      promotionDiscount: Number(promotionDiscount.toFixed(2)),
      couponDiscount: Number(couponDiscount.toFixed(2)),
      shipping,
      tax,
      total,
    },
  };
}
