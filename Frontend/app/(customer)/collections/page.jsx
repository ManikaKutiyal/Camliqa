"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import GoldenDivider from "@/components/GoldenDivider";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import products from "@/lib/products";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getStorefrontProducts } from "@/services/supabase/products";
import { mapStorefrontProduct, productHasTag } from "@/lib/storefrontProductUtils";
import { formatCurrency } from "@/lib/utils";

function HeartIcon({ product }) {
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const active = isInWishlist(product.id);
  
  return (
    <button 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product);
      }}
      className="transition-all duration-300 transform hover:scale-110"
    >
      <Heart 
        size={20} 
        className={`transition-colors duration-300 ${active ? "fill-[#C5A059] text-[#C5A059]" : "text-primary/40 hover:text-primary"}`} 
      />
    </button>
  );
}

export default function CollectionsPage() {
  const { addToCart } = useCartStore();
  const [bestsellers, setBestsellers] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const heroRef = useRef(null);
  const bestsellersRef = useRef(null);
  const recommendedRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const yText = useTransform(scrollYProgress, [0, 1], [0, 90]);

  useEffect(() => {
    async function fetchFeaturedCollections() {
      try {
        const supabase = createClient();
        const { data, error } = await getStorefrontProducts(supabase);
        if (error || !data) throw error;

        const mappedProducts = data.map(mapStorefrontProduct);
        const bestsellerProducts = mappedProducts
          .filter((product) => productHasTag(product.tags, "Bestseller"))
          .slice(0, 8);
        const recommendedTaggedProducts = mappedProducts
          .filter((product) => productHasTag(product.tags, "Recommended"))
          .slice(0, 8);

        setBestsellers(bestsellerProducts);
        setRecommendedProducts(recommendedTaggedProducts);
      } catch (err) {
        console.error("Failed to fetch featured collection products", err);
      }
    }

    fetchFeaturedCollections();
  }, []);

  const scrollSection = (ref, direction) => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const scrollAmount = clientWidth / 2;
      const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      ref.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <main className="camliqa-aurora bg-[#F5F1F8] text-primary antialiased selection:bg-secondary/25 selection:text-primary overflow-hidden">
      <Navbar />

      {/* =========================================
          PART 1: SAGE INSPIRED (EDITORIAL & WARM)
          ========================================= */}

      {/* 1. Hero Section */}
      <section ref={heroRef} className="relative w-full flex flex-col items-center bg-[#F5F1F8] pt-8">
        <div className="w-[95%] max-w-7xl mx-auto h-[50vh] sm:h-[65vh] relative rounded-3xl overflow-hidden">
          <Image
            src="/collections/eye_hero.png"
            alt="Hero Eye"
            fill
            className="object-cover object-top opacity-90"
            priority
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Massive Decorative Watermark */}
        <motion.div style={{ y: yText }} className="relative z-0 -mt-16 sm:-mt-32 lg:-mt-48 pointer-events-none w-full flex justify-center select-none">
          <h1 className="font-serif text-[4.5rem] sm:text-[10rem] lg:text-[16rem] leading-none tracking-tight text-[#1A1A3E] drop-shadow-sm mix-blend-multiply opacity-80 lg:opacity-100">
            rituals.
          </h1>
        </motion.div>
      </section>

      {/* 2. New Philosophy Section */}
      <section className="relative pt-20 pb-12 sm:pt-40 sm:pb-24 bg-[#F5F1F8] z-10">
        <div className="section-shell max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            <div className="lg:col-span-5 flex flex-col items-start pr-4">
              <Reveal>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium leading-tight text-[#1A1A3E] tracking-tight mb-6">
                  New philosophy of selfcare: healthy skin & hair
                </h2>
                <p className="text-[#1A1A3E] text-sm leading-relaxed mb-4 max-w-md">
                  Camliqa is about conscious simplicity — effective formulas, thoughtful ingredients, and soft textures designed for real everyday life.
                </p>
                <p className="text-[#1A1A3E] text-sm leading-relaxed mb-8 max-w-md">
                  We believe skincare should support your skin, not overwhelm it, combining modern science with a calm, minimal approach.
                </p>
                <Link 
                  href="/about" 
                  className="bg-[#C5A059] text-white rounded-full px-8 py-3 text-xs font-medium hover:bg-[#A88849] transition-colors"
                >
                  More about Camliqa
                </Link>
              </Reveal>
            </div>

            <div className="lg:col-span-7 relative h-[400px] sm:h-[500px]">
              <Reveal width="100%" height="100%">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3/4 sm:w-2/3 aspect-square bg-[#ECE7F0] rounded-full blur-3xl opacity-50" />
                <motion.div 
                   initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                   whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.8 }}
                   className="absolute right-0 top-0 bottom-0 w-[90%] flex justify-end"
                >
                  <div className="relative w-full h-full">
                    <Image
                      src="/collections/philosophy_sage_jar.png"
                      alt="Product Jar"
                      fill
                      className="object-contain drop-shadow-2xl mix-blend-multiply"
                    />
                  </div>
                </motion.div>
              </Reveal>
            </div>
            
          </div>
        </div>
      </section>

      {/* 3. Pure Care By Nature */}
      <section className="py-12 sm:py-24 bg-[#F5F1F8]">
        <div className="section-shell max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            
            {/* Left: 2 Portrait Images */}
            <div className="lg:col-span-7 grid grid-cols-2 gap-4 sm:gap-6">
              <Reveal width="100%">
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-[#ECE7F0]">
                  <Image src="/collections/pure_care_left.jpg" alt="Pure Care Left Image" fill className="object-cover" />
                </div>
              </Reveal>
              <Reveal width="100%" delay={0.2}>
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-[#ECE7F0]">
                  <Image src="/collections/pure_care_right.jpg" alt="Pure Care Right Image" fill className="object-cover" />
                </div>
              </Reveal>
            </div>

            {/* Right: Text + Landscape Image */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <Reveal width="100%">
                <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-[#1A1A3E] tracking-tight mb-6">
                  Pure care <br/> by nature
                </h2>
                <p className="text-[#1A1A3E] text-sm leading-relaxed mb-4 max-w-sm">
                  Thoughtfully crafted formulas designed to bring balance and calm to your daily routine.
                </p>
                <p className="text-[#1A1A3E] text-sm leading-relaxed mb-8 max-w-sm">
                  Lightweight textures, gentle ingredients, and a minimalist approach help support healthy-looking skin — effortlessly, every day.
                </p>
                
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md mt-4">
                  <Image src="/collections/tubes_landscape.png" alt="Tubes lying down" fill className="object-cover" />
                </div>
              </Reveal>
            </div>
            
          </div>
        </div>
      </section>

      {/* 4. All-in-One Skincare Complex */}
      <section className="relative py-16 sm:py-32 bg-[#F5F1F8] overflow-hidden min-h-fit lg:min-h-[90vh] flex flex-col items-center justify-center">
        {/* Giant Background Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
            <span className="font-serif text-[60vw] sm:text-[40vw] leading-none tracking-tighter text-[#C5A059] opacity-[0.08] sm:opacity-[0.15] mix-blend-multiply">
               new
            </span>
        </div>

        <div className="section-shell max-w-6xl relative z-10 w-full">
          <div className="grid grid-cols-12 gap-8 items-start mb-12 sm:mb-16">
            <div className="col-span-12 sm:col-span-6 flex flex-col pt-8">
              <Reveal>
                <h2 className="font-serif text-[2.2rem] sm:text-5xl lg:text-[3.5rem] font-medium text-[#1A1A3E] tracking-tight leading-[1.1] mb-4">
                  All-in-One Skincare Complex
                </h2>
                <p className="text-sm sm:text-base leading-relaxed max-w-md" style={{ color: "#392265ff" }}>
                  Multifunctional line designed to simplify your daily routine without compromising results.
                </p>
              </Reveal>
            </div>
            <div className="col-span-12 sm:col-span-6 flex justify-end">
              <Reveal width="100%" delay={0.2}>
                <div className="relative w-[90%] max-w-[500px] aspect-[4/3] overflow-hidden">
                  <Image src="/collections/light_bottles_group.png" alt="Group of 3 light bottles" fill className="object-cover" />
                </div>
              </Reveal>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8 items-end">
            <div className="col-span-12 sm:col-span-6">
              <Reveal width="100%" delay={0.3}>
                <div className="relative w-[100%] sm:w-[90%] max-w-[550px] aspect-[3/2] overflow-hidden z-20">
                  <Image src="/collections/dark_bottles_group.png" alt="Group of 4 dark bottles" fill className="object-cover" />
                </div>
              </Reveal>
            </div>
            <div className="col-span-12 sm:col-span-6 pb-8 pl-0 sm:pl-12">
              <Reveal delay={0.4}>
                <div className="max-w-sm">
                  <p className="text-sm sm:text-base leading-relaxed mb-8"style={{ color: "#392265ff" }}>
                    Each formula combines hydration, barrier support, and skin-balancing ingredients to work in one effortless step. The collection focuses on smart minimalism — fewer products, more impact, and consistent care for healthy-looking skin.
                  </p>
                  <Link 
                    href="/products" 
                    className="inline-block border border-[#1A1A3E] text-[#1A1A3E] rounded-full px-10 py-2.5 text-sm font-medium hover:bg-[#1A1A3E] hover:text-white transition-colors"
                  >
                    Catalog
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 5. The Anatomy of Efficiency */}
      <section className="relative w-full py-24 sm:py-32">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image src="/collections/eye_hero.png" alt="Skin Texture Background" fill className="object-cover object-center brightness-75 sepia-[.2]" />
          <div className="absolute inset-0 bg-[#1A1A3E]/60 mix-blend-multiply" />
        </div>

        <div className="section-shell max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Diagram */}
            <div className="lg:col-span-6 flex flex-col items-center">
              <Reveal width="100%">
                <div className="relative w-full aspect-[4/5] bg-[#ECE7F0]/95 backdrop-blur-sm p-4 sm:p-8 rounded-sm shadow-2xl flex items-center justify-center overflow-hidden">
                   {/* Pointers and Image */}
                   <div className="relative w-full h-full">
                     <Image src="/collections/philosophy_sage_jar.png" alt="Anatomy Jar" fill className="object-contain scale-[1.2] drop-shadow-2xl mix-blend-multiply" />
                     
                     {/* Pointers */}
                     <div className="absolute top-[8%] right-[5%] sm:right-[15%] bg-[#1A1A3E] text-white text-[10px] sm:text-xs px-4 py-1.5 rounded-full z-20 shadow-md">Hyaluronic Acid</div>
                     <div className="absolute top-[20%] left-[2%] sm:left-[5%] bg-[#1A1A3E] text-white text-[10px] sm:text-xs px-4 py-1.5 rounded-full z-20 shadow-md">Botanical Extracts</div>
                     <div className="absolute top-[40%] right-[2%] sm:right-[10%] bg-[#1A1A3E] text-white text-[10px] sm:text-xs px-4 py-1.5 rounded-full z-20 shadow-md">Niacinamide</div>
                     <div className="absolute bottom-[30%] left-[2%] sm:left-[8%] bg-[#1A1A3E] text-white text-[10px] sm:text-xs px-4 py-1.5 rounded-full z-20 shadow-md">Ceramides</div>
                     
                     {/* Connecting Lines */}
                     <div className="hidden sm:block absolute top-[13%] right-[30%] w-[1px] h-[15%] bg-[#1A1A3E] rotate-45 z-10" />
                     <div className="hidden sm:block absolute top-[24%] left-[25%] w-[30%] h-[1px] bg-[#1A1A3E] z-10" />
                     <div className="hidden sm:block absolute top-[44%] right-[25%] w-[20%] h-[1px] bg-[#1A1A3E] z-10" />
                     <div className="hidden sm:block absolute bottom-[33%] left-[22%] w-[25%] h-[1px] bg-[#1A1A3E] z-10" />
                   </div>
                </div>
                <p className="text-white/80 text-xs mt-4 font-light max-w-sm text-center sm:text-left mx-auto sm:mx-0">
                  Made with a balanced blend of skin-loving ingredients, including botanical extracts, hydrating complexes and barrier-supporting actives designed for daily care.
                </p>
              </Reveal>
            </div>

            {/* Text */}
            <div className="lg:col-span-6 lg:pl-12">
              <Reveal delay={0.2} width="100%">
                <h2 className="font-serif text-[2.2rem] sm:text-5xl lg:text-6xl font-medium text-white mb-6 leading-[1.1] tracking-tight">
                  The anatomy of efficiency
                </h2>
                <p className="text-white/90 text-sm sm:text-base leading-relaxed mb-10 max-w-md">
                  Each product is the result of years of laboratory development based on research and innovative technologies. At the same time, we have minimized the composition of chemicals and focused on using natural and completely safe components.
                </p>
                <Link href="/about" className="inline-block bg-[#F5F1F8] text-[#1A1A3E] rounded-full px-8 py-3 text-sm font-semibold hover:bg-white transition-colors shadow-lg">
                  More about our approach
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Full Cycle Category Grid */}
      <section className="py-16 sm:py-32 bg-[#F5F1F8]">
        <div className="section-shell max-w-6xl">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* ROW 1 */}
            {/* Col 1: Header */}
            <div className="md:col-span-1 md:pr-4">
              <Reveal width="100%">
                <h2 className="font-serif text-[2.2rem] lg:text-[3.2rem] font-medium text-[#1A1A3E] tracking-tight leading-[1.1] mb-8 md:mb-0">
                  Full cycle of multi-stage skin care
                </h2>
              </Reveal>
            </div>

            {/* Col 2: Card 1 (Hair) */}
            <div className="md:col-span-1">
              <Reveal delay={0.1} width="100%">
                <Link href="/products?category=Hair" className="group block relative w-full aspect-[4/3] bg-[#ECE7F0] overflow-hidden">
                  <Image src="/collections/light_bottles_group.png" alt="Hair" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-full py-1.5 px-4 flex items-center gap-3 border border-black/5 group-hover:bg-white transition-colors">
                    <span className="text-[#1A1A3E] text-[13px] font-medium">Hair&Head Skin</span>
                    <svg className="w-3.5 h-3.5 text-[#1A1A3E]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </Link>
              </Reveal>
            </div>

            {/* Col 3: Card 2 (Body) */}
            <div className="md:col-span-1">
              <Reveal delay={0.2} width="100%">
                <Link href="/products?category=Body" className="group block relative w-full aspect-[4/3] bg-[#ECE7F0] overflow-hidden">
                  <Image src="/collections/tubes_landscape.png" alt="Body" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-full py-1.5 px-4 flex items-center gap-3 border border-black/5 group-hover:bg-white transition-colors">
                    <span className="text-[#1A1A3E] text-[13px] font-medium">Body&Hands</span>
                    <svg className="w-3.5 h-3.5 text-[#1A1A3E]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </Link>
              </Reveal>
            </div>

            {/* ROW 2 */}
            {/* Col 1: Card 3 (Face) */}
            <div className="md:col-span-1">
              <Reveal delay={0.3} width="100%">
                <Link href="/products?category=Skin%20Care" className="group block relative w-full aspect-[4/3] bg-[#ECE7F0] overflow-hidden mt-0 md:-mt-8">
                  <Image src="/collections/cream_jar.png" alt="Face" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-full py-1.5 px-4 flex items-center gap-3 border border-black/5 group-hover:bg-white transition-colors">
                    <span className="text-[#1A1A3E] text-[13px] font-medium">Face&Anti-acne</span>
                    <svg className="w-3.5 h-3.5 text-[#1A1A3E]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </Link>
              </Reveal>
            </div>

            {/* Col 2: Card 4 (Feet) */}
            <div className="md:col-span-1">
              <Reveal delay={0.4} width="100%">
                <Link href="/products" className="group block relative w-full aspect-[4/3] bg-[#ECE7F0] overflow-hidden">
                  <Image src="/collections/dark_bottles_group.png" alt="Shop All" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-full py-1.5 px-4 flex items-center gap-3 border border-black/5 group-hover:bg-white transition-colors">
                    <span className="text-[#1A1A3E] text-[13px] font-medium">Shop All</span>
                    <svg className="w-3.5 h-3.5 text-[#1A1A3E]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </Link>
              </Reveal>
            </div>

            {/* Col 3: Paragraph & Button */}
            <div className="md:col-span-1 flex flex-col justify-start pt-6 md:pt-10">
              <Reveal delay={0.5} width="100%">
                <p className="text-[#1A1A3E] text-[13px] sm:text-sm leading-relaxed mb-6 pr-2">
                  More than 1000 products for daily and therapeutic care. For men and women, for all ages, for all skin types. Explore the full catalog to find essentials designed for balance, comfort, and visible results.
                </p>
                <Link href="/products" className="inline-block bg-[#C5A059] text-white rounded-full px-8 py-2.5 text-xs sm:text-[13px] font-medium hover:bg-[#A88849] transition-colors self-start">
                  View full catalog
                </Link>
              </Reveal>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================
          PART 2: THE ORDINARY INSPIRED (CLINICAL & MINIMAL)
          ========================================= */}

      <div className="w-full h-px bg-secondary/10" />

      {/* 5. Elite Hero Section: "The Future of Beauty" */}
      <section className="w-full min-h-fit lg:min-h-screen flex flex-col lg:flex-row bg-[#1A1A3E]">
        {/* Left Content */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 sm:py-20 lg:py-32 relative z-10">
          <Reveal>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-px bg-[#F5F1F8]/30" />
              <span className="text-[#F5F1F8]/60 text-[10px] uppercase tracking-[0.3em] font-medium">
                Advanced Formulations
              </span>
            </div>
            
            <h1 className="font-serif text-[3.5rem] sm:text-[6.5rem] lg:text-[8rem] font-medium leading-[0.9] text-[#F5F1F8] tracking-tighter" style={{ color: "#C5A059" }}>
              The Future <br className="hidden sm:block" />
              <span className="italic font-light opacity-90 ml-2 sm:ml-12 text-[#C5A059]">of Beauty</span>
            </h1>
          </Reveal>
          
          <Reveal delay={0.2}>
            <p className="mt-10 sm:mt-14 text-black/80 text-[15px] sm:text-[17px] max-w-md font-sans leading-[1.8] font-light">
              Activate cellular regeneration with our science-backed innovations. 
              We are redefining the boundaries of modern skincare through high-potency, minimalist formulations designed for real, visible results.
            </p>
          </Reveal>
          
          <Reveal delay={0.4}>
            <div className="mt-14">
              <Link href="/products" className="group flex items-center gap-6 w-fit cursor-pointer">
                <div className="w-14 h-14 rounded-full border border-[#F5F1F8]/30 flex items-center justify-center group-hover:bg-[#F5F1F8] transition-colors duration-500 ease-out">
                  <svg className="w-5 h-5 text-[#F5F1F8] group-hover:text-[#1A1A3E] transition-colors duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
                <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-black/80 group-hover:text-[#C5A059] transition-colors duration-500">Discover the Science</span>
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Right Image Container */}
        <div className="w-full lg:w-1/2 relative min-h-[60vh] lg:min-h-screen">
          <Image 
            src="/collections/eye_hero.png" 
            alt="The Future of Beauty" 
            fill 
            className="object-cover object-center"
          />
          {/* Subtle gradient overlay to merge perfectly with the left panel */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A3E] via-[#1A1A3E]/20 to-transparent opacity-90 lg:opacity-60" />
          
        </div>
      </section>

      {/* 6. Bestsellers Section */}
      <section className="py-20 sm:py-32 bg-[#FCFAFF]">
        <div className="section-shell">
          <Reveal>
            <div className="flex flex-wrap items-center justify-between gap-6 mb-12">
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-primary">
                Bestsellers
              </h2>
              <div className="flex shrink-0 items-center gap-4 text-primary/30">
                <button 
                  onClick={() => scrollSection(bestsellersRef, 'left')}
                  className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center hover:text-primary hover:border-primary transition-colors"
                >
                  ←
                </button>
                <button 
                  onClick={() => scrollSection(bestsellersRef, 'right')}
                  className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center hover:text-primary hover:border-primary transition-colors"
                >
                  →
                </button>
              </div>
            </div>
          </Reveal>

          <div 
            ref={bestsellersRef}
            className="flex gap-8 sm:gap-12 overflow-x-auto hide-scrollbar pb-8 scroll-smooth"
          >
            {bestsellers.map((product, idx) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="group flex flex-col min-w-[280px] sm:min-w-[340px] w-[340px]"
              >
                <div className="relative w-full aspect-[4/5] bg-[#F5F1F8] rounded-xl overflow-hidden mb-6 flex items-center justify-center p-6 transition-all group-hover:bg-[#F5F1F8]">
                   <div className="absolute top-4 right-4 z-20">
                     <HeartIcon product={product} />
                   </div>
                   <div className="relative w-full h-full overflow-hidden rounded-lg shadow-sm">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
                      />
                   </div>
                </div>
                
                <div>
                  <h3 className="font-serif text-2xl italic font-light mb-1" style={{ color: "#000000ff" }}>{product.name}</h3>
                  <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: "#1A1A3E" }}>
                    {product.description}
                  </p>
                  <button 
                    onClick={() => addToCart(product)}
                    className="mt-6 w-full bg-[#1A1A3E] text-white rounded-full py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#C5A059] transition-all transform hover:-translate-y-1 shadow-lg"
                  >
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Create Our Own Nutrition Kit Section */}
      <section className="py-24 sm:py-32 bg-[#F5F1F8]">
        <div className="section-shell">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
            
            <div className="flex flex-col items-start pr-0 lg:pr-16 order-2 lg:order-1">
              <Reveal>
                <h2 className="font-serif text-[2.2rem] sm:text-[3.5rem] font-medium leading-tight text-primary mb-6">
                  Create our own nutrition kit
                </h2>
                <p className="text-primary/70 text-base sm:text-lg mb-4">
                  Behind the scenes, we've been experimenting with new science.
                </p>
                <p className="text-primary/70 text-base sm:text-lg mb-10">
                  Creating all new formulations just for you.
                </p>
                <Link 
                  href="/products?category=Kits" 
                  className="inline-block bg-primary text-white rounded-full px-10 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-transform hover:scale-105"
                >
                  Beauty Assistant
                </Link>
              </Reveal>
            </div>

            <div className="relative h-[400px] sm:h-[500px] w-full flex items-center justify-center order-1 lg:order-2">
              <Reveal width="100%" height="100%">
                <motion.div 
                  initial={{ y: -30, rotate: -10 }}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                  className="absolute right-[10%] top-[10%] w-48 h-64 sm:w-60 sm:h-80 z-10 overflow-hidden rounded-[2rem] shadow-lg border-4 border-white"
                >
                  <Image
                    src="/collections/splashing_serum.png"
                    alt="Dropper Splash"
                    fill
                    className="object-cover"
                  />
                </motion.div>

                <motion.div 
                  initial={{ y: 30, rotate: 15 }}
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0.5 }}
                  className="absolute left-[10%] bottom-[10%] w-40 h-56 sm:w-56 sm:h-72 z-20 overflow-hidden rounded-[2rem] shadow-2xl border-4 border-white"
                >
                  <Image
                    src="/collections/dark_bottles_group.png"
                    alt="Dropper Bottle"
                    fill
                    className="object-cover"
                  />
                </motion.div>
              </Reveal>
            </div>

          </div>
        </div>
      </section>

      {/* 8. Everyday Essentials Section */}
      <section className="py-24 sm:py-32 bg-[#FCFAFF]">
        <div className="section-shell">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            <div className="lg:col-span-7 grid grid-cols-2 gap-4 sm:gap-6 relative">
               <motion.div 
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.6 }}
                 className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden mt-12 shadow-md"
               >
                 <Image
                   src="/collections/light_bottles_group.png"
                   alt="Essential 1"
                   fill
                   className="object-cover"
                 />
               </motion.div>
               <motion.div 
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.6, delay: 0.2 }}
                 className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden mb-12 shadow-md"
               >
                 <Image
                   src="/collections/cream_jar.png"
                   alt="Essential 2"
                   fill
                   className="object-cover"
                 />
               </motion.div>
            </div>

            <div className="lg:col-span-5 flex flex-col items-start text-left lg:pl-10">
              <Reveal>
                <h2 className="font-serif text-[2.2rem] sm:text-[3.5rem] font-medium leading-tight text-primary mb-6">
                  Everyday essentials
                </h2>
                <p className=" text-sm sm:text-base leading-relaxed mb-10 max-w-md" style={{ color: "#1A1A3E" }}>
                  Our beginner friendly Hyaluronic Acid 2% + B5 boosts hydration, while Niacinamide 10% + Zinc 1% improves the look of skin radiance. Formulated to provide lasting moisture and visible clarity.
                </p>
                <Link
                  href="/products"
                  className="inline-block bg-[#E6DCC3] text-primary rounded-full px-10 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-[#A88849] transition-colors"
                >
                  Shop Now
                </Link>
              </Reveal>
            </div>

          </div>
        </div>
      </section>

      {/* 9. Recommended Products */}
      <section className="relative w-full overflow-hidden h-auto min-h-[750px] bg-[#1A1A3E] py-16 sm:py-24">
        {/* Background Image (Placeholder) */}
        <div className="absolute inset-0 z-0">
          <Image src="/collections/eye_hero.png" alt="Background" fill className="object-cover opacity-40 blur-md mix-blend-overlay" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between pl-[5%] sm:pl-[10%]">
          
          {/* Top Row: Title & Arrows */}
          <div className="flex justify-between items-start w-full pr-[5%] sm:pr-[10%] mb-12 sm:mb-20">
            <Reveal>
              <h2 className="font-serif text-4xl sm:text-[5rem] font-light tracking-tighter leading-[1.1] tracking-tight">
                Recommended products
              </h2>
            </Reveal>
            
            <div className="flex gap-3">
              <button 
                onClick={() => scrollSection(recommendedRef, 'left')}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white flex items-center justify-center text-white hover:bg-white hover:text-[#1A1A3E] transition-colors"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button 
                onClick={() => scrollSection(recommendedRef, 'right')}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white flex items-center justify-center text-white hover:bg-white hover:text-[#1A1A3E] transition-colors"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          {/* Bottom Row: Paragraph & Cards */}
          <div className="flex items-end justify-between w-full mt-auto">
            
            {/* Paragraph */}
            <div className="w-[30%] min-w-[280px] hidden lg:block pr-8 pb-6">
              <Reveal delay={0.2}>
                <p className="text-[15px] leading-relaxed font-light tracking-wide"style={{ color: "#655422ff" }}>
                  Carefully selected essentials<br/>
                  loved for their performance,<br/>
                  balance, and everyday comfort.<br/>
                  Discover formulas designed to<br/>
                  hydrate, restore, and support<br/>
                  healthy-looking skin.
                </p>
              </Reveal>
            </div>

            {/* Cards Carousel */}
            <div 
              ref={recommendedRef}
              className="w-full lg:w-[70%] overflow-x-auto hide-scrollbar cursor-grab active:cursor-grabbing scroll-smooth"
            >
              <div className="flex gap-6 min-w-max pr-8 pb-4">
                 {recommendedProducts.map((product) => (
                   <div key={product.id} className="w-[300px] sm:w-[340px] bg-[#ECE7F0] p-5 shadow-2xl flex flex-col group">
                      <div className="w-full aspect-[4/5] bg-white relative mb-5 overflow-hidden">
                         <Image 
                           src={product.image} 
                           fill 
                           className="object-cover p-6 transition-transform duration-700 group-hover:scale-110 mix-blend-multiply" 
                           alt={product.name}
                         />
                      </div>
                      <div className="flex justify-between items-start mb-6">
                         <h3 className="font-serif text-[#1A1A3E] text-xl italic font-light leading-snug w-[60%]">{product.name}</h3>
                         <span className="font-sans text-[#1A1A3E] text-[17px] font-semibold mt-0.5">{formatCurrency(product.price || 0)}</span>
                      </div>
                      <button 
                        onClick={() => addToCart(product)}
                        className="w-full bg-[#C5A059] text-white rounded-full py-3.5 text-[14px] font-medium hover:bg-[#A88849] transition-colors"
                      >
                         Add to cart
                      </button>
                   </div>
                 ))}
              </div>
            </div>

          </div>

        </div>
        
        <style dangerouslySetInnerHTML={{__html: `
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}} />
      </section>

      {/* 10. Formulated with Intention Banner */}
      <section className="relative w-full h-[400px] sm:h-[500px] overflow-hidden flex items-center bg-[#ECE7F0]">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <Image src="/collections/cream_swirl_bg.png" alt="Cream texture" fill className="object-cover scale-[2] origin-center opacity-80" />
          <div className="absolute inset-0 bg-[#ECE7F0]/30 mix-blend-multiply" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-16 flex items-center justify-between">
          
          {/* Logo (Left) */}
          <Reveal>
            <div className="w-[120px] h-[120px] sm:w-[240px] sm:h-[240px] relative drop-shadow-2xl flex items-center justify-center">
              <svg viewBox="-10 -10 120 120" className="w-full h-full text-[#F5F1F8]" fill="currentColor">
                {/* Elegant Crescent C */}
                <path d="M 50 0 A 50 50 0 0 0 50 100 A 57 57 0 0 1 50 0 Z" />
                {/* Minimalist Pearl/Dot in the opening */}
                <circle cx="55" cy="50" r="10" />
              </svg>
            </div>
          </Reveal>

          {/* Text (Right) */}
          <div className="w-[55%] sm:w-[60%] flex flex-col items-start pl-4 sm:pl-0">
             <Reveal delay={0.2}>
               <h2 className="font-serif text-[1.8rem] sm:text-[3.5rem] lg:text-[4.5rem] font-light tracking-tighter text-[#1A1A3E] leading-[1.2] tracking-tight">
                 Formulated with intention. Designed for real skin.
               </h2>
             </Reveal>
             <Reveal delay={0.4}>
               <p className="font-sans text-[#1A1A3E] text-[13px] sm:text-[17px] mt-3 sm:mt-6 font-semibold">
                 Minimal formulas. Maximum balance.
               </p>
             </Reveal>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
