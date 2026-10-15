"use client";
import React from 'react';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useAuth } from "@/components/AuthContext";

const navLinks = [
  { label: "ABOUT", href: "/about" },
  { label: "SHOP ALL", href: "/products" },
  // { label: "COLLECTIONS", href: "/collections" },
  { label: "SKIN CARE", href: "/skin-care" },
  { label: "HAIR CARE", href: "/hair-care" },
  { label: "BATH & BODY", href: "/bath-body" },
  { label: "OUR ETHOS", href: "/collections" },
];

function IconSearch({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </svg>
  );
}

function IconUser({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1.7-3 4.1-4.5 7-4.5s5.3 1.5 7 4.5" />
    </svg>
  );
}

function IconHeart({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );
}

function IconCart({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M6 5H18L19 18H5L6 5Z" />
      <path d="M9 5V3C9 2.44772 9.44772 2 10 2H14C14.5523 2 15 2.44772 15 3V5" />
    </svg>
  );
}

function IconSpark({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 36 36" className={`camliqa-ai-icon ${className}`} aria-hidden="true">
      <circle cx="18" cy="18" r="17" fill="#0B0F2A" stroke="#D7C7FF" strokeWidth="1" />
      <path
        d="M18 8.6l2.4 5.2 5.4 2.2-4.6 3.2 1.1 5.3L18 21.7l-4.3 2.8 1.1-5.3-4.6-3.2 5.4-2.2L18 8.6z"
        fill="#E6DCFF"
      />
      <circle cx="9" cy="12" r="1.3" fill="#DCCBFF" />
      <circle cx="26.5" cy="11" r="1" fill="#DCCBFF" opacity="0.85" />
      <circle cx="27" cy="24.5" r="1.1" fill="#DCCBFF" opacity="0.8" />
    </svg>
  );
}

