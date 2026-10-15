"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  adminGetPromotions, 
  adminCreatePromotion, 
  adminDeletePromotion,
  adminSetPromotionActive,
  adminGetProducts,
  adminGetCategories
} from "@/services/supabase";

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingPromotionId, setUpdatingPromotionId] = useState(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [promotionKind, setPromotionKind] = useState("product_discount");
  const [appliesTo, setAppliesTo] = useState("all");
  const [discountType, setDiscountType] = useState("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [requiredQuantity, setRequiredQuantity] = useState(3);
  const [bundlePrice, setBundlePrice] = useState("");
  const [getQuantity, setGetQuantity] = useState(1);
  const [endsAt, setEndsAt] = useState("");
  const [selectedTargets, setSelectedTargets] = useState([]);

  const productsById = Object.fromEntries(products.map((p) => [p.id, p]));
  const categoriesById = Object.fromEntries(categories.map((c) => [c.id, c]));
  const normalizeCategoryKey = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]/g, "");

  const formatCategoryName = (value) => {
    const key = normalizeCategoryKey(value);
    if (key === "skincare") return "Skin Care";
    if (key === "haircare") return "Hair Care";
    if (key === "bodycare") return "Body Care";
    return String(value || "")
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const categoryOptionsMap = new Map();

  for (const product of products) {
    if (!product.category) continue;
    const key = normalizeCategoryKey(product.category);
    if (!key || categoryOptionsMap.has(key)) continue;
    categoryOptionsMap.set(key, {
      id: `category-text:${product.category}`,
      name: formatCategoryName(product.category),
      isTextCategory: true,
    });
  }

  for (const category of categories) {
    const key = normalizeCategoryKey(category.name || category.slug);
    if (!key || categoryOptionsMap.has(key)) continue;
    categoryOptionsMap.set(key, {
      id: category.id,
      name: formatCategoryName(category.name || category.slug),
      isTextCategory: false,
    });
  }

  const categoryOptions = [...categoryOptionsMap.values()];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const supabase = createClient();
    const [promoRes, prodRes, catRes] = await Promise.all([
      adminGetPromotions(supabase),
      adminGetProducts(supabase),
      adminGetCategories(supabase)
    ]);
    if (promoRes.data) setPromotions(promoRes.data);
    if (prodRes.data) setProducts(prodRes.data);
    if (catRes.data) setCategories(catRes.data);
    setLoading(false);
  }

  const handleTargetToggle = (id) => {
    setSelectedTargets((prev) =>
      prev.includes(id) ? prev.filter((targetId) => targetId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    if (new Date(endsAt) <= new Date()) {
      alert("End date must be in the future.");
      setSaving(false);
      return;
    }

    const normalizedAppliesTo = promotionKind === "category_discount" ? "categories" : appliesTo;

    if (normalizedAppliesTo !== "all" && selectedTargets.length === 0) {
      alert("Please select at least one target for this promotion.");
      setSaving(false);
      return;
    }

    if ((promotionKind === "product_discount" || promotionKind === "category_discount") && Number(discountValue) <= 0) {
      alert("Please enter a discount value.");
      setSaving(false);
      return;
    }

    if (promotionKind === "buy_x_for_y" && (Number(requiredQuantity) <= 0 || Number(bundlePrice) <= 0)) {
      alert("Please enter a valid quantity and bundle price.");
      setSaving(false);
      return;
    }

    if (promotionKind === "buy_x_get_y" && (Number(requiredQuantity) <= 0 || Number(getQuantity) <= 0)) {
      alert("Please enter valid buy/get quantities.");
      setSaving(false);
      return;
    }

    const targets = selectedTargets.map((id) => {
      if (normalizedAppliesTo !== "categories") return { product_id: id };

      if (id.startsWith("category-text:")) {
        return { category: id.replace("category-text:", "") };
      }

      return { category_id: id };
    });

    const payload = {
      title,
      description: description.trim() || null,
      promotion_kind: promotionKind,
      applies_to: normalizedAppliesTo,
      discount_type: promotionKind === "product_discount" || promotionKind === "category_discount" ? discountType : "fixed",
      discount_value: promotionKind === "product_discount" || promotionKind === "category_discount" ? Number(discountValue) : 0,
      required_quantity: ["buy_x_for_y", "buy_x_get_y"].includes(promotionKind) ? Number(requiredQuantity) : null,
      bundle_price: promotionKind === "buy_x_for_y" ? Number(bundlePrice) : null,
      get_quantity: promotionKind === "buy_x_get_y" ? Number(getQuantity) : null,
      ends_at: new Date(endsAt).toISOString(),
      active: true
    };

    const { error } = await adminCreatePromotion(supabase, payload, targets);
    if (error) {
      alert("Failed to create promotion: " + error.message);
    } else {
      await loadData();
      resetForm();
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this promotion?")) return;
    const supabase = createClient();
    await adminDeletePromotion(supabase, id);
    await loadData();
  };

  const handleToggleActive = async (promo) => {
    const supabase = createClient();
    setUpdatingPromotionId(promo.id);
    const { error } = await adminSetPromotionActive(supabase, promo.id, !promo.active);
    if (error) {
      alert("Failed to update promotion status: " + error.message);
      setUpdatingPromotionId(null);
      return;
    }
    await loadData();
    setUpdatingPromotionId(null);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPromotionKind("product_discount");
    setAppliesTo("all");
    setDiscountType("percent");
    setDiscountValue("");
    setRequiredQuantity(3);
    setBundlePrice("");
    setGetQuantity(1);
    const dt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setEndsAt(local);
    setSelectedTargets([]);
    setShowForm(false);
  };

  const targetOptions = appliesTo === "categories" || promotionKind === "category_discount" ? categoryOptions : products;
  const showDiscountFields = promotionKind === "product_discount" || promotionKind === "category_discount";
  const showAppliesTo = promotionKind !== "category_discount";

  useEffect(() => {
    if (!showForm) return;
    if (!endsAt) {
      const dt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setEndsAt(local);
    }
  }, [showForm, endsAt]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Promotions</h1>
          <p className="text-sm text-slate-500">Manage the single promotion shown below customer reviews on the homepage</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          {showForm ? "Cancel" : "Create Promotion"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700">Promotion Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                  placeholder="e.g. Summer Flash Sale"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700">Ends At (Date & Time)</label>
                <input
                  type="datetime-local"
                  required
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">Homepage Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                placeholder="Short line shown under the promotion title on the homepage"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700">Promotion Type</label>
                <select
                  value={promotionKind}
                  onChange={(e) => {
                    const nextKind = e.target.value;
                    setPromotionKind(nextKind);
                    setSelectedTargets([]);
                    if (nextKind === "category_discount") setAppliesTo("categories");
                  }}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                >
                  <option value="product_discount">Product / All Discount</option>
                  <option value="category_discount">Category Discount</option>
                  <option value="buy_x_for_y">Buy X @ Fixed Price</option>
                  <option value="buy_x_get_y">Buy X Get Y</option>
                </select>
              </div>

              {showAppliesTo ? (
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Applies To</label>
                  <select
                    value={appliesTo}
                    onChange={(e) => {
                      setAppliesTo(e.target.value);
                      setSelectedTargets([]);
                    }}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                  >
                    <option value="all">All Products</option>
                    <option value="products">Selected Products</option>
                    <option value="categories">Selected Categories</option>
                  </select>
                </div>
              ) : null}

              {showDiscountFields ? (
                <div className="grid grid-cols-[0.85fr_1fr] gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Discount</label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                    >
                      <option value="percent">%</option>
                      <option value="fixed">₹</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Value</label>
                    <input
                      type="number"
                      min="0"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                    />
                  </div>
                </div>
              ) : null}
            </div>

            {promotionKind === "buy_x_for_y" ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Buy Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={requiredQuantity}
                    onChange={(e) => setRequiredQuantity(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Bundle Price</label>
                  <input
                    type="number"
                    min="1"
                    value={bundlePrice}
                    onChange={(e) => setBundlePrice(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                    placeholder="999"
                  />
                </div>
              </div>
            ) : null}

            {promotionKind === "buy_x_get_y" ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Buy Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={requiredQuantity}
                    onChange={(e) => setRequiredQuantity(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Free Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={getQuantity}
                    onChange={(e) => setGetQuantity(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                  />
                </div>
              </div>
            ) : null}

            {(appliesTo !== "all" || promotionKind === "category_discount") ? (
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Select {appliesTo === "categories" || promotionKind === "category_discount" ? "Categories" : "Products"}
                </label>
                <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-slate-200 p-2">
                  {targetOptions.map((opt) => (
                    <label key={opt.id} className="flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={selectedTargets.includes(opt.id)}
                        onChange={() => handleTargetToggle(opt.id)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      <span className="text-sm">{opt.title || opt.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Promotion"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading promotions...</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Title</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Rule</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Description</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Ends At</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {promotions.map((promo) => {
                const isExpired = new Date(promo.ends_at) < new Date();
                const targetLabels = (promo.promotion_targets || [])
                  .map((t) => {
                    if (t.product_id) return productsById[t.product_id]?.title || "Unknown product";
                    if (t.category_id) return categoriesById[t.category_id]?.name || "Unknown category";
                    if (t.category) return t.category;
                    return null;
                  })
                  .filter(Boolean);
                return (
                  <tr key={promo.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">{promo.title}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      <p className="capitalize">{String(promo.promotion_kind || "product_discount").replaceAll("_", " ")}</p>
                      {targetLabels.length > 0 ? (
                        <p className="mt-1 max-w-[220px] truncate text-xs text-slate-400" title={targetLabels.join(", ")}>
                          {targetLabels.join(", ")}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-slate-400">All products</p>
                      )}
                    </td>
                    <td className="max-w-md px-6 py-4 text-sm text-slate-500">
                      <p className="truncate" title={promo.description || ""}>
                        {promo.description || "No description"}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                      {new Date(promo.ends_at).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${isExpired ? 'bg-slate-100 text-slate-800' : promo.active ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {isExpired ? 'Expired' : promo.active ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleToggleActive(promo)}
                          disabled={updatingPromotionId === promo.id || isExpired}
                          className="text-slate-600 hover:text-slate-900 disabled:opacity-50"
                        >
                          {promo.active ? "Pause" : "Select"}
                        </button>
                        <button onClick={() => handleDelete(promo.id)} className="text-rose-600 hover:text-rose-900">Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {promotions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-slate-500">No promotions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
