import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAdminStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      login: (status, userData = null) => {
        set({ isAuthenticated: status, user: userData });
      },
      logout: () => set({ isAuthenticated: false, user: null }),
    }),
    {
      name: 'admin-storage',
    }
  )
);
