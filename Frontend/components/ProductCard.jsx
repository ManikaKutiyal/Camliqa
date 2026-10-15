"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Star, Heart } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import { getPromotionalUnitPrice, getProductBasePrice } from "@/lib/promotions";
import { formatCurrency } from "@/lib/utils";

function StaticImage({ src, alt, className = "" }) {
  const [error, setError] = React.useState(false);
  const placeholder = "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=800";
  
  const imageSrc = error ? placeholder : (src || placeholder);
  const isExternal = imageSrc.startsWith('http') && !imageSrc.includes('localhost') && !imageSrc.includes('camliqa.com');

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {isExternal ? (
        <img 
          src={imageSrc} 
          alt={alt} 
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <Image 
          src={imageSrc} 
          alt={alt} 
          fill 
          className="object-cover"
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}

export default function ProductCard({ product, roundedNone = false }) {
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();
  const isFavorite = isInWishlist(product.id);
  const [isAdded, setIsAdded] = React.useState(false);
  const basePrice = getProductBasePrice(product);
  const promotionalPrice = getPromotionalUnitPrice(product, product.activePromotion);
  const hasPromotionalPrice = promotionalPrice < basePrice;

  const stockQty = typeof product.stock === 'number' ? product.stock : (product.stock === 'out-of-stock' ? 0 : 100);
  const isOutOfStock = stockQty === 0;
  const isLowStock = stockQty > 0 && stockQty <= 5;


  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      className="group relative"
    >
      <Link href={`/products/${product.id}`}>
        <div className={`relative overflow-hidden ${roundedNone ? 'rounded-none' : 'rounded-2xl'} border border-primary/10 bg-white shadow-[0_8px_24px_-12px_rgba(26,26,62,0.12)] transition-all duration-300`}>
          {/* Badges row: Promo / Product tag */}
          {(() => {
            const badgeText = product.promotionBadge || product.tags?.find(t => t.startsWith('*'))?.substring(1) || product.badge;
            if (!badgeText) return null;
            return (
              <div className="absolute top-4 left-4 z-20 bg-secondary/90 px-3 py-1 rounded-full backdrop-blur-md">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                  {badgeText}
                </p>
              </div>
            );
          })()}

          {/* Out of Stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
              <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-lg">
                Out of Stock
              </span>
            </div>
          )}

          {/* Low Stock pill */}
          {isLowStock && (
            <div className="absolute bottom-[148px] left-4 z-20">
              <span className="bg-amber-500 text-white text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-full shadow">
                Only {stockQty} left!
              </span>
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product);
            }}
            className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-md transition-all duration-300 hover:bg-white hover:scale-110 border border-primary/10 shadow-sm"
          >
            <Heart
              className={`h-5 w-5 transition-all ${isFavorite ? "fill-red-500 text-red-500" : "text-primary"
                }`}
              strokeWidth={1.5}
            />
          </button>

          {/* Image */}
          <div className="relative h-[280px] overflow-hidden bg-gradient-to-br from-secondary/5 to-primary/5 transition-colors duration-500">
            <StaticImage
              src={product.image}
              alt={product.name}
            />
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Category */}
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
              {product.category}
            </p>

            {/* Title */}
            <h3 className="mt-2 font-serif text-[1.15rem] leading-tight text-primary hover:text-secondary transition-colors">
              {product.name}
            </h3>

            {/* Description */}
            <p className="mt-2 text-[0.85rem] leading-relaxed text-primary/60 line-clamp-2">
              {product.description}
            </p>

            {/* Rating */}
            <div className="mt-4 flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < Math.floor(product.rating)
                        ? "fill-secondary text-secondary"
                        : "text-primary/20"
                      }`}
                    strokeWidth={1.5}
                  />
                ))}
              </div>
              <span className="text-[0.8rem] font-semibold text-primary/70">
                ({product.reviews})
              </span>
            </div>

            {/* Price & Button */}
            <div className="mt-5 flex items-center justify-between">
              <div>
                <p className="text-[0.75rem] uppercase tracking-[0.16em] text-primary/50">
                  Price
                </p>
                <p className="font-serif text-[1.5rem] text-primary">
                  {formatCurrency(hasPromotionalPrice ? promotionalPrice : basePrice)}
                </p>
                {hasPromotionalPrice ? (
                  <p className="text-xs font-medium text-primary/40 line-through">{formatCurrency(basePrice)}</p>
                ) : null}
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isAdded || isOutOfStock}
                className={`relative z-40 px-6 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                  isOutOfStock
                    ? 'bg-primary/20 text-primary/40 cursor-not-allowed'
                    : isAdded 
                    ? 'bg-green-600 text-white scale-95' 
                    : 'bg-[#1A1A3E] text-white hover:bg-[#C5A059] active:scale-95'
                }`}
              >
                {isOutOfStock ? (
                  'Sold Out'
                ) : isAdded ? (
                  <>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    Added
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3 h-3" />
                    Add
                  </>
                )}
              </button>
            </div>
          </div>


        </div>
      </Link>
    </motion.div>
  );
}
