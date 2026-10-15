export const PROMOTION_KINDS = {
  productDiscount: "product_discount",
  categoryDiscount: "category_discount",
  buyXForY: "buy_x_for_y",
  buyXGetY: "buy_x_get_y",
  freeGift: "free_gift",
};

export function toNumber(value, fallback = 0) {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  const numeric = Number(String(value || "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(numeric) ? numeric : fallback;
}

export function getProductBasePrice(product) {
  return toNumber(product?.discount_price ?? product?.discountPrice ?? product?.price);
}

export function isPromotionLive(promotion, now = new Date()) {
  if (!promotion?.active) return false;
  if (promotion.starts_at && new Date(promotion.starts_at) > now) return false;
  if (promotion.ends_at && new Date(promotion.ends_at) < now) return false;
  return true;
}

export function isProductEligibleForPromotion(product, promotion) {
  if (!isPromotionLive(promotion)) return false;
  if (promotion.promotion_kind === PROMOTION_KINDS.freeGift) return false;

  const appliesTo = promotion.applies_to || "all";
  if (appliesTo === "all") return true;

  const targets = promotion.promotion_targets || [];
  if (appliesTo === "products") {
    return targets.some((target) => target.product_id === product?.id);
  }

  if (appliesTo === "categories") {
    return targets.some((target) => {
      const targetCategory = target.category_id || target.category;
      return targetCategory && (targetCategory === product?.category_id || targetCategory === product?.category);
    });
  }

  return false;
}

export function getPromotionBadge(promotion) {
  if (!isPromotionLive(promotion)) return null;

  const quantity = Number(promotion.required_quantity || 0);
  const getQuantity = Number(promotion.get_quantity || 0);
  const value = toNumber(promotion.discount_value);

  if (promotion.promotion_kind === PROMOTION_KINDS.buyXForY && quantity > 0 && promotion.bundle_price) {
    return `Buy ${quantity} @ ₹${toNumber(promotion.bundle_price)}`;
  }

  if (promotion.promotion_kind === PROMOTION_KINDS.buyXGetY && quantity > 0 && getQuantity > 0) {
    return `Buy ${quantity} Get ${getQuantity}`;
  }

  if (promotion.promotion_kind === PROMOTION_KINDS.freeGift && promotion.minimum_order_amount) {
    return `Free Gift Above ₹${toNumber(promotion.minimum_order_amount)}`;
  }

  if (promotion.discount_type === "percent" && value > 0) return `${value}% Off`;
  if (promotion.discount_type === "fixed" && value > 0) return `₹${value} Off`;

  return promotion.title || "Promotion";
}

export function getPromotionalUnitPrice(product, promotion) {
  const price = getProductBasePrice(product);
  if (!isProductEligibleForPromotion(product, promotion)) return price;

  const kind = promotion.promotion_kind;
  if (kind !== PROMOTION_KINDS.productDiscount && kind !== PROMOTION_KINDS.categoryDiscount) {
    return price;
  }

  const value = toNumber(promotion.discount_value);
  if (value <= 0) return price;

  if (promotion.discount_type === "percent") {
    return Number(Math.max(0, price - (price * value) / 100).toFixed(2));
  }

  if (promotion.discount_type === "fixed") {
    return Number(Math.max(0, price - value).toFixed(2));
  }

  return price;
}

function getEligibleUnitPrices(cartItems, promotion) {
  const prices = [];

  for (const item of cartItems || []) {
    if (!isProductEligibleForPromotion(item, promotion)) continue;

    const unitPrice = getProductBasePrice(item);
    const quantity = Number(item.quantity || 0);
    for (let index = 0; index < quantity; index += 1) {
      prices.push(unitPrice);
    }
  }

  return prices;
}

export function calculatePromotionDiscount(cartItems, promotion) {
  if (!isPromotionLive(promotion)) return 0;

  const kind = promotion.promotion_kind;

  if (kind === PROMOTION_KINDS.productDiscount || kind === PROMOTION_KINDS.categoryDiscount) {
    const discount = (cartItems || []).reduce((sum, item) => {
      if (!isProductEligibleForPromotion(item, promotion)) return sum;

      const unitPrice = getProductBasePrice(item);
      const promotedPrice = getPromotionalUnitPrice(item, promotion);
      return sum + Math.max(0, unitPrice - promotedPrice) * Number(item.quantity || 0);
    }, 0);

    return Number(discount.toFixed(2));
  }

  if (kind === PROMOTION_KINDS.buyXForY) {
    const quantity = Number(promotion.required_quantity || 0);
    const bundlePrice = toNumber(promotion.bundle_price);
    if (quantity <= 0 || bundlePrice <= 0) return 0;

    const eligiblePrices = getEligibleUnitPrices(cartItems, promotion).sort((a, b) => b - a);
    const bundleCount = Math.floor(eligiblePrices.length / quantity);
    if (bundleCount <= 0) return 0;

    const bundledOriginal = eligiblePrices
      .slice(0, bundleCount * quantity)
      .reduce((sum, price) => sum + price, 0);

    return Number(Math.max(0, bundledOriginal - bundleCount * bundlePrice).toFixed(2));
  }

  if (kind === PROMOTION_KINDS.buyXGetY) {
    const buyQuantity = Number(promotion.required_quantity || 0);
    const getQuantity = Number(promotion.get_quantity || 0);
    const groupSize = buyQuantity + getQuantity;
    if (buyQuantity <= 0 || getQuantity <= 0 || groupSize <= 0) return 0;

    const eligiblePrices = getEligibleUnitPrices(cartItems, promotion).sort((a, b) => a - b);
    const freeCount = Math.floor(eligiblePrices.length / groupSize) * getQuantity;
    if (freeCount <= 0) return 0;

    return Number(eligiblePrices.slice(0, freeCount).reduce((sum, price) => sum + price, 0).toFixed(2));
  }

  return 0;
}

export function calculateCartPromotionSummary(cartItems, promotion) {
  const subtotal = Number(
    (cartItems || []).reduce((sum, item) => sum + getProductBasePrice(item) * Number(item.quantity || 0), 0).toFixed(2),
  );
  const promotionDiscount = calculatePromotionDiscount(cartItems, promotion);
  const promotionTotal = Number(Math.max(0, subtotal - promotionDiscount).toFixed(2));

  return {
    subtotal,
    promotionDiscount,
    promotionTotal,
    badge: getPromotionBadge(promotion),
  };
}
