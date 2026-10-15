"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import FeaturedProducts from "@/components/FeaturedProducts";
import Footer from "@/components/Footer";
import Reveal, { ImageReveal } from "@/components/Reveal";
import AISkinLab from "@/components/AISkinLab";
import AnatomyOfPurity from "@/components/AnatomyOfPurity";
import VideoSection from "@/components/VideoSection";
import HorizontalStory from "@/components/HorizontalStory";
import ThePureObsession from "@/components/ThePureObsession";
import GoldenDivider from "@/components/GoldenDivider";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";             
import InnerCircle from "@/components/InnerCircle";
import { createClient } from "@/lib/supabase/client";
import { getActivePromotionsWithTargets } from "@/services/supabase";
import { getPromotionBadge } from "@/lib/promotions";

const collections = [
  {
    name: "Hair Ritual",
    tag: "STRENGTH & SHINE",
    description: "Nourish the scalp, reduce breakage, and restore soft, glossy lengths with a ritual built for healthier-looking hair.",
    href: "/hair-care",
    imageSrc: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=900",
    thumbSrc: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800",
    imageAlt: "Camliqa Hair Ritual care"
  },
  {
    name: "Body Ritual",
    tag: "EVERYDAY LUXURY",
    description: "Transform daily care into a sensory reset with silky body formulas that hydrate, smooth, and comfort the skin.",
    href: "/products?category=Body%20Care",
    imageSrc: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=900",
    imageAlt: "Camliqa Body Ritual care"
  },
  {
    name: "Skin Ritual",
    tag: "PURIFY & RENEW",
    description: "Refine and replenish with cleansing and treatment-led skincare designed to leave the complexion calm, balanced, and radiant.",
    href: "/skin-care",
    imageSrc: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Camliqa Skin Ritual care"
  }
];

const trustBadges = [
  { label: "Organic", icon: "leaf" },
  { label: "Cruelty-Free", icon: "bunny" },
  { label: "Paraben-Free", icon: "drop" },
  { label: "Sulfate-Free", icon: "spark" }
];

const ingredients = [
  {
    name: "Hyaluronic Acid",
    benefit: "Triple-molecular weight for multi-depth hydration that plumps from within.",
    icon: "molecule"
  },
  {
    name: "Peptides",
    benefit: "Advanced signal proteins that stimulate collagen for firm, elastic skin.",
    icon: "spark"
  },
  {
    name: "Retinol",
    benefit: "Encapsulated renewal system for powerful anti-aging with zero irritation.",
    icon: "drop"
  },
  {
    name: "Niacinamide",
    benefit: "Clinical-grade B3 that refines pores and balances sebum production.",
    icon: "hex"
  },
  {
    name: "Vitamin C",
    benefit: "Stabilized antioxidant complex for a brilliant, long-lasting radiance.",
    icon: "spark"
  },
  {
    name: "Ceramides",
    benefit: "Bio-identical lipids that restore and reinforce the natural skin barrier.",
    icon: "shield"
  }
];

const testimonials = [
  {
    name: "Aanya S.",
    rating: 5,
    quote: "My skin texture looks smoother in a week. The ritual feels expensive without being harsh."
  },
  {
    name: "Ishaan V.",
    rating: 5,
    quote: "The Night Recovery serum is a game changer. I wake up with hydrated skin every single morning."
  },
  {
    name: "Rohit K.",
    rating: 5,
    quote: "Hair feels softer and looks healthier. Love the minimal, clean finish on the skin too."
  },
  {
    name: "Zara L.",
    rating: 5,
    quote: "Finally a brand that understands sensitive skin. No fragrance, just pure efficacy."
  },
  {
    name: "Meera P.",
    rating: 5,
    quote: "Gentle on sensitive skin. The glow is subtle—but real."
  },
  {
    name: "Karan M.",
    rating: 5,
    quote: "Minimalist packaging, maximal results. The Hair Care ritual has saved my dry scalp."
  },
  {
    name: "Sanya B.",
    rating: 5,
    quote: "The glow after using the Vitamin C serum is unlike anything else. Truly a luxury experience."
  },
  {
    name: "Arjun D.",
    rating: 5,
    quote: "I've tried many clinical brands, but Camliqa's balance of nature and science is unbeatable."
  }
];

const reveal = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0 }
};

