import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, Star, X, UploadCloud, Pencil, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

const PREDEFINED_SKIN_TYPES = ["Oily", "Dry", "Combination", "Sensitive", "Normal", "All"];
const PREDEFINED_SKIN_CONCERNS = ["Acne", "Dullness", "Dryness", "Sensitivity", "Anti-Aging", "Pores", "Brightening", "Oil Control", "Hydration"];
const PREDEFINED_SKIN_SUBCATEGORIES = ["Serums", "Moisturizers", "Masks", "Cleansers"];
const PREDEFINED_HAIR_SUBCATEGORIES = ["Shampoo", "Conditioner", "Oil", "Hair mask"];
const PREDEFINED_BODY_SUBCATEGORIES = ["Soaps & Scrubs", "Lotions & Butters", "Bath Salts & Bombs", "Body Oils"];
const PREDEFINED_HAIR_CONCERNS = ["Hair Fall", "Dandruff", "Frizz", "Damage Repair", "Scalp Health", "Growth"];
const PREDEFINED_BODY_CONCERNS = ["Dryness", "Roughness", "Sensitivity", "Hydration", "Firming", "Exfoliation", "Relaxation"];

const PREDEFINED_TAGS = ["Featured", "Recommended", "Must Have", "Bestseller", "100% Natural", "Skin-friendly", "Made in India", "Handmade", "Eco-conscious", "Cruelty-free", "Vegan", "Dermatologically Tested"];

const LEGACY_TAG_MAP = {
  RECOMMENDED: "Recommended",
  "MUST HAVE": "Must Have",
  BESTSELLER: "Bestseller",
};

const normalizeTag = (tag) => {
  const isStarred = tag.startsWith("*");
  const base = isStarred ? tag.slice(1) : tag;
  const normalized = LEGACY_TAG_MAP[base] || base;
  return isStarred ? `*${normalized}` : normalized;
};

