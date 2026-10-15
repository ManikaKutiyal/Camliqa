import { formatCurrency } from "@/lib/utils";

export const CONCERN_VISUALS = {
  Dullness: { desc: "Radiance & Glow", img: "/collections/uploaded_prod_5.png", color: "bg-[#FDF5E6]/60" },
  Aging: { desc: "Lines & Elasticity", img: "/collections/uploaded_prod_4.png", color: "bg-[#F5F5F5]/60" },
  "Anti-Aging": { desc: "Lines & Elasticity", img: "/collections/uploaded_prod_4.png", color: "bg-[#F5F5F5]/60" },
  Hydration: { desc: "Dryness & Barrier", img: "/collections/uploaded_prod_3.png", color: "bg-[#F0F8FF]/60" },
  Dryness: { desc: "Dryness & Barrier", img: "/collections/uploaded_prod_3.png", color: "bg-[#F0F8FF]/60" },
  Blemishes: { desc: "Pores & Clarity", img: "/collections/uploaded_prod_1.png", color: "bg-[#FFF5EE]/60" },
  Acne: { desc: "Pores & Clarity", img: "/collections/uploaded_prod_1.png", color: "bg-[#FFF5EE]/60" },
  Brightening: { desc: "Even Skin Tone", img: "/collections/uploaded_prod_2.png", color: "bg-[#FFFBF0]/60" },
  Sensitivity: { desc: "Gentle Balance", img: "/collections/uploaded_prod_5.png", color: "bg-[#FFF0F3]/60" },
  Pores: { desc: "Refine & Clarify", img: "/collections/uploaded_prod_2.png", color: "bg-[#F8F8FF]/60" },
  "Oil Control": { desc: "Sebum Balance", img: "/collections/uploaded_prod_4.png", color: "bg-[#F0FFF4]/60" },
  "Hair Fall": { desc: "Thinning & Shedding", img: "/collections/clinical_serum.png", color: "bg-[#F5F5F5]/40" },
  Dandruff: { desc: "Build-up & Health", img: "/collections/splashing_serum.png", color: "bg-[#F0FFF0]/40" },
  Frizz: { desc: "Heat & Breakage", img: "/collections/cream_jar.png", color: "bg-[#FDF5E6]/40" },
  "Damage Repair": { desc: "Heat & Breakage", img: "/collections/cream_jar.png", color: "bg-[#FDF5E6]/40" },
  "Scalp Health": { desc: "Build-up & Health", img: "/collections/splashing_serum.png", color: "bg-[#F0FFF0]/40" },
  Growth: { desc: "Flat & Fine Hair", img: "/collections/pump_bottle.png", color: "bg-[#E6E6FA]/40" },
  "Body Dryness": { desc: "Intense Moisture", img: "/collections/uploaded_prod_3.png", color: "bg-[#FDF5E6]/60" },
  "Roughness": { desc: "Smooth Texture", img: "/collections/uploaded_prod_5.png", color: "bg-[#F0F8FF]/60" },
  "Body Sensitivity": { desc: "Gentle Care", img: "/collections/uploaded_prod_2.png", color: "bg-[#FFF5EE]/60" },
  "Body Hydration": { desc: "Deep Quench", img: "/collections/pure_care_left.jpg", color: "bg-[#F5F5F5]/60" },
  "Firming": { desc: "Toned Skin", img: "/collections/uploaded_prod_4.png", color: "bg-[#FDF5E6]/60" },
  "Exfoliation": { desc: "Refining Polish", img: "/collections/uploaded_prod_5.png", color: "bg-[#F0F8FF]/60" },
  "Relaxation": { desc: "Calm Senses", img: "/collections/uploaded_prod_1.png", color: "bg-[#FFF5EE]/60" },
};

export const CONCERN_FALLBACK_POOL = [
  { desc: "Targeted Solution", img: "/collections/uploaded_prod_1.png", color: "bg-[#FDF5E6]/60" },
  { desc: "Precision Formula", img: "/collections/uploaded_prod_2.png", color: "bg-[#F5F5F5]/60" },
  { desc: "Expert Care", img: "/collections/uploaded_prod_3.png", color: "bg-[#F0F8FF]/60" },
  { desc: "Pure Ritual", img: "/collections/uploaded_prod_5.png", color: "bg-[#FFF5EE]/60" },
];