export default function Navbar({ onOpenAI, aiActive }) {
  const { cartCount, openCart } = useCartStore();
  const { wishlist, openWishlist } = useWishlistStore();
  const [mounted, setMounted] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { isHydrated, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isAIActive = Boolean(aiActive) || pathname === "/ai-beauty-advisor";

  const handleOpenAI = (event) => {
    event?.preventDefault?.();
    router.push("/ai-beauty-advisor");
  };

  React.useEffect(() => {
    setMounted(true);
  }, []);


  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[#C5A059]/10 bg-white/75 py-4 backdrop-blur-xl shadow-[0_6px_32px_rgba(197,160,89,0.06)] sm:py-5">
        <div className="section-shell">
          {/* Mobile / Tablet Nav */}
          <div className="flex items-center justify-between gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/15 text-primary transition hover:border-primary/30"
              aria-label="Open menu"
            >
              ☰
            </button>

            <Link href="/" className="flex flex-col items-center">
              <span className="font-serif text-2xl leading-none tracking-[0.02em] text-primary sm:text-3xl">Camliqa</span>
            </Link>

            <div className="flex items-center justify-end gap-3 text-primary/80">
              <button
                type="button"
                onClick={handleOpenAI}
                className="inline-flex items-center justify-center"
                aria-label="AI Beauty Advisor"
              >
                <span className={`camliqa-ai-icon-wrap flex h-8 w-8 items-center justify-center text-primary ${isAIActive ? "is-active" : ""}`}>
                  <IconSpark />
                </span>
              </button>
              <button 
                type="button" 
                onClick={openWishlist}
                className="relative transition hover:text-primary" 
                aria-label="Wishlist"
              >
                <IconHeart />
                {mounted && wishlist.length > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C5A059] px-1 text-[8px] font-bold leading-none text-white">
                    {wishlist.length}
                  </span>
                )}
              </button>
              <Link href="/cart" className="relative transition hover:text-primary" aria-label="Cart">
                <IconCart />
                {mounted && cartCount() > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[8px] font-bold leading-none text-white">
                    {cartCount()}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden items-center justify-between gap-2 lg:flex">
            <nav className="flex flex-[0_0_35%] items-center gap-4">
              {navLinks.map((link) => (
                link.href.startsWith("/") ? (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="relative whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/70 transition duration-500 hover:text-primary after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-secondary/70 after:transition-all after:duration-500 hover:after:w-full"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="relative whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/70 transition duration-500 hover:text-primary after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-secondary/70 after:transition-all after:duration-500 hover:after:w-full"
                  >
                    {link.label}
                  </a>
                )
              ))}
            </nav>

            <div className="flex flex-[0_0_30%] justify-center">
              <Link href="/" className="flex flex-col items-center">
                <span className="font-serif text-[2.2rem] leading-none tracking-[0.02em] text-primary sm:text-[2.4rem]">
                  Camliqa
                </span>
              </Link>
            </div>

            <div className="flex flex-[0_0_35%] items-center justify-end gap-4 text-primary/70">
              <button
                type="button"
                onClick={handleOpenAI}
                className="inline-flex items-center gap-1.5 rounded-full border border-secondary/20 bg-white/70 px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-primary/80 transition duration-300 hover:border-secondary/40 hover:text-primary lg:text-[10px]"
                aria-label="AI Beauty Advisor"
              >
                <span className={`camliqa-ai-icon-wrap flex h-4 w-4 items-center justify-center text-primary ${isAIActive ? "is-active" : ""}`}>
                  <IconSpark className="h-4 w-4" />
                </span>
                <span className="whitespace-nowrap">AI Beauty Advisor</span>
              </button>
              <button type="button" className="text-primary/55 transition hover:text-primary" aria-label="Search">
                <IconSearch className="h-4 w-4" />
              </button>
              {isHydrated ? (
                isAuthenticated ? (
                  <Link
                    href="/profile"
                    className="text-primary/55 transition hover:text-primary"
                    aria-label="Account"
                  >
                    <IconUser className="h-4 w-4" />
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary/70 transition hover:text-primary"
                    aria-label="Login"
                  >
                    Login
                  </Link>
                )
              ) : (
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] opacity-0" aria-hidden="true">
                  Login
                </div>
              )}
              <button
                type="button"
                onClick={openWishlist}
                className="relative text-primary/55 transition hover:text-primary"
                aria-label="Wishlist"
              >
                <IconHeart className="h-4 w-4" />
                {mounted && wishlist.length > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C5A059] px-1 text-[8px] font-bold leading-none text-white">
                    {wishlist.length}
                  </span>
                )}
              </button>
              <button type="button" onClick={openCart} className="relative text-primary/55 transition hover:text-primary" aria-label="Cart">
                <IconCart className="h-4 w-4" />
                {mounted && cartCount() > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[8px] font-bold leading-none text-white">
                    {cartCount()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-[70] bg-primary/35 backdrop-blur-sm lg:hidden"
            aria-label="Close menu overlay"
          />
          <aside className="fixed left-0 top-0 z-[71] h-full w-[86vw] max-w-[340px] border-r border-secondary/25 bg-[#F9F8FF] p-6 shadow-2xl lg:hidden">
            <div className="mb-8 flex items-center justify-between">
              <span className="font-serif text-2xl text-primary">Menu</span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/15 text-primary"
                aria-label="Close menu"
              >
                ×
              </button>
            </div>

            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-xl border border-primary/10 bg-white px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/80 transition hover:border-secondary/40 hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
              {isHydrated && (
                <Link
                  href={isAuthenticated ? "/profile" : "/login"}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-xl border border-primary/10 bg-white px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/80 transition hover:border-secondary/40 hover:text-primary"
                >
                  {isAuthenticated ? "MY ACCOUNT" : "LOGIN / SIGNUP"}
                </Link>
              )}
            </nav>
          </aside>
        </>
      )}
    </>
  );
}
