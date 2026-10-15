"use client";

import { createContext, useContext, useState, useEffect } from "react";

import { createClient } from "@/lib/supabase/client";

const AuthContext = createContext();

function mapUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email || "",
    name: user.user_metadata?.full_name || user.email || "Customer",
  };
}

export function AuthProvider({ children, initialUser = null }) {
  const [user, setUser] = useState(() => mapUser(initialUser));
  // Only start as hydrated if the server already confirmed a user.
  // If initialUser is null the client must confirm auth state first
  // (this prevents the "Please login" flash for hash-based token flows).
  const [isHydrated, setIsHydrated] = useState(() => Boolean(initialUser));

  useEffect(() => {
    let isMounted = true;

    const supabase = createClient();

    // Subscribe to auth state changes FIRST.
    // The SDK fires INITIAL_SESSION on setup (handles #access_token in URL hash).
    // We only mark the context as hydrated once this first event fires, so the
    // profile page never shows "Please login" before the SDK processes hash tokens.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setUser(mapUser(session?.user ?? null));
      setIsHydrated(true);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider value={{ user, isHydrated, isAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