export const SKIN_CONCERN_FALLBACK = [
  { title: "DULLNESS", rawTitle: "Dullness", desc: "Radiance & Glow", img: "/collections/uploaded_prod_5.png", color: "bg-[#FDF5E6]/60" },
  { title: "AGING", rawTitle: "Aging", desc: "Lines & Elasticity", img: "/collections/uploaded_prod_4.png", color: "bg-[#F5F5F5]/60" },
  { title: "HYDRATION", rawTitle: "Hydration", desc: "Dryness & Barrier", img: "/collections/uploaded_prod_3.png", color: "bg-[#F0F8FF]/60" },
  { title: "BLEMISHES", rawTitle: "Blemishes", desc: "Pores & Clarity", img: "/collections/uploaded_prod_1.png", color: "bg-[#FFF5EE]/60" },
];

export const SKIN_CONCERN_NAMES = [
  "Acne",
  "Aging",
  "Anti-Aging",
  "Blemishes",
  "Brightening",
  "Dullness",
  "Dryness",
  "Hydration",
  "Oil Control",
  "Pores",
  "Sensitivity",
];

export const HAIR_CONCERN_NAMES = [
  "Hair Fall",
  "Dandruff",
  "Frizz",
  "Damage Repair",
  "Scalp Health",
  "Growth",
];

export const HAIR_CONCERN_FALLBACK = [
  { title: "VOLUME", rawTitle: "Growth", desc: "Flat & Fine Hair", img: "/collections/pump_bottle.png", color: "bg-[#E6E6FA]/40" },
  { title: "DAMAGE", rawTitle: "Damage Repair", desc: "Heat & Breakage", img: "/collections/cream_jar.png", color: "bg-[#FDF5E6]/40" },
  { title: "SCALP", rawTitle: "Scalp Health", desc: "Build-up & Health", img: "/collections/splashing_serum.png", color: "bg-[#F0FFF0]/40" },
  { title: "DENSITY", rawTitle: "Hair Fall", desc: "Thinning & Shedding", img: "/collections/clinical_serum.png", color: "bg-[#F5F5F5]/40" },
];

export const BODY_CONCERN_NAMES = [
  "Body Dryness",
  "Roughness",
  "Body Sensitivity",
  "Body Hydration",
  "Firming",
  "Exfoliation",
  "Relaxation",
];

export const BODY_CONCERN_FALLBACK = [
  { title: "DRYNESS", rawTitle: "Body Dryness", desc: "Intense Moisture", img: "/collections/uploaded_prod_3.png", color: "bg-[#FDF5E6]/60" },
  { title: "ROUGHNESS", rawTitle: "Roughness", desc: "Smooth Texture", img: "/collections/uploaded_prod_5.png", color: "bg-[#F0F8FF]/60" },
  { title: "SENSITIVITY", rawTitle: "Body Sensitivity", desc: "Gentle Care", img: "/collections/uploaded_prod_2.png", color: "bg-[#FFF5EE]/60" },
  { title: "HYDRATION", rawTitle: "Body Hydration", desc: "Deep Quench", img: "/collections/pure_care_left.jpg", color: "bg-[#F5F5F5]/60" },
  { title: "FIRMING", rawTitle: "Firming", desc: "Toned Skin", img: "/collections/uploaded_prod_4.png", color: "bg-[#FDF5E6]/60" },
  { title: "EXFOLIATION", rawTitle: "Exfoliation", desc: "Refining Polish", img: "/collections/uploaded_prod_5.png", color: "bg-[#F0F8FF]/60" },
  { title: "RELAXATION", rawTitle: "Relaxation", desc: "Calm Senses", img: "/collections/uploaded_prod_1.png", color: "bg-[#FFF5EE]/60" },
];

export function normalizeCategory(category) {
  return String(category || "").toLowerCase().replace(/\s+/g, " ").trim();
}

export function isSkinCareCategory(category) {
  const value = normalizeCategory(category);
  return value === "skin care" || value === "skincare";
}

export function isHairCareCategory(category) {
  const value = normalizeCategory(category);
  return value === "hair care" || value === "haircare";
}

export function isBodyCareCategory(category) {
  const value = normalizeCategory(category);
  return ["body care", "bodycare", "body and bath", "bath and body", "bath & body", "body", "bodyhands", "bath & body care"].includes(value);
}

