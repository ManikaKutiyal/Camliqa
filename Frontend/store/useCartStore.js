import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { syncCartToBackend, updateBackendCartItem, removeBackendCartItem } from '@/services/supabase/storeSync';

const createCartState = (set, get) => ({
    items: [],
    isOpen: false,
    userId: null,

    setUserId: async (userId) => {
        const currentUserId = get().userId;
        if (userId === currentUserId) return;
        
        set({ userId });
        if (userId) {
            // Merge local cart to backend
            const mergedCart = await syncCartToBackend(userId, get().items);
            set({ items: mergedCart });
        } else {
            // Logged out, clear cart
            set({ items: [] });
        }
    },

    openCart: () => set({ isOpen: true }),
    closeCart: () => set({ isOpen: false }),
    toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

    addToCart: async (product, quantity = 1) => {
        const userId = get().userId;
        
        let variantId = null;
        let size = null;
        let color = null;
        let price = product.price;
        let stock = product.stock;

        if (product.selectedVariant) {
            variantId = product.selectedVariant.id;
            size = product.selectedVariant.size;
            color = product.selectedVariant.color;
            if (product.selectedVariant.price_override != null) {
                price = product.selectedVariant.price_override;
            }
            if (typeof product.selectedVariant.stock_count === 'number') {
                stock = product.selectedVariant.stock_count;
            }
        } else if (Array.isArray(product.product_variants) && product.product_variants.length > 0) {
            const activeVariants = product.product_variants.filter(v => v.active !== false);
            const defaultVariant = activeVariants[0] || product.product_variants[0];
            if (defaultVariant) {
                variantId = defaultVariant.id;
                size = defaultVariant.size;
                color = defaultVariant.color;
                if (defaultVariant.price_override != null) {
                    price = defaultVariant.price_override;
                }
                if (typeof defaultVariant.stock_count === 'number') {
                    stock = defaultVariant.stock_count;
                }
            }
        } else {
            size = product.size || null;
            color = product.color || null;
        }

        let priceNum = price;
        if (typeof priceNum === 'string') {
            priceNum = parseFloat(priceNum.replace(/[^0-9.]/g, '')) || 0;
        }

        const baseId = product.id || product.name || 'product';
        const productId = `${baseId}-${variantId || 'default'}`;
        
        const cartProduct = {
            ...product,
            cartId: productId,
            variantId,
            size,
            color,
            price: priceNum,
            stock,
        };

        // Optimistic UI update
        set((state) => {
            const existingItem = state.items.find(item => item.cartId === productId);
            if (existingItem) {
                const maxStock = existingItem.stock ?? Infinity;
                const newQty = Math.min(existingItem.quantity + quantity, maxStock);
                return {
                    items: state.items.map(item =>
                        item.cartId === productId ? { ...item, quantity: newQty } : item
                    ),
                    isOpen: true,
                };
            }
            const maxStock = cartProduct.stock ?? Infinity;
            const clampedQty = Math.min(quantity, maxStock);
            return {
                items: [...state.items, { ...cartProduct, quantity: clampedQty }],
                isOpen: true
            };
        });

        // Backend update
        if (userId) {
            const existingItem = get().items.find(item => item.cartId === productId);
            await updateBackendCartItem(userId, productId, existingItem.quantity);
        }
    },

    removeFromCart: async (cartId) => {
        const userId = get().userId;
        set((state) => ({
            items: state.items.filter(item => item.cartId !== cartId)
        }));

        if (userId) {
            await removeBackendCartItem(userId, cartId);
        }
    },

    clearCart: () => set({ items: [] }),

    updateQuantity: async (cartId, quantity) => {
        const userId = get().userId;
        // Find the item to check its stock limit
        const item = get().items.find(i => i.cartId === cartId);
        const maxStock = item?.stock ?? Infinity;
        const newQuantity = Math.max(1, Math.min(quantity, maxStock));
        set((state) => ({
            items: state.items.map(i =>
                i.cartId === cartId ? { ...i, quantity: newQuantity } : i
            )
        }));

        if (userId) {
            await updateBackendCartItem(userId, cartId, newQuantity);
        }
    },

    cartTotal: () => {
        return get().items.reduce((total, item) => {
            const priceStr = String(item.price).replace(/[^0-9.]/g, '');
            const price = parseFloat(priceStr) || 0;
            return total + (price * item.quantity);
        }, 0);
    },

    cartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
    }
});

export const useCartStore = create(
    persist(
        createCartState,
        {
            name: 'camliqa-cart',
            partialize: (state) => ({ items: state.items }),
        }
    )
);
