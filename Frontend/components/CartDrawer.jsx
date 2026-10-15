"use client";
import React from 'react';
import { X, Minus, Plus, Trash2, ExternalLink } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getActivePromotionsWithTargets } from "@/services/supabase";
import { calculateCartPromotionSummary } from "@/lib/promotions";
import { formatCurrency } from "@/lib/utils";

export default function CartDrawer() {
    const { items, isOpen, closeCart, removeFromCart, updateQuantity } = useCartStore();
    const [activePromotion, setActivePromotion] = React.useState(null);

    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
        setMounted(true);
    }, []);

    React.useEffect(() => {
        let cancelled = false;

        async function loadPromotion() {
            const supabase = createClient();
            const { data, error } = await getActivePromotionsWithTargets(supabase);
            if (!cancelled && !error) {
                setActivePromotion(data?.[0] || null);
            }
        }

        loadPromotion();

        return () => {
            cancelled = true;
        };
    }, []);

    const promotionSummary = React.useMemo(
        () => calculateCartPromotionSummary(items, activePromotion),
        [items, activePromotion]
    );

    if (!mounted) return null;

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity"
                    onClick={closeCart}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed inset-y-0 right-0 z-[70] w-full max-w-md transform bg-white shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-black/10 px-6 py-4">
                        <h2 className="text-2xl font-serif text-ink">Your Cart</h2>
                        <button
                            onClick={closeCart}
                            className="rounded-full p-2 text-ink/70 transition hover:bg-black/5 hover:text-ink"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        {items.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-center space-y-4 text-ink/60">
                                <p>Your luxury cart is empty.</p>
                                <button
                                    onClick={closeCart}
                                    className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-80"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-6">
                                {items.map((item) => (
                                    <div key={item.cartId} className="flex gap-4 border-b border-black/5 pb-6">
                                        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-base">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        <div className="flex flex-1 flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between">
                                                    <div className="flex flex-col">
                                                        <h3 className="font-medium text-ink">{item.name}</h3>
                                                        <Link 
                                                            href={`/products/${item.id}`} 
                                                            onClick={closeCart}
                                                            className="flex items-center gap-1 text-[10px] text-primary/40 hover:text-primary transition-colors uppercase tracking-widest mt-1"
                                                        >
                                                            View Product <ExternalLink size={10} />
                                                        </Link>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromCart(item.cartId)}
                                                        className="text-ink/40 transition hover:text-red-500"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <p className="text-sm text-ink/60">{item.size}</p>
                                            </div>

                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex flex-col items-start gap-1">
                                                    <div className="flex items-center rounded-full border border-black/10 px-2 py-1">
                                                        <button
                                                            onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                                                            className="p-1 text-ink/70 hover:text-ink"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                        <button
                                                            onClick={() => {
                                                                if (item.stock != null && item.quantity >= item.stock) return;
                                                                updateQuantity(item.cartId, item.quantity + 1);
                                                            }}
                                                            disabled={item.stock != null && item.quantity >= item.stock}
                                                            className={`p-1 transition ${
                                                                item.stock != null && item.quantity >= item.stock
                                                                    ? 'text-ink/20 cursor-not-allowed'
                                                                    : 'text-ink/70 hover:text-ink'
                                                            }`}
                                                            title={item.stock != null && item.quantity >= item.stock ? 'Maximum stock reached' : ''}
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                    {item.stock != null && item.quantity >= item.stock && (
                                                        <span className="text-[10px] text-amber-600 font-medium px-1">
                                                            Max stock reached
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="font-semibold text-ink">{formatCurrency(item.price)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                        <div className="border-t border-black/10 bg-base/50 px-6 py-6 backdrop-blur-md">
                            <div className="mb-4 flex items-center justify-between">
                                <span className="text-lg font-medium text-ink">Subtotal</span>
                                <span className="text-xl font-semibold text-ink">{formatCurrency(promotionSummary.subtotal)}</span>
                            </div>
                            {promotionSummary.promotionDiscount > 0 ? (
                                <>
                                    <div className="mb-4 rounded-2xl border border-secondary/25 bg-white px-4 py-3">
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                                                {promotionSummary.badge}
                                            </span>
                                            <span className="font-semibold text-green-700">
                                                -{formatCurrency(promotionSummary.promotionDiscount)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mb-4 flex items-center justify-between">
                                        <span className="text-lg font-medium text-ink">After Promotion</span>
                                        <span className="text-xl font-semibold text-ink">{formatCurrency(promotionSummary.promotionTotal)}</span>
                                    </div>
                                </>
                            ) : null}
                            <p className="mb-6 text-sm text-ink/60">Shipping and taxes calculated at checkout.</p>
                            <Link 
                                href="/checkout" 
                                onClick={closeCart}
                                className="block w-full text-center rounded-full bg-primary py-4 text-base font-medium text-white shadow-lg transition hover:opacity-90"
                            >
                                Checkout
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