function getPromotionDescription(promotion) {
  if (promotion?.description) return promotion.description;

  return "Shop your favourites before this offer ends.";
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-secondary" fill="currentColor" stroke="currentColor" strokeWidth="1.2">
      <path d="m12 3.2 2.4 5 5.5.8-4 3.9.95 5.5L12 15.8 7.15 18.4l.95-5.5-4-3.9 5.5-.8L12 3.2Z" />
    </svg>
  );
}

function IngredientIcon({ kind }) {
  const base = "h-9 w-9 text-secondary";

  if (kind === "molecule") {
    return (
      <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="6.5" cy="12" r="2" />
        <circle cx="16.8" cy="6.8" r="1.8" />
        <circle cx="17.6" cy="16.8" r="2.1" />
        <path d="M8.3 11 15.2 7.7" />
        <path d="M8.2 13 15.6 16" />
        <path d="M16.1 8.4 16.9 14.8" />
        <path d="M6.8 10.1 6.8 7.2" className="text-highlight" />
      </svg>
    );
  }

  if (kind === "spark") {
    return (
      <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M12 3l1.2 6.2L19 12l-5.8 2.8L12 21l-1.2-6.2L5 12l5.8-2.8L12 3Z" />
        <path d="M4.8 19.2 7 17m10 0 2.2 2.2M4.8 4.8 7 7m10 0 2.2-2.2" className="text-highlight" />
      </svg>
    );
  }

  if (kind === "drop") {
    return (
      <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M12 3.5c3.2 4.2 6.2 7.8 6.2 11.2A6.2 6.2 0 0 1 12 20.9a6.2 6.2 0 0 1-6.2-6.2c0-3.4 3-7 6.2-11.2Z" />
        <path d="M9.6 14.8c.3 1.7 1.6 2.9 3.4 3.2" className="text-highlight" />
      </svg>
    );
  }

  if (kind === "shield") {
    return (
      <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M12 8v8M8 12h8" className="text-highlight" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M9.2 6.4 12 4.8l2.8 1.6 2.8 4.8-2.8 4.8L12 17.6 9.2 16 6.4 11.2l2.8-4.8Z" />
      <path d="M12 4.8v12.8" className="text-highlight" />
      <path d="M6.4 11.2h11.2" className="text-highlight" />
    </svg>
  );
}

function TrustIcon({ kind }) {
  const common = "h-5 w-5 text-secondary";

  if (kind === "leaf") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M5 14.5c0-6.2 6.2-9.8 14-10-.2 8-3.8 14-10 14-2.2 0-4-1.8-4-4Z" />
        <path d="M8 16c3-2.5 6.1-4.6 10.5-6.4" />
      </svg>
    );
  }

  if (kind === "bunny") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M9 7.4c-1.1-2.3-2.9-3.6-4.3-3.6C3.7 3.8 3 4.7 3 6c0 2.6 2.3 4.9 5 6.2" />
        <path d="M15 7.4c1.1-2.3 2.9-3.6 4.3-3.6 1 0 1.7.9 1.7 2.2 0 2.6-2.3 4.9-5 6.2" />
        <path d="M7.4 14.5a4.6 4.6 0 0 0 9.2 0c0-3.2-2.1-5.8-4.6-5.8s-4.6 2.6-4.6 5.8Z" />
        <path d="M10 15.2c.5.6 1.2 1 2 1s1.5-.4 2-1" />
      </svg>
    );
  }

  if (kind === "drop") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M12 3.5c3.2 4.2 6.2 7.8 6.2 11.2A6.2 6.2 0 0 1 12 20.9a6.2 6.2 0 0 1-6.2-6.2c0-3.4 3-7 6.2-11.2Z" />
        <path d="M9.6 14.8c.3 1.7 1.6 2.9 3.4 3.2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M12 3l1.2 6.2L19 12l-5.8 2.8L12 21l-1.2-6.2L5 12l5.8-2.8L12 3Z" />
      <path d="M4.8 19.2 7 17m10 0 2.2 2.2M4.8 4.8 7 7m10 0 2.2-2.2" />
    </svg>
  );
}

import BrandMarquee from "@/components/BrandMarquee";
import CurationsSection from "@/components/CurationsSection";

