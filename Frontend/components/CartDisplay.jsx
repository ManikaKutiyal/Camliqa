'use client';

import { useCartStore } from '@/store/useCartStore';
import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';

export default function CartDisplay() {
  const { items: cart, removeFromCart, updateQuantity, cartTotal: getTotalPrice } = useCartStore();
  const [isOpen, setIsOpen] = useState(false);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = getTotalPrice();

  return (
    <>
      {/* Cart Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 text-accentSecondary hover:text-accentPrimary transition"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-accentPrimary text-white text-xs font-bold">
            {totalItems}
          </span>
        )}
      </button>

      {/* Cart Sidebar */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Cart Panel */}
          <div className="fixed right-0 top-0 z-50 h-screen w-full max-w-md overflow-y-auto bg-base shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between border-b border-muted/30 bg-base px-6 py-4">
              <h2 className="text-xl font-serif text-ink">Your Cart</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted hover:text-ink transition"
              >
                ✕
              </button>
            </div>

            {/* Cart Items */}
            <div className="p-6">
              {cart.length === 0 ? (
                <p className="text-center text-muted py-8">Your cart is empty</p>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.cartId ?? item.id} className="flex gap-4 border border-muted/30 rounded-lg p-4">
                      {/* Image */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-20 w-20 rounded object-cover"
                      />

                      {/* Details */}
                      <div className="flex-1">
                        <h3 className="font-medium text-ink">{item.name}</h3>
                        <p className="text-sm text-muted">{formatCurrency(item.priceDisplay ?? item.price)}</p>

                        {/* Quantity Selector */}
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.cartId ?? item.id, item.quantity - 1)}
                            className="px-2 py-1 border border-muted/30 rounded text-muted hover:text-ink transition"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-sm text-ink">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.cartId ?? item.id, item.quantity + 1)}
                            className="px-2 py-1 border border-muted/30 rounded text-muted hover:text-ink transition"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.cartId ?? item.id)}
                        className="text-muted hover:text-accentPrimary transition"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer with Total */}
            {cart.length > 0 && (
              <div className="sticky bottom-0 border-t border-muted/30 bg-base px-6 py-4">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-lg font-semibold text-ink">Total:</p>
                  <p className="text-2xl font-serif text-accentPrimary">{formatCurrency(totalPrice)}</p>
                </div>
                <button className="w-full rounded-lg bg-accentPrimary py-3 font-medium text-white hover:bg-accentPrimary/90 transition">
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
