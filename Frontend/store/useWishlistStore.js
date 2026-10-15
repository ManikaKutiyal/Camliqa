import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { syncWishlistToBackend, toggleBackendWishlist } from '@/services/supabase/storeSync';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      wishlist: [],
      isOpen: false,
      userId: null,
      
      setUserId: async (userId) => {
          const currentUserId = get().userId;
          if (userId === currentUserId) return;
          
          set({ userId });
          if (userId) {
              const mergedWishlist = await syncWishlistToBackend(userId, get().wishlist);
              set({ wishlist: mergedWishlist });
          } else {
              set({ wishlist: [] });
          }
      },

      openWishlist: () => set({ isOpen: true }),
      closeWishlist: () => set({ isOpen: false }),
      toggleWishlistState: () => set((state) => ({ isOpen: !state.isOpen })),
      
      addToWishlist: async (product) => {
        const userId = get().userId;
        const { wishlist } = get();
        if (!wishlist.find((item) => item.id === product.id)) {
          set({ wishlist: [...wishlist, product] });
          if (userId) {
              await toggleBackendWishlist(userId, product, true);
          }
        }
      },
      
      removeFromWishlist: async (productId) => {
        const userId = get().userId;
        const { wishlist } = get();
        set({ wishlist: wishlist.filter((item) => item.id !== productId) });
        if (userId) {
            await toggleBackendWishlist(userId, { id: productId }, false);
        }
      },
      
      toggleWishlist: async (product) => {
        const userId = get().userId;
        const { wishlist } = get();
        const exists = wishlist.find((item) => item.id === product.id);
        
        if (exists) {
          set({ wishlist: wishlist.filter((item) => item.id !== product.id) });
          if (userId) {
              await toggleBackendWishlist(userId, product, false);
          }
        } else {
          set({ wishlist: [...wishlist, product] });
          if (userId) {
              await toggleBackendWishlist(userId, product, true);
          }
        }
      },
      
      isInWishlist: (productId) => {
        return get().wishlist.some((item) => item.id === productId);
      }
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({ wishlist: state.wishlist }),
    }
  )
);
