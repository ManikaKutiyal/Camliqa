"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Bell,
  CreditCard,
  LogOut,
  Package,
  UserRound,
  Heart,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { useWishlistStore } from "@/store/useWishlistStore";

const sectionTabs = [
  { id: "profile", label: "Profile", icon: UserRound, href: "/profile" },
  { id: "orders", label: "Orders", icon: Package, href: "/profile?tab=orders" },
  { id: "payments", label: "Payments", icon: CreditCard, href: "/profile?tab=payments" },
  { id: "notifications", label: "Notifications", icon: Bell, href: "/profile?tab=notifications" },
  { id: "wishlist", label: "Wishlist", icon: Heart, href: "#", isWishlistTrigger: true },
];

export default function ProfileSidebar({ activeSection }) {
  const { logout } = useAuth();
  const { openWishlist } = useWishlistStore();
  const searchParams = useSearchParams();

  return (
    <aside className="rounded-3xl border border-[var(--line)] bg-white/70 backdrop-blur-xl p-5 shadow-[0_18px_60px_rgba(108,63,197,0.04)] lg:sticky lg:top-24 lg:self-start transition-all duration-300 hover:shadow-[0_22px_70px_rgba(201,168,76,0.06)]">
      <div className="rounded-2xl bg-gradient-to-r from-[var(--surface)] to-white border border-[var(--line)] px-4 py-3.5 mb-5">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.25em] text-[var(--accent-secondary)]">My Account</p>
      </div>

      <nav className="space-y-1.5">
        {sectionTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;

          if (tab.isWishlistTrigger) {
            return (
              <button
                key={tab.id}
                type="button"
                onClick={openWishlist}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-[var(--muted-ink)] hover:bg-[var(--surface)] hover:text-[var(--accent-deep)] hover:border-l-4 hover:border-[var(--accent-secondary)] border-l-4 border-transparent transition-all duration-200"
              >
                <Icon className="h-4.5 w-4.5 text-[var(--accent-secondary)]" />
                {tab.label}
              </button>
            );
          }

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all duration-300 border-l-4 ${
                isActive
                  ? "bg-[var(--accent-primary)] text-white shadow-md shadow-[rgba(26,26,62,0.15)] border-l-4 border-[var(--accent-secondary)]"
                  : "text-[var(--muted-ink)] hover:bg-[var(--surface)] hover:text-[var(--accent-deep)] hover:border-l-4 hover:border-[var(--accent-secondary)] border-l-4 border-transparent"
              }`}
            >
              <Icon className={`h-4.5 w-4.5 transition-colors ${isActive ? "text-[var(--accent-secondary)]" : "text-[var(--muted-ink)]"}`} />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 pt-5 border-t border-[var(--line)]">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-rose-500 hover:bg-rose-50/50 hover:text-rose-600 transition-all duration-200"
        >
          <LogOut className="h-4.5 w-4.5" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
