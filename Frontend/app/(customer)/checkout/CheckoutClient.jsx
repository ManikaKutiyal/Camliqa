"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { formatCurrency } from "@/lib/utils";
import { calculateCartPromotionSummary } from "@/lib/promotions";
import { createClient } from "@/lib/supabase/client";
import { getActivePromotionsWithTargets } from "@/services/supabase";
import { useAuth } from "@/components/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Tag, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  X, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  CreditCard,
  Truck,
  Sparkles,
  Gift,
  ChevronDown,
  ChevronUp,
  Zap
} from "lucide-react";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutClient() {
  const router = useRouter();
  const { user } = useAuth();
  const { items } = useCartStore();
  const [activePromotion, setActivePromotion] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Coupon state ─────────────────────────────────────────
  const [couponInput, setCouponInput] = useState("");
  const [couponValidating, setCouponValidating] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null); 
  const [couponError, setCouponError] = useState(null);
  const [suggestedCoupons, setSuggestedCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [showAllCoupons, setShowAllCoupons] = useState(false);
  const [autoApplied, setAutoApplied] = useState(false);
  // ─────────────────────────────────────────────────────────

  const [address, setAddress] = useState({
    fullName: user?.user_metadata?.full_name || "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  useEffect(() => {
    let cancelled = false;
    async function loadPromotion() {
      const supabase = createClient();
      const { data, error } = await getActivePromotionsWithTargets(supabase);
      if (!cancelled && !error) {
        setActivePromotion(data?.[0] || null);
      }
    }
    loadPromotion();
    return () => { cancelled = true; };
  }, []);

  const promotionSummary = useMemo(
    () => calculateCartPromotionSummary(items, activePromotion),
    [items, activePromotion]
  );

  // ── Totals ────────────────────────────────────────────────
  const shipping = 45; 
  const subtotalAfterPromotion = promotionSummary.promotionTotal;

  // ── Load & auto-apply best coupon ────────────────────────
  useEffect(() => {
    if (subtotalAfterPromotion <= 0 || autoApplied) return;
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
        const others = (all || []).filter(c => c.code !== best?.code);
        setSuggestedCoupons(others);
        // Auto-apply best coupon
        if (best && !appliedCoupon) {
          setAppliedCoupon(best);
          setAutoApplied(true);
        }
      } catch (err) {
        console.error("[suggest coupons]", err);
      } finally {
        if (!cancelled) setCouponsLoading(false);
      }
    }
    loadSuggested();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotalAfterPromotion]);
  // ─────────────────────────────────────────────────────────

  const couponDiscount = appliedCoupon
    ? appliedCoupon.dealType === "free_shipping"
      ? shipping
      : Number(appliedCoupon.savings || 0)
    : 0;

  const effectiveShipping = appliedCoupon?.dealType === "free_shipping" ? 0 : shipping;
  const taxableAmount = Math.max(0, subtotalAfterPromotion - (appliedCoupon?.dealType !== "free_shipping" ? couponDiscount : 0));
  const tax = Number((taxableAmount * 0.15).toFixed(2));
  const total = Number((taxableAmount + tax + effectiveShipping).toFixed(2));
  // ─────────────────────────────────────────────────────────

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  // ── Coupon handlers ───────────────────────────────────────
  const handleApplyCoupon = useCallback(async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    setCouponValidating(true);
    setCouponError(null);
    setAppliedCoupon(null);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          subtotal: subtotalAfterPromotion,
          shipping,
        }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        setCouponError(json.error || "Invalid coupon code.");
        return;
      }

      setAppliedCoupon(json.data);
      setCouponInput("");
    } catch {
      setCouponError("Failed to validate coupon. Please try again.");
    } finally {
      setCouponValidating(false);
    }
  }, [couponInput, subtotalAfterPromotion, shipping]);

  const handleRemoveCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponError(null);
    setCouponInput("");
  }, []);
  // ─────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payloadItems = items.map(item => ({
        productId: item.id,
        variantId: item.variantId || null,
        size: item.size || null,
        color: item.color || null,
        quantity: item.quantity,
      }));

      const response = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: address,
          items: payloadItems,
          shippingMethod: "standard",
          couponCode: appliedCoupon?.code || "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      const { paymentSession } = data.data;

      if (paymentSession.mode === "mock") {
        console.warn("Razorpay is in MOCK mode. Order created. Redirecting to success.");
        router.push("/checkout/success");
        return;
      }

      if (paymentSession.mode === "unavailable") {
        throw new Error(paymentSession.message || "Payment gateway unavailable.");
      }

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Razorpay SDK failed to load. Are you online?");
      }

      const options = {
        key: paymentSession.keyId,
        amount: paymentSession.amount,
        currency: paymentSession.currency,
        name: paymentSession.name,
        description: paymentSession.description,
        order_id: paymentSession.orderId,
        prefill: paymentSession.prefill,
        notes: paymentSession.notes,
        theme: { color: "#1A1D36" },
        handler: function () {
          router.push("/checkout/success");
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        setError(response.error.description || "Payment failed. Please try again.");
        setLoading(false);
      });

      rzp.open();

    } catch (err) {
      console.error("Checkout error:", err);
      setError(err.message || "Something went wrong during checkout.");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="luxury-card flex flex-col items-center justify-center text-center py-24 px-6 border border-white/50 bg-white/40 backdrop-blur-md rounded-[2.5rem] shadow-[0_30px_80px_-20px_rgba(26,26,62,0.06)] max-w-2xl mx-auto relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#C9A84C]/5 to-transparent pointer-events-none" />
        
        <div className="w-24 h-24 rounded-full bg-white/80 border border-white flex items-center justify-center mb-8 shadow-md text-[#C9A84C] relative">
          <ShoppingBag className="w-10 h-10 stroke-[1.2]" />
        </div>
        <h2 className="font-serif text-3xl text-[#1A1A3E] mb-4">Your Cart is Empty</h2>
        <p className="text-sm text-[#1A1A3E]/60 max-w-sm mx-auto mb-8 font-medium">
          Add some clinical luxury products to your bag to proceed.
        </p>
        <button
          onClick={() => router.push("/products")}
          className="customer-primary-button"
        >
          Continue Shopping
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start relative z-10">
      {/* ── Checkout Form ─────────────────────────────────── */}
      <div className="lg:col-span-7 xl:col-span-8">
        <form 
          onSubmit={handleSubmit} 
          className="luxury-card bg-white/50 border border-white/60 p-8 sm:p-12 rounded-[2.5rem] shadow-[0_30px_80px_-20px_rgba(26,26,62,0.08)] backdrop-blur-md space-y-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-[#C9A84C]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <h2 className="font-serif text-2xl text-[#1A1A3E] border-b border-[#1A1A3E]/10 pb-4 flex items-center gap-3">
            Shipping Address
          </h2>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold uppercase tracking-wider text-red-600 flex items-center gap-2"
            >
              <XCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="col-span-2">
              <label className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1A1A3E]/50 block mb-2">
                Full Name
              </label>
              <input
                required 
                type="text" 
                name="fullName" 
                value={address.fullName} 
                onChange={handleInputChange}
                placeholder="Aanya Sharma"
                className="block w-full bg-white/40 border border-[#1A1A3E]/10 rounded-xl px-4 py-3.5 focus:border-[#C9A84C] focus:bg-white/80 text-sm font-medium text-[#1A1A3E] transition-all duration-300 outline-none placeholder:text-[#1A1A3E]/30"
              />
            </div>

            <div className="col-span-2">
              <label className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1A1A3E]/50 block mb-2">
                Phone Number
              </label>
              <input
                required 
                type="tel" 
                name="phone" 
                value={address.phone} 
                onChange={handleInputChange}
                placeholder="+91 98765 43210"
                className="block w-full bg-white/40 border border-[#1A1A3E]/10 rounded-xl px-4 py-3.5 focus:border-[#C9A84C] focus:bg-white/80 text-sm font-medium text-[#1A1A3E] transition-all duration-300 outline-none placeholder:text-[#1A1A3E]/30"
              />
            </div>

            <div className="col-span-2">
              <label className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1A1A3E]/50 block mb-2">
                Address Line 1
              </label>
              <input
                required 
                type="text" 
                name="addressLine1" 
                value={address.addressLine1} 
                onChange={handleInputChange}
                placeholder="Apartment, building, suite number"
                className="block w-full bg-white/40 border border-[#1A1A3E]/10 rounded-xl px-4 py-3.5 focus:border-[#C9A84C] focus:bg-white/80 text-sm font-medium text-[#1A1A3E] transition-all duration-300 outline-none placeholder:text-[#1A1A3E]/30"
              />
            </div>

            <div className="col-span-2">
              <label className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1A1A3E]/50 block mb-2">
                Address Line 2 (Optional)
              </label>
              <input
                type="text" 
                name="addressLine2" 
                value={address.addressLine2} 
                onChange={handleInputChange}
                placeholder="Street address, landmark"
                className="block w-full bg-white/40 border border-[#1A1A3E]/10 rounded-xl px-4 py-3.5 focus:border-[#C9A84C] focus:bg-white/80 text-sm font-medium text-[#1A1A3E] transition-all duration-300 outline-none placeholder:text-[#1A1A3E]/30"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1A1A3E]/50 block mb-2">
                City
              </label>
              <input
                required 
                type="text" 
                name="city" 
                value={address.city} 
                onChange={handleInputChange}
                placeholder="Mumbai"
                className="block w-full bg-white/40 border border-[#1A1A3E]/10 rounded-xl px-4 py-3.5 focus:border-[#C9A84C] focus:bg-white/80 text-sm font-medium text-[#1A1A3E] transition-all duration-300 outline-none placeholder:text-[#1A1A3E]/30"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1A1A3E]/50 block mb-2">
                State
              </label>
              <input
                required 
                type="text" 
                name="state" 
                value={address.state} 
                onChange={handleInputChange}
                placeholder="Maharashtra"
                className="block w-full bg-white/40 border border-[#1A1A3E]/10 rounded-xl px-4 py-3.5 focus:border-[#C9A84C] focus:bg-white/80 text-sm font-medium text-[#1A1A3E] transition-all duration-300 outline-none placeholder:text-[#1A1A3E]/30"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1A1A3E]/50 block mb-2">
                Postal Code
              </label>
              <input
                required 
                type="text" 
                name="postalCode" 
                value={address.postalCode} 
                onChange={handleInputChange}
                placeholder="400001"
                className="block w-full bg-white/40 border border-[#1A1A3E]/10 rounded-xl px-4 py-3.5 focus:border-[#C9A84C] focus:bg-white/80 text-sm font-medium text-[#1A1A3E] transition-all duration-300 outline-none placeholder:text-[#1A1A3E]/30"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1A1A3E]/50 block mb-2">
                Country
              </label>
              <input
                required 
                type="text" 
                name="country" 
                value={address.country} 
                readOnly
                className="block w-full bg-black/5 border border-[#1A1A3E]/5 rounded-xl px-4 py-3.5 text-sm font-bold text-[#1A1A3E]/60 outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-[#1A1A3E]/5">
            <button
              type="submit"
              disabled={loading}
              className="customer-primary-button w-full relative z-10 py-4.5 rounded-full text-sm font-black uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>Processing Checkout...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4.5 h-4.5" />
                  <span>Place Order & Pay Securely</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Order Summary ──────────────────────────────────── */}
      <div className="lg:col-span-5 xl:col-span-4">
        <div className="sticky top-28 luxury-card p-8 rounded-[2.5rem] border border-white/60 bg-white/50 backdrop-blur-lg shadow-[0_40px_100px_-30px_rgba(26,26,62,0.12)] space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#C9A84C]/10 to-transparent rounded-full blur-2xl pointer-events-none" />
          
          <h2 className="font-serif text-2xl text-[#1A1A3E] border-b border-[#1A1A3E]/10 pb-4">
            Order Summary
          </h2>

          {/* Items list inside scrollable view */}
          <div className="max-h-64 overflow-y-auto pr-2 space-y-4 ai-scrollbar">
            {items.map(item => (
              <div key={item.cartId} className="flex gap-4 items-center">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="h-16 w-16 rounded-xl object-cover border border-[#1A1A3E]/5 bg-white shadow-sm" 
                />
                <div className="flex-1">
                  <h4 className="text-xs font-serif text-[#1A1A3E] line-clamp-2 leading-snug">{item.name}</h4>
                  <div className="flex items-center gap-2 mt-1 text-[9px] text-[#1A1A3E]/50 font-bold uppercase tracking-wider">
                    <span>Qty: {item.quantity}</span>
                    <span>•</span>
                    <span>{item.size || "Standard"}</span>
                  </div>
                </div>
                <div className="text-xs font-bold text-[#1A1A3E]">
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* ── Coupon Section ─────────────────────────── */}
          <div className="border-t border-[#1A1A3E]/10 pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1A1A3E]/50 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#C9A84C]" />
                Coupon Code
              </label>
              {couponsLoading && (
                <span className="flex items-center gap-1 text-[9px] text-[#1A1A3E]/40 font-bold uppercase tracking-wider">
                  <Loader2 className="w-3 h-3 animate-spin" /> Finding best deal…
                </span>
              )}
            </div>

            {/* Auto-applied banner */}
            {autoApplied && appliedCoupon && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 rounded-xl border border-[#C9A84C]/30 bg-[#C9A84C]/8 px-3 py-2"
              >
                <Zap className="w-3.5 h-3.5 text-[#C9A84C] shrink-0" />
                <p className="text-[9px] font-black uppercase tracking-wider text-[#C9A84C]">
                  Best coupon auto-applied — saving you {formatCurrency(appliedCoupon.savings || 0)}!
                </p>
              </motion.div>
            )}

            {appliedCoupon ? (
              /* Applied coupon pill */
              <div className="flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 px-4 py-3 shadow-inner">
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-green-800">{appliedCoupon.code}</p>
                    <p className="text-[10px] font-medium text-green-600 mt-0.5">
                      {appliedCoupon.dealType === "free_shipping"
                        ? "Free shipping applied"
                        : `Saving ${formatCurrency(appliedCoupon.savings || 0)} on your order`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="rounded-full p-1.5 text-green-600 transition hover:bg-green-100 hover:text-green-800"
                  title="Remove coupon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Coupon entry row */
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value.toUpperCase());
                    setCouponError(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApplyCoupon())}
                  placeholder="Enter code e.g. SAVE15"
                  className="flex-1 rounded-xl bg-white/40 border border-[#1A1A3E]/10 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-[#1A1A3E] placeholder:normal-case placeholder:tracking-normal focus:border-[#C9A84C] focus:bg-white/85 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={couponValidating || !couponInput.trim()}
                  className="flex items-center gap-1.5 rounded-xl bg-[#1A1A3E] px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#1A1A3E]/80 disabled:opacity-40"
                >
                  {couponValidating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply"}
                </button>
              </div>
            )}

            {/* Coupon error */}
            {couponError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red-600"
              >
                <XCircle className="w-3.5 h-3.5" />
                {couponError}
              </motion.div>
            )}

            {/* Other available coupons */}
            {suggestedCoupons.length > 0 && (
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAllCoupons(p => !p)}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#C9A84C] hover:text-[#1A1A3E] transition-colors"
                >
                  <Gift className="w-3.5 h-3.5" />
                  {showAllCoupons ? "Hide" : `View ${suggestedCoupons.length} more`} available offers
                  {showAllCoupons ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                <AnimatePresence>
                  {showAllCoupons && (
                    <motion.div
                      key="coupon-list"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden space-y-2"
                    >
                      {suggestedCoupons.map((c) => (
                        <motion.button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setAppliedCoupon(c);
                            setAutoApplied(false);
                            setCouponError(null);
                            setCouponInput("");
                          }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className="w-full text-left rounded-2xl border border-dashed border-[#C9A84C]/40 bg-[#C9A84C]/5 px-4 py-3 hover:bg-[#C9A84C]/10 hover:border-[#C9A84C]/60 transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Tag className="w-3.5 h-3.5 text-[#C9A84C] shrink-0" />
                              <span className="text-xs font-black uppercase tracking-widest text-[#1A1A3E]">{c.code}</span>
                            </div>
                            <span className="text-[10px] font-black text-green-600">
                              Save {formatCurrency(c.savings)}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#1A1A3E]/50 font-medium mt-1 pl-5">
                            {c.dealType === "free_shipping"
                              ? "Free shipping on this order"
                              : c.dealType === "fixed_amount"
                              ? `Flat ₹${c.discountAmount} off`
                              : `${c.discountPercent}% off${
                                  c.maxDiscountAmount > 0
                                    ? ` (up to ${formatCurrency(c.maxDiscountAmount)})`
                                    : ""
                                }`}
                            {c.minimumOrderAmount > 0 && ` · Min. order ${formatCurrency(c.minimumOrderAmount)}`}
                          </p>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
          {/* ─────────────────────────────────────────────── */}

          {/* Price breakdown */}
          <div className="space-y-4 border-t border-[#1A1A3E]/10 pt-6">
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-[#1A1A3E]/60">Subtotal</span>
              <span className="text-[#1A1A3E] font-bold">{formatCurrency(promotionSummary.subtotal)}</span>
            </div>

            {promotionSummary.promotionDiscount > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#C9A84C] font-black text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#C9A84C]" />
                  Promotion ({promotionSummary.badge})
                </span>
                <span className="text-green-600 font-bold">-{formatCurrency(promotionSummary.promotionDiscount)}</span>
              </div>
            )}

            {appliedCoupon && couponDiscount > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-green-800 font-black text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  Coupon ({appliedCoupon.code})
                </span>
                <span className="text-green-600 font-bold">
                  -{formatCurrency(appliedCoupon.dealType === "free_shipping" ? shipping : couponDiscount)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-[#1A1A3E]/60">Shipping</span>
              <span className="text-[#1A1A3E] font-bold">
                {effectiveShipping === 0 ? (
                  <span className="text-emerald-600 font-bold uppercase tracking-[0.15em] text-[10px] bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">Complementary</span>
                ) : (
                  formatCurrency(effectiveShipping)
                )}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-[#1A1A3E]/60">Estimated Tax (15%)</span>
              <span className="text-[#1A1A3E] font-bold">{formatCurrency(tax)}</span>
            </div>

            <div className="border-t border-[#1A1A3E]/10 pt-4 flex justify-between items-end">
              <div>
                <span className="text-xs font-bold text-[#1A1A3E] uppercase tracking-wider block">Total order</span>
                <span className="text-[10px] text-[#1A1A3E]/40 block mt-0.5">Secure Razorpay gateway</span>
              </div>
              <span className="font-serif text-3xl text-[#1A1A3E] font-black leading-none tracking-tight">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
