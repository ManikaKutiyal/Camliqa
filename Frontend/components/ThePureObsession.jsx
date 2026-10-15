"use client";

import React from "react";
import { motion } from "framer-motion";
import Reveal from "@/components/Reveal";

/* ─── SVG Icons ─── */
function PureIcon({ kind }) {
  const cls = "h-5 w-5 text-secondary";
  switch (kind) {
    case "shield-check":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case "drops":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-9-10.5-9-10.5-9 5.944-9 10.5 4.03 8.25 9 8.25z" />
        </svg>
      );
    case "leaf":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 20S2 13 8 7c4-4 12-5 12-5s1 8-3 12c-6 6-13 4-13 4z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 20L12 12" />
        </svg>
      );
    case "heart":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      );
    case "star":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      );
    case "leaf-outline":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 14.5c0-6.2 6.2-9.8 14-10-.2 8-3.8 14-10 14-2.2 0-4-1.8-4-4Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16c3-2.5 6.1-4.6 10.5-6.4" />
        </svg>
      );
    case "check-circle":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "sparkles":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      );
    case "flame":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
        </svg>
      );
    default:
      return null;
  }
}

/* ─── Data ─── */
const featuresTop = [
  { label: "Paraben Free",     icon: "shield-check" },
  { label: "Sulfate Free",     icon: "drops"        },
  { label: "100% Organic",     icon: "leaf"         },
  { label: "Cruelty Free",     icon: "heart"        },
  { label: "Derm Tested",      icon: "star"         },
];

const featuresBottom = [
  { label: "100% Vegan",       icon: "leaf-outline" },
  { label: "All Skin Types",   icon: "check-circle" },
  { label: "Toxin Free",       icon: "sparkles"     },
  { label: "Ethically Sourced",icon: "flame"        },
];

const stats = [
  { value: "0",   unit: "%", label: "Synthetic Fragrance" },
  { value: "100", unit: "%", label: "Plant-Based"         },
  { value: "10K", unit: "+", label: "Happy Customers"     },
  { value: "0",   unit: "",  label: "Animal Testing"      },
];

/* ─── Single Badge ─── */
function FeatureBadge({ feat, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col items-center gap-4"
    >
      {/* Circle */}
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-secondary/20 bg-white/70 shadow-[0_4px_20px_rgba(197,160,89,0.07)] backdrop-blur-sm transition-all duration-500 group-hover:border-secondary/45 group-hover:shadow-[0_6px_28px_rgba(197,160,89,0.18)] group-hover:scale-110">
        {/* Subtle inner ring */}
        <div className="absolute inset-[5px] rounded-full border border-secondary/10 transition-all duration-500 group-hover:border-secondary/25" />
        <PureIcon kind={feat.icon} />
      </div>

      {/* Label */}
      <span className="text-center text-[9.5px] font-semibold uppercase tracking-[0.22em] text-primary/55 transition-colors duration-300 group-hover:text-secondary/80 sm:text-[10px]">
        {feat.label}
      </span>
    </motion.div>
  );
}

/* ─── Main ─── */
export default function ThePureObsession() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      <div className="section-shell relative z-10 mx-auto max-w-4xl px-4 sm:px-8">

        {/* Header */}
        <div className="mb-14 flex flex-col items-center text-center">
          <Reveal>
            <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-secondary sm:text-[11px]">
              The Pure Ethos
            </p>
            <h2 className="mt-4 font-serif text-[2rem] leading-tight text-primary sm:text-[2.6rem]">
              The Pure <span className="italic text-secondary">Obsession</span>
            </h2>

            {/* Tagline */}
            <p className="mt-5 font-serif text-[1.05rem] italic text-primary/40 sm:text-[1.15rem]">
              Nothing compromised.{" "}
              <span className="text-secondary/60 not-italic font-semibold tracking-wide">Everything pure.</span>
            </p>

            <div className="mt-6 flex items-center justify-center gap-3 opacity-20">
              <span className="h-px w-8 bg-secondary" />
              <div className="h-1 w-1 rotate-45 bg-secondary" />
              <span className="h-px w-8 bg-secondary" />
            </div>
          </Reveal>
        </div>

        {/* Row 1 — 5 badges */}
        <div className="flex w-full flex-wrap justify-center gap-x-10 gap-y-9 sm:gap-x-14 md:gap-x-20">
          {featuresTop.map((feat, i) => (
            <FeatureBadge key={feat.label} feat={feat} index={i} />
          ))}
        </div>

        {/* Thin divider */}
        <div className="mx-auto my-10 h-px w-24 bg-gradient-to-r from-transparent via-secondary/25 to-transparent" />

        {/* Row 2 — 4 badges */}
        <div className="flex w-full flex-wrap justify-center gap-x-10 gap-y-9 sm:gap-x-14 md:gap-x-20">
          {featuresBottom.map((feat, i) => (
            <FeatureBadge key={feat.label} feat={feat} index={i + 5} />
          ))}
        </div>

      </div>

      {/* ── Full-bleed Stat Strip ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7, delay: 0.25 }}
        className="mt-14 w-full border-y border-secondary/18 bg-white/50 backdrop-blur-sm"
      >
        <div className="grid grid-cols-2 divide-x divide-secondary/15 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group flex flex-col items-center gap-1 px-6 py-7 text-center transition-colors duration-300 hover:bg-secondary/5 sm:px-10"
            >
              <p className="font-serif text-[1.8rem] leading-none text-primary transition-colors duration-300 group-hover:text-secondary sm:text-[2.2rem]">
                {stat.value}
                <span className="text-secondary/60 text-[1.3rem]">{stat.unit}</span>
              </p>
              <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.3em] text-primary/40">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
