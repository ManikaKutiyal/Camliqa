"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getStorefrontProducts } from "@/services/supabase/products";
import {
  buildConcernCards,
  filterByCategory,
  HAIR_CONCERN_FALLBACK,
  HAIR_CONCERN_NAMES,
  SKIN_CONCERN_NAMES,
  SKIN_CONCERN_FALLBACK,
  BODY_CONCERN_NAMES,
  BODY_CONCERN_FALLBACK,
} from "@/lib/storefrontProductUtils";

function getConcernConfig(category) {
  if (category === "Hair Care") {
    return {
      fallback: HAIR_CONCERN_FALLBACK,
      names: HAIR_CONCERN_NAMES,
      helperText: "Targeted care for your unique hair journey",
      backgroundClassName: "bg-[#F8F6FA]/60",
    };
  }

  if (category === "Body Care") {
    return {
      fallback: BODY_CONCERN_FALLBACK,
      names: BODY_CONCERN_NAMES,
      helperText: "Expert formulations for absolute body nourishment",
      backgroundClassName: "bg-[#FAF9F6]",
    };
  }

  return {
    fallback: SKIN_CONCERN_FALLBACK,
    names: SKIN_CONCERN_NAMES,
    helperText: "Expert formulations for targeted skin needs",
    backgroundClassName: "bg-[#FAF9F6]",
  };
}

export default function ShopByConcernSection({ category = "Skin Care" }) {
  const concernConfig = getConcernConfig(category);
  const [concerns, setConcerns] = useState(() =>
    buildConcernCards([], {
      fallback: concernConfig.fallback,
      allowedConcerns: concernConfig.names,
      includeAllAllowed: true,
      limit: concernConfig.names.length,
    }),
  );
  const carouselRef = useRef(null);

  useEffect(() => {
    async function fetchConcerns() {
      try {
        const supabase = createClient();
        const { data, error } = await getStorefrontProducts(supabase);
        if (error || !data) throw error;

        const categoryProducts = filterByCategory(data, category);
        const sorted = buildConcernCards(categoryProducts, {
          fallback: concernConfig.fallback,
          allowedConcerns: concernConfig.names,
          includeAllAllowed: true,
          limit: concernConfig.names.length,
        });

        if (sorted.length > 0) setConcerns(sorted);
      } catch {
        // keep static fallback
      }
    }
    fetchConcerns();
  }, [category, concernConfig.fallback, concernConfig.names]);

  const scroll = (direction) => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const firstCard = carousel.querySelector("a");
    const cardWidth = firstCard?.getBoundingClientRect().width || carousel.clientWidth / 2;
    const amount = cardWidth + 32;
    carousel.scrollTo({
      left: carousel.scrollLeft + (direction === "left" ? -amount : amount),
      behavior: "smooth",
    });
  };

  return (
    <section className={`w-full py-28 relative overflow-hidden ${concernConfig.backgroundClassName}`}>
      <div className="absolute left-0 top-0 w-full h-full bg-[url('/noise.png')] opacity-[0.03] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-16 relative z-10">
        {/* Header — identical to original */}
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-16 gap-4">
          <div>
            <h2 className="font-serif italic uppercase text-3xl sm:text-4xl text-[#1A1A3E] mb-2">Shop by Concern</h2>
            <p className="text-[10px] text-secondary uppercase tracking-[0.4em] font-black">Precision Solutions</p>
          </div>
          <div className="h-[1px] flex-1 bg-secondary/20 mx-8 hidden md:block" />
          <p className="text-[11px] text-[#1A1A3E]/40 uppercase tracking-widest max-w-[200px] text-right">{concernConfig.helperText}</p>
        </div>

        {/* Carousel Container */}
        <div className="relative group/carousel">
          {/* Left Arrow */}
          <button
            type="button"
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 md:-translate-x-4 z-20 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#1A1A3E]/5 flex items-center justify-center text-[#1A1A3E]/60 hover:text-[#1A1A3E] hover:border-[#1A1A3E]/20 transition-all opacity-0 group-hover/carousel:opacity-100 hidden sm:flex"
          >
            ←
          </button>

          {/* Right Arrow */}
          <button
            type="button"
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 md:translate-x-4 z-20 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#1A1A3E]/5 flex items-center justify-center text-[#1A1A3E]/60 hover:text-[#1A1A3E] hover:border-[#1A1A3E]/20 transition-all opacity-0 group-hover/carousel:opacity-100 hidden sm:flex"
          >
            →
          </button>

          <div
            ref={carouselRef}
            className="flex gap-4 sm:gap-8 overflow-x-auto pb-8 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
          {concerns.map((concern, idx) => (
            <Link
              href={`/products?category=${encodeURIComponent(category)}&concern=${encodeURIComponent(concern.rawTitle)}`}
              key={idx}
              className="group relative flex-shrink-0 w-[220px] sm:w-[260px] aspect-[3/4] overflow-hidden rounded-sm border border-white transition-all duration-700 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-2xl hover:-translate-y-1"
            >
              {/* Background */}
              <div className={`absolute inset-0 ${concern.color} transition-colors duration-700 group-hover:bg-white`} />

              {/* Content */}
              <div className="absolute inset-0 p-6 sm:p-10 flex flex-col items-center justify-center text-center z-10">
                <h3 className="font-serif italic text-2xl text-[#1A1A3E] mb-1 group-hover:text-secondary transition-colors duration-500">
                  {concern.title}
                </h3>
                <p className="text-[9px] uppercase tracking-[0.3em] text-[#1A1A3E]/50 font-bold group-hover:text-[#1A1A3E]/80 transition-colors duration-500">
                  {concern.desc}
                </p>
              </div>

              {/* Image */}
              <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-all duration-1000 scale-110 group-hover:scale-100">
                <Image src={concern.img} alt={concern.title} fill className="object-contain p-12 mix-blend-multiply" />
              </div>

              {/* Bottom golden line on hover */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                <div className="w-12 h-[1px] bg-secondary" />
              </div>
            </Link>
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}
