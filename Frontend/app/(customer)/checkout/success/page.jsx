"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { CheckCircle2, Sparkles, ShoppingBag, ArrowRight, Heart } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const clearCart = useCartStore((state) => state.clearCart);
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    // Clear cart after successful checkout
    clearCart();

    // Visual countdown
    const interval = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    // Redirect to profile/orders page after a short delay
    const timer = setTimeout(() => {
      router.push("/profile");
    }, 8000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [clearCart, router]);

  // Dynamic particle variants
  const sparkVariants = {
    animate: (i) => ({
      y: [0, -30, -50],
      x: [0, (i % 2 === 0 ? 30 : -30), (i % 2 === 0 ? 45 : -45)],
      opacity: [0, 1, 0],
      scale: [0.5, 1, 0.5],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        delay: i * 0.4,
        ease: "easeOut"
      }
    })
  };

  return (
    <main className="camliqa-aurora min-h-screen text-[#1A1A3E] antialiased selection:bg-[#C9A84C]/25 flex flex-col justify-between overflow-hidden">
      <div>
        <Navbar />

        <div className="section-shell py-24 flex items-center justify-center px-4 relative">
          {/* Shimmer background particle swirls */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#C9A84C]/10 via-[#6C3FC5]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="luxury-card p-10 sm:p-14 rounded-[3rem] border border-white/60 bg-white/50 backdrop-blur-lg shadow-[0_45px_100px_-30px_rgba(26,26,62,0.12)] text-center max-w-xl w-full relative overflow-hidden"
          >
            {/* Absolute sparkling stars around the card */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={sparkVariants}
                  animate="animate"
                  className="absolute text-[#C9A84C]"
                  style={{
                    top: "45%",
                    left: "50%",
                  }}
                >
                  <Sparkles className="w-4 h-4 fill-current opacity-80" />
                </motion.div>
              ))}
            </div>

            {/* Glowing checkmark badge with halo */}
            <div className="relative mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="relative w-24 h-24 rounded-full bg-white border border-[#C9A84C]/20 flex items-center justify-center mx-auto shadow-md text-[#C9A84C] relative z-10"
              >
                <CheckCircle2 className="w-12 h-12 stroke-[1.2]" />
                {/* Dynamic radar echo */}
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.5, 0.2] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute -inset-3 rounded-full border border-[#C9A84C]/20 pointer-events-none"
                />
              </motion.div>
            </div>

            {/* Joyful clinical luxury header */}
            <div className="space-y-3">
              <span className="customer-section-label">Order Confirmed</span>
              <h1 className="customer-section-title text-3xl sm:text-4xl leading-tight">
                Your Organic Ritual <br />
                <span className="italic text-[#C9A84C]">Begins Now</span>
              </h1>
              <div className="w-12 h-[1px] bg-[#C9A84C] mx-auto mt-4" />
            </div>

            <p className="mt-6 text-sm text-[#1A1A3E]/60 font-medium leading-relaxed max-w-sm mx-auto">
              Thank you for choosing Camliqa. We have received your order and our skincare laboratory is currently preparing your clinical formulations.
            </p>

            {/* Visual Redirection countdown bar */}
            <div className="mt-8 pt-4 pb-2 max-w-xs mx-auto">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-[#1A1A3E]/40 mb-2">
                <span>Directing to Dashboard</span>
                <span>0:0{countdown}</span>
              </div>
              <div className="w-full h-[3px] bg-[#1A1A3E]/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 8, ease: "linear" }}
                  className="h-full bg-[#C9A84C]"
                />
              </div>
            </div>

            {/* Direct routing button triggers */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Link 
                href="/profile" 
                className="customer-primary-button w-full sm:w-auto text-xs py-3.5 px-8 font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                View My Orders
              </Link>
              <Link 
                href="/" 
                className="customer-secondary-button w-full sm:w-auto text-xs py-3.5 px-8 font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4 text-[#C9A84C]" />
                Camliqa Home
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
