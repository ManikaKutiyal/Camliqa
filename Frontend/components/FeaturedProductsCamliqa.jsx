"use client";

import { useEffect, useState } from "react";
import { API_URL } from "../lib/api";
import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";

export default function FeaturedProductsCamliqa() {
  const { addToCart } = useCartStore();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products`);
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <section id="featured-products" className="section-shell py-12 sm:py-14 lg:py-18">
      <Reveal width="100%">
        <div className="text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.38em] text-secondary sm:text-xs">
            Featured Products
          </p>
          <h2 className="mt-3 font-serif text-3xl text-primary sm:text-4xl">Direct To Cart Essentials</h2>
        </div>
      </Reveal>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {isLoading ? (
          [1, 2].map(i => (
            <div key={i} className="h-64 bg-white/45 border border-secondary/45 rounded-2xl animate-pulse"></div>
          ))
        ) : products.length > 0 ? (
          products.map((product, index) => (
            <Reveal key={product.id} delay={index * 0.15} width="100%">
              <article
                className="rounded-2xl border border-secondary/45 bg-white/45 p-6 shadow-soft backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_24px_60px_-34px_rgba(26,29,54,0.38),0_0_55px_rgba(197,160,89,0.14)]"
              >
                <Link href={`/products/${product.id}`} className="block">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-secondary">{product.category}</p>
                      <h3 className="mt-3 font-serif text-2xl leading-tight text-primary transition group-hover:text-secondary">{product.name}</h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {product.skinTypes?.map(type => (
                          <span key={type} className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="w-28 shrink-0 sm:w-32">
                      <div className="aspect-square relative overflow-hidden rounded-xl border border-secondary/35 bg-white/80 p-3 shadow-[0_18px_40px_-34px_rgba(26,29,54,0.48)]">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain p-4"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-primary/75">{product.description}</p>
                </Link>

                <div className="mt-6 flex items-center justify-between border-t border-primary/10 pt-4">
                  <p className="font-serif text-2xl text-primary">{formatCurrency(product.price)}</p>
                  <button
                    type="button"
                    onClick={() => addToCart(product)}
                    className="group text-[11px] font-semibold uppercase tracking-[0.2em] text-primary"
                  >
                    <span className="relative inline-block pb-1 after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-secondary after:transition-transform after:duration-300 group-hover:after:scale-x-110">
                      Add to Cart
                    </span>
                  </button>
                </div>
              </article>
            </Reveal>
          ))
        ) : (
          <p className="col-span-full text-center text-primary/40 italic">No products available at the moment.</p>
        )}
      </div>
    </section>
  );
}
