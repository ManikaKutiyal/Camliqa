"use client";
import React from 'react';
import { X, Trash2, ShoppingCart, ExternalLink } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";

export default function WishlistDrawer() {
    const { wishlist, isOpen, closeWishlist, removeFromWishlist } = useWishlistStore();
    const { addToCart } = useCartStore();

    const [addingItemId, setAddingItemId] = React.useState(null);
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const handleMoveToCart = (product) => {
        setAddingItemId(product.id);
        
        // Wait a bit for the animation before closing/opening
        setTimeout(() => {
            closeWishlist();
            addToCart(product);
            setAddingItemId(null);
        }, 600);
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity"
                    onClick={closeWishlist}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed inset-y-0 right-0 z-[70] w-full max-w-md transform bg-white shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#C5A059]/10 px-6 py-4 bg-[#F9F8FF]">
                        <h2 className="text-2xl font-serif text-[#1A1A3E]">Your Wishlist</h2>
                        <button
                            onClick={closeWishlist}
                            className="rounded-full p-2 text-[#1A1A3E]/70 transition hover:bg-[#1A1A3E]/5 hover:text-[#1A1A3E]"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Wishlist Items */}
                    <div className="flex-1 overflow-y-auto px-6 py-6 bg-white">
                        {wishlist.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-center space-y-4 text-[#1A1A3E]/60">
                                <div className="w-20 h-20 rounded-full bg-[#F5F1F8] flex items-center justify-center mb-4">
                                    <ShoppingCart size={32} className="text-[#C5A059]/30" />
                                </div>
                                <p className="font-serif italic text-lg">Your wishlist is waiting to be filled.</p>
                                <button
                                    onClick={closeWishlist}
                                    className="rounded-full border border-[#C5A059] px-6 py-2.5 text-sm font-medium text-[#C5A059] transition hover:bg-[#C5A059] hover:text-white"
                                >
                                    Explore Rituals
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-6">
                                {wishlist.map((item) => (
                                    <div key={item.id} className="flex gap-4 border-b border-[#F5F1F8] pb-6 group">
                                        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-[#F5F1F8] relative">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        </div>

                                        <div className="flex flex-1 flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-medium text-[#1A1A3E] font-serif italic text-lg">{item.name}</h3>
                                                    <button
                                                        onClick={() => removeFromWishlist(item.id)}
                                                        className="text-[#1A1A3E]/30 transition hover:text-red-500 p-1"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <p className="text-[11px] uppercase tracking-widest text-[#1A1A3E]/50 mt-1">{item.category}</p>
                                            </div>

                                            <div className="flex items-center justify-between mt-4">
                                                <p className="font-semibold text-[#1A1A3E]">{item.price}</p>
                                                <div className="flex gap-2">
                                                    <Link 
                                                        href={`/products/${item.id}`}
                                                        onClick={closeWishlist}
                                                        className="p-2 rounded-full bg-[#F5F1F8] text-[#1A1A3E]/70 hover:bg-[#1A1A3E] hover:text-white transition-all shadow-sm"
                                                        title="View Product"
                                                    >
                                                        <ExternalLink size={14} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleMoveToCart(item)}
                                                        disabled={addingItemId === item.id}
                                                        className={`flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all shadow-md ${
                                                            addingItemId === item.id 
                                                            ? "bg-green-600 text-white" 
                                                            : "bg-[#1A1A3E] text-white hover:bg-[#C5A059]"
                                                        }`}
                                                    >
                                                        {addingItemId === item.id ? (
                                                            <>
                                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                Added
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ShoppingCart size={12} />
                                                                Add to Cart
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {wishlist.length > 0 && (
                        <div className="border-t border-[#C5A059]/10 bg-[#F9F8FF] px-6 py-6">
                            <p className="mb-6 text-xs text-[#1A1A3E]/60 text-center uppercase tracking-widest font-medium">Your curated selection of architectural beauty</p>
                            <button 
                                onClick={closeWishlist}
                                className="w-full rounded-full bg-[#1A1A3E] py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-xl transition hover:bg-[#C5A059]"
                            >
                                Continue Browsing
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
