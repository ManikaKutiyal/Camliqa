"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import ProfileDashboard from "@/components/ProfileDashboard";
import { useAuth } from "@/components/AuthContext";
import { fetchProfileDashboardData } from "@/services/profile";

export default function ProfilePage() {
  const { user, isHydrated, isAuthenticated } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    // Wait until the client auth state is resolved before deciding
    if (!isHydrated) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    let isActive = true;

    async function loadProfile() {
      try {
        const data = await fetchProfileDashboardData();

        if (!isActive) {
          return;
        }

        setProfileData({
          ...data,
          profile: {
            ...data.profile,
            name: user?.name || data.profile.name,
            email: user?.email || data.profile.email,
          },
        });
        setLoadError("");
      } catch (error) {
        if (!isActive) {
          return;
        }

        console.error("Failed to load profile dashboard:", error);
        setLoadError("We could not load your profile details right now.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadProfile();

      return () => {
      isActive = false;
    };
  }, [user, isHydrated, isAuthenticated]);

  return (
    <div className="relative px-4 py-10 sm:px-6 lg:px-8">
      {/* Ambient background accent */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(201,168,76,0.12),rgba(108,63,197,0.06),transparent)]" />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">

        {/* ── Header ── */}
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.05)] px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.25em] text-[var(--accent-secondary)]">
            Customer Account
          </span>
          <h1 className="text-[clamp(2.2rem,5vw,3.2rem)] font-serif font-medium leading-[1.06] tracking-tight text-[var(--accent-primary)]">
            My Profile
          </h1>
          <p className="max-w-xl text-[0.95rem] font-medium leading-relaxed text-[var(--muted-ink)]">
            Manage your details, saved addresses, orders, payments, and preferences — all from one place.
          </p>
        </div>

        {/* Wait for client auth to hydrate before showing the gate */}
        {!isHydrated || loading ? (
          <div className="rounded-3xl border border-[var(--line)] bg-white/90 px-6 py-10 text-center text-sm text-[var(--muted-ink)] shadow-[0_18px_60px_rgba(26,22,18,0.08)]">
            Loading profile dashboard...
          </div>
        ) : !isAuthenticated ? (
          <div className="rounded-3xl border border-[var(--line)] bg-white/60 backdrop-blur-md px-6 py-12 text-center text-sm text-[var(--muted-ink)] shadow-[0_18px_60px_rgba(108,63,197,0.04)] max-w-md mx-auto">
            <p className="mb-5 text-base font-medium text-[var(--accent-primary)]">Please login to view your profile dashboard and account details.</p>
            <Link href="/login?next=/profile" className="customer-primary-button w-full sm:w-auto">
              Login Now
            </Link>
          </div>
        ) : loadError ? (
          <div className="rounded-3xl border border-[#f2d1c4] bg-[#fff6f1] px-6 py-10 text-center text-sm text-[#8a4a34] shadow-[0_18px_60px_rgba(26,22,18,0.08)]">
            {loadError}
          </div>
        ) : !profileData ? (
          <div className="rounded-3xl border border-[var(--line)] bg-white/90 px-6 py-10 text-center text-sm text-[var(--muted-ink)] shadow-[0_18px_60px_rgba(26,22,18,0.08)]">
            Loading profile dashboard...
          </div>
        ) : (
          <ProfileDashboard initialData={profileData} />
        )}
      </div>
    </div>
  );
}

