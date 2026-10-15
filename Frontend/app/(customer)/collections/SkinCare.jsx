"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import products from "@/lib/products";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShopByConcernSection from "@/components/ShopByConcernSection";
import { createClient } from "@/lib/supabase/client";
import { getStorefrontProducts } from "@/services/supabase/products";
import {
  filterByCategory,
  mapStorefrontProduct,
  productHasTag,
  getRecentProducts,
  getPopularProductMeta,
  getProductDisplayTag,
  getTagBadgeClass,
  mapSpotlightProduct,
} from "@/lib/storefrontProductUtils";
import { formatCurrency } from "@/lib/utils";

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

const FAVORITES_DEFAULTS = {
  badges: [["NEW", "EDITOR'S PICK"], ["NEW", "BESTSELLER"], ["NEW", "VEGAN"]],
  reviews: ["284", "126", "138"],
  sizes: [["300 ml", "150 ml"], ["50 ml"], ["50 ml", "30 ml"]],
};

const DEFAULT_RADIANCE_PRODUCTS = [
  {
    id: "radiance-fallback-1",
    name: "VIT-C 20 Serum",
    tag: "Balancing concentrate",
    price: "₹38.40",
    image: "/collections/uploaded_prod_5.png",
    hoverSrc: "/collections/uploaded_prod_2.png",
    badge: "NEW",
    reviews: "84",
    sizes: [],
  },
  {
    id: "radiance-fallback-2",
    name: "Reishi Barrier Balm",
    tag: "Deep moisture & skin defense",
    price: "₹41.50",
    image: "/collections/cream_jar.png",
    hoverSrc: "/collections/pure_care_left.jpg",
    badge: "BESTSELLER",
    reviews: "173",
    sizes: ["50 ml", "30 ml"],
  },
];

function WishlistButton({ product, className = "" }) {
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const active = isInWishlist(product.id);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product);
      }}
      className={`transition-all duration-300 transform hover:scale-110 flex items-center justify-center rounded-full ${className}`}
    >
      <Heart
        size={16}
        className={`transition-colors duration-300 ${active ? "fill-red-500 text-red-500" : "text-[#1A1A3E]/30 group-hover:text-[#1A1A3E]/60"}`}
      />
    </button>
  );
}

function HoverImage({ src, alt, className = "", hoverSrc = "/collections/uploaded_prod_2.png" }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-contain p-4 mix-blend-multiply transition-all duration-700 ease-in-out ${isHovered ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}
      />
      <Image
        src={hoverSrc}
        alt={`${alt} alternate`}
        fill
        className={`object-contain p-4 mix-blend-multiply transition-all duration-700 ease-in-out absolute inset-0 ${isHovered ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-sm'}`}
      />
    </div>
  );
}

function getProductDetailHref(product) {
  return product?.id ? `/products/${encodeURIComponent(product.id)}` : "/products";
}