export default function ProductForm({ initialData, onSubmit, isSubmitting }) {
  const router = useRouter();

  // Derive initial tags — if the product has featured: true but the tag isn't
  // in the tags array (e.g. products marked via old admin), inject it automatically.
  const resolveInitialTags = () => {
    const tags = [...(initialData?.tags || [])].map(normalizeTag);
    if (initialData?.featured === true) {
      const alreadyHasFeaturedTag = tags.some((t) => t === 'Featured' || t === '*Featured');
      if (!alreadyHasFeaturedTag) {
        tags.unshift('Featured');
      }
    }
    return tags;
  };

  const [formData, setFormData] = useState({
    name: initialData?.name || initialData?.title || '',
    price: initialData?.price || '',
    rating: initialData?.rating || 0,
    category: initialData?.category || 'Skin Care',
    sub_category: initialData?.sub_category || '',
    description: initialData?.description || '',
    how_to_use: initialData?.how_to_use || '',
    suitable_for: initialData?.suitable_for || '',
    image: initialData?.image || initialData?.image_url || '',
    stock: typeof initialData?.stock === 'number' ? initialData.stock : (initialData?.stock === 'out-of-stock' ? 0 : (initialData?.stock === 'in-stock' ? 100 : parseInt(initialData?.stock) || 0)),
    skin_type: initialData?.skin_type || [],
    concern: initialData?.concern || [],
    tags: resolveInitialTags(),
    key_benefits: initialData?.key_benefits || [],
    gallery: initialData?.product_images || [],
    ingredients: initialData?.ingredients || [],
  });

  // Variants state — each: { id, size, stock_count, price_override }
  const [variants, setVariants] = useState(() => {
    const raw = initialData?.product_variants || [];
    return raw.filter(v => v.active !== false).map(v => ({
      id: v.id || Math.random().toString(36).substring(7),
      size: v.size || '',
      stock_count: typeof v.stock_count === 'number' ? v.stock_count : 0,
      price_override: v.price_override != null ? v.price_override : '',
    }));
  });

  const [editingVariantId, setEditingVariantId] = useState(null);

  const addVariant = () => {
    const newId = Math.random().toString(36).substring(7);
    setVariants(prev => [...prev, {
      id: newId,
      size: '',
      stock_count: 0,
      price_override: '',
    }]);
    setEditingVariantId(newId); // auto-open new variant for editing
  };

  const updateVariant = (id, field, value) => {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const removeVariant = (id) => {
    setVariants(prev => prev.filter(v => v.id !== id));
  };


  const [mediaItems, setMediaItems] = useState(() => {
    const items = [];
    if (initialData?.image || initialData?.image_url) {
      items.push({ id: 'cover', url: initialData.image || initialData.image_url, file: null, isCover: true });
    }
    if (initialData?.product_images && initialData.product_images.length > 0) {
      initialData.product_images.forEach(img => {
        items.push({ id: img.id || Math.random().toString(), url: img.url, file: null, isCover: false });
      });
    }
    return items;
  });

  const [newBenefit, setNewBenefit] = useState("");
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [newIngredient, setNewIngredient] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanVariants = variants.filter(v => v.size.trim()).map(v => ({
      ...v,
      stock_count: parseInt(v.stock_count) || 0,
      price_override: v.price_override !== '' ? parseFloat(v.price_override) : null,
    }));
    // Derive total stock from variants; fallback to formData.stock if no variants
    const totalStock = cleanVariants.length > 0
      ? cleanVariants.reduce((sum, v) => sum + v.stock_count, 0)
      : formData.stock;
    onSubmit({ ...formData, stock: totalStock, mediaItems, variants: cleanVariants });
  };

  const handleFileChange = (e) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);
    
    const newItems = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      url: URL.createObjectURL(file),
      file,
      isCover: false
    }));

    setMediaItems(prev => {
      const next = [...prev, ...newItems];
      // If no cover is set, make the first one the cover
      if (next.length > 0 && !next.some(item => item.isCover)) {
        next[0].isCover = true;
      }
      return next;
    });
  };

  const setAsCover = (id) => {
    setMediaItems(prev => prev.map(item => ({
      ...item,
      isCover: item.id === id
    })));
  };

  const removeMedia = (id) => {
    setMediaItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setFormData({ ...formData, key_benefits: [...formData.key_benefits, newBenefit.trim()] });
      setNewBenefit("");
    }
  };

  const handleRemoveBenefit = (index) => {
    const updated = [...formData.key_benefits];
    updated.splice(index, 1);
    setFormData({ ...formData, key_benefits: updated });
  };

  const handleAddGalleryImage = () => {
    if (newGalleryUrl.trim()) {
      setFormData({ 
        ...formData, 
        gallery: [...formData.gallery, { url: newGalleryUrl.trim(), sort_order: formData.gallery.length }] 
      });
      setNewGalleryUrl("");
    }
  };

  const handleRemoveGalleryImage = (index) => {
    const updated = [...formData.gallery];
    updated.splice(index, 1);
    setFormData({ ...formData, gallery: updated });
  };

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setFormData({ 
        ...formData, 
        ingredients: [...formData.ingredients, { name: newIngredient.trim(), sort_order: formData.ingredients.length }] 
      });
      setNewIngredient("");
    }
  };

  const handleRemoveIngredient = (index) => {
    const updated = [...formData.ingredients];
    updated.splice(index, 1);
    setFormData({ ...formData, ingredients: updated });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {/* 1. Basic Info */}
      <section className="bg-white rounded-[2rem] border border-secondary/20 p-8 shadow-sm">
        <h3 className="font-serif text-xl text-primary mb-6 border-b border-secondary/10 pb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary/80">Product Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-[#FDFBFF] border border-secondary/30 rounded-xl py-2.5 px-4 text-sm text-primary placeholder:text-primary/30 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary/80">Price (₹) *</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full bg-[#FDFBFF] border border-secondary/30 rounded-xl py-2.5 px-4 text-sm text-primary placeholder:text-primary/30 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary/80">Rating *</label>
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={formData.rating}
              onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value) || 0})}
              className="w-full bg-[#FDFBFF] border border-secondary/30 rounded-xl py-2.5 px-4 text-sm text-primary placeholder:text-primary/30 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary/80">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => {
                const category = e.target.value;
                setFormData({
                  ...formData,
                  category,
                  skin_type: category === "Skin Care" ? formData.skin_type : [],
                  concern: [],
                  sub_category: "",
                });
              }}
              className="w-full bg-[#FDFBFF] border border-secondary/30 rounded-xl py-2.5 px-4 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
            >
              <option value="Skin Care">Skin Care</option>
              <option value="Hair Care">Hair Care</option>
              <option value="Body Care">Body Care</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary/80">Sub-Category / Ritual</label>
            {formData.category === 'Skin Care' ? (
              <select
                value={formData.sub_category}
                onChange={(e) => setFormData({...formData, sub_category: e.target.value})}
                className="w-full bg-[#FDFBFF] border border-secondary/30 rounded-xl py-2.5 px-4 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
              >
                <option value="">Select skin sub-category</option>
                {PREDEFINED_SKIN_SUBCATEGORIES.map((subCategory) => (
                  <option key={subCategory} value={subCategory}>
                    {subCategory}
                  </option>
                ))}
              </select>
            ) : formData.category === 'Hair Care' ? (
              <select
                value={formData.sub_category}
                onChange={(e) => setFormData({...formData, sub_category: e.target.value})}
                className="w-full bg-[#FDFBFF] border border-secondary/30 rounded-xl py-2.5 px-4 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
              >
                <option value="">Select hair sub-category</option>
                {PREDEFINED_HAIR_SUBCATEGORIES.map((subCategory) => (
                  <option key={subCategory} value={subCategory}>
                    {subCategory}
                  </option>
                ))}
              </select>
            ) : formData.category === 'Body Care' ? (
              <select
                value={formData.sub_category}
                onChange={(e) => setFormData({...formData, sub_category: e.target.value})}
                className="w-full bg-[#FDFBFF] border border-secondary/30 rounded-xl py-2.5 px-4 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
              >
                <option value="">Select body sub-category</option>
                {PREDEFINED_BODY_SUBCATEGORIES.map((subCategory) => (
                  <option key={subCategory} value={subCategory}>
                    {subCategory}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Enter sub-category"
                value={formData.sub_category}
                onChange={(e) => setFormData({...formData, sub_category: e.target.value})}
                className="w-full bg-[#FDFBFF] border border-secondary/30 rounded-xl py-2.5 px-4 text-sm text-primary placeholder:text-primary/30 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
              />
            )}

          </div>
          {/* Stock Quantity removed — managed per-variant in Sizes & Variants section below */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary/80">Short Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              placeholder="Brief description appearing on the product card..."
              className="w-full bg-[#FDFBFF] border border-secondary/30 rounded-xl py-2.5 px-4 text-sm text-primary placeholder:text-primary/30 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
            />
          </div>
        </div>
      </section>

      {/* 1.5 Sizes & Variants */}
      <section className="bg-white rounded-[2rem] border border-secondary/20 p-8 shadow-sm">
        <div className="flex items-center justify-between border-b border-secondary/10 pb-4 mb-6">
          <div>
            <h3 className="font-serif text-xl text-primary">Sizes &amp; Variants</h3>
            <p className="text-[11px] text-primary/50 mt-1">e.g. 100ml, 200ml, 500ml — each with its own stock &amp; optional price</p>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-2 bg-secondary/10 text-secondary hover:bg-secondary hover:text-white px-4 py-2 rounded-xl transition-colors text-sm font-semibold"
          >
            <Plus size={16} />
            Add Size
          </button>
        </div>

        {variants.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-secondary/20 rounded-2xl">
            <p className="text-sm text-primary/40 font-medium">No variants yet.</p>
            <p className="text-[11px] text-primary/30 mt-1">Click "Add Size" to create size options like 100ml, 200ml, 500ml…</p>
            <p className="text-[11px] text-primary/30 mt-1">If no variants are added, the base Stock Quantity above is used.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {variants.map((v) => {
                const vStock = parseInt(v.stock_count) || 0;
                const isEditing = editingVariantId === v.id;
                const statusColor = vStock === 0
                  ? 'bg-red-100 text-red-600 border-red-200'
                  : vStock <= 5
                  ? 'bg-amber-100 text-amber-700 border-amber-200'
                  : 'bg-emerald-100 text-emerald-700 border-emerald-200';
                const statusLabel = vStock === 0 ? 'Out of Stock' : vStock <= 5 ? `Low (${vStock})` : `In Stock (${vStock})`;

                return (
                  <div
                    key={v.id}
                    className={`rounded-xl border transition-all duration-200 ${
                      isEditing
                        ? 'border-secondary/40 bg-secondary/5 shadow-sm'
                        : 'border-primary/10 bg-[#FDFBFF]'
                    }`}
                  >
                    {isEditing ? (
                      /* ── EDIT MODE ── */
                      <div className="p-4 space-y-3">
                        <div className="grid grid-cols-[2fr_1fr_1.5fr] gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary/50">Size / Label</label>
                            <input
                              type="text"
                              placeholder="e.g. 100ml, 200ml, 500g…"
                              value={v.size}
                              onChange={(e) => updateVariant(v.id, 'size', e.target.value)}
                              className="w-full bg-white border border-secondary/30 rounded-lg py-2 px-3 text-sm text-primary placeholder:text-primary/30 focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary/50">Stock</label>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              placeholder="0"
                              value={v.stock_count}
                              onChange={(e) => updateVariant(v.id, 'stock_count', parseInt(e.target.value) || 0)}
                              className="w-full bg-white border border-secondary/30 rounded-lg py-2 px-3 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary/50">Price Override (₹)</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 text-sm font-bold">₹</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Same as base"
                                value={v.price_override}
                                onChange={(e) => updateVariant(v.id, 'price_override', e.target.value)}
                                className="w-full bg-white border border-secondary/30 rounded-lg py-2 pl-7 pr-3 text-sm text-primary placeholder:text-primary/30 focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            onClick={() => removeVariant(v.id)}
                            className="flex items-center gap-1.5 text-[11px] text-red-400 hover:text-red-600 font-semibold transition-colors"
                          >
                            <Trash2 size={13} /> Remove
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingVariantId(null)}
                            disabled={!v.size.trim()}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-secondary text-white text-[11px] font-bold uppercase tracking-[0.1em] rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Check size={13} /> Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ── LOCKED VIEW MODE ── */
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-sm text-primary">{v.size || <span className="text-primary/30 italic">No size</span>}</span>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColor}`}>
                            {statusLabel}
                          </span>
                          {v.price_override !== '' && v.price_override != null && (
                            <span className="text-[11px] text-secondary font-bold">₹{v.price_override}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingVariantId(v.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-secondary border border-secondary/30 rounded-lg hover:bg-secondary/10 transition-colors"
                          >
                            <Pencil size={12} /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeVariant(v.id)}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

            {/* Summary */}
            <div className="pt-2 flex items-center gap-6 text-[11px] text-primary/50 font-medium border-t border-primary/5 pt-4">
              <span>{variants.filter(v => v.size.trim()).length} variant(s) configured</span>
              <span>·</span>
              <span>Total stock: <strong className="text-primary/80">{variants.reduce((sum, v) => sum + (parseInt(v.stock_count) || 0), 0)}</strong> units</span>
            </div>
          </div>
        )}
      </section>

      {/* 2. Media */}
      <section className="bg-white rounded-[2rem] border border-secondary/20 p-8 shadow-sm">
        <h3 className="font-serif text-xl text-primary mb-6 border-b border-secondary/10 pb-4">Product Images</h3>
        
        <div className="space-y-6">
          <label className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-secondary/30 rounded-2xl bg-[#FDFBFF] hover:bg-secondary/5 transition-colors cursor-pointer group">
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-primary/60 group-hover:text-primary transition-colors">
              <p className="mb-1 text-sm font-bold">Click to upload images</p>
              <p className="text-xs opacity-70">PNG, JPG, WEBP up to 5MB</p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              multiple 
              accept="image/png, image/jpeg, image/webp" 
              onChange={handleFileChange}
            />
          </label>

          {mediaItems.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {mediaItems.map((item) => (
                <div key={item.id} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-secondary/20 group bg-gray-50">
                  <img src={item.url} alt="Product media" className="w-full h-full object-cover" />
                  
                  {/* Overlay Actions */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => setAsCover(item.id)}
                      className="p-1.5 bg-white rounded-md shadow-sm text-secondary hover:bg-secondary/10 transition-colors"
                      title="Set as Cover Image"
                    >
                      <Star size={14} className={item.isCover ? "fill-secondary text-secondary" : ""} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeMedia(item.id)}
                      className="p-1.5 bg-white rounded-md shadow-sm text-rose-500 hover:bg-rose-50 transition-colors"
                      title="Remove Image"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Cover Indicator */}
                  {item.isCover && (
                    <div className="absolute bottom-0 left-0 right-0 bg-[#C5A059] text-white text-[9px] font-bold tracking-widest text-center py-1 uppercase">
                      Cover Image
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. Product Attributes */}
      <section className="bg-white rounded-[2rem] border border-secondary/20 p-8 shadow-sm">
        <h3 className="font-serif text-xl text-primary mb-6 border-b border-secondary/10 pb-4">Categorization & Attributes</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Skin / Hair Types & Concerns */}
          <div className="space-y-6">
            {formData.category === 'Skin Care' && (
              <>
                <div className="space-y-3">
                  <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary/80">Skin Types</label>
                  <div className="flex flex-wrap gap-2">
                    {PREDEFINED_SKIN_TYPES.map(type => {
                      const isSelected = formData.skin_type.includes(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            const newTypes = isSelected 
                              ? formData.skin_type.filter(t => t !== type)
                              : [...formData.skin_type, type];
                            setFormData({...formData, skin_type: newTypes});
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isSelected ? 'bg-secondary text-white shadow-md shadow-secondary/20' : 'bg-[#FDFBFF] border border-secondary/30 text-primary/60 hover:border-secondary hover:text-primary'}`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary/80">Skin Concerns</label>
                  <div className="flex flex-wrap gap-2">
                    {PREDEFINED_SKIN_CONCERNS.map(concern => {
                      const isSelected = formData.concern.includes(concern);
                      return (
                        <button
                          key={concern}
                          type="button"
                          onClick={() => {
                            const newConcerns = isSelected 
                              ? formData.concern.filter(c => c !== concern)
                              : [...formData.concern, concern];
                            setFormData({...formData, concern: newConcerns});
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isSelected ? 'bg-secondary text-white shadow-md shadow-secondary/20' : 'bg-[#FDFBFF] border border-secondary/30 text-primary/60 hover:border-secondary hover:text-primary'}`}
                        >
                          {concern}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {formData.category === 'Hair Care' && (
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary/80">Hair Concerns</label>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_HAIR_CONCERNS.map(concern => {
                    const isSelected = formData.concern.includes(concern);
                    return (
                      <button
                        key={concern}
                        type="button"
                        onClick={() => {
                          const newConcerns = isSelected 
                            ? formData.concern.filter(c => c !== concern)
                            : [...formData.concern, concern];
                          setFormData({...formData, concern: newConcerns});
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isSelected ? 'bg-secondary text-white shadow-md shadow-secondary/20' : 'bg-[#FDFBFF] border border-secondary/30 text-primary/60 hover:border-secondary hover:text-primary'}`}
                      >
                        {concern}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {formData.category === 'Body Care' && (
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary/80">Body Concerns</label>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_BODY_CONCERNS.map(concern => {
                    const isSelected = formData.concern.includes(concern);
                    return (
                      <button
                        key={concern}
                        type="button"
                        onClick={() => {
                          const newConcerns = isSelected
                            ? formData.concern.filter(c => c !== concern)
                            : [...formData.concern, concern];
                          setFormData({...formData, concern: newConcerns});
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isSelected ? 'bg-secondary text-white shadow-md shadow-secondary/20' : 'bg-[#FDFBFF] border border-secondary/30 text-primary/60 hover:border-secondary hover:text-primary'}`}
                      >
                        {concern}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary/80">Tags / Badges</label>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_TAGS.map(tag => {
                  const isStarred = formData.tags.includes(`*${tag}`);
                  const isSelected = formData.tags.includes(tag) || isStarred;
                  
                  return (
                    <div key={tag} className="flex items-stretch shadow-sm rounded-lg overflow-hidden border border-secondary/20 transition-all">
                      <button
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setFormData({...formData, tags: formData.tags.filter(t => t !== tag && t !== `*${tag}`)});
                          } else {
                            setFormData({...formData, tags: [...formData.tags, tag]});
                          }
                        }}
                        className={`px-3 py-1.5 text-xs font-medium transition-all ${isSelected ? 'bg-secondary text-white' : 'bg-[#FDFBFF] text-primary/60 hover:bg-secondary/5 hover:text-primary'}`}
                      >
                        {tag}
                      </button>
                      {isSelected && (
                        <button
                          type="button"
                          onClick={() => {
                            const newTags = formData.tags.map(t => {
                              if (t === `*${tag}`) return tag; // unstar
                              if (t.startsWith('*')) return t.substring(1); // unstar others (only 1 star allowed)
                              if (t === tag) return `*${tag}`; // star this
                              return t;
                            });
                            setFormData({...formData, tags: newTags});
                          }}
                          className={`px-2 flex items-center justify-center border-l border-white/20 transition-all ${isStarred ? 'bg-[#C5A059] text-white hover:bg-[#b08d4f]' : 'bg-secondary/90 text-white/40 hover:text-white hover:bg-secondary'}`}
                          title={isStarred ? "Remove featured badge" : "Set as featured badge"}
                        >
                          <Star size={14} className={isStarred ? "fill-white" : ""} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary/80">Suitable For</label>
              <input
                type="text"
                placeholder="e.g. All Skin Types, Men, Women, Children"
                value={formData.suitable_for}
                onChange={(e) => setFormData({...formData, suitable_for: e.target.value})}
                className="w-full bg-[#FDFBFF] border border-secondary/30 rounded-xl py-2.5 px-4 text-sm text-primary placeholder:text-primary/30 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
              />
              <p className="text-[10px] text-primary/50">Comma-separated list of target groups.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Details (Benefits, How to Use, Ingredients) */}
      <section className="bg-white rounded-[2rem] border border-secondary/20 p-8 shadow-sm">
        <h3 className="font-serif text-xl text-primary mb-6 border-b border-secondary/10 pb-4">Detailed Information</h3>
        
        <div className="space-y-8">
          
          {/* Key Benefits */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary/80">Key Benefits</label>
            <div className="space-y-2">
              {formData.key_benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-[#FDFBFF] border border-secondary/20 rounded-xl px-4 py-2 text-sm text-primary">
                  <span className="text-secondary/50 font-bold w-6">{idx + 1}.</span>
                  <span className="flex-1">{benefit}</span>
                  <button type="button" onClick={() => handleRemoveBenefit(idx)} className="text-red-500/50 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                placeholder="Add a key benefit..."
                className="flex-1 bg-[#FDFBFF] border border-secondary/30 rounded-xl py-2.5 px-4 text-sm text-primary placeholder:text-primary/30 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddBenefit(); } }}
              />
              <button
                type="button"
                onClick={handleAddBenefit}
                className="bg-secondary/10 text-secondary hover:bg-secondary hover:text-white px-4 py-2 rounded-xl transition-colors flex items-center justify-center"
              >
                Add
              </button>
            </div>
          </div>

          {/* How to Use */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary/80">How to Use</label>
            <textarea
              value={formData.how_to_use}
              onChange={(e) => setFormData({...formData, how_to_use: e.target.value})}
              rows={4}
              placeholder="1. Wet your skin with water&#10;2. Gently massage...&#10;3. Rinse thoroughly"
              className="w-full bg-[#FDFBFF] border border-secondary/30 rounded-xl py-2.5 px-4 text-sm text-primary placeholder:text-primary/30 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
            />
            <p className="text-[10px] text-primary/50">List steps separated by new lines.</p>
          </div>

          {/* Key Ingredients */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary/80">Key Ingredients</label>
            <div className="flex flex-wrap items-center gap-2 bg-[#FDFBFF] border border-secondary/30 rounded-xl p-2 focus-within:ring-2 focus-within:ring-secondary/20 focus-within:border-secondary transition-all">
              {formData.ingredients.map((ing, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-sm font-medium">
                  <span>{ing.name}</span>
                  <button type="button" onClick={() => handleRemoveIngredient(idx)} className="text-slate-400 hover:text-slate-600">
                    <X size={14} />
                  </button>
                </div>
              ))}
              <input
                type="text"
                value={newIngredient}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.includes(',')) {
                    const parts = val.split(',');
                    let currentIngredients = [...formData.ingredients];
                    for (let i = 0; i < parts.length - 1; i++) {
                      const trimmed = parts[i].trim();
                      if (trimmed) {
                        currentIngredients.push({ name: trimmed, sort_order: currentIngredients.length });
                      }
                    }
                    setFormData({ 
                      ...formData, 
                      ingredients: currentIngredients
                    });
                    setNewIngredient(parts[parts.length - 1].trimStart());
                  } else {
                    setNewIngredient(val);
                  }
                }}
                placeholder={formData.ingredients.length === 0 ? "Add a key ingredient (press comma to add)..." : ""}
                className="flex-1 bg-transparent min-w-[150px] py-1 px-2 text-sm text-primary placeholder:text-primary/30 focus:outline-none"
                onKeyDown={(e) => { 
                  if(e.key === 'Enter') { 
                    e.preventDefault(); 
                    if (newIngredient.trim()) {
                      handleAddIngredient(); 
                    }
                  } else if (e.key === 'Backspace' && newIngredient === '' && formData.ingredients.length > 0) {
                    handleRemoveIngredient(formData.ingredients.length - 1);
                  }
                }}
              />
            </div>
            <p className="text-[10px] text-primary/50">Press comma (,) or Enter to add an ingredient. Backspace to remove last.</p>
          </div>

        </div>
      </section>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 sticky bottom-4 z-50 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-secondary/20 shadow-xl">
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-primary/60 hover:text-primary transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-white rounded-xl px-8 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] hover:bg-primary/90 transition-all shadow-lg shadow-primary/10 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : (initialData ? 'Update Product' : 'Create Product')}
        </button>
      </div>
    </form>
  );
}
