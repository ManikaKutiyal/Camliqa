"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sliders,
  Search,
  ChevronDown,
  Grid3x3,
  List,
  Filter,
  X,
  Sparkles,
  Leaf,
  Droplets,
  Zap,
  Loader2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import GoldenDivider from "@/components/GoldenDivider";
import { getStorefrontProducts } from "@/services/supabase/products";
import { getActivePromotionsWithTargets } from "@/services/supabase";
import { createClient } from "@/lib/supabase/client";
import { getPromotionBadge, isProductEligibleForPromotion } from "@/lib/promotions";

const palette = {
  primary: "#1A1A3E",
  secondary: "#C5A059",
  accentSoft: "rgba(232,226,248,0.92)",
  background: "#F9F7FD"
};

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 }
};

const SKIN_CONCERNS = [
  { value: "Acne", label: "Acne" },
  { value: "Dullness", label: "Dullness" },
  { value: "Skin Dryness", label: "Dryness" },
  { value: "Skin Sensitivity", label: "Sensitivity" },
  { value: "Anti-Aging", label: "Anti-Aging" },
  { value: "Pores", label: "Pores" },
  { value: "Brightening", label: "Brightening" },
  { value: "Oil Control", label: "Oil Control" },
  { value: "Skin Hydration", label: "Hydration" },
];
const HAIR_CONCERNS = [
  { value: "Hair Fall", label: "Hair Fall" },
  { value: "Dandruff", label: "Dandruff" },
  { value: "Frizz", label: "Frizz" },
  { value: "Damage Repair", label: "Damage Repair" },
  { value: "Scalp Health", label: "Scalp Health" },
  { value: "Growth", label: "Growth" },
];
const BODY_CONCERNS = [
  { value: "Body Dryness", label: "Dryness" },
  { value: "Roughness", label: "Roughness" },
  { value: "Body Sensitivity", label: "Sensitivity" },
  { value: "Body Hydration", label: "Hydration" },
  { value: "Firming", label: "Firming" },
  { value: "Exfoliation", label: "Exfoliation" },
  { value: "Relaxation", label: "Relaxation" },
];

function normalizeCategoryValue(category) {
  const normalized = String(category || "").trim().toLowerCase().replace(/\s+/g, "");
  if (normalized === "hair" || normalized === "haircare") return "Hair Care";
  if (normalized === "skin" || normalized === "skincare") return "Skin Care";
  if (["body", "bodycare", "bodyandbath", "bodybath", "bodyhands"].includes(normalized.replace(/&/g, ""))) {
    return "Body Care";
  }
  return category;
}

function normalizeConcernForCategory(concern, category) {
  if (category === "Skin Care" && concern === "Dryness") return "Skin Dryness";
  if (category === "Skin Care" && concern === "Sensitivity") return "Skin Sensitivity";
  if (category === "Skin Care" && concern === "Hydration") return "Skin Hydration";
  if (category === "Body Care" && concern === "Dryness") return "Body Dryness";
  if (category === "Body Care" && concern === "Sensitivity") return "Body Sensitivity";
  if (category === "Body Care" && concern === "Hydration") return "Body Hydration";
  return concern;
}

function normalizeConcernsForCategory(concerns = [], category) {
  return concerns.map((concern) => normalizeConcernForCategory(concern, category));
}

function getConcernDisplayLabel(concern, category) {
  if (category === "All") {
    if (concern.value === "Skin Dryness") return "Skin Dryness";
    if (concern.value === "Skin Sensitivity") return "Skin Sensitivity";
    if (concern.value === "Skin Hydration") return "Skin Hydration";
    if (concern.value === "Body Dryness") return "Body Dryness";
    if (concern.value === "Body Sensitivity") return "Body Sensitivity";
    if (concern.value === "Body Hydration") return "Body Hydration";
  }
  return concern.label;
}