function DynamicRating({ rating = 0 }) {
  return (
    <div className="flex items-center gap-0.5 mb-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-2.5 w-2.5 ${i < Math.floor(rating || 0) ? "fill-[#C5A059] text-[#C5A059]" : "text-[#1A1A3E]/20"}`}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function PopularProductCard({ product, badges, reviews, sizes, isCompact = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState(sizes[0]);

  return (
    <div className="flex flex-col w-full">
      {/* Image Container */}
      <div
        className={`relative w-full bg-white mb-6 p-8 flex items-center justify-center transition-all duration-700 ${isCompact ? 'aspect-square' : 'aspect-[4/5]'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
          {badges.map((badge, i) => (
            <span key={i} className={`text-[8px] font-bold px-2 py-0.5 rounded-sm tracking-wider ${badge === 'BESTSELLER' ? 'bg-[#FFD700]/40 text-[#8B7500]' : 'bg-[#1A1A3E]/5 text-[#1A1A3E]/60'}`}>
              {badge}
            </span>
          ))}
        </div>

        {/* Wishlist Button */}
        <WishlistButton product={product} className="absolute top-4 right-14 z-20 bg-white/80 backdrop-blur-sm p-2 shadow-sm border border-[#1A1A3E]/5" />

        {/* Rating */}
        <div className="absolute top-4 right-4 z-10 flex flex-col items-end">
          <DynamicRating rating={product?.rating} />

        </div>

        {/* Product Image with Swap Effect */}
        <div className="relative w-full h-full">
          <HoverImage
            src={product.image}
            alt={product.name}
            hoverSrc={
              (product.product_images?.find(img => img.url !== product.image)?.url) ||
              (product.gallery?.find(img => img !== product.image)) ||
              product.image
            }
          />
        </div>

        {/* Size Selection */}
        <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`text-[9px] px-2 py-1 border transition-all ${selectedSize === size ? 'bg-[#1A1A3E] text-white border-[#1A1A3E]' : 'bg-white/80 backdrop-blur-sm text-[#1A1A3E] border-[#1A1A3E]/10 hover:border-[#1A1A3E]'}`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col items-start">
        <Link
          href={getProductDetailHref(product)}
          className="font-serif text-[#1A1A3E] text-xl leading-tight mb-1 transition-colors hover:text-[#C5A059]"
        >
          {product.name}
        </Link>
        <p className="text-[11px] text-[#1A1A3E]/40 uppercase tracking-widest mb-4">{product.tag || "For sensitive skin"}</p>
        <span className="font-sans text-xl font-light text-[#1A1A3E]">{formatCurrency(product.price || 0)}</span>
      </div>
    </div>
  );
}

function ShoppingBagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5h.008v.008H8.625v-.008zm5.625 0h.008v.008h-.008v-.008z" />
    </svg>
  );
}

function getCollectionSubcategory(product) {
  const value = product?.sub_category || product?.category || "";
  const normalized = String(value).trim().toUpperCase();
  if (!normalized || ["SKIN CARE", "HAIR CARE", "BODY CARE"].includes(normalized)) return "";
  return normalized;
}

export default function SkinCare() {
  const { addToCart } = useCartStore();
  const [activeTab, setActiveTab] = useState("MOISTURIZERS");
  const [activeFaq, setActiveFaq] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [mustHaves, setMustHaves] = useState(products.slice(0, 8));
  const [recommendedProducts, setRecommendedProducts] = useState(products.slice(8, 16));
  const carouselRef = useRef(null);
  const recommendedRef = useRef(null);

  // Dynamic Recent Products
  const [recentProducts, setRecentProducts] = useState([products[5], products[1], products[2]]);
  const [radianceProducts, setRadianceProducts] = useState(DEFAULT_RADIANCE_PRODUCTS);

  useEffect(() => {
    async function fetchRecent() {
      try {
        const supabase = createClient();
        const { data, error } = await getStorefrontProducts(supabase);
        if (error || !data) throw error;

        if (data.length > 0) {
          const mapped = filterByCategory(data, "Skin Care").map(mapStorefrontProduct);
          const collectionItems = mapped.filter((product) => getCollectionSubcategory(product));
          setCategoryProducts(collectionItems);

          if (collectionItems.length > 0) {
            setRecentProducts(getRecentProducts(collectionItems, 3));
          }

          const dbMustHaves = collectionItems.filter(p => productHasTag(p.tags, "Must Have"));
          if (dbMustHaves.length > 0) {
            setMustHaves(dbMustHaves);
          }

          const dbRecommended = collectionItems.filter(p => productHasTag(p.tags, "Recommended"));
          if (dbRecommended.length > 0) {
            setRecommendedProducts(dbRecommended);
          }

          const dbBestsellers = collectionItems
            .filter(p => productHasTag(p.tags, "Bestseller"))
            .slice(0, 2)
            .map((p, index) => mapSpotlightProduct(p, index, DEFAULT_RADIANCE_PRODUCTS));
          if (dbBestsellers.length > 0) {
            const filled = [...dbBestsellers];
            while (filled.length < 2) {
              filled.push(DEFAULT_RADIANCE_PRODUCTS[filled.length]);
            }
            setRadianceProducts(filled.slice(0, 2));
          }
        }
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    }
    fetchRecent();
  }, []);

  const scroll = (ref, direction) => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const scrollAmount = clientWidth / 2;
      const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      ref.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  // Filter products based on active tab
  const filteredProducts = (categoryProducts.length > 0 ? categoryProducts : products)
    .filter((product) => getCollectionSubcategory(product) === activeTab)
    .slice(0, 4);

  return (
    <div className="w-full relative min-h-screen">
      <PageAtmosphere />

      <div className="relative z-10">
        <Navbar />

        {/* 1. Hero Section (Dreamy Daily Ritual) */}
        <section className="w-full relative overflow-hidden py-24 sm:py-32 bg-transparent">
          {/* Animated Background Gradients */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] bg-[#6b42aa]/10 blur-[100px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[50%] bg-[#C5A059]/10 blur-[80px] rounded-full" />
          </div>

          {/* Gold & Purple Sparkles */}
          <SparklingGlow color="#6b42aa" count={12} />
          <SparklingGlow color="#C5A059" count={8} />

          <div className="max-w-5xl mx-auto px-6 relative h-[400px] flex items-center justify-center">

            {/* Text Left */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:block">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-serif italic uppercase text-3xl sm:text-4xl lg:text-5xl text-[#1A1A3E] leading-[1.1] tracking-wide"
              >
                DREAMY DAILY<br />
                <span className="text-[#6b42aa]">RITUAL</span>
              </motion.h1>
            </div>

            {/* Central Product Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-[80%] max-w-[500px] aspect-[4/3] bg-white/40 backdrop-blur-md shadow-[0_20px_50px_-20px_rgba(107,66,170,0.15)] flex items-center justify-center overflow-visible group border border-white/50"
            >
              {/* Inner Gold Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-[#C5A059]/5 z-0" />

              <Image
                src="/collections/light_bottles_group.png"
                alt="Hero Product"
                fill
                className="object-contain p-10 mix-blend-multiply relative z-10"
              />

              {/* Floating Badge */}
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center p-2 border border-[#C5A059]/20">
                <div className="w-full h-full rounded-full border border-dashed border-[#C5A059]/40 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-[#C5A059] uppercase tracking-tighter text-center">Pure<br />Extracts</span>
                </div>
              </div>

              {/* Shop Now (Bottom Right of the box) */}
              <Link href="/products?category=Skin%20Care" className="absolute -bottom-10 right-0 font-serif italic text-sm text-[#1A1A3E] border-b border-[#1A1A3E]/20 hover:border-[#1A1A3E] transition-colors pb-0.5">
                shop now
              </Link>
            </motion.div>

            {/* Mobile Title (Visible only on small screens) */}
            <div className="absolute top-0 left-0 md:hidden mb-8">
              <h1 className="font-serif italic uppercase text-3xl text-[#1A1A3E] leading-[1.1] tracking-wide">
                DREAMY DAILY<br />
                RITUAL
              </h1>
            </div>

          </div>
        </section>

        {/* 2. Ticker / Banner */}
        <div className="w-full border-t border-b border-[#1A1A3E]/10 py-4 flex justify-between px-6 lg:px-16 overflow-hidden bg-white/30 backdrop-blur-sm">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center justify-center w-1/3 text-center border-r last:border-r-0 border-[#1A1A3E]/10">
              <span className="text-[7px] text-[#1A1A3E]/40 uppercase tracking-widest mb-0.5">ALWAYS</span>
              <span className="text-[9px] text-[#1A1A3E]/60 uppercase tracking-[0.2em]">FREE SHIPPING</span>
            </div>
          ))}
        </div>

        {/* 2.5 Shop by Concern — dynamic from backend */}
        <ShopByConcernSection />

        {/* 2.6 Popular Products (Your Favorites) */}
        <section className="w-full py-24 bg-transparent relative overflow-hidden">
          <SparklingGlow />
          {/* Ambient Purple Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#6b42aa]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#6b42aa]/3 blur-[100px] rounded-full translate-y-1/3 -translate-x-1/4" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#1A1A3E]/70 mb-4 block font-medium">POPULAR PRODUCTS</span>
                <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#1A1A3E] leading-tight">
                  Your favorites, <span className="italic font-light">freshly restocked</span>
                </h2>
              </div>
              <Link href="/products?category=Skin%20Care" className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-[#1A1A3E] group">
                VIEW ALL
                <div className="w-10 h-10 rounded-full border border-[#1A1A3E]/20 flex items-center justify-center group-hover:bg-[#1A1A3E] group-hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
              </Link>
            </div>

            {/* Asymmetric Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

              {/* 1. Large Card (Left) */}
              <div className="md:col-span-5">
                <PopularProductCard
                  product={recentProducts[0]}
                  {...getPopularProductMeta(recentProducts[0], 0, FAVORITES_DEFAULTS)}
                />
              </div>

              {/* 2. Middle Card */}
              <div className="md:col-span-4">
                <PopularProductCard
                  product={recentProducts[1]}
                  {...getPopularProductMeta(recentProducts[1], 1, FAVORITES_DEFAULTS)}
                  isCompact
                />
              </div>

              {/* 3. Right Column: Text + Small Card */}
              <div className="md:col-span-3 flex flex-col justify-between gap-12">
                <div className="pt-4">
                  <p className="text-[13px] text-[#1A1A3E]/80 leading-relaxed max-w-[220px]">
                    Discover what we&apos;re loving lately high-performing, cleanly formulated, and selected with care.
                  </p>
                </div>
                <PopularProductCard
                  product={recentProducts[2]}
                  {...getPopularProductMeta(recentProducts[2], 2, FAVORITES_DEFAULTS)}
                  isCompact
                />
              </div>

            </div>
          </div>
        </section>

        {/* 3. Must Have Carousel */}
        <section className="w-full py-24 bg-transparent overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-16 flex flex-col md:flex-row items-center">

            {/* Left Title Block */}
            <div className="w-full md:w-1/3 flex items-center justify-between md:justify-start gap-8 mb-12 md:mb-0">
              <div className="flex flex-col items-start">
                <h2 className="font-serif italic uppercase text-3xl sm:text-4xl text-[#1A1A3E] mb-1 tracking-wide">
                  MUST HAVE
                </h2>
                <p className="text-[10px] text-[#1A1A3E]/40 uppercase tracking-widest mb-6">Our Bestsellers</p>
                <Link href="/products?category=Skin%20Care" className="text-[10px] uppercase tracking-[0.2em] text-[#1A1A3E] border-b border-[#1A1A3E]/30 pb-0.5 hover:border-[#1A1A3E] transition-colors">
                  shop now
                </Link>
              </div>

              {/* Arrows */}
              <div className="hidden md:flex gap-4">
                <button
                  onClick={() => scroll(carouselRef, 'left')}
                  className="text-[#1A1A3E]/30 text-2xl font-light cursor-pointer hover:text-[#1A1A3E] transition-colors"
                >
                  &lt;
                </button>
                <button
                  onClick={() => scroll(carouselRef, 'right')}
                  className="text-[#1A1A3E]/30 text-2xl font-light cursor-pointer hover:text-[#1A1A3E] transition-colors"
                >
                  &gt;
                </button>
              </div>
            </div>

            {/* Product Carousel */}
            <div
              ref={carouselRef}
              className="w-full md:w-2/3 flex gap-6 overflow-x-auto hide-scrollbar pb-4 scroll-smooth"
            >
              {mustHaves.map((product) => {
                const displayTag = getProductDisplayTag(product);

                return (
                <div key={product.id} className="min-w-[260px] w-[300px] flex flex-col items-center group">
                  <div className="w-full aspect-[4/5] bg-[#F5F1F8] relative mb-6 flex items-center justify-center p-6 shadow-sm">
                    {displayTag && (
                      <div className={`absolute top-4 left-4 backdrop-blur-sm px-3 py-1 text-[8px] font-bold uppercase tracking-widest z-10 ${getTagBadgeClass(displayTag)}`}>
                        {displayTag}
                      </div>
                    )}

                    <WishlistButton
                      product={product}
                      className="absolute top-4 right-4 z-20 bg-white/80 backdrop-blur-sm p-2.5 shadow-sm border border-[#1A1A3E]/5"
                    />

                    {/* Image Container */}
                    <div className="relative w-full h-full bg-white flex items-center justify-center p-4">
                      <HoverImage
                        src={product.image}
                        alt={product.name}
                        hoverSrc={
                          (product.product_images?.find(img => img.url !== product.image)?.url) ||
                          (product.gallery?.find(img => img !== product.image)) ||
                          product.image
                        }
                      />

                      {/* Cart Icon */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        className="absolute bottom-3 right-3 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm text-[#1A1A3E] hover:bg-[#1A1A3E] hover:text-white transition-all"
                      >
                        <ShoppingBagIcon />
                      </button>
                    </div>
                  </div>

                  {/* Details */}
                  <DynamicRating rating={product?.rating} />
                  <h3 className="font-sans text-[10px] uppercase tracking-widest text-[#1A1A3E] text-center mb-1 font-medium">{product.name}</h3>
                  <p className="text-[11px] text-[#1A1A3E]/60 text-center">{formatCurrency(product.price || 0)}</p>
                </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* 3. Must Have Carousel */}
        {/* ... already exists ... */}

        {/* 3.5 Trust the Texture (Mood Section) */}
        <section className="w-full py-24 bg-transparent relative overflow-hidden">
          <SparklingGlow />
          {/* Subtle Purple Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6b42aa]/5 blur-[150px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

              {/* Left Content */}
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-[#1A1A3E]/70 mb-6 block font-medium">TRUST THE TEXTURE</span>
                <h2 className="font-serif text-5xl lg:text-6xl text-[#1A1A3E] leading-[1.1] mb-8">
                  Radiance <br /> <span className="italic font-light text-[0.9em]">in every detail</span>
                </h2>
                <p className="text-[13px] text-[#1A1A3E]/80 leading-relaxed max-w-sm mb-16 font-light">
                  Explore a handpicked edit of skincare, makeup & wellness essentials — guided by trust, not trends.
                </p>

                {/* Mini Product Cards */}
                <div className="grid grid-cols-2 gap-6">
                  {radianceProducts.map((product, idx) => (
                    <div key={product.id || idx} className="flex flex-col">
                      <div className="relative aspect-square bg-white p-6 mb-4 flex items-center justify-center">
                        <span className="absolute top-3 left-3 bg-[#FFD700]/40 text-[#8B7500] text-[7px] font-bold px-1.5 py-0.5 rounded-sm">{product.badge}</span>
                        <div className="absolute top-3 right-3 flex flex-col items-end">
                          <DynamicRating rating={product?.rating} />

                        </div>
                        <HoverImage
                          src={product.image}
                          alt={product.name}
                          hoverSrc={product.hoverSrc}
                        />
                        {idx === 1 && product.sizes?.length > 0 && (
                          <div className="absolute bottom-3 right-3 flex flex-col gap-0.5">
                            {product.sizes.map((size, sizeIdx) => (
                              <span
                                key={size}
                                className={`text-[7px] px-1 border ${sizeIdx === 0 ? "bg-[#1A1A3E] text-white border-[#1A1A3E]" : "bg-white text-[#1A1A3E] border-[#1A1A3E]/10"}`}
                              >
                                {size}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <Link
                        href={getProductDetailHref(product)}
                        className="font-serif text-[#1A1A3E] text-sm mb-1 transition-colors hover:text-[#C5A059]"
                      >
                        {product.name}
                      </Link>
                      <p className={`text-[10px] uppercase tracking-widest mb-3 ${idx === 0 ? "text-[#1A1A3E]/70" : "text-[#1A1A3E]/40"}`}>{product.tag}</p>
                      <span className="font-sans text-sm font-semibold text-[#1A1A3E]">{product.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Lifestyle Image */}
              <div className="relative aspect-square w-full shadow-2xl overflow-hidden group">
                <Image
                  src="https://images.unsplash.com/photo-1555820585-c5ae44394b79?q=80&w=725&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Texture Mood"
                  fill
                  className="object-cover transition-transform duration-[3000ms] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full text-center px-6">
                  <p className="font-serif italic text-white text-3xl lg:text-4xl drop-shadow-lg">
                    Glow that <span className="font-light">feels</span> like care
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 4. Full Width Banner */}
        <section className="relative w-full h-[60vh] sm:h-[70vh] overflow-hidden flex items-center bg-transparent">
          <Image
            src="/collections/eye_hero.png"
            alt="Skin Care Banner"
            fill
            className="object-cover object-center"
          />

          {/* Subtle Gradient for readability */}
          <div className="absolute inset-0 bg-gradient-to-l from-[#FCFAFF]/40 via-transparent to-transparent md:from-[#FCFAFF]/60" />

          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-16 flex justify-end">
            <div className="flex flex-col items-center md:items-end text-center md:text-right max-w-sm">
              <h2 className="font-serif italic uppercase text-3xl sm:text-4xl lg:text-5xl text-[#1A1A3E] leading-[1.1] tracking-wide mb-4">
                MAKE SKIN CARE<br />
                SOOO SIMPLE
              </h2>
              <p className="text-[10px] text-[#1A1A3E]/60 uppercase tracking-[0.2em] mb-8">Effortless routines for healthy skin</p>
              <Link href="/products?category=Skin%20Care" className="text-[11px] uppercase tracking-[0.2em] text-[#1A1A3E] border-b border-[#1A1A3E]/30 pb-0.5 hover:border-[#1A1A3E] transition-colors">
                shop now
              </Link>
            </div>
          </div>
        </section>

        {/* 5. Tabs Product Grid */}
        <section className="w-full py-24 max-w-7xl mx-auto px-6 lg:px-16">
          {/* Tabs */}
          <div className="flex justify-center gap-8 sm:gap-16 mb-20 border-b border-[#1A1A3E]/10 pb-8 overflow-x-auto hide-scrollbar">
            {["SERUMS", "MOISTURIZERS", "MASKS", "CLEANSERS"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`font-serif italic uppercase tracking-[0.1em] text-xl sm:text-2xl transition-all duration-500 whitespace-nowrap pb-2 relative group ${activeTab === tab ? 'text-[#1A1A3E]' : 'text-[#1A1A3E]/20 hover:text-[#1A1A3E]/40'}`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTabSkin"
                    className="absolute bottom-0 left-0 w-full h-[1px] bg-[#1A1A3E]"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Grid with AnimatePresence for smooth transitions */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
            <AnimatePresence mode="wait">
              {filteredProducts.map((product, idx) => (
                <motion.div
                  key={`${activeTab}-${product.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="flex flex-col items-center group"
                >
                  <div className="w-full aspect-[4/5] bg-[#F5F1F8] relative mb-6 flex items-center justify-center p-6 shadow-sm transition-all duration-700 group-hover:shadow-md">
                    {idx === 0 && <span className="absolute top-4 left-4 bg-[#E6DCC3] text-[#1A1A3E] text-[8px] uppercase tracking-widest px-2 py-1 z-10 font-bold">NEW</span>}

                    <div className="relative w-full h-full bg-white flex items-center justify-center p-4">
                      <HoverImage
                        src={product.image}
                        alt={product.name}
                        hoverSrc={
                          (product.product_images?.find(img => img.url !== product.image)?.url) ||
                          (product.gallery?.find(img => img !== product.image)) ||
                          product.image
                        }
                      />
                      <WishlistButton
                        product={product}
                        className="absolute top-3 left-3 z-20 bg-white/80 backdrop-blur-sm p-2 shadow-sm border border-[#1A1A3E]/5"
                      />
                      <button
                        onClick={() => addToCart(product)}
                        className="absolute bottom-3 right-3 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm text-[#1A1A3E] hover:bg-[#1A1A3E] hover:text-white transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                      >
                        <ShoppingBagIcon />
                      </button>
                    </div>
                  </div>
                  <DynamicRating rating={product?.rating} />
                  <h3 className="font-sans text-[10px] uppercase tracking-[0.15em] text-[#1A1A3E] text-center mb-1 font-medium">{product.name}</h3>
                  <p className="text-[11px] text-[#1A1A3E]/60 text-center font-light">{formatCurrency(product.price || 0)}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* 6. Editorial Split (Haute Couture style) */}
        <section className="w-full bg-white/10 backdrop-blur-sm py-20 relative">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-8 px-6 md:flex-row md:items-center md:gap-10 lg:gap-12 lg:px-16">
            <div className="w-full md:w-[48%] flex flex-col items-center text-center md:items-start md:text-left">
              <h2 className="font-serif italic uppercase text-4xl sm:text-5xl text-[#1A1A3E] mb-4 tracking-wide">
                PURE HYDRATION
              </h2>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#1A1A3E]/60 mb-6">Deep cellular repair</p>
              <p className="text-sm sm:text-[15px] text-[#1A1A3E]/70 leading-relaxed max-w-[320px] mb-8 font-light">
                Formulated with advanced botanical extracts and active peptides. Designed to restore balance, enhance elasticity, and provide long-lasting moisture to your skin barrier.
              </p>
              <Link href="/products?category=Skin%20Care" className="text-[11px] uppercase tracking-[0.22em] text-[#1A1A3E] border-b border-[#1A1A3E]/30 pb-0.5 hover:border-[#1A1A3E] transition-colors">
                shop now
              </Link>
            </div>
            <div className="w-full md:w-[52%] flex justify-center md:justify-start">
              <div className="relative w-full max-w-[460px] aspect-square shadow-xl">
                <Image src="/collections/splashing_serum.png" alt="Pure Hydration" fill className="object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* 7. Recommended Products Section */}
        <section className="w-full py-24 bg-transparent overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div className="max-w-md">
                <h2 className="font-serif italic uppercase text-3xl sm:text-4xl text-[#1A1A3E] mb-2 tracking-wide">
                  RECOMMENDED
                </h2>
                <p className="text-[10px] text-[#1A1A3E]/40 uppercase tracking-widest">Selected for your skin type</p>
              </div>

              <div className="flex gap-4 mt-6 md:mt-0">
                <button
                  onClick={() => scroll(recommendedRef, 'left')}
                  className="w-12 h-12 rounded-full border border-[#1A1A3E]/10 flex items-center justify-center text-[#1A1A3E]/30 hover:text-[#1A1A3E] hover:border-[#1A1A3E]/30 transition-all"
                >
                  ←
                </button>
                <button
                  onClick={() => scroll(recommendedRef, 'right')}
                  className="w-12 h-12 rounded-full border border-[#1A1A3E]/10 flex items-center justify-center text-[#1A1A3E]/30 hover:text-[#1A1A3E] hover:border-[#1A1A3E]/30 transition-all"
                >
                  →
                </button>
              </div>
            </div>

            <div
              ref={recommendedRef}
              className="flex gap-6 overflow-x-auto hide-scrollbar pb-8 scroll-smooth"
            >
              {recommendedProducts.map((product) => (
                <div key={product.id} className="min-w-[280px] w-[320px] flex flex-col group cursor-pointer">
                  <div className="w-full aspect-[3/4] bg-[#F5F1F8] relative mb-6 overflow-hidden rounded-sm">
                    <HoverImage
                      src={product.image}
                      alt={product.name}
                      hoverSrc={
                        (product.product_images?.find(img => img.url !== product.image)?.url) ||
                        (product.gallery?.find(img => img !== product.image)) ||
                        product.image
                      }
                    />
                    <WishlistButton
                      product={product}
                      className="absolute top-4 right-4 z-20 bg-white/80 backdrop-blur-sm p-2.5 shadow-sm border border-[#1A1A3E]/5"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                  </div>
                  <h3 className="font-serif italic text-lg text-[#1A1A3E] mb-1">{product.name}</h3>
                  <p className="text-[11px] text-[#1A1A3E]/50 uppercase tracking-widest mb-2">{product.category}</p>
                  <p className="text-[13px] font-semibold text-[#1A1A3E]">{product.price}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7.5 Routine Guide Section */}
        <section className="w-full py-24 bg-[#F5F1F8]">
          <div className="max-w-7xl mx-auto px-6 lg:px-16">
            <div className="flex flex-col md:flex-row items-baseline justify-between mb-20">
              <h2 className="font-serif italic uppercase text-3xl text-[#1A1A3E]">THE RITUAL GUIDE</h2>
              <p className="text-[10px] text-[#1A1A3E]/60 uppercase tracking-[0.2em] mt-2 md:mt-0">4 Steps to Luminosity</p>
            </div>

            <div className="relative flex flex-col md:flex-row justify-between gap-12 md:gap-4">
              {/* Connecting Line (Desktop) */}
              <div className="absolute top-8 left-0 w-full h-[1px] bg-[#1A1A3E]/10 hidden md:block" />

              {[
                { step: "01", title: "CLEANSE", desc: "Start with a gentle pH-balanced cleanser to remove impurities without stripping the barrier." },
                { step: "02", title: "TREAT", desc: "Apply high-potency serums while skin is damp to target specific concerns like aging or dullness." },
                { step: "03", title: "HYDRATE", desc: "Lock in treatments with a whipped moisturizer to maintain hydration and soft-focus texture." },
                { step: "04", title: "PROTECT", desc: "Never skip SPF. Protecting your skin from UV damage is the most vital step in any routine." }
              ].map((item, idx) => (
                <div key={idx} className="relative z-10 flex-1 flex flex-col items-start max-w-[280px]">
                  <div className="w-16 h-16 bg-white flex items-center justify-center rounded-full border border-[#1A1A3E]/5 mb-8 shadow-sm group-hover:border-[#C5A059]/30 transition-colors">
                    <span className="font-serif italic text-xl text-[#1A1A3E]">{item.step}</span>
                  </div>
                  <h3 className="font-serif text-lg text-[#1A1A3E] mb-4 tracking-wide">{item.title}</h3>
                  <p className="text-[13px] text-[#1A1A3E]/60 leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. FAQ Section */}
        <section className="w-full py-24 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-serif italic uppercase text-3xl text-[#1A1A3E] mb-4">Common Enquiries</h2>
              <p className="text-[10px] text-[#1A1A3E]/40 uppercase tracking-[0.3em]">Knowledge & Care</p>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "Are Camliqa products safe for sensitive skin?",
                  a: "Yes, all our formulations are dermatologist-tested and specifically engineered to be gentle yet effective. We avoid harsh synthetic fragrances and parabens that often trigger sensitivity."
                },
                {
                  q: "What is the science behind Molecular Intelligence?",
                  a: "Our Molecular Intelligence approach focuses on bioactive ingredients that mimic your skin's natural chemistry. This ensures deeper penetration and better biocompatibility for visible results."
                },
                {
                  q: "Are your ingredients ethically sourced?",
                  a: "Absolutely. We pride ourselves on sourcing high-quality, sustainable botanical extracts. We work directly with suppliers who adhere to strict ethical and environmental standards."
                },
                {
                  q: "How should I store my serums and creams?",
                  a: "To maintain the potency of the active ingredients, store your products in a cool, dry place away from direct sunlight. Ensure the caps are tightly sealed after every use."
                }
              ].map((faq, idx) => (
                <div
                  key={idx}
                  className="border-b border-[#1A1A3E]/10"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full py-6 flex items-center justify-between text-left group"
                  >
                    <span className="font-serif italic text-xl text-[#1A1A3E] group-hover:text-[#C5A059] transition-colors">{faq.q}</span>
                    <span className={`text-xl text-[#1A1A3E]/30 transition-transform duration-300 ${activeFaq === idx ? 'rotate-45' : ''}`}>+</span>
                  </button>
                  <AnimatePresence>
                    {activeFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="pb-8 text-sm text-[#1A1A3E]/60 leading-relaxed max-w-2xl">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. Footer / Instagram Feed */}
        <section className="w-full py-20 bg-white">
          <div className="text-center mb-12">
            <h2 className="font-serif italic uppercase text-xl sm:text-2xl text-[#1A1A3E] tracking-wide">
              FOLLOW US @CAMLIQA_
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-1 sm:gap-4 max-w-7xl mx-auto px-1 sm:px-6">
            <div className="relative aspect-square bg-[#F5F1F8]">
              <Image src="/collections/pure_care_right.jpg" alt="Instagram 1" fill className="object-cover" />
            </div>
            <div className="relative aspect-square bg-[#F5F1F8]">
              <Image src="/collections/splashing_serum.png" alt="Instagram 2" fill className="object-cover" />
            </div>
            <div className="relative aspect-square bg-[#F5F1F8]">
              <Image src="/collections/cream_swirl_bg.png" alt="Instagram 3" fill className="object-cover" />
            </div>
          </div>
        </section>

        <style dangerouslySetInnerHTML={{
          __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
      </div>
    </div>
  );
}