export default function HomePage() {
  const [activePromotion, setActivePromotion] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadActivePromotion() {
      const supabase = createClient();
      const { data, error } = await getActivePromotionsWithTargets(supabase);

      if (!cancelled && !error) {
        setActivePromotion(data?.[0] || null);
      }
    }

    loadActivePromotion();

    return () => {
      cancelled = true;
    };
  }, []);

  const [reviewsList, setReviewsList] = useState(testimonials);

  useEffect(() => {
    async function fetchFeaturedReviews() {
      try {
        const res = await fetch("/api/reviews/featured?limit=8");
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            const mapped = json.data.map((r) => ({
              name: r.profiles?.full_name || "Anonymous",
              rating: r.rating,
              quote: r.review,
            }));
            setReviewsList(mapped);
          }
        }
      } catch (err) {
        console.error("Failed to fetch featured reviews", err);
      }
    }
    fetchFeaturedReviews();
  }, []);

  return (
    <main className="camliqa-aurora bg-base text-primary antialiased selection:bg-secondary/25 selection:text-primary">
      <Navbar />

      <section className="relative isolate flex min-h-[85vh] items-center overflow-hidden bg-white">
        {/* Desktop Background Image */}
        <div className="absolute inset-0 hidden sm:block">
          <Image
            src="/bg.png"
            fill
            className="object-cover object-center"
            alt="Camliqa Natural Beauty"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/35" />
        </div>

        <div className="section-shell relative z-10 flex flex-col items-center py-10 sm:items-start sm:py-32 lg:py-48">
          {/* Mobile-Only Centered Image Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="relative mb-12 h-[42vh] w-[90%] overflow-hidden rounded-[3rem] shadow-[0_30px_70px_-15px_rgba(26,29,54,0.3)] sm:hidden"
          >
            <Image
              src="/bg.png"
              fill
              className="object-cover object-[100%_center]"
              alt="Camliqa Natural Beauty"
              priority
            />
            {/* Soft inner glow */}
            <div className="absolute inset-0 rounded-[3rem] border border-white/20 shadow-inner" />
          </motion.div>

          {/* Text Content */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            variants={reveal}
            className="flex flex-col items-center text-center sm:max-w-2xl sm:items-start sm:text-left"
          >
            <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.45em] text-secondary sm:mb-6 sm:text-[11px]">
              Pure • Natural • Refined
            </p>
            <h1 className="font-serif text-[2.85rem] leading-[1.02] text-[#1A1D36] sm:text-[4rem] lg:text-[6rem] tracking-tight">
              Transform Your <br className="hidden sm:block" />
              <span className="italic text-[#1A1D36]">Skin &amp; Hair</span>.
            </h1>
            <p className="mt-7 max-w-[320px] text-[0.95rem] font-medium leading-relaxed text-primary/65 sm:mt-8 sm:max-w-lg sm:text-[1.1rem]">
              Experience the power of natural ingredients blended with modern care. Designed to reveal your healthiest self.
            </p>

            <div className="mt-14 flex w-full flex-col items-center gap-4 px-4 sm:mt-10 sm:w-fit sm:flex-row sm:gap-3 sm:px-0 sm:items-start">
              <a
                href="/products"
                className="group relative inline-flex w-44 items-center justify-center rounded-full bg-[#1A1D36] py-4 text-[10px] font-bold uppercase tracking-[0.22em] text-white transition-all hover:translate-y-[-2px] active:scale-95 shadow-[0_12px_35px_rgba(26,29,54,0.18)] sm:w-fit sm:px-9 sm:py-4 sm:text-[10px] sm:hover:scale-[1.03] sm:hover:translate-y-0 sm:shadow-[0_16px_45px_rgba(26,29,54,0.22)]"
              >
                BUY NOW
              </a>
              <a
                href="#ingredients"
                className="group relative inline-flex w-72 items-center justify-center rounded-full border border-[#1A1D36] bg-white py-4 text-[10px] font-bold uppercase tracking-[0.22em] text-[#1A1D36] transition-all hover:bg-[#1A1D36]/5 sm:w-fit sm:border-2 sm:bg-transparent sm:px-9 sm:py-4 sm:text-[10px] sm:hover:bg-[#1A1D36]/8 sm:hover:border-[#1A1D36]/80"
              >
                EXPLORE INGREDIENTS
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <BrandMarquee />
      <CurationsSection />

      <FeaturedProducts />


      <section id="collections" className="relative px-4 py-12 sm:px-8 sm:py-20">
        {/* ─── Unified Canvas Texture ─── */}
        <div className="luxury-overlay-texture" />
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-8">
          <div className="mb-8 flex flex-col items-center gap-4 text-center sm:mb-10 sm:gap-5">
            <Reveal>
              <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-secondary sm:text-xs">
                Expertly Formulated
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <h2 className="font-serif text-[1.8rem] leading-[1.2] text-primary sm:text-[2.4rem] sm:leading-[1.1]">
                Curated Rituals for{" "}
                <span className="italic text-secondary">Every Concern</span>
              </h2>
            </Reveal>
            <Reveal delay={0.4}>
              <p className="max-w-md text-[0.85rem] leading-relaxed text-primary/65 sm:text-[0.92rem]">
                Scientifically-backed rituals designed to harmonise with your skin&apos;s natural rhythm — morning to night.
              </p>
            </Reveal>
            <Reveal direction="up" delay={0.55}>
              <a
                href="/products"
                className="mt-1 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.24em] text-primary/55 transition hover:text-secondary sm:text-[10px]"
              >
                Explore All Collections
                <span className="text-sm">→</span>
              </a>
            </Reveal>
          </div>

          <div className="mt-8 grid gap-5 md:auto-rows-[210px] md:grid-cols-12">
            {collections.map((collection, index) => {
              const isHair = index === 0;
              const isBody = index === 1;

              return (
                <div
                  key={collection.name}
                  className={`${
                    isHair
                      ? "md:col-span-7 md:row-span-2"
                      : "md:col-span-5 md:row-span-1"
                  }`}
                >
                  <Reveal delay={index * 0.2} width="100%" height="100%">
                    <Link href={collection.href} className="block h-full">
                      <article
                        className={`group relative h-full overflow-hidden rounded-2xl border shadow-soft transition hover:-translate-y-1 hover:shadow-[0_26px_70px_-42px_rgba(26,29,54,0.48),0_0_46px_rgba(209,209,209,0.10)] ${
                          isBody
                            ? "border-secondary/35 bg-primary text-white"
                            : "border-secondary/25 bg-white"
                        }`}
                      >
                      <div
                        className={`pointer-events-none absolute inset-0 ${
                          isBody
                            ? "bg-[radial-gradient(800px_circle_at_12%_12%,rgba(197,160,89,0.18)_0%,rgba(197,160,89,0)_62%)]"
                            : "bg-[linear-gradient(135deg,rgba(197,160,89,0.05)_0%,rgba(255,255,255,0)_50%)]"
                        }`}
                      />

                      <div className="relative flex h-full flex-col items-stretch justify-between gap-5 p-6 sm:p-7 md:flex-row md:gap-6">
                        {/* Text Block */}
                        <div className="flex max-w-none flex-col justify-center md:max-w-[18rem]">
                          <p className={`text-[8px] font-bold uppercase tracking-[0.38em] sm:text-[9px] ${
                            isBody ? "text-secondary/80" : "text-secondary"
                          }`}>
                            {collection.tag}
                          </p>
                          <h3 className={`mt-2 font-serif text-[1.3rem] leading-tight sm:mt-3 sm:text-[1.75rem] ${
                            isBody ? "text-white" : "text-primary"
                          }`}>
                            {collection.name}
                          </h3>
                          <p className={`mt-2 text-[0.78rem] leading-relaxed sm:mt-3 sm:text-[0.82rem] ${
                            isBody ? "text-white/65" : "text-primary/58"
                          }`}>
                            {collection.description}
                          </p>
                          <div className={`mt-4 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.28em] transition ${
                            isBody
                              ? "text-secondary/70 hover:text-secondary"
                              : "text-primary/45 hover:text-secondary"
                          }`}>
                            <span>Shop Now</span>
                            <span>→</span>
                          </div>
                        </div>

                        {/* Image Block */}
                        <div className={`relative overflow-hidden rounded-xl ${
                          isHair
                            ? "h-[195px] w-full md:h-full md:w-[52%]"
                            : "h-[165px] w-full md:h-full md:w-[46%]"
                        }`}>
                          <div className={`relative h-full w-full overflow-hidden rounded-xl ${
                            isBody
                              ? "border border-secondary/20 bg-white/5"
                              : "border border-secondary/20 bg-white/70"
                          }`}>
                            <ImageReveal delay={index * 0.3}>
                              <Image
                                src={collection.imageSrc}
                                alt={collection.imageAlt}
                                fill
                                sizes={isHair ? "(min-width: 768px) 500px, 92vw" : "(min-width: 768px) 350px, 92vw"}
                                className={`object-cover object-center transition duration-700 ease-out group-hover:scale-[1.04] ${
                                  isBody ? "opacity-85" : "opacity-95"
                                }`}
                                priority={isHair}
                              />
                            </ImageReveal>
                            <div className={`pointer-events-none absolute inset-0 ${
                              isBody
                                ? "bg-gradient-to-l from-primary/10 via-primary/20 to-primary/55"
                                : "bg-gradient-to-l from-white/0 via-white/5 to-white/30"
                            }`} />
                          </div>

                          {isHair ? (
                            <div className="absolute right-2 top-2 w-10 sm:right-3 sm:top-3 sm:w-16">
                              <div className="aspect-square overflow-hidden rounded-xl border border-secondary/35 bg-white/85 shadow-soft">
                                <Image
                                  src={collection.thumbSrc}
                                  alt={`${collection.name} detail`}
                                  width={128}
                                  height={128}
                                  className="h-full w-full object-cover object-center"
                                />
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                      </article>
                    </Link>
                  </Reveal>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <AISkinLab />
        <AnatomyOfPurity />

        <section className="relative overflow-hidden pt-0 sm:pt-6">
        {/* Unified Background handled by LuxuryGlow + Section Specific Purple Tint */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_circle_at_85%_30%,rgba(108,63,197,0.06)_0%,transparent_60%)]" />

        <VideoSection />

        <div id="ingredients" className="relative z-10 mx-auto max-w-6xl px-4 pt-16 pb-14 sm:pb-16 lg:pb-20">
          {/* Header - Centered on Mobile */}
          <div className="mb-12 flex flex-col items-center text-center lg:hidden">
            <Reveal delay={0.1}>
              <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-secondary">Molecular Intelligence</p>
            </Reveal>
            <Reveal delay={0.2}>
              <h2 className="mt-4 font-serif text-[2.5rem] leading-[1.1] text-primary">
                <span className="italic">Ingredients</span>
              </h2>
            </Reveal>
            <Reveal delay={0.3}>
              <p className="mt-6 max-w-xs text-[0.85rem] leading-relaxed text-primary/60">
                Bioactive ingredients selected for clinical performance and biocompatibility.
              </p>
            </Reveal>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr_1fr] lg:items-center">
            {/* Left Column (Desktop Only Title + Cards) */}
            <div className="hidden flex-col gap-8 lg:flex">
              <div className="max-w-sm">
                <Reveal delay={0.2}>
                  <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-secondary">Molecular Intelligence</p>
                </Reveal>
                <Reveal delay={0.3}>
                  <h2 className="mt-4 font-serif text-4xl leading-[1.1] text-primary lg:text-5xl">
                    <span className="italic">Ingredients</span>
                  </h2>
                </Reveal>
                <Reveal delay={0.4}>
                  <p className="mt-6 text-[0.85rem] leading-relaxed text-primary/60">
                    Our formulations aren&apos;t just mixed—they are engineered. Every bioactive ingredient is selected for its clinical performance and biocompatibility.
                  </p>
                </Reveal>
              </div>

              <div className="flex flex-col gap-4">
                {ingredients.slice(0, 3).map((item, index) => (
                  <motion.article
                    key={item.name}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group relative overflow-hidden rounded-xl border border-secondary/20 bg-white/45 p-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.02)] backdrop-blur-md transition hover:border-secondary/50 hover:bg-white/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-secondary">{String(index + 1).padStart(2, "0")}.</span>
                            <h4 className="font-serif text-lg text-primary">{item.name}</h4>
                          </div>
                          <IngredientIcon kind={item.icon} />
                        </div>
                        <p className="mt-2 text-[0.78rem] leading-relaxed text-primary/55">{item.benefit}</p>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-secondary/30 transition-all duration-500 group-hover:w-full" />
                  </motion.article>
                ))}
              </div>
            </div>

            {/* Center Column: Interactive Circle Graphic (Always Visible) */}
            <div className="relative flex items-center justify-center py-6 lg:py-0">
              <div className="relative flex h-[240px] w-[240px] items-center justify-center sm:h-[280px] sm:w-[280px] lg:h-[360px] lg:w-[360px]">
                {/* Large Outer Circle */}
                <div className="absolute inset-0 rounded-full bg-white/50 shadow-[0_30px_80px_rgba(0,0,0,0.03)] backdrop-blur-md" />
                <div className="absolute inset-6 rounded-full border border-secondary/15" />
                <div className="absolute inset-12 rounded-full border border-secondary/5" />

                {/* Rotating Outer Ring */}
                <div className="absolute inset-0 rounded-full border border-dashed border-secondary/20 animate-spin-slow" />

                {/* Inner Circle Glow */}
                <div className="absolute inset-4 rounded-full bg-white/40 shadow-[0_40px_100px_rgba(0,0,0,0.04)] backdrop-blur-xl border border-white/50" />
                
                {/* Center Drop Circle */}
                <div className="group relative z-20 flex h-20 w-20 cursor-pointer items-center justify-center rounded-full bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-transform duration-500 hover:scale-110 sm:h-32 sm:w-32">
                  <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,1)_0%,rgba(248,248,248,0.5)_100%)]" />
                  <div className="relative z-30 transition-transform duration-500 group-hover:scale-110">
                    <IngredientIcon kind="drop" />
                  </div>
                  {/* Ripple Effect */}
                  <div className="absolute inset-0 rounded-full border border-secondary/20 animate-ping opacity-20" />
                </div>
              </div>
            </div>

            {/* Mobile Cards Grid (Only visible on Mobile) */}
            <div className="mt-8 grid grid-cols-2 gap-3 lg:hidden">
              {ingredients.map((item, index) => (
                <motion.article
                  key={item.name}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="group relative flex flex-col items-center rounded-2xl border border-secondary/15 bg-white/40 p-4 text-center shadow-sm backdrop-blur-md"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                    <IngredientIcon kind={item.icon} />
                  </div>
                  <h4 className="font-serif text-[0.95rem] text-primary">{item.name}</h4>
                  <p className="mt-1 text-[0.68rem] leading-tight text-primary/50">{item.benefit.split('.')[0]}</p>
                </motion.article>
              ))}
            </div>

            {/* Right Column (Desktop Only Cards) */}
            <div className="hidden flex-col gap-4 lg:flex lg:mt-32">
              {ingredients.slice(3).map((item, index) => (
                <motion.article
                  key={item.name}
                  initial={{ opacity: 0, x: 15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (index + 3) * 0.1 }}
                  className="group relative overflow-hidden rounded-xl border border-secondary/20 bg-white/45 p-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.02)] backdrop-blur-md transition hover:border-secondary/50 hover:bg-white/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-secondary">{String(index + 4).padStart(2, "0")}.</span>
                          <h4 className="font-serif text-lg text-primary">{item.name}</h4>
                        </div>
                        <IngredientIcon kind={item.icon} />
                      </div>
                      <p className="mt-2 text-[0.78rem] leading-relaxed text-primary/55">{item.benefit}</p>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-secondary/30 transition-all duration-500 group-hover:w-full" />
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="social-proof"
        className="section-shell py-12 sm:py-20 lg:py-24"
      >
        <div className="w-full flex justify-center">
          <Reveal>
            <div className="text-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.38em] text-secondary sm:text-xs">
                Social Proof & Trust
              </p>
              <h2 className="mt-3 font-serif text-3xl text-primary sm:text-4xl">Clinical trust, proven daily.</h2>
            </div>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="overflow-hidden rounded-2xl border border-secondary/55 bg-white/70 shadow-soft backdrop-blur-md">
            <div className="grid md:grid-cols-2">
              <div className="overflow-hidden border-b border-secondary/55 px-6 py-4 md:border-b-0 md:border-r md:px-8">
                <div className="relative overflow-hidden py-6 flex items-center">
                  <div className="auto-marquee flex min-w-max items-center whitespace-nowrap">
                    <div className="flex items-center gap-16 pr-16">
                      <span className="text-[11px] font-medium uppercase tracking-[0.34em] text-primary/70">
                        10,000+ Happy Customers
                      </span>
                      <span className="text-[11px] font-medium uppercase tracking-[0.34em] text-primary/70">
                        Dermatologist-inspired rituals
                      </span>
                      <span className="text-[11px] font-medium uppercase tracking-[0.34em] text-primary/70">
                        Natural ingredients, modern care
                      </span>
                    </div>
                    <div className="flex items-center gap-16 pr-16" aria-hidden="true">
                      <span className="text-[11px] font-medium uppercase tracking-[0.34em] text-primary/70">
                        10,000+ Happy Customers
                      </span>
                      <span className="text-[11px] font-medium uppercase tracking-[0.34em] text-primary/70">
                        Dermatologist-inspired rituals
                      </span>
                      <span className="text-[11px] font-medium uppercase tracking-[0.34em] text-primary/70">
                        Natural ingredients, modern care
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 md:px-8">
                <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-primary/70">Star Rating</p>
                <div className="mt-2 flex items-center gap-2">
                  <p className="font-serif text-3xl text-primary">4.8 / 5</p>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <StarIcon key={index} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-0 border-t border-secondary/45 sm:grid-cols-2 lg:grid-cols-4">
              {trustBadges.map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center justify-between border-b border-secondary/35 px-5 py-4 sm:border-r sm:last:border-r-0 lg:border-b-0"
                >
                  <span className="text-xs font-medium uppercase tracking-[0.28em] text-primary/72">
                    {badge.label}
                  </span>
                  <span className="inline-flex items-center justify-center">
                    <TrustIcon kind={badge.icon} />
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-2xl border border-secondary/55 p-7 shadow-soft backdrop-blur-md"
            style={{ background: 'linear-gradient(135deg, rgba(197,160,89,0.08) 0%, rgba(255,255,255,0.75) 40%, rgba(248,246,242,0.9) 100%)' }}
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.38em] text-secondary">Expert Note</p>
            <p className="mt-4 font-serif text-2xl leading-tight text-primary">
              “Recommended for sensitive skin types when used consistently as a simple ritual.”
            </p>
            <p className="mt-4 text-sm leading-relaxed text-primary/70">Dr. Priya Sharma, Dermatologist</p>
          </div>
        </div>

        <div className="mt-24">
          <div className="w-full flex justify-center mb-16">
            <Reveal>
              <div className="mx-auto max-w-5xl text-center">
                <p className="text-[11px] font-medium uppercase tracking-[0.38em] text-secondary sm:text-xs">THE GUIDE</p>
                <h3 className="mt-3 font-serif text-3xl text-primary sm:text-4xl">Customer Reviews</h3>
              </div>
            </Reveal>
          </div>

          <div className="relative mt-16 overflow-hidden py-10">
            {/* Gradient Overlays for smooth edges */}
            <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-base/50 to-transparent sm:w-40" />
            <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-base/50 to-transparent sm:w-40" />

            <div className="auto-marquee flex min-w-max items-center gap-16 sm:gap-24">
              {[...reviewsList, ...reviewsList].map((item, index) => (
                <article
                  key={`${item.name}-${index}`}
                  className="relative w-[300px] shrink-0 pl-10 sm:w-[400px] sm:pl-12"
                >
                  {/* Vertical Separator Line */}
                  <span className="absolute left-0 top-0 h-full w-[1px] bg-secondary/30" />
                  {/* Number Indicator (Subtle) */}
                  <span className="absolute left-2 top-0 font-serif text-4xl text-secondary/10">
                    {String((index % reviewsList.length) + 1).padStart(2, "0")}
                  </span>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-2xl text-primary">{item.name}</h4>
                      <div className="flex items-center gap-0.5 text-secondary">
                        {Array.from({ length: item.rating }).map((_, starIndex) => (
                          <StarIcon key={starIndex} />
                        ))}
                      </div>
                    </div>
                    <p className="text-[14px] leading-relaxed text-primary/70 italic">“{item.quote}”</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-[1px] w-8 bg-secondary/20" />
                      <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-secondary/40">Verified Purchase</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>


      {activePromotion ? (
        <section className="section-shell py-6 sm:py-8">
          <Reveal width="100%">
            <div className="relative overflow-hidden rounded-2xl border border-secondary/30 bg-white/55 shadow-soft backdrop-blur-md">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1100px_circle_at_18%_22%,rgba(201,168,76,0.14)_0%,rgba(201,168,76,0)_60%),radial-gradient(1100px_circle_at_82%_18%,rgba(108,63,197,0.12)_0%,rgba(108,63,197,0)_62%),linear-gradient(120deg,rgba(26,26,62,0.05)_0%,rgba(26,26,62,0)_52%,rgba(26,26,62,0.06)_100%)]" />

              <div className="relative flex flex-col items-start justify-between gap-6 px-6 py-6 md:flex-row md:items-center sm:px-8 sm:py-8">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-secondary/90">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <path d="M4.5 12.5c0-4.8 4.1-8 9.4-8.1" />
                      <path d="M5 13.5c.7 4.2 3.7 6.9 8 6.9 3.5 0 6.2-2 6.2-5.1 0-2.2-1.4-3.5-3.4-4.4" />
                    </svg>
                    <p className="text-[11px] font-medium uppercase tracking-[0.38em] text-secondary sm:text-xs">
                      {getPromotionBadge(activePromotion) || "Launch Promotion"}
                    </p>
                  </div>

                  <h3 className="mt-2 font-serif text-xl leading-tight text-primary sm:text-2xl lg:text-3xl">
                    {activePromotion.title}
                  </h3>
                  <p className="mt-1 max-w-xl text-[13px] text-primary/65">
                    {getPromotionDescription(activePromotion)}
                  </p>
                </div>

                <div className="shrink-0 w-full md:w-auto">
                  <a
                    href="/products"
                    className="group flex w-full md:inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white shadow-card transition hover:bg-primary/90"
                  >
                    Shop Now
                    <span className="text-white/80 transition group-hover:translate-x-0.5">→</span>
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      ) : null}


      <section className="section-shell py-12 sm:py-16">
        <div
          className="relative mx-auto max-w-3xl overflow-hidden rounded-[2.5rem] border border-secondary/25 px-8 py-10 text-center shadow-[0_20px_50px_-20px_rgba(197,160,89,0.1)] sm:px-12 sm:py-14 lg:px-20"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,246,242,0.7) 100%)' }}
        >
          {/* Subtle brand glow matching Featured Edit */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(197,160,89,0.06),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(197,160,89,0.04),transparent_50%)]" />

          <Reveal>
            <p className="text-[11px] font-medium uppercase tracking-[0.38em] text-secondary sm:text-xs">Our Vision</p>
            <p className="mt-8 font-serif text-[1.8rem] leading-[1.25] text-primary sm:text-[2.15rem]">
              Camliqa works every day to create <span className="italic">safe, effective solutions</span> that deliver
              visible results while staying true to <span className="italic text-secondary">natural, high-quality</span> ingredients.
            </p>

            <div className="mt-8 flex items-center justify-center gap-4 opacity-30">
              <span className="h-px w-8 bg-secondary/60" />
              <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
              <span className="h-px w-8 bg-secondary/60" />
            </div>
          </Reveal>
        </div>
      </section>


      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        variants={reveal}
        className="relative overflow-hidden py-16 sm:py-20"
      >
        {/* Unified brand ambient glow handled by global canvas */}

        <div className="section-shell relative z-10">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.38em] text-secondary sm:text-xs">
              Clinical Results
            </p>
            <h3 className="mt-5 font-serif text-[2.2rem] leading-tight text-primary sm:text-[2.8rem]">
              Proven <span className="italic text-secondary">Efficacy</span>
            </h3>

            <div className="mt-16 grid gap-12 md:grid-cols-3 lg:gap-16">
              {[
                {
                  value: "98%",
                  label: "Hydration Surge",
                  text: "Experienced an immediate surge in hydration and skin softness."
                },
                {
                  value: "94%",
                  label: "Tone Correction",
                  text: "Noticed a visible reduction in dullness and uneven tone after 14 days."
                },
                {
                  value: "100%",
                  label: "Pure Texture",
                  text: "Agreed the formulations felt weightless and deeply natural."
                }
              ].map((stat, index) => (
                <div key={stat.value} className="group relative flex flex-col items-center">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-secondary/10 bg-white/30 backdrop-blur-sm transition-colors group-hover:border-secondary/30">
                    <p className="font-serif text-[1.8rem] text-primary">
                      {stat.value}
                    </p>
                  </div>
                  <p className="text-[14px] font-bold uppercase tracking-[0.3em] text-secondary/60">{stat.label}</p>
                  <p className="mx-auto mt-4 max-w-[220px] text-[1rem] leading-relaxed text-primary/60">
                    {stat.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>


      <ThePureObsession />

      <section className="section-shell py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="text-[12px] font-medium uppercase tracking-[0.38em] text-secondary sm:text-xs">The Whispers</p>
            <h2 className="mt-10 font-serif text-[1.65rem] italic leading-[1.6] text-primary sm:text-[2rem]">
              “An absolute revelation. Camliqa isn&apos;t just skincare; it is a <span className="text-secondary/80">natural ritual</span> that redefines what it
              means to be truly luminous.”
            </h2>
            <div className="mt-10 flex flex-col items-center">
              <div className="mb-4 h-px w-8 bg-secondary/30" />
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/50">Vogue Aesthetics</p>
            </div>
          </Reveal>
        </div>
      </section>

      <InnerCircle />

      <Footer />
    </main>
  );
}