function SparklingGlow({ color = "#6b42aa", count = 15 }) {
  const sparks = Array.from({ length: count });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {sparks.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          initial={{
            x: Math.random() * 100 + "%",
            y: Math.random() * 100 + "%",
            opacity: 0,
            scale: 0
          }}
          animate={{
            y: [null, "-15%", "15%"],
            opacity: [0, 0.6, 0],
            scale: [0, 1.2, 0.6]
          }}
          transition={{
            duration: 4 + Math.random() * 8,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut"
          }}
          style={{
            backgroundColor: color,
            filter: "blur(0.5px)",
            boxShadow: `0 0 8px 2px ${color}4d`
          }}
        />
      ))}
    </div>
  );
}

function PageAtmosphere() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Base Purple Gradient - Toned Down */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FAF9FF] via-[#F6F2FF] to-[#FBFAFF]" />

      {/* Floating Gold Spots - More Prominent */}
      <motion.div
        animate={{
          x: [0, 80, 0],
          y: [0, 40, 0],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[5%] left-[10%] w-[500px] h-[500px] bg-[#C5A059]/20 blur-[130px] rounded-full"
      />
      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, 80, 0],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[35%] right-[5%] w-[600px] h-[600px] bg-[#C5A059]/15 blur-[160px] rounded-full"
      />
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[20%] left-[20%] w-[400px] h-[400px] bg-[#C5A059]/20 blur-[110px] rounded-full"
      />
      <motion.div
        animate={{
          x: [0, 60, 0],
          y: [0, -120, 0],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[5%] right-[10%] w-[500px] h-[500px] bg-[#C5A059]/15 blur-[140px] rounded-full"
      />

      {/* Very Subtle Purple Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#6b42aa]/2 blur-[150px] rounded-full opacity-30" />
    </div>
  );
}

function CustomDropdown({ label, value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative group min-w-[120px]">
      <span className="absolute -top-3.5 left-0 text-[8px] font-black uppercase tracking-[0.25em] text-[#C5A059]/80">
        {label}
      </span>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full border-b border-[#1A1A3E]/10 py-2 text-[11px] font-bold uppercase tracking-widest text-[#1A1A3E] hover:border-[#C5A059]/40 transition-colors"
      >
        <span className="truncate">{value}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDown className="h-3 w-3 opacity-40 ml-2" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 z-[100] mt-2 w-[200px] bg-white/95 backdrop-blur-xl border border-[#C5A059]/10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-xl overflow-hidden py-2"
          >
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${value === opt
                    ? "bg-[#C5A059]/10 text-[#C5A059]"
                    : "text-[#1A1A3E]/60 hover:bg-[#FAF9FF] hover:text-[#1A1A3E]"
                  }`}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ShopPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [activePromotion, setActivePromotion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSkinTypes, setSelectedSkinTypes] = useState([]);
  const [selectedConcerns, setSelectedConcerns] = useState([]);
  const [sortBy, setSortBy] = useState("featured");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState(2000);
  const [priceRange, setPriceRange] = useState([0, 2000]);

  // Pre-populate filters from URL params (e.g. from collection pages)
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    let nextCategory = "All";
    if (categoryParam) {
      nextCategory = normalizeCategoryValue(categoryParam.trim());
      setSelectedCategory(nextCategory);
    }

    const concernParam = searchParams.get("concern");
    if (concernParam) {
      const parsed = concernParam
        .split(",")
        .map((c) => normalizeConcernForCategory(c.trim(), nextCategory))
        .filter(Boolean);
      if (parsed.length > 0) setSelectedConcerns(parsed);
    }
  }, [searchParams]);

  // Fetch products from Supabase
  useEffect(() => {
    async function loadProducts() {
      try {
        const supabase = createClient();
        const [productsRes, promoRes] = await Promise.all([
          getStorefrontProducts(supabase),
          getActivePromotionsWithTargets(supabase)
        ]);
        if (productsRes.error) throw productsRes.error;

        const promotion = promoRes.error ? null : promoRes.data?.[0] || null;
        setActivePromotion(promotion);

        // Map "Pro" data to our UI expectations
        const mappedData = (productsRes.data || []).map(p => {
          const normalizedCategory = normalizeCategoryValue(p.category);
          const normalizedProduct = {
            ...p,
            category: normalizedCategory,
            name: p.title || p.name, // Handle both title and name schemas
            image: p.image_url || p.image,
            rating: p.rating || 4.8,
            reviews: 124,
            skinType: p.skin_type && p.skin_type.length > 0 ? p.skin_type : ['All'],
            concerns: normalizeConcernsForCategory(p.concern || [], normalizedCategory),
            stock: typeof p.stock === 'number' ? p.stock : 0
          };

          return {
            ...normalizedProduct,
            activePromotion: isProductEligibleForPromotion(normalizedProduct, promotion) ? promotion : null,
            promotionBadge: isProductEligibleForPromotion(normalizedProduct, promotion) ? getPromotionBadge(promotion) : null
          };

          return {
            ...normalizedProduct,
            activePromotion: isProductEligibleForPromotion(normalizedProduct, promotion) ? promotion : null,
            promotionBadge: isProductEligibleForPromotion(normalizedProduct, promotion) ? getPromotionBadge(promotion) : null
          };
        });

        setProducts(mappedData);
        if (mappedData.length > 0) {
          const maxP = Math.max(...mappedData.map(p => p.price || 0));
          setMaxPrice(maxP);
          setPriceRange([0, maxP]);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Derived Filter Options
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category).filter(Boolean));
    cats.delete("Collections");
    cats.delete("Accessories");
    return ["All", ...cats];
  }, [products]);
  const skinTypes = ["Oily", "Dry", "Combination", "Sensitive", "Normal"];

  const skinConcernsList = SKIN_CONCERNS;
  const hairConcernsList = HAIR_CONCERNS;
  const bodyConcernsList = BODY_CONCERNS;

  const concerns = useMemo(
    () => [...skinConcernsList, ...hairConcernsList, ...bodyConcernsList],
    []
  );

  const showSkinTypeFilter = selectedCategory === "All" || selectedCategory === "Skin Care";
  const showSkinConcerns = selectedCategory === "All" || selectedCategory === "Skin Care";
  const showHairConcerns = selectedCategory === "All" || selectedCategory === "Hair Care";
  const showBodyConcerns = selectedCategory === "All" || selectedCategory === "Body Care";

  const visibleConcerns = useMemo(() => {
    if (selectedCategory === "Skin Care") return skinConcernsList;
    if (selectedCategory === "Hair Care") return hairConcernsList;
    if (selectedCategory === "Body Care") return bodyConcernsList;
    return concerns;
  }, [selectedCategory, concerns]);

  useEffect(() => {
    if (selectedCategory === "Body Care") {
      setSelectedSkinTypes([]);
      setSelectedConcerns((prev) => prev.filter((c) => bodyConcernsList.some((concern) => concern.value === c)));
    } else if (selectedCategory === "Hair Care") {
      setSelectedSkinTypes([]);
      setSelectedConcerns((prev) => prev.filter((c) => hairConcernsList.some((concern) => concern.value === c)));
    } else if (selectedCategory === "Skin Care") {
      setSelectedConcerns((prev) => prev.filter((c) => skinConcernsList.some((concern) => concern.value === c)));
    }
  }, [selectedCategory]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (selectedSkinTypes.length > 0) {
      result = result.filter((p) =>
        p.skinType?.some(type => selectedSkinTypes.includes(type) || type === "All")
      );
    }

    if (selectedConcerns.length > 0) {
      result = result.filter((p) =>
        p.concerns?.some(concern => selectedConcerns.includes(concern))
      );
    }

    if (searchTerm) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortBy) {
      case "price-low": result.sort((a, b) => a.price - b.price); break;
      case "price-high": result.sort((a, b) => b.price - a.price); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
      case "newest": result.sort((a, b) => b.id - a.id); break;
      default: break;
    }

    return result;
  }, [products, searchTerm, selectedCategory, selectedSkinTypes, selectedConcerns, sortBy, priceRange]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FAF9FF] items-center justify-center">
        <Navbar />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-secondary mb-4"
        >
          <Loader2 size={40} />
        </motion.div>
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/40 animate-pulse">
          Curating Your Ritual...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full relative min-h-screen">
      <PageAtmosphere />

      <main className="relative z-10 camliqa-aurora text-primary antialiased selection:bg-secondary/25 selection:text-primary">
        <Navbar />


        {/* Shop Section */}
        <section className="relative section-shell py-12 sm:py-24">
          {/* Centered Heading for Products */}
          <div className="mb-12 text-center sm:mb-20">
            <h1 className="font-serif text-[2.8rem] leading-[1.1] text-[#1A1A3E] mb-6 tracking-tighter sm:text-7xl lg:text-8xl">
              Our <span className="italic font-light opacity-60">Catalog</span>
            </h1>
            <p className="text-[#1A1A3E]/50 max-w-xl mx-auto text-[10px] sm:text-base font-medium tracking-[0.3em] uppercase" style={{ color: "#1A1A3E" }}>
              Meticulously formulated for your unique rituals.
            </p>
          </div>

          <div className="w-full">
            {/* 
              ARCHITECTURAL TOP BAR - Desktop Only
          */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-20 w-full border-b-2 border-[#C5A059]/30 pb-12 hidden lg:block"
            >
              <div className="flex flex-wrap items-center justify-between px-2 py-2 gap-10">
                {/* Left: Search & Categories */}
                <div className="flex flex-wrap items-center gap-10 lg:gap-16">
                  <div className="relative w-full sm:w-96">
                    <input
                      type="text"
                      placeholder="SEARCH THE CATALOG..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-transparent border-b border-[#1A1A3E]/20 py-2 text-[12px] font-bold tracking-[0.1em] focus:outline-none focus:border-[#C5A059] transition-all pl-10"
                    />
                    <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C5A059]" />
                  </div>

                  <div className="pt-2">
                    <CustomDropdown
                      label="Category"
                      value={selectedCategory}
                      options={categories}
                      onChange={setSelectedCategory}
                    />
                  </div>
                </div>

                {/* Right: Price & Sort */}
                <div className="flex flex-wrap items-center gap-12 lg:gap-20">
                  <div className="flex items-center gap-8">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C5A059]">Price Limit</span>
                      <span className="text-[14px] font-black text-[#1A1A3E] tracking-tighter">₹{priceRange[1]}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      step="1"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-32 sm:w-48 h-[2px] bg-[#1A1A3E]/10 appearance-none cursor-pointer accent-[#C5A059]"
                    />
                  </div>

                  <div className="pt-2">
                    <CustomDropdown
                      label="Sort Order"
                      value={sortBy === "featured" ? "Featured" : sortBy === "price-low" ? "Price Low" : sortBy === "price-high" ? "Price High" : "Newest"}
                      options={["Featured", "Price Low", "Price High", "Newest"]}
                      onChange={(val) => {
                        if (val === "Featured") setSortBy("featured");
                        if (val === "Price Low") setSortBy("price-low");
                        if (val === "Price High") setSortBy("price-high");
                        if (val === "Newest") setSortBy("newest");
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* MOBILE TOP BAR - Floating & Compact */}
            <div className="lg:hidden mb-12 space-y-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Rituals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/50 border border-[#1A1A3E]/10 rounded-2xl px-12 py-4 text-[12px] font-medium placeholder:text-[#1A1A3E]/30 focus:outline-none focus:border-[#C5A059]/50 backdrop-blur-md"
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C5A059]" />
              </div>

              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-[#1A1A3E] px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-xl shadow-[#1A1A3E]/10"
                >
                  <Sliders className="h-3 w-3 text-secondary" />
                  Refine Ritual
                </button>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/60 border border-[#1A1A3E]/10 text-[#1A1A3E] backdrop-blur-md">
                  <span className="text-[14px] font-serif italic">{filteredProducts.length}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-16 lg:grid-cols-[320px_1fr]">
              {/* SIDEBAR - Desktop Only */}
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:block space-y-20 h-fit"
              >
                {showSkinTypeFilter && (
                <div className="border-l-2 border-[#C5A059]/30 pl-10 space-y-10">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-[2px] bg-[#C5A059]" />
                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#C5A059]">Skin Type</span>
                  </div>
                  <div className="grid grid-cols-1 gap-y-5 pt-2">
                    {skinTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedSkinTypes(prev =>
                          prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                        )}
                        className={`text-left text-[11px] font-bold uppercase tracking-[0.3em] transition-all flex items-center gap-4 group ${selectedSkinTypes.includes(type)
                          ? "text-[#C5A059]"
                          : "text-[#1A1A3E]/60 hover:text-[#C5A059]"
                          }`}
                      >
                        <div className={`w-1 h-1 rounded-full transition-all duration-500 ${selectedSkinTypes.includes(type) ? "bg-[#C5A059] scale-125" : "bg-[#1A1A3E]/20 group-hover:bg-[#C5A059]"}`} />
                        <span>{type}</span>
                        <div className="flex-1 h-[1px] bg-[#1A1A3E]/5 ml-auto" />
                        <div className={`h-[2px] bg-[#C5A059] transition-all duration-500 ${selectedSkinTypes.includes(type) ? "w-12" : "w-0 group-hover:w-6"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                )}

                {(showSkinConcerns || showHairConcerns || showBodyConcerns) && (
                <div className="border-l-2 border-[#C5A059]/30 pl-10 space-y-12">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-[2px] bg-[#C5A059]" />
                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#C5A059]">Primary Needs</span>
                  </div>
                  {showSkinConcerns && (
                  <div className="space-y-6 pt-2">
                    <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#1A1A3E] border-b border-[#1A1A3E]/10 pb-1 block w-fit">Skin Concerns</span>
                    <div className="grid grid-cols-1 gap-y-5">
                      {skinConcernsList.map((concern) => (
                        <button
                          key={concern.value}
                          onClick={() => setSelectedConcerns(prev =>
                            prev.includes(concern.value) ? prev.filter(c => c !== concern.value) : [...prev, concern.value]
                          )}
                          className={`text-left text-[11px] font-bold uppercase tracking-[0.3em] transition-all flex items-center gap-4 group ${selectedConcerns.includes(concern.value)
                            ? "text-[#C5A059]"
                            : "text-[#1A1A3E]/60 hover:text-[#C5A059]"
                            }`}
                        >
                          <div className={`w-1 h-1 rounded-full transition-all duration-500 ${selectedConcerns.includes(concern.value) ? "bg-[#C5A059] scale-125" : "bg-[#1A1A3E]/20 group-hover:bg-[#C5A059]"}`} />
                          <span>{concern.label}</span>
                          <div className="flex-1 h-[1px] bg-[#1A1A3E]/5 ml-auto" />
                          <div className={`h-[2px] bg-[#C5A059] transition-all duration-500 ${selectedConcerns.includes(concern.value) ? "w-12" : "w-0 group-hover:w-6"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  )}
                  {showHairConcerns && (
                  <div className="space-y-6 pt-4">
                    <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#1A1A3E] border-b border-[#1A1A3E]/10 pb-1 block w-fit">Hair Concerns</span>
                    <div className="grid grid-cols-1 gap-y-5">
                      {hairConcernsList.map((concern) => (
                        <button
                          key={concern.value}
                          onClick={() => setSelectedConcerns(prev =>
                            prev.includes(concern.value) ? prev.filter(c => c !== concern.value) : [...prev, concern.value]
                          )}
                          className={`text-left text-[11px] font-bold uppercase tracking-[0.3em] transition-all flex items-center gap-4 group ${selectedConcerns.includes(concern.value)
                            ? "text-[#C5A059]"
                            : "text-[#1A1A3E]/60 hover:text-[#C5A059]"
                            }`}
                        >
                          <div className={`w-1 h-1 rounded-full transition-all duration-500 ${selectedConcerns.includes(concern.value) ? "bg-[#C5A059] scale-125" : "bg-[#1A1A3E]/20 group-hover:bg-[#C5A059]"}`} />
                          <span>{concern.label}</span>
                          <div className="flex-1 h-[1px] bg-[#1A1A3E]/5 ml-auto" />
                          <div className={`h-[2px] bg-[#C5A059] transition-all duration-500 ${selectedConcerns.includes(concern.value) ? "w-12" : "w-0 group-hover:w-6"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  )}
                  {showBodyConcerns && (
                  <div className={`space-y-6 ${showSkinConcerns || showHairConcerns ? "pt-4" : "pt-2"}`}>
                    <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#1A1A3E] border-b border-[#1A1A3E]/10 pb-1 block w-fit">Body Concerns</span>
                    <div className="grid grid-cols-1 gap-y-5">
                      {bodyConcernsList.map((concern) => (
                        <button
                          key={concern.value}
                          onClick={() => setSelectedConcerns(prev =>
                            prev.includes(concern.value) ? prev.filter(c => c !== concern.value) : [...prev, concern.value]
                          )}
                          className={`text-left text-[11px] font-bold uppercase tracking-[0.3em] transition-all flex items-center gap-4 group ${selectedConcerns.includes(concern.value)
                            ? "text-[#C5A059]"
                            : "text-[#1A1A3E]/60 hover:text-[#C5A059]"
                            }`}
                        >
                          <div className={`w-1 h-1 rounded-full transition-all duration-500 ${selectedConcerns.includes(concern.value) ? "bg-[#C5A059] scale-125" : "bg-[#1A1A3E]/20 group-hover:bg-[#C5A059]"}`} />
                          <span>{concern.label}</span>
                          <div className="flex-1 h-[1px] bg-[#1A1A3E]/5 ml-auto" />
                          <div className={`h-[2px] bg-[#C5A059] transition-all duration-500 ${selectedConcerns.includes(concern.value) ? "w-12" : "w-0 group-hover:w-6"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  )}
                </div>
                )}

                <div className="pl-10 pt-10">
                  <button
                    onClick={() => {
                      setSelectedCategory("All");
                      setSelectedSkinTypes([]);
                      setSelectedConcerns([]);
                      setSearchTerm("");
                      setPriceRange([0, maxPrice]);
                      setSortBy("featured");
                    }}
                    className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.35em] text-[#1A1A3E]/60 hover:text-[#C5A059] transition-all"
                  >
                    <span className="w-10 h-[2px] bg-[#1A1A3E]/20 group-hover:bg-[#C5A059] transition-all" />
                    Reset All Filters
                  </button>
                </div>
              </motion.aside>

              {/* Products Column */}
              <div>
                <div className="mb-10 flex items-center justify-between px-2 lg:mb-12">
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.4em] text-[#1A1A3E]/50 font-black">
                    Selection / {filteredProducts.length} Results
                  </span>

                  <div className="hidden lg:flex items-center gap-4 text-[#1A1A3E]/30">
                    <Sparkles className="h-4 w-4" />
                  </div>
                </div>

                {activePromotion ? (
                  <div className="mb-10 rounded-2xl border border-[#C5A059]/25 bg-white/70 px-5 py-4 shadow-[0_18px_40px_-30px_rgba(26,26,62,0.35)] backdrop-blur">
                    <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#C5A059]">
                      {getPromotionBadge(activePromotion)}
                    </p>
                    <h2 className="mt-2 font-serif text-2xl text-[#1A1A3E]">{activePromotion.title}</h2>
                    {activePromotion.description ? (
                      <p className="mt-1 text-sm leading-relaxed text-[#1A1A3E]/60">{activePromotion.description}</p>
                    ) : null}
                  </div>
                ) : null}

                {/* Responsive Grid: 1 col at <425px, 2 cols at >=425px */}
                <div className="grid grid-cols-1 min-[425px]:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
                  <AnimatePresence mode="popLayout">
                    {filteredProducts.map((product, idx) => (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3, delay: idx * 0.03 }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {filteredProducts.length === 0 && (
                  <div className="py-32 text-center">
                    <p className="font-serif italic text-2xl text-[#1A1A3E]/40">No products match your ritual selection.</p>
                    <button onClick={() => { setSearchTerm(""); setSelectedCategory("All"); setSelectedSkinTypes([]); setSelectedConcerns([]); setPriceRange([0, maxPrice]); }} className="mt-8 text-[10px] uppercase tracking-[0.3em] text-[#C5A059] border-b border-[#C5A059]/30 pb-2">Reveal All Products</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Filter Drawer - Premium Pop-up */}
        <AnimatePresence>
          {isMobileFilterOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileFilterOpen(false)}
                className="fixed inset-0 z-[100] bg-primary/30 backdrop-blur-md"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed right-0 top-0 bottom-0 z-[101] w-[85%] max-w-[380px] bg-white/95 backdrop-blur-2xl shadow-[-20px_0_60px_rgba(0,0,0,0.1)] flex flex-col"
              >
                <div className="p-8 border-b border-primary/5 flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-3xl text-primary">Ritual Refinement</h3>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-secondary mt-1">Bespoke Curation</p>
                  </div>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <X className="h-5 w-5 text-primary" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-12">
                  {/* Categories - Mobile */}
                  <div className="space-y-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary border-b border-secondary/20 pb-1 inline-block">Categories</span>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-5 py-3 rounded-2xl text-[10px] font-bold tracking-widest transition-all ${selectedCategory === cat ? "bg-primary text-white" : "bg-primary/5 text-primary/40"}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Skin Type - Mobile */}
                  {showSkinTypeFilter && (
                  <div className="space-y-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary border-b border-secondary/20 pb-1 inline-block">By Skin Type</span>
                    <div className="flex flex-wrap gap-2">
                      {skinTypes.map(type => (
                        <button
                          key={type}
                          onClick={() => setSelectedSkinTypes(prev =>
                            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                          )}
                          className={`px-5 py-3 rounded-2xl text-[10px] font-bold tracking-widest transition-all border ${selectedSkinTypes.includes(type) ? "bg-secondary text-white border-secondary" : "bg-white border-primary/10 text-primary/40"}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  )}

                  {/* Concerns - Mobile */}
                  {visibleConcerns.length > 0 && (
                  <div className="space-y-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary border-b border-secondary/20 pb-1 inline-block">
                      {selectedCategory === "Body Care" ? "Body Concerns" : selectedCategory === "Hair Care" ? "Hair Concerns" : selectedCategory === "Skin Care" ? "Skin Concerns" : "Primary Needs"}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {visibleConcerns.map(c => (
                        <button
                          key={c.value}
                          onClick={() => setSelectedConcerns(prev =>
                            prev.includes(c.value) ? prev.filter(conc => conc !== c.value) : [...prev, c.value]
                          )}
                          className={`px-5 py-3 rounded-2xl text-[10px] font-bold tracking-widest transition-all border ${selectedConcerns.includes(c.value) ? "bg-secondary/10 text-secondary border-secondary/30" : "bg-white border-primary/10 text-primary/40"}`}
                        >
                          {getConcernDisplayLabel(c, selectedCategory)}
                        </button>
                      ))}
                    </div>
                  </div>
                  )}
                </div>

                {/* Mobile Drawer Actions */}
                <div className="p-8 bg-white border-t border-primary/5">
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="w-full py-4.5 rounded-2xl bg-primary text-white text-[11px] font-bold uppercase tracking-[0.25em] shadow-2xl shadow-primary/20 mb-4"
                  >
                    Apply Curation
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCategory("All");
                      setSelectedSkinTypes([]);
                      setSelectedConcerns([]);
                      setIsMobileFilterOpen(false);
                    }}
                    className="w-full py-4 text-[9px] font-bold uppercase tracking-[0.25em] text-primary/40"
                  >
                    Reset Ritual
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <GoldenDivider />

        {/* CTA Section */}
        <section className="section-shell pb-20 sm:pb-24 lg:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-xl border p-10 text-center backdrop-blur-xl sm:p-16"
            style={{
              borderColor: "rgba(197,160,89,0.25)",
              background:
                "linear-gradient(135deg, rgba(26,29,54,0.95) 0%, rgba(26,29,54,0.84) 50%, rgba(197,160,89,0.32) 100%)",
              boxShadow: "0 44px 100px -60px rgba(26,29,54,0.55)"
            }}
          >
            <div className="relative z-10">
              <h2 className="font-serif text-[2.6rem] leading-tight text-white sm:text-[3.1rem]">
                Find Your Perfect Product
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-[1.02rem] leading-relaxed" style={{ color: "rgba(255,255,255,0.82)" }}>
                Browse our complete collection and discover natural, handcrafted skincare and haircare products that work for you.
              </p>
            </div>
          </motion.div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
