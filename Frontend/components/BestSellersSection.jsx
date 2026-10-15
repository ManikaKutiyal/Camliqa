"use client";
import React from 'react';
import { useCartStore } from "@/store/useCartStore";

const bestSellers = [
  {
    name: "Niacinamide 10% Face Serum",
    concerns: "Acne Marks, Oily Skin",
    price: "₹24",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80",
    sizes: ["30ml", "60ml"]
  },
  {
    name: "Vitamin C 10% Serum",
    concerns: "Dullness, Spots",
    price: "₹29",
    image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=900&q=80",
    sizes: ["30ml", "50ml"]
  },
  {
    name: "Salicylic Acid 2% Serum",
    concerns: "Acne, Blackheads",
    price: "₹22",
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=80",
    sizes: ["30ml", "60ml"]
  },
  {
    name: "SPF 50 Fluid Sunscreen",
    concerns: "UV Protection, Pigmentation",
    price: "₹19",
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80",
    sizes: ["40ml", "80ml"]
  },
  {
    name: "Barrier Repair Moisturizer",
    concerns: "Dryness, Sensitivity",
    price: "₹31",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80",
    sizes: ["50ml", "100ml"]
  },
  {
    name: "Retinol Night Elixir",
    concerns: "Fine Lines, Texture",
    price: "₹36",
    image: "https://images.unsplash.com/photo-1556229010-aa3f7ff66b24?auto=format&fit=crop&w=900&q=80",
    sizes: ["30ml", "45ml"]
  },
  {
    name: "Ceramide Recovery Cream",
    concerns: "Barrier Support, Dryness",
    price: "₹34",
    image: "https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?auto=format&fit=crop&w=900&q=80",
    sizes: ["50ml", "75ml"]
  },
  {
    name: "Daily Gel Cleanser",
    concerns: "Oil Balance, Pores",
    price: "₹26",
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80",
    sizes: ["100ml", "150ml"]
  }
];

function BestSellerCard({ item }) {
  const [selectedSize, setSelectedSize] = React.useState(item.sizes[0]);
  const { addToCart } = useCartStore();

  const handleAddToCart = () => {
    addToCart({
      ...item,
      size: selectedSize
    });
  };

  return (
    <article className="w-[250px] shrink-0 overflow-hidden rounded-2xl bg-white shadow-soft sm:w-[265px] lg:w-[280px]">
      <img src={item.image} alt={item.name} className="h-64 w-full object-cover" />
      <div className="p-5">
        <h3 className="text-[1.35rem] leading-7 text-ink">{item.name}</h3>
        <p className="mt-1 text-base text-accentSecondary/85">{item.concerns}</p>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-lg font-semibold text-ink">From {item.price}</p>
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="rounded-lg border border-black/10 bg-base px-2 py-1.5 text-sm text-accentSecondary outline-none"
          >
            {item.sizes.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          className="mt-4 w-full rounded-lg bg-primary px-3 py-2.5 text-base font-medium text-offWhite transition hover:shadow-[0_0_0_1px_rgba(197,160,89,0.35),0_0_34px_rgba(197,160,89,0.12)]"
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}

export default function BestSellersSection() {
  const loopItems = [...bestSellers, ...bestSellers];

  return (
    <section className="w-full px-5 py-12 sm:px-8 md:py-16 lg:px-10">
      <div className="mx-auto w-full max-w-[1700px]">
        <h2 className="text-4xl leading-none text-ink sm:text-5xl">Our Best Sellers</h2>
        <div className="mt-8 overflow-hidden">
          <div className="auto-marquee flex w-max gap-5">
            {loopItems.map((item, index) => (
              <BestSellerCard key={`${item.name}-${index}`} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
