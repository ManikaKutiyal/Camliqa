"use client";

import { useState } from 'react';
import Link from 'next/link';
import products from "@/lib/products";
import ProductDetailModal from './ProductDetailModal';
import { useCartStore } from '@/store/useCartStore';

function ProductCard({ product, onViewDetails }) {
  const { addToCart } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    setIsAdding(true);
    addToCart(product);
    setTimeout(() => setIsAdding(false), 1500);
  };

  return (
    <article 
      className="group mx-auto w-full max-w-[280px] overflow-hidden rounded-2xl border border-muted/35 bg-section shadow-soft cursor-pointer transition hover:shadow-lg"
      onClick={() => onViewDetails(product)}
    >
      <img
        src={product.image}
        alt={product.name}
        className="h-64 w-full object-cover"
      />

      <div className="p-4">
        <h4 className="text-lg">{product.name}</h4>
        <p className="text-sm text-gray-500">{product.benefit}</p>

        <div className="mt-3 flex justify-between items-center">
          <p>{product.priceDisplay}</p>

          <button
            onClick={handleAddToCart}
            className={`text-sm ${
              isAdding ? 'text-green-500' : 'text-blue-500'
            }`}
          >
            {isAdding ? '✓ Added' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function ProductSection() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <section>
      <div className="grid grid-cols-2 gap-4">
        {products.slice(0, 4).map((product) => (
          <ProductCard 
            key={product.id} 
            product={product}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      <Link href="/products">View All Products</Link>

      <ProductDetailModal 
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}