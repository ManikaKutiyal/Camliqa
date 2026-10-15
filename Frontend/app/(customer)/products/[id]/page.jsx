"use client";

import React, { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Star,
  Heart,
  Share2,
  ShoppingCart,
  Check,
  ChevronLeft,
  Droplets,
  Leaf,
  Loader2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { createClient } from "@/lib/supabase/client";
import { getStorefrontProductById, getProductIngredients, getStorefrontProducts } from "@/services/supabase/products";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/components/AuthContext";
import { getProductReviews } from "@/services/supabase/reviews";

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 }
};

export default function ProductDetailPage({ params }) {
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  const [quantity, setQuantity] = useState(1);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const { user, isAuthenticated } = useAuth();
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState("");
  const [newReview, setNewReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      try {
        const supabase = createClient();
        const { data: prodData, error } = await getStorefrontProductById(supabase, params.id);
        
        if (error || !prodData) {
          setIsNotFound(true);
          return;
        }

        const { data: revData } = await getProductReviews(supabase, params.id);
        const approvedReviews = revData || [];
        setReviewsList(approvedReviews);
        setReviewsLoading(false);

        const { data: ingredientsData } = await getProductIngredients(supabase, params.id);

        let normalizedCategory = prodData.category;
        if (normalizedCategory) {
          if (normalizedCategory.toLowerCase().replace(/\s+/g, '') === 'skincare') {
            normalizedCategory = 'Skin Care';
          } else if (normalizedCategory.toLowerCase().replace(/\s+/g, '') === 'haircare') {
            normalizedCategory = 'Hair Care';
          }
        }

        const mappedProduct = {
          ...prodData,
          category: normalizedCategory,
          name: prodData.title || prodData.name,
          image: prodData.image_url || prodData.image,
          rating: approvedReviews.length > 0
            ? parseFloat((approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length).toFixed(1))
            : (prodData.rating || 4.8),
          reviews: approvedReviews.length > 0 ? approvedReviews.length : 124,
          longDescription: prodData.description || "",
          price: prodData.price || 0,
          stock: typeof prodData.stock === 'number' ? prodData.stock : 0,
          features: Array.isArray(prodData.tags) ? prodData.tags : [],
          ingredients: (ingredientsData || []).map(i => i.name),
          suitableFor: typeof prodData.suitable_for === 'string' 
            ? prodData.suitable_for.split(',').map(s => s.trim()).filter(Boolean) 
            : (Array.isArray(prodData.suitable_for) ? prodData.suitable_for : []),
          benefits: Array.isArray(prodData.key_benefits) ? prodData.key_benefits : [],
          howToUse: typeof prodData.how_to_use === 'string'
            ? prodData.how_to_use.split('\n').map(s => s.trim()).filter(Boolean)
            : (Array.isArray(prodData.how_to_use) ? prodData.how_to_use : []),
          badge: prodData.featured ? 'Featured' : null,
          gallery: (prodData.product_images || []).sort((a, b) => a.sort_order - b.sort_order).map(img => img.url),
          variants: (prodData.product_variants || []).filter(v => v.active !== false && v.size && v.size.trim()),
        };
        
        setProduct(mappedProduct);

        // Fetch related
        const { data: related } = await getStorefrontProducts(supabase);
        if (related) {
           const mappedRelated = related.map(p => {
             let relNormalizedCategory = p.category;
             if (relNormalizedCategory) {
               if (relNormalizedCategory.toLowerCase().replace(/\s+/g, '') === 'skincare') {
                 relNormalizedCategory = 'Skin Care';
               } else if (relNormalizedCategory.toLowerCase().replace(/\s+/g, '') === 'haircare') {
                 relNormalizedCategory = 'Hair Care';
               }
             }
             return {
               ...p,
               name: p.title || p.name,
               image: p.image_url || p.image,
               rating: p.rating || 4.8,
               reviews: 124,
               category: relNormalizedCategory,
               description: p.description
             };
           }).filter(p => p.category === normalizedCategory && p.id !== prodData.id).slice(0, 3);
           setRelatedProducts(mappedRelated);
        }

      } catch (err) {
        setIsNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    
    if (params.id) {
      loadProduct();
    }
  }, [params.id]);

  // ── Variant-derived state (must be before early returns, uses optional chaining) ──
  const activeVariants = (product?.variants || []).filter(v => v.size);
  const hasVariants = activeVariants.length > 0;

  // Auto-select the first variant whenever the product finishes loading
  React.useEffect(() => {
    if (hasVariants && !selectedVariant) {
      setSelectedVariant(activeVariants[0]);
    }
  }, [hasVariants]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeVariant = hasVariants ? (selectedVariant || activeVariants[0]) : null;
  const activePrice = activeVariant?.price_override ?? product?.price ?? 0;
  const stockQty = activeVariant
    ? (typeof activeVariant.stock_count === 'number' ? activeVariant.stock_count : 0)
    : (typeof product?.stock === 'number' ? product.stock : 0);
  const isOutOfStock = stockQty === 0;
  const isLowStock = stockQty > 0 && stockQty <= 5;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(
      { ...product, selectedVariant: activeVariant, price: activePrice },
      quantity
    );
    setIsAddedToCart(true);
    setTimeout(() => setIsAddedToCart(false), 2000);
  };

  if (isNotFound) {
    notFound();
  }

  if (loading || !product) {
    return (
      <main className="camliqa-aurora min-h-screen bg-base text-primary antialiased flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
        <Footer />
      </main>
    );
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    setSubmitting(true);
    setSubmitError("");
    setSubmitMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('product_reviews')
        .insert({
          product_id: product.id,
          user_id: user.id,
          rating: newRating,
          title: newTitle,
          review: newReview,
          status: 'pending',
          is_featured: false
        });

      if (error) throw error;

      setSubmitMessage("Thank you! Your review has been submitted for admin approval.");
      setNewTitle("");
      setNewReview("");
      setNewRating(5);
      setShowReviewForm(false);
    } catch (err) {
      console.error("Failed to submit review", err);
      setSubmitError(err.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };




  const isFavorite = product ? isInWishlist(product.id) : false;

  return (
    <main className="camliqa-aurora min-h-screen bg-base text-primary antialiased selection:bg-secondary/25 selection:text-primary">
      <Navbar />

      {/* Breadcrumb - Refined */}
      <div className="section-shell">
        <Link
          href="/products"
          className="inline-flex items-center gap-3 py-8 text-[15px] font-bold tracking-widest text-primary/40 hover:text-secondary transition-all group"
        >
          <div className="w-8 h-[1px] bg-primary/10 group-hover:bg-secondary transition-all" />
          Back to collection
        </Link>
      </div>

      {/* Product Detail Section - Compacted */}
      <section className="section-shell py-8 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Asymmetrical Image Gallery */}
          {(() => {
            const allImages = Array.from(new Set([product.image, ...(product.gallery || [])].filter(Boolean)));
            const displayImages = allImages.length > 0 ? allImages : ["https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=800"];
            
            return (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col sm:flex-row-reverse gap-4 sm:gap-6"
              >
                <div className="relative w-full sm:flex-1 aspect-square sm:aspect-[4/5] overflow-hidden bg-white shadow-[0_30px_70px_-20px_rgba(26,26,62,0.12)] border border-primary/5">
                  <Image
                    src={displayImages[activeImageIndex] || displayImages[0]}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    priority
                  />
                  {product.badge && (
                    <div className="absolute top-4 left-4 sm:top-8 sm:left-8 bg-secondary px-4 py-1.5 shadow-xl">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                        {product.badge}
                      </p>
                    </div>
                  )}
                </div>

                {/* Thumbnail Strip: Horizontal on mobile, Vertical on desktop */}
                {displayImages.length > 1 && (
                  <div className="flex flex-row sm:flex-col gap-3 sm:gap-4 w-full sm:w-20 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 scrollbar-hide">
                    {displayImages.map((imgUrl, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImageIndex(i)}
                        className={`shrink-0 w-20 sm:w-20 aspect-square overflow-hidden border transition-all duration-500 ${
                          i === activeImageIndex
                            ? "border-[#C5A059] opacity-100"
                            : "border-primary/5 opacity-40 hover:opacity-100"
                        }`}
                      >
                        <Image
                          src={imgUrl}
                          alt={`${product.name} view ${i + 1}`}
                          width={80}
                          height={80}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })()}

          {/* Refined Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col pr-0 lg:pr-12"
          >
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-[1px] bg-secondary" />
                <span className="text-[12px] font-black uppercase tracking-widest text-secondary">
                  {product.category} ritual
                </span>
              </div>
              
              <h1 className="font-serif text-[2.8rem] leading-[1.1] text-primary tracking-tight">
                {product.name}
              </h1>

              {/* Refined Rating */}
              <div className="mt-6 flex items-center gap-6">
                <div className="flex items-center gap-1.5">
                  {[...Array(5)].map((_, i) => (
                     <Star
                       key={i}
                       className={`h-3 w-3 ${
                         i < Math.floor(product.rating)
                           ? "fill-[#C5A059] text-[#C5A059]"
                           : "text-primary/10"
                       }`}
                       strokeWidth={2}
                     />
                  ))}
                </div>
                <span className="text-xs font-bold text-primary/40">
                  {product.rating} / 5.0 rating from {product.reviews} reviews
                </span>
              </div>

              {/* Sentence Case Description */}
              <p className="mt-6 text-[1.05rem] leading-relaxed text-primary/70 font-medium whitespace-pre-line">
                {product.longDescription}
              </p>

              {/* Size / Variant Selector */}
              {hasVariants && (
                <div className="mt-8 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Select Size</span>
                    {activeVariant && (
                      <span className="text-[11px] font-semibold text-primary/60">
                        — {activeVariant.size}
                        {activeVariant.price_override != null && activeVariant.price_override !== activePrice
                          ? '' : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {activeVariants.map((v) => {
                      const vStock = typeof v.stock_count === 'number' ? v.stock_count : 0;
                      const isSelected = activeVariant?.id === v.id || activeVariant?.size === v.size;
                      const isVOut = vStock === 0;
                      return (
                        <button
                          key={v.id || v.size}
                          type="button"
                          disabled={isVOut}
                          onClick={() => {
                            setSelectedVariant(v);
                            setQuantity(1);
                          }}
                          className={`relative px-3.5 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition-all border ${ 
                            isVOut
                              ? 'border-primary/10 text-primary/25 bg-primary/5 cursor-not-allowed line-through'
                              : isSelected
                              ? 'border-secondary bg-secondary text-white shadow-md shadow-secondary/20'
                              : 'border-primary/20 text-primary/60 bg-white hover:border-secondary hover:text-secondary'
                          }`}
                        >
                          {v.size}
                          {isVOut && (
                            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[7px] font-bold px-1 py-0.5 rounded-full leading-none">
                              Out
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Price & Refined Actions */}
            <div className="mt-8 pt-8 border-t border-primary/5 space-y-6">

              {/* Stock Status Badge */}
              <div>
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em]">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em]">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Only {stockQty} left!
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    In Stock
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-primary/40 mb-1">Price value</span>
                  <span className="font-serif text-[2rem] text-primary">{formatCurrency(activePrice * (isOutOfStock ? 1 : quantity))}</span>
                </div>
                
                {/* Quantity Control — hidden when out of stock */}
                {!isOutOfStock && (
                  <div className="flex items-center bg-[#F8F8FB] px-2 py-1 h-12">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-full flex items-center justify-center text-primary/40 hover:text-primary transition-all text-lg"
                    >
                      −
                    </button>
                    <span className="w-10 text-center font-bold text-[13px]">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(stockQty, quantity + 1))}
                      className="w-8 h-full flex items-center justify-center text-primary/40 hover:text-primary transition-all text-lg"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  onClick={handleAddToCart}
                  whileHover={isOutOfStock ? {} : { y: -2 }}
                  whileTap={isOutOfStock ? {} : { scale: 0.98 }}
                  disabled={isOutOfStock}
                  className={`flex-1 h-12 text-[11px] font-black uppercase tracking-[0.15em] transition-all ${
                    isOutOfStock
                      ? 'bg-primary/10 text-primary/30 cursor-not-allowed'
                      : isAddedToCart
                      ? 'bg-green-600 text-white'
                      : 'bg-[#1C1E3A] text-white hover:bg-secondary'
                  }`}
                >
                  {isOutOfStock ? 'Out of Stock' : isAddedToCart ? 'Added to cart' : 'Add to cart'}
                </motion.button>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`aspect-square h-12 flex items-center justify-center border transition-all ${isFavorite ? "bg-red-50 border-red-200 text-red-500" : "border-primary/10 text-primary/30 hover:border-primary/30"}`}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} strokeWidth={1.5} />
                  </button>
                  <button className="aspect-square h-12 flex items-center justify-center border border-primary/10 text-primary/30 hover:border-primary/30 transition-all">
                    <Share2 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Elite Features Grid */}
              {product.features.length > 0 && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-4 pt-4 pb-4 border-b border-primary/5">
                  {product.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-[5px] h-[5px] rounded-full bg-[#C5A059]" />
                      <span className="text-[11px] font-black text-primary/60">
                        {feature.startsWith('*') ? feature.substring(1) : feature}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Technical Specifications - Moved Near Description */}
              <div className="pt-6 space-y-10">
                 {product.ingredients.length > 0 && (
                   <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-[#C5A059] flex items-center gap-3">
                        <div className="w-8 h-[1px] bg-[#C5A059]" />
                        Key ingredients
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {product.ingredients.map((ing, idx) => (
                          <span key={idx} className="px-3.5 py-2 bg-white border border-primary/10 text-[11px] font-black text-primary/50 shadow-sm">
                            {ing}
                          </span>
                        ))}
                      </div>
                   </div>
                 )}

                 {product.suitableFor.length > 0 && (
                   <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-[#C5A059] flex items-center gap-3">
                        <div className="w-8 h-[1px] bg-[#C5A059]" />
                        Suitable for
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {product.suitableFor.map((type, idx) => (
                          <span key={idx} className="px-4 py-2 bg-[#1C1E3A] text-white text-[10px] font-black uppercase tracking-[0.1em]">
                            {type}
                          </span>
                        ))}
                      </div>
                   </div>
                 )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits and Ritual */}
      {(product.benefits.length > 0 || product.howToUse.length > 0) && (
        <section className="section-shell py-16 border-t border-primary/5">
          <div className="grid gap-16 lg:grid-cols-2">
            {/* Proven Benefits (Left) */}
            {product.benefits.length > 0 && (
              <div className="space-y-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-[#C5A059] flex items-center gap-3">
                  <div className="w-8 h-[1px] bg-[#C5A059]" />
                  Key benefits
                </h3>
                <div className="grid gap-8">
                  {product.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex gap-6 items-start">
                      <span className="text-[11px] font-black text-[#C5A059]/60 mt-1.5 w-6">0{idx + 1}</span>
                      <p className="text-[13px] leading-relaxed text-primary/60 font-medium">
                        {benefit}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ritual Steps (Right) */}
            {product.howToUse.length > 0 && (
              <div className="space-y-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-[#C5A059] flex items-center gap-3">
                  <div className="w-8 h-[1px] bg-[#C5A059]" />
                  How to use
                </h3>
                <div className="grid gap-8">
                  {product.howToUse.map((step, idx) => (
                    <div key={idx} className="flex gap-6 items-start">
                      <span className="text-[11px] font-black text-[#C5A059]/60 mt-1.5 w-6">0{idx + 1}</span>
                      <p className="text-[13px] leading-relaxed text-primary/60 font-medium">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Customer Reviews Section */}
      <section className="section-shell py-16 border-t border-primary/5">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-primary/5 pb-8">
            <div>
              <h2 className="font-serif text-[2.2rem] leading-tight sm:text-[2.6rem]">
                Customer Reviews
              </h2>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4.5 w-4.5 ${
                        i < Math.floor(product.rating)
                          ? "fill-[#C5A059] text-[#C5A059]"
                          : "text-primary/10"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-primary/70">
                  {product.rating} out of 5 stars (based on {reviewsList.length} review{reviewsList.length === 1 ? "" : "s"})
                </span>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => {
                  if (isAuthenticated) {
                    setShowReviewForm(!showReviewForm);
                    setSubmitError("");
                    setSubmitMessage("");
                  } else {
                    window.location.href = `/login?redirect=/products/${product.id}`;
                  }
                }}
                className="bg-[#1C1E3A] hover:bg-[#C5A059] px-6 py-3.5 text-[11px] font-black uppercase tracking-[0.15em] text-white transition-all shadow-md"
              >
                {showReviewForm ? "Close Form" : "Write a Review"}
              </button>
            </div>
          </div>

          {/* Submission Success Alert */}
          {submitMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-xl text-sm font-medium animate-fadeIn">
              {submitMessage}
            </div>
          )}

          {/* Submission Error Alert */}
          {submitError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 px-6 py-4 rounded-xl text-sm font-medium animate-fadeIn">
              {submitError}
            </div>
          )}

          {/* Review Form */}
          {showReviewForm && isAuthenticated && (
            <motion.form
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleReviewSubmit}
              className="bg-[#F8F8FB] border-t-2 border-[#C5A059] p-8 space-y-6 shadow-sm"
            >
              <h3 className="font-serif text-xl text-primary">Share your feedback</h3>

              {/* Star Rating Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-primary/40 block">
                  Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setNewRating(starVal)}
                      className="text-[#C5A059] hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          starVal <= newRating
                            ? "fill-[#C5A059]"
                            : "text-[#C5A059]/20"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-2">
                <label htmlFor="review-title" className="text-[10px] font-black uppercase tracking-[0.15em] text-primary/40 block">
                  Review Title
                </label>
                <input
                  id="review-title"
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Summarize your experience..."
                  className="w-full bg-white border border-primary/10 px-4 py-3 text-sm text-primary placeholder:text-primary/30 outline-none focus:border-[#C5A059] transition-all shadow-sm"
                />
              </div>

              {/* Comments Textarea */}
              <div className="space-y-2">
                <label htmlFor="review-body" className="text-[10px] font-black uppercase tracking-[0.15em] text-primary/40 block">
                  Review Content
                </label>
                <textarea
                  id="review-body"
                  required
                  rows={4}
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  placeholder="How did this product perform? Share details about texture, scent, and results..."
                  className="w-full bg-white border border-primary/10 px-4 py-3 text-sm text-primary placeholder:text-primary/30 outline-none focus:border-[#C5A059] transition-all shadow-sm resize-none"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#1C1E3A] hover:bg-[#C5A059] disabled:bg-slate-400 px-6 py-3 text-[11px] font-black uppercase tracking-[0.15em] text-white transition-all shadow-md"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="border border-primary/10 hover:border-primary/30 px-6 py-3 text-[11px] font-black uppercase tracking-[0.15em] text-primary/60 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}

          {/* Reviews List */}
          <div className="space-y-8">
            {reviewsLoading ? (
              <p className="text-center text-primary/40 text-sm py-8">Loading reviews...</p>
            ) : reviewsList.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-primary/10 rounded-2xl bg-slate-50/50">
                <p className="text-primary/40 text-sm font-medium">Be the first to review this product</p>
                <p className="text-[11px] text-primary/30 mt-1">Share your experience with others.</p>
              </div>
            ) : (
              <div className="divide-y divide-primary/5">
                {reviewsList.map((rev) => (
                  <div key={rev.id} className="py-8 first:pt-0 last:pb-0 space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1C1E3A] text-xs font-black text-white">
                          {(rev.profiles?.full_name || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-primary">{rev.profiles?.full_name || "Verified Buyer"}</p>
                          <p className="text-[10px] text-primary/40">
                            {new Date(rev.created_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < rev.rating
                                ? "fill-[#C5A059] text-[#C5A059]"
                                : "text-primary/10"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 pl-12">
                      <h4 className="text-sm font-bold text-primary">{rev.title}</h4>
                      <p className="text-xs leading-relaxed text-primary/70 font-medium whitespace-pre-wrap">
                        {rev.review}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="section-shell py-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-10">
              <h2 className="font-serif text-[2.2rem] leading-tight sm:text-[2.6rem]">
                More from {product.category}
              </h2>
              <p className="mt-3 text-[1.02rem] leading-relaxed text-primary/60 max-w-2xl">
                Explore our other popular products in this category
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((relatedProduct, idx) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                >
                  <ProductCard product={relatedProduct} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      <Footer />
    </main>
  );
}
