"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import CustomCursor from "@/components/CustomCursor";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import LuxuryGlow from "@/components/LuxuryGlow";
import Preloader from "@/components/Preloader";
import WishlistDrawer from "@/components/WishlistDrawer";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { AuthProvider } from "@/components/AuthContext";

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const setCartUserId = useCartStore((state) => state.setUserId);
  const setWishlistUserId = useWishlistStore((state) => state.setUserId);

  useEffect(() => {
    if (isAdmin) return;
    
    const supabase = createClient();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      const userId = session?.user?.id || null;
      setCartUserId(userId);
      setWishlistUserId(userId);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const userId = session?.user?.id || null;
      setCartUserId(userId);
      setWishlistUserId(userId);
    });

    return () => subscription.unsubscribe();
  }, [isAdmin, setCartUserId, setWishlistUserId]);


  if (isAdmin) {
    // Return clean standard layout for admin
    return <>{children}</>;
  }

  // Return luxury storefront layout
  return (
    <>
      <Preloader />
      <SmoothScroll>
        <AuthProvider>
          <div>
            <ScrollProgressBar />
            <LuxuryGlow />
            <CustomCursor />
            {children}
            <WishlistDrawer />
          </div>
        </AuthProvider>
      </SmoothScroll>
    </>
  );
}