export function filterByCategory(products, category) {
  const isSkin = category === "Skin Care";
  const isHair = category === "Hair Care";
  const isBody = category === "Body Care";
  return (products || []).filter((product) => {
    if (isSkin) return isSkinCareCategory(product.category);
    if (isHair) return isHairCareCategory(product.category);
    if (isBody) return isBodyCareCategory(product.category);
    return normalizeCategory(product.category) === normalizeCategory(category);
  });
}

export function productHasTag(tags, tagName) {
  if (!Array.isArray(tags)) return false;
  const target = tagName.toLowerCase();
  return tags.some((t) => t.replace(/^\*/, "").toLowerCase() === target);
}

export function mapStorefrontProduct(product) {
  return {
    ...product,
    name: product.title || product.name,
    image: product.image_url || product.image,
    price: formatCurrency(product.price || 0),
    tag: product.short_description || product.tag || product.sub_category || "Freshly Restocked",
  };
}

export function getProductHoverSrc(product) {
  return (
    product.product_images?.find((img) => img.url !== product.image)?.url ||
    product.gallery?.find((img) => img !== product.image) ||
    product.hoverSrc ||
    product.image
  );
}

export function getProductDisplayTag(product) {
  if (!Array.isArray(product.tags) || product.tags.length === 0) return null;

  const starred = product.tags.find((t) => t.startsWith("*"));
  if (starred) return starred.replace(/^\*/, "");

  const tag =
    product.tags.find((t) => t.replace(/^\*/, "").toLowerCase() !== "must have") ||
    product.tags[0];
  return tag.replace(/^\*/, "");
}

export function getTagBadgeClass(tag) {
  return "bg-[#FFD700]/40 text-[#8B7500]";
}

export function getProductBadges(product) {
  if (!Array.isArray(product.tags) || product.tags.length === 0) return [];

  return product.tags
    .map((tag) => tag.replace(/^\*/, ""))
    .filter(Boolean)
    .map((tag) => tag.toUpperCase())
    .slice(0, 2);
}

export function getProductSizes(product, fallback = []) {
  const sizes = (product.product_variants || [])
    .map((variant) => variant.size)
    .filter(Boolean);
  return sizes.length > 0 ? sizes : fallback;
}

export function getPopularProductMeta(product, index, defaults) {
  return {
    badges: getProductBadges(product),
    reviews: product.review_count || defaults.reviews[index],
    sizes: getProductSizes(product, defaults.sizes[index]),
  };
}

export function mapSpotlightProduct(product, index, defaults = []) {
  const starredTag = product.tags?.find((t) => t.startsWith("*"));
  const badge = starredTag
    ? starredTag.replace(/^\*/, "").toUpperCase()
    : productHasTag(product.tags, "Bestseller")
      ? "BESTSELLER"
      : defaults[index]?.badge || "BESTSELLER";

  const sizes = getProductSizes(product, defaults[index]?.sizes || []);

  return {
    ...product,
    hoverSrc: getProductHoverSrc(product),
    badge,
    reviews: product.review_count || defaults[index]?.reviews || "0",
    tag: product.short_description || product.tag || product.sub_category || product.category || "",
    sizes,
  };
}

export function buildConcernCards(products, { fallback, limit = 4, visuals = CONCERN_VISUALS, fallbackPool = CONCERN_FALLBACK_POOL, allowedConcerns = null, includeAllAllowed = false }) {
  const countMap = {};
  const allowed = allowedConcerns ? new Set(allowedConcerns) : null;

  for (const product of products) {
    for (const concern of product.concern || []) {
      if (allowed && !allowed.has(concern)) continue;
      if (concern) countMap[concern] = (countMap[concern] || 0) + 1;
    }
  }

  const entries = includeAllAllowed && allowedConcerns
    ? allowedConcerns.map((concern) => [concern, countMap[concern] || 0])
    : Object.entries(countMap).sort(([, a], [, b]) => b - a);

  const sorted = entries
    .slice(0, limit)
    .map(([concern], idx) => {
      const visual = visuals[concern] || fallbackPool[idx % fallbackPool.length];
      return { title: concern.toUpperCase(), rawTitle: concern, ...visual };
    });

  return sorted.length > 0 ? sorted : fallback;
}

export function getRecentProducts(products, limit = 3) {
  return [...(products || [])]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, limit);
}

export function getFeaturedProducts(products, limit = 3) {
  const featured = products.filter(
    (product) => product.featured === true || productHasTag(product.tags, "Featured"),
  );
  if (featured.length >= limit) return featured.slice(0, limit);
  return products.slice(0, limit);
}
