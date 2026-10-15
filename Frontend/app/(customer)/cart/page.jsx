"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Minus, 
  Plus, 
  Trash2, 
  ExternalLink, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  ArrowRight,
  Sparkles,
  Loader2,
  Tag,
  CheckCircle,
  XCircle,
  X,
  Gift,
  ChevronDown,
  ChevronUp,
  Zap
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useCartStore } from "@/store/useCartStore";
import { createClient } from "@/lib/supabase/client";
import { getActivePromotionsWithTargets } from "@/services/supabase";
import { getStorefrontProducts } from "@/services/supabase/products";
import { calculateCartPromotionSummary } from "@/lib/promotions";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity } = useCartStore();
  const [activePromotion, setActivePromotion] = React.useState(null);
  const [mounted, setMounted] = React.useState(false);
  const [promoLoading, setPromoLoading] = React.useState(true);
  const [recommendations, setRecommendations] = React.useState([]);

  // ── Coupon state ────────────────────────────────────────
  const [couponInput, setCouponInput] = React.useState("");
  const [couponValidating, setCouponValidating] = React.useState(false);
  const [appliedCoupon, setAppliedCoupon] = React.useState(null);
  const [couponError, setCouponError] = React.useState(null);
  const [suggestedCoupons, setSuggestedCoupons] = React.useState([]);
  const [couponsLoading, setCouponsLoading] = React.useState(false);
  const [showAllCoupons, setShowAllCoupons] = React.useState(false);
  const [autoApplied, setAutoApplied] = React.useState(false);
  // ────────────────────────────────────────────────────────

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    
    let cancelled = false;
    async function loadPromotion() {
      try {
        const supabase = createClient();
        const { data, error } = await getActivePromotionsWithTargets(supabase);
        if (!cancelled && !error) {
          setActivePromotion(data?.[0] || null);
        }
      } catch (err) {
        console.error("Failed to load promotions", err);
      } finally {
        if (!cancelled) setPromoLoading(false);
      }
    }

    loadPromotion();

    return () => {
      cancelled = true;
    };
  }, [mounted]);

  // Load curated recommendations to align with Homepage
  React.useEffect(() => {
    if (!mounted) return;
    async function loadRecommendations() {
      try {
        const supabase = createClient();
        const { data, error } = await getStorefrontProducts(supabase);
        if (!error && data) {
          const cartIds = new Set(items.map(item => item.id));
          const filtered = data
            .map(p => ({
              ...p,
              name: p.title || p.name,
              image: p.image_url || p.image,
              rating: p.rating || 4.8,
              reviews: p.reviews || 124,
              description: p.description
            }))
            .filter(p => !cartIds.has(p.id))
            .slice(0, 3);
          setRecommendations(filtered);
        }
      } catch (err) {
        console.error("Failed to load recommendations", err);
      }
    }
    
    loadRecommendations();
  }, [mounted, items]);

  const promotionSummary = React.useMemo(
    () => calculateCartPromotionSummary(items, activePromotion),
    [items, activePromotion]
  );

  const shipping = 45;
  const subtotalAfterPromotion = promotionSummary.promotionTotal;

  // ── Auto-apply best coupon ──────────────────────────────
  React.useEffect(() => {
    if (!mounted || subtotalAfterPromotion <= 0 || autoApplied) return;
    let cancelled = false;
    async function loadSuggested() {
      setCouponsLoading(true);
      try {
        const res = await fetch("/api/coupons/suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subtotal: subtotalAfterPromotion, shipping }),
        });
        const json = await res.json();
        if (cancelled || !res.ok) return;
        const { best, all } = json.data || {};
        setSuggestedCoupons((all || []).filter(c => c.code !== best?.code));
        if (best && !appliedCoupon) {
          setAppliedCoupon(best);
          setAutoApplied(true);
        }
      } catch (err) {
        console.error("[cart/suggest coupons]", err);
      } finally {
        if (!cancelled) setCouponsLoading(false);
      }
    }
    loadSuggested();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, subtotalAfterPromotion]);

  const handleApplyCoupon = React.useCallback(async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) { setCouponError("Please enter a coupon code."); return; }
    setCouponValidating(true);
    setCouponError(null);
    setAppliedCoupon(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal: subtotalAfterPromotion, shipping }),
      });
      const json = await res.json();
      if (!res.ok || json.error) { setCouponError(json.error || "Invalid coupon code."); return; }
      setAppliedCoupon(json.data);
      setAutoApplied(false);
      setCouponInput("");
    } catch { setCouponError("Failed to validate coupon."); }
    finally { setCouponValidating(false); }
  }, [couponInput, subtotalAfterPromotion, shipping]);
  // ────────────────────────────────────────────────────────

  if (!mounted) {
    return (
      <main className="camliqa-aurora min-h-screen text-primary antialiased flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
        <Footer />
      </main>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 70, 
        damping: 15 
      } 
    }
  };

  return (
    <main className="camliqa-aurora min-h-screen text-[#1A1A3E] antialiased selection:bg-[#C9A84C]/25 flex flex-col justify-between overflow-hidden">
      <div>
        <Navbar />

        {/* Hero Section */}
        <section className="relative py-16 md:py-24 text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#1A1A3E]/5 via-transparent to-transparent" />
          <div className="section-shell relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-4"
            >
              <span className="customer-section-label">Your Selection</span>
              <h1 className="customer-section-title text-4xl md:text-5xl lg:text-6xl mt-2">
                Your Luxury Ritual
              </h1>
              <div className="w-16 h-[1.5px] bg-[#C9A84C] mx-auto mt-6" />
              <p className="text-xs md:text-sm text-[#1A1A3E]/60 max-w-md mx-auto font-medium tracking-wide uppercase mt-4">
                Natural formulas blended for clinical brilliance.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Breadcrumbs */}
        <div className="section-shell py-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A3E]/40">
            <Link href="/" className="hover:text-[#C9A84C] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-[#C9A84C] transition-colors">Products</Link>
            <span>/</span>
            <span className="text-[#C9A84C]">Cart Selection</span>
          </div>
        </div>

        {/* Main Content */}
        <section className="section-shell pb-24">
          {items.length === 0 ? (
            /* Elite Empty Cart State */
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="luxury-card flex flex-col items-center justify-center text-center py-24 px-6 border border-white/50 bg-white/40 backdrop-blur-md rounded-[2.5rem] shadow-[0_30px_80px_-20px_rgba(26,26,62,0.06)] max-w-2xl mx-auto relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-[#C9A84C]/5 to-transparent pointer-events-none" />
              
              <div className="w-24 h-24 rounded-full bg-white/80 border border-white flex items-center justify-center mb-8 shadow-md text-[#C9A84C] relative group hover:rotate-6 transition-transform duration-500">
                <ShoppingBag className="w-10 h-10 stroke-[1.2]" />
                <div className="absolute -inset-2 rounded-full border border-[#C9A84C]/20 animate-ping opacity-25" />
              </div>
              <h2 className="font-serif text-3xl text-[#1A1A3E] mb-4">Your Cart is Empty</h2>
              <p className="text-sm text-[#1A1A3E]/60 max-w-sm mx-auto mb-10 font-medium leading-relaxed">
                Indulge in our exquisite collections of all-natural products. Refresh your skincare routine today.
              </p>
              <Link
                href="/products"
                className="customer-primary-button"
              >
                Continue Shopping
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </motion.div>
          ) : (
            /* Active Cart State */
            <div className="grid gap-12 lg:grid-cols-12 items-start">
              {/* Cart Items List */}
              <div className="lg:col-span-8 space-y-8">
                <div className="flex items-center justify-between border-b border-[#1A1A3E]/10 pb-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1A1A3E]/40">
                    Product Details
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1A1A3E]/40 hidden md:block">
                    Total Value
                  </span>
                </div>

                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="space-y-6"
                >
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div 
                        key={item.cartId}
                        variants={itemVariants}
                        exit={{ opacity: 0, x: -60 }}
                        className="luxury-card flex flex-col md:flex-row gap-6 border border-white/50 bg-white/40 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:bg-white/60 hover:shadow-[0_30px_70px_-25px_rgba(26,26,62,0.08)] transition-all duration-500 relative group overflow-hidden"
                      >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />

                        {/* Image Wrapper */}
                        <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-white border border-[#1A1A3E]/5 relative shadow-sm group-hover:scale-[1.04] transition-transform duration-500 mx-auto md:mx-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        {/* Item Details */}
                        <div className="flex flex-1 flex-col justify-between">
                          <div className="space-y-1">
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <h3 className="font-serif text-xl text-[#1A1A3E] group-hover:text-[#C9A84C] transition-colors duration-300">
                                  {item.name}
                                </h3>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                                  <p className="text-[10px] text-[#1A1A3E]/50 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                    Size: <span className="text-[#C9A84C] font-black">{item.size || "Standard"}</span>
                                  </p>
                                  {item.category && (
                                    <p className="text-[10px] text-[#1A1A3E]/50 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                      Collection: <span className="text-[#C9A84C] font-black">{item.category}</span>
                                    </p>
                                  )}
                                </div>

                                {/* Curated Short Product Description inside Cart */}
                                {item.description && (
                                  <p className="text-xs text-[#1A1A3E]/60 mt-3 font-medium line-clamp-2 leading-relaxed max-w-xl">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => removeFromCart(item.cartId)}
                                className="text-[#1A1A3E]/40 hover:text-red-500 hover:bg-red-50/50 transition-all p-2 rounded-full"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-5 h-5 stroke-[1.5]" />
                              </button>
                            </div>
                            
                            <Link 
                              href={`/products/${item.id}`} 
                              className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#C9A84C] hover:text-[#1A1A3E] transition-colors mt-3"
                            >
                              View Product <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>

                          {/* Controls Row */}
                          <div className="flex items-center justify-between mt-6 pt-5 border-t border-[#1A1A3E]/5">
                            <div className="flex flex-col items-start gap-1">
                              <div className="flex items-center rounded-xl border border-white bg-white/80 shadow-inner px-2 py-0.5">
                                <button
                                  onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                                  className="p-1.5 text-[#1A1A3E]/60 hover:text-[#C9A84C] transition-colors"
                                  disabled={item.quantity <= 1}
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="w-8 text-center text-sm font-bold text-[#1A1A3E]">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => {
                                    if (item.stock != null && item.quantity >= item.stock) return;
                                    updateQuantity(item.cartId, item.quantity + 1);
                                  }}
                                  disabled={item.stock != null && item.quantity >= item.stock}
                                  className={`p-1.5 transition-colors ${
                                    item.stock != null && item.quantity >= item.stock
                                      ? "text-[#1A1A3E]/20 cursor-not-allowed"
                                      : "text-[#1A1A3E]/60 hover:text-[#C9A84C]"
                                  }`}
                                  title={item.stock != null && item.quantity >= item.stock ? "Maximum stock reached" : ""}
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              {item.stock != null && item.quantity >= item.stock && (
                                <span className="text-[9px] text-amber-600 font-bold px-2 mt-1">
                                  Maximum stock reached
                                </span>
                              )}
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] text-[#1A1A3E]/40 block md:hidden uppercase font-bold tracking-wider mb-1">
                                Total
                              </span>
                              <span className="font-serif text-xl text-[#1A1A3E] font-bold">
                                {formatCurrency(item.price * item.quantity)}
                              </span>
                              <span className="text-[10px] text-[#1A1A3E]/40 block mt-0.5 font-bold tracking-wide">
                                ({formatCurrency(item.price)} each)
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Order Summary Sticky Card */}
              <div className="lg:col-span-4 lg:sticky lg:top-28">
                <div className="luxury-card p-8 rounded-[2.5rem] border border-white/60 bg-white/50 backdrop-blur-lg shadow-[0_40px_100px_-30px_rgba(26,26,62,0.12)] space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#C9A84C]/10 to-transparent rounded-full blur-2xl pointer-events-none" />
                  
                  <h2 className="font-serif text-2xl text-[#1A1A3E] border-b border-[#1A1A3E]/10 pb-4">
                    Order Summary
                  </h2>

                  {/* Calculations */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-[#1A1A3E]/60">Subtotal</span>
                      <span className="text-[#1A1A3E] font-bold">{formatCurrency(promotionSummary.subtotal)}</span>
                    </div>

                    {promotionSummary.promotionDiscount > 0 && (
                      <div className="space-y-3">
                        <div className="rounded-2xl border border-[#C9A84C]/20 bg-[#C9A84C]/5 px-4 py-3 flex items-center justify-between gap-4">
                          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#C9A84C] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#C9A84C]" />
                            {promotionSummary.badge}
                          </span>
                          <span className="font-black text-green-600 text-sm">
                            -{formatCurrency(promotionSummary.promotionDiscount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-medium">
                          <span className="text-[#1A1A3E]/60">After Promotion</span>
                          <span className="text-[#1A1A3E] font-bold">{formatCurrency(promotionSummary.promotionTotal)}</span>
                        </div>
                      </div>
                    )}

                    {/* Coupon discount row */}
                    {appliedCoupon && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-green-800 font-black text-[10px] uppercase tracking-wider flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          Coupon ({appliedCoupon.code})
                        </span>
                        <span className="text-green-600 font-bold">
                          -{formatCurrency(appliedCoupon.dealType === "free_shipping" ? shipping : (appliedCoupon.savings || 0))}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-[#1A1A3E]/60">Shipping</span>
                      {appliedCoupon?.dealType === "free_shipping" ? (
                        <span className="text-emerald-600 font-bold uppercase tracking-[0.15em] text-[10px] bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">Free</span>
                      ) : (
                        <span className="text-emerald-600 font-bold uppercase tracking-[0.15em] text-[10px] bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">Complementary</span>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-[#1A1A3E]/60">Estimated Taxes</span>
                      <span className="text-[#1A1A3E]/40 text-xs italic">Calculated at checkout</span>
                    </div>

                    <div className="border-t border-[#1A1A3E]/10 pt-5 flex justify-between items-end">
                      <div>
                        <span className="text-xs font-bold text-[#1A1A3E] uppercase tracking-wider block">Total Order</span>
                        <span className="text-[10px] text-[#1A1A3E]/40 block mt-0.5">VAT / Duties included</span>
                      </div>
                      <span className="font-serif text-3xl text-[#1A1A3E] font-black leading-none tracking-tight">
                        {formatCurrency(promotionSummary.promotionDiscount > 0 ? promotionSummary.promotionTotal : promotionSummary.subtotal)}
                      </span>
                    </div>
                  </div>

                  {/* ── Coupon Section ───────────────────── */}
                  <div className="border-t border-[#1A1A3E]/10 pt-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1A1A3E]/50 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#C9A84C]" /> Coupon
                      </label>
                      {couponsLoading && (
                        <span className="flex items-center gap-1 text-[9px] text-[#1A1A3E]/40 font-bold">
                          <Loader2 className="w-3 h-3 animate-spin" /> Finding best deal…
                        </span>
                      )}
                    </div>

                    {autoApplied && appliedCoupon && (
                      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 rounded-xl border border-[#C9A84C]/30 bg-[#C9A84C]/8 px-3 py-2">
                        <Zap className="w-3.5 h-3.5 text-[#C9A84C] shrink-0" />
                        <p className="text-[9px] font-black uppercase tracking-wider text-[#C9A84C]">
                          Best deal auto-applied — saving {formatCurrency(appliedCoupon.savings || 0)}!
                        </p>
                      </motion.div>
                    )}

                    {appliedCoupon ? (
                      <div className="flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                          <div>
                            <p className="text-xs font-black uppercase tracking-wider text-green-800">{appliedCoupon.code}</p>
                            <p className="text-[10px] text-green-600">
                              {appliedCoupon.dealType === "free_shipping" ? "Free shipping" : `Save ${formatCurrency(appliedCoupon.savings || 0)}`}
                            </p>
                          </div>
                        </div>
                        <button type="button" onClick={() => { setAppliedCoupon(null); setAutoApplied(false); setCouponError(null); }}
                          className="rounded-full p-1.5 text-green-600 hover:bg-green-100 transition">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input type="text" value={couponInput}
                          onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(null); }}
                          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleApplyCoupon())}
                          placeholder="Enter coupon code"
                          className="flex-1 rounded-xl bg-white/40 border border-[#1A1A3E]/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-[#1A1A3E] placeholder:normal-case placeholder:tracking-normal focus:border-[#C9A84C] focus:bg-white/85 transition-all outline-none" />
                        <button type="button" onClick={handleApplyCoupon} disabled={couponValidating || !couponInput.trim()}
                          className="rounded-xl bg-[#1A1A3E] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#1A1A3E]/80 disabled:opacity-40">
                          {couponValidating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply"}
                        </button>
                      </div>
                    )}

                    {couponError && (
                      <p className="flex items-center gap-1.5 text-[10px] font-bold text-red-600">
                        <XCircle className="w-3.5 h-3.5" /> {couponError}
                      </p>
                    )}

                    {suggestedCoupons.length > 0 && (
                      <div className="space-y-2">
                        <button type="button" onClick={() => setShowAllCoupons(p => !p)}
                          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#C9A84C] hover:text-[#1A1A3E] transition-colors">
                          <Gift className="w-3.5 h-3.5" />
                          {showAllCoupons ? "Hide" : `${suggestedCoupons.length} more`} offers
                          {showAllCoupons ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                        <AnimatePresence>
                          {showAllCoupons && (
                            <motion.div key="cart-coupons" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-2">
                              {suggestedCoupons.map(c => (
                                <button key={c.code} type="button"
                                  onClick={() => { setAppliedCoupon(c); setAutoApplied(false); setCouponError(null); setCouponInput(""); }}
                                  className="w-full text-left rounded-2xl border border-dashed border-[#C9A84C]/40 bg-[#C9A84C]/5 px-4 py-3 hover:bg-[#C9A84C]/10 transition-all">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-widest text-[#1A1A3E] flex items-center gap-1.5">
                                      <Tag className="w-3 h-3 text-[#C9A84C]" />{c.code}
                                    </span>
                                    <span className="text-[10px] font-black text-green-600">Save {formatCurrency(c.savings)}</span>
                                  </div>
                                  <p className="text-[10px] text-[#1A1A3E]/50 mt-1 pl-4">
                                    {c.dealType === "free_shipping" ? "Free shipping" : c.dealType === "fixed_amount" ? `Flat ₹${c.discountAmount} off` : `${c.discountPercent}% off`}
                                    {c.minimumOrderAmount > 0 && ` · Min. ${formatCurrency(c.minimumOrderAmount)}`}
                                  </p>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  {/* Checkout CTA */}
                  <div className="pt-4">
                    <Link
                      href="/checkout"
                      className="customer-primary-button w-full relative z-10 flex items-center justify-center gap-2"
                    >
                      Secure Checkout
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* Luxury Trust Indicators */}
                  <div className="border-t border-[#1A1A3E]/5 pt-6 space-y-4">
                    <div className="flex items-center gap-4 text-xs text-[#1A1A3E]/70 font-medium">
                      <ShieldCheck className="w-5 h-5 text-[#C9A84C] shrink-0" />
                      <span>SSL Encrypted Payment System</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#1A1A3E]/70 font-medium">
                      <Truck className="w-5 h-5 text-[#C9A84C] shrink-0" />
                      <span>Premium tracked express delivery</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#1A1A3E]/70 font-medium">
                      <RotateCcw className="w-5 h-5 text-[#C9A84C] shrink-0" />
                      <span>Indulgent 30-day effortless returns</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Curved Recommended Products to align perfectly with Homepage Curations */}
        {recommendations.length > 0 && items.length > 0 && (
          <section className="section-shell pb-32 border-t border-[#1A1A3E]/10 pt-20">
            <div className="mb-12 text-center space-y-3">
              <span className="customer-section-label">Complete Your Ritual</span>
              <h2 className="customer-section-title text-3xl md:text-4xl">Recommended formulations</h2>
              <div className="w-12 h-[1px] bg-[#C9A84C] mx-auto mt-4" />
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {recommendations.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </main>
  );
}
