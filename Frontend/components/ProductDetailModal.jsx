'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { formatCurrency } from '@/lib/utils';

export default function ProductDetailModal({ product, isOpen, onClose }) {
  const { addToCart } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    // Mark as added
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000); // Reset after 2 seconds
  };

  const handleClose = () => {
    setQuantity(1);
    setAddedToCart(false);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/40" onClick={handleClose}></div>

      {/* Full-screen panel */}
      <div className="fixed inset-0 z-50 bg-base">
        <div className="relative h-full w-full overflow-hidden">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-accentSecondary/20 text-ink transition hover:bg-accentSecondary/30"
          >
            ✕
          </button>

          {/* Content */}
          <div className="h-full overflow-y-auto p-5 pt-16 sm:p-6 sm:pt-16 md:p-10">
            <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 md:gap-10">
              {/* Image */}
              <div className="overflow-hidden rounded-2xl border border-muted/25 bg-section">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-[320px] w-full object-contain sm:h-[420px] md:h-[640px]"
                />
              </div>

              {/* Details */}
              <div className="md:pr-2">
                {/* Header */}
                <div className="mb-6">
                  <p className="text-sm uppercase tracking-[0.1em] text-accentSecondary">
                    {product.ingredient}
                  </p>
                  <h1 className="mt-2 text-3xl font-serif text-ink md:text-4xl">{product.name}</h1>
                  <p className="mt-2 text-xl font-serif text-accentPrimary md:text-2xl">{formatCurrency(product.priceDisplay ?? product.price)}</p>
                  <p className="mt-2 text-sm text-muted">Size: {product.size}</p>
                </div>

                {/* Description */}
                <div className="mb-8 border-t border-muted/30 pt-6">
                  <h3 className="mb-3 text-lg font-semibold text-ink">About</h3>
                  <p className="text-sm leading-6 text-muted">{product.description}</p>
                </div>

                {/* Benefits */}
                <div className="mb-8 border-t border-muted/30 pt-6">
                  <h3 className="mb-4 text-lg font-semibold text-ink">Key Benefits</h3>
                  <ul className="space-y-2">
                    {product.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="mt-1 inline-block h-2 w-2 rounded-full bg-accentPrimary flex-shrink-0"></span>
                        <span className="text-sm text-muted">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* How to Use */}
                <div className="mb-8 border-t border-muted/30 pt-6">
                  <h3 className="mb-4 text-lg font-semibold text-ink">How to Use</h3>
                  <ol className="space-y-2">
                    {product.howToUse.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="inline-block h-6 w-6 rounded-full bg-accentSecondary/20 text-center text-xs font-semibold text-accentSecondary flex-shrink-0 pt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-sm text-muted pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Ingredients */}
                <div className="mb-8 border-t border-muted/30 pt-6">
                  <h3 className="mb-3 text-lg font-semibold text-ink">Ingredients</h3>
                  <p className="text-sm leading-6 text-muted">{product.ingredients}</p>
                </div>

                {/* Add to Cart Section */}
                <div className="border-t border-muted/30 pt-6">
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex items-center border border-muted/30 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-2 text-muted hover:text-ink transition"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-12 border-l border-r border-muted/30 bg-base py-2 text-center text-ink outline-none"
                        min="1"
                      />
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-4 py-2 text-muted hover:text-ink transition"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className={`w-full rounded-lg py-3 font-medium transition ${
                      addedToCart
                        ? 'bg-green-500/20 text-green-700'
                        : 'bg-accentPrimary text-white hover:bg-accentPrimary/90'
                    }`}
                  >
                    {addedToCart ? '✓ Added to Cart' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
