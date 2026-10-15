"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Beaker,
  Droplets,
  Factory,
  Leaf,
  ShieldCheck,
  Sparkles,
  HeartHandshake,
  Rabbit,
  Recycle,
  Star
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GoldenDivider from "@/components/GoldenDivider";

const palette = {
  primary: "#1A1A3E",
  secondary: "#C5A059",
  accentSoft: "rgba(232,226,248,0.92)",
  background: "#F9F7FD"
};

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 }
};

function Section({ children, className = "", ...props }) {
  return (
    <section className={`section-shell py-20 sm:py-28 lg:py-32 ${className}`} {...props}>
      <div className="relative">
        {children}
      </div>
    </section>
  );
}

function Eyebrow({ children }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px w-6 bg-gradient-to-r from-secondary/60 to-transparent" />
      <p className="text-[10px] font-bold uppercase tracking-[0.62em] text-secondary">{children}</p>
    </div>
  );
}

function Stat({ label, value, icon: Icon }) {
  return (
    <div className="group relative overflow-hidden">
      <div
        className="absolute inset-0 rounded-2xl blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 -z-10"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(197,160,89,0.25), transparent 70%)"
        }}
      />
      <div className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-section/55 px-4 py-3 shadow-[0_18px_40px_-32px_rgba(26,29,54,0.35)] backdrop-blur-md transition-all duration-300 hover:shadow-[0_24px_60px_-28px_rgba(197,160,89,0.22)] hover:-translate-y-0.5 hover:border-secondary/20">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/60 transition-transform duration-300 group-hover:scale-110">
          <Icon className="h-5 w-5 text-secondary" strokeWidth={1.8} />
        </div>
        <div className="leading-tight">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary/55">{label}</p>
          <p className="mt-0.5 font-serif text-[1.2rem] text-primary">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ValueCard({ icon: Icon, title, children }) {
  return (
    <div
      className={[
        "group relative luxury-card overflow-hidden rounded-[24px] p-8 lg:p-9",
        "border-[rgba(26,26,62,0.10)] bg-white/60 backdrop-blur-sm",
        "shadow-[0_28px_60px_-32px_rgba(0,0,0,0.12)]",
        "hover:shadow-[0_40px_100px_-48px_rgba(197,160,89,0.28)]",
        "transition-all duration-300 ease-out hover:-translate-y-1"
      ].join(" ")}
    >
      <div
        className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full blur-3xl opacity-0 transition-opacity duration-700 group-hover:opacity-60"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(197,160,89,0.40), rgba(26,29,54,0.08) 60%, transparent 75%)"
        }}
      />
      <div className="relative flex items-start gap-4 z-10">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300 group-hover:scale-110"
          style={{
            borderColor: "rgba(26,26,62,0.15)",
            background:
              "linear-gradient(180deg, rgba(197,160,89,0.15) 0%, rgba(26,29,54,0.06) 100%)"
          }}
        >
          <Icon className="h-6 w-6 text-secondary" strokeWidth={1.6} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-[1.55rem] leading-tight" style={{ color: palette.primary }}>
            {title}
          </h3>
          <p className="mt-3 text-[0.98rem] leading-relaxed text-primary/70">
            {children}
          </p>
        </div>
      </div>
      <div
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r"
        style={{
          from: "transparent",
          to: "rgba(197,160,89,0.20)"
        }}
      />
    </div>
  );
}

function CertBadge({ icon: Icon, label }) {
  return (
    <div
      className="group relative flex items-center gap-3 rounded-2xl border bg-section/70 px-5 py-4 backdrop-blur-md transition-all duration-300 hover:shadow-[0_24px_60px_-28px_rgba(197,160,89,0.24)] hover:-translate-y-0.5 hover:bg-section/85 cursor-pointer"
      style={{
        borderColor: "rgba(26,26,62,0.10)",
        boxShadow: "0 18px 40px -30px rgba(0,0,0,0.12)"
      }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300 group-hover:scale-110"
        style={{
          borderColor: "rgba(26,26,62,0.12)",
          background:
            "linear-gradient(180deg, rgba(197,160,89,0.12) 0%, rgba(26,29,54,0.05) 100%)"
        }}
      >
        <Icon className="h-5 w-5" style={{ color: palette.primary }} strokeWidth={1.6} />
      </div>
      <p className="text-[0.95rem] font-medium text-primary/85">
        {label}
      </p>
      <div
        className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 blur-lg -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(197,160,89,0.20), transparent 70%)"
        }}
      />
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="camliqa-aurora min-h-screen bg-base text-primary antialiased selection:bg-secondary/25 selection:text-primary">
      <Navbar />

      {/* Hero */}
      <section
        className="grain-overlay relative isolate overflow-hidden"
        style={{
          background:
            "radial-gradient(circle_at_14%_18%,rgba(244,234,219,0.9)_0%,rgba(244,234,219,0)_28%),radial-gradient(circle_at_82%_18%,rgba(232,226,248,0.92)_0%,rgba(232,226,248,0)_26%),linear-gradient(90deg,#f5eddc_0%,#fcfbf9_52%,#f2ecfb_100%)"
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(circle at 22% 12%, rgba(26,29,54,0.08) 0%, transparent 40%), radial-gradient(circle at 78% 38%, rgba(232,226,248,0.55) 0%, transparent 42%)"
          }}
        />

        <div className="section-shell relative z-10 grid items-center gap-12 py-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] lg:gap-16 lg:py-28">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            variants={fadeUp}
          >
            <Eyebrow>Minimal formulas. Maximum care.</Eyebrow>
            <h1 className="mt-6 font-serif text-[3.2rem] leading-[1.2] tracking-tight sm:mt-0 sm:text-[4.4rem] sm:leading-[1.02] lg:text-[5.2rem]">
              <span className="text-primary">Our Story</span>
            </h1>
            <p
              className="mt-8 max-w-xl text-[1.02rem] leading-relaxed sm:text-[1.08rem]"
              style={{ color: "rgba(26,26,62,0.74)" }}
            >
              We build skincare the way it should feel: calm, intentional, and beautifully effective—formulated with
              transparency, tested with care, and designed to elevate everyday ritual.
            </p>

            <div className="mt-11 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/products"
                className="group relative inline-flex w-full items-center justify-center rounded-full px-8 py-4 text-[12px] font-bold uppercase tracking-[0.24em] text-white transition-all hover:scale-[1.03] active:scale-95 sm:w-auto overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(26,29,54,1) 0%, rgba(26,29,54,0.92) 100%)",
                  boxShadow: "0 20px 50px rgba(26,29,54,0.25)"
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative">Shop Now</span>
              </Link>
              <a
                href="#values"
                className="group inline-flex w-full items-center justify-center rounded-full border px-8 py-4 text-[12px] font-bold uppercase tracking-[0.24em] transition-all duration-300 hover:bg-secondary/5 hover:shadow-[0_12px_30px_rgba(197,160,89,0.18)] hover:-translate-y-0.5 sm:w-auto"
                style={{ borderColor: "rgba(26,26,62,0.25)", color: palette.primary }}
              >
                Our Values
              </a>
            </div>

            <div className="mt-10 grid gap-3 sm:max-w-xl sm:grid-cols-3">
              <Stat label="Made In" value="Bangalore" icon={Factory} />
              <Stat label="Standard" value="GMP" icon={BadgeCheck} />
              <Stat label="Rated" value="4.8/5" icon={Star} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.05 }}
            className="relative mx-auto w-full max-w-[420px]"
          >
            <div
              className="absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl"
              style={{ background: "rgba(232,226,248,0.65)" }}
            />
            <div
              className="absolute -left-10 -bottom-12 h-32 w-32 rounded-full blur-2xl"
              style={{ background: "rgba(197,160,89,0.22)" }}
            />

            <div
              className="relative overflow-hidden rounded-[28px] border bg-section/65 backdrop-blur-xl group transition-all duration-500 hover:shadow-[0_50px_120px_-40px_rgba(197,160,89,0.30)] hover:border-secondary/20"
              style={{
                borderColor: "rgba(26,26,62,0.10)",
                boxShadow: "0 40px 90px -46px rgba(26,26,62,0.35)"
              }}
            >
              <div className="absolute inset-0 pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
              <Image
                src="https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&q=80&w=1200"
                alt="Minimal skincare textures and bottles"
                width={900}
                height={1100}
                className="h-[480px] w-full object-cover sm:h-[560px] transition-transform duration-500 group-hover:scale-105"
                priority
              />
              <div
                className="pointer-events-none absolute left-6 top-6 hidden h-20 w-20 rounded-[26px] border bg-white/40 shadow-[0_28px_80px_-52px_rgba(26,29,54,0.55)] backdrop-blur-xl sm:block"
                style={{ borderColor: "rgba(26,29,54,0.12)" }}
              />
              <div
                className="pointer-events-none absolute right-7 top-24 hidden h-14 w-14 rounded-full border bg-white/35 shadow-[0_28px_80px_-52px_rgba(26,29,54,0.55)] backdrop-blur-xl sm:block"
                style={{ borderColor: "rgba(197,160,89,0.20)" }}
              />
              <div
                className="absolute inset-x-0 bottom-0 p-6"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(248,246,242,0) 0%, rgba(248,246,242,0.88) 55%, rgba(248,246,242,0.98) 100%)"
                }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { label: "Cruelty Free", Icon: Rabbit },
                    { label: "Paraben Free", Icon: Droplets },
                    { label: "Sulfate Free", Icon: Sparkles },
                    { label: "Vegan", Icon: Leaf }
                  ].map(({ label, Icon }) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em]"
                      style={{
                        borderColor: "rgba(26,26,62,0.12)",
                        color: "rgba(26,26,62,0.72)",
                        backgroundColor: "rgba(255,255,255,0.65)"
                      }}
                    >
                      <Icon className="h-4 w-4 text-secondary" strokeWidth={1.8} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Founding Story */}
      <Section id="story">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          variants={fadeUp}
          className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16"
        >
          <div>
            <Eyebrow>How It All Began</Eyebrow>
            <motion.h2 
              className="mt-6 font-serif text-[2.4rem] leading-tight sm:text-[2.9rem]" 
              style={{ color: palette.primary }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              A quiet frustration became a deliberate craft.
            </motion.h2>
            <motion.p 
              className="mt-7 max-w-xl text-[1.02rem] leading-relaxed text-primary/70"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              We started with one belief: skincare should feel calm and obvious—clear labels, quiet confidence, and
              formulas that do what they promise.
            </motion.p>

            <div className="mt-8 space-y-5 border-l border-primary/10 pl-6">
              {[
                {
                  title: "A real problem",
                  desc: "Sensitive skin didn’t need more steps—just better ingredients and barrier-first intent.",
                  Icon: ShieldCheck
                },
                {
                  title: "A visible gap",
                  desc: "Minimal, high-performance products without the noise of vague claims or harsh shortcuts.",
                  Icon: Beaker
                },
                {
                  title: "A personal ritual",
                  desc: "Slow formulation—batch by batch—until every texture felt refined and restorative.",
                  Icon: HeartHandshake
                }
              ].map(({ title, desc, Icon }) => (
                <div key={title} className="relative">
                  <span className="absolute -left-[33px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-primary/10 bg-base shadow-[0_10px_28px_-18px_rgba(26,29,54,0.45)]">
                    <Icon className="h-3.5 w-3.5 text-secondary" strokeWidth={2} />
                  </span>
                  <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-primary/60">{title}</p>
                  <p className="mt-2 text-[1.02rem] leading-relaxed text-primary/70">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div
              className="absolute -inset-6 rounded-[34px] blur-2xl"
              style={{
                background:
                  "radial-gradient(circle at 20% 20%, rgba(197,160,89,0.22), transparent 55%), radial-gradient(circle at 78% 62%, rgba(232,226,248,0.22), transparent 55%)"
              }}
            />
            <div
              className="relative overflow-hidden rounded-[28px] border bg-section/60 shadow-[0_40px_95px_-55px_rgba(26,26,62,0.35)] backdrop-blur-xl group transition-all duration-500 hover:shadow-[0_50px_120px_-45px_rgba(197,160,89,0.28)] hover:border-secondary/20"
              style={{ borderColor: "rgba(26,26,62,0.10)" }}
            >
              <Image
                src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=1600"
                alt="Clean, minimal skincare product photography"
                width={1200}
                height={900}
                className="h-[320px] w-full object-cover sm:h-[420px] transition-transform duration-500 group-hover:scale-105"
              />
              <div className="p-7 sm:p-8">
                <div className="grid gap-5 sm:grid-cols-3">
                  {[
                    { label: "Problem", value: "Overcomplicated skincare", Icon: ShieldCheck },
                    { label: "Gap", value: "Minimal + effective formulas", Icon: Beaker },
                    { label: "Inspiration", value: "Barrier-first rituals", Icon: HeartHandshake }
                  ].map(({ label, value, Icon }) => (
                    <motion.div
                      key={label}
                      className="group/card relative rounded-2xl border bg-gradient-to-br from-white/40 to-white/20 p-5 backdrop-blur-md transition-all duration-300 hover:shadow-[0_16px_40px_-20px_rgba(197,160,89,0.20)] hover:border-secondary/30 hover:from-white/50 hover:to-white/30 overflow-hidden cursor-pointer"
                      style={{ borderColor: "rgba(26,26,62,0.12)" }}
                      whileHover={{ y: -3 }}
                    >
                      <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full blur-xl opacity-0 group-hover/card:opacity-40 bg-secondary/30 transition-opacity duration-300" />
                      <div className="relative z-10 flex items-center gap-2">
                        <Icon className="h-4 w-4 text-secondary transition-transform duration-300 group-hover/card:scale-110" strokeWidth={1.8} />
                        <p
                          className="text-[11px] font-bold uppercase tracking-[0.26em] text-primary/70"
                        >
                          {label}
                        </p>
                      </div>
                      <p className="mt-3 font-serif text-[1.15rem] text-primary">
                        {value}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Section>


      {/* Founder */}
      <Section className="pt-0">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          variants={fadeUp}
          className="mx-auto max-w-5xl"
        >
          <div
            className="group golden-wash relative overflow-hidden rounded-[28px] border bg-gradient-to-br from-white/60 to-white/50 p-9 shadow-[0_44px_100px_-55px_rgba(26,26,62,0.30)] backdrop-blur-xl sm:p-11 transition-all duration-300 hover:shadow-[0_50px_120px_-48px_rgba(197,160,89,0.25)] hover:border-secondary/20"
            style={{ borderColor: "rgba(26,26,62,0.10)" }}
          >
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: palette.accentSoft }}
            />
            <div className="relative flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:gap-10">
              <div className="relative h-[128px] w-[128px] shrink-0 overflow-hidden rounded-full ring-4 ring-white/60 shadow-[0_26px_60px_-18px_rgba(26,26,62,0.20)]">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ boxShadow: "inset 0 2px 8px rgba(255,255,255,0.6)" }}
                />
                <Image
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=900"
                  alt="Founder portrait"
                  width={320}
                  height={280}
                  className="h-full w-full rounded-full object-cover"
                />
              </div>

              <div className="flex-1">
                <Eyebrow>Founder</Eyebrow>
                <h3 className="mt-4 font-serif text-[2.1rem] leading-tight" style={{ color: palette.primary }}>
                  Aanya Mehra
                </h3>
                <p className="mt-1 text-[0.95rem] font-semibold uppercase tracking-[0.22em] text-accentSecondary">
                  Founder &amp; Chief Formulator
                </p>
                <p className="mt-6 text-[1.02rem] leading-relaxed" style={{ color: "rgba(26,26,62,0.72)" }}>
                  With a background in cosmetic chemistry and a lifelong love for minimalist design, Aanya builds formulas
                  that are gentle by default, clinical in intent, and luxurious in texture—so your routine feels effortless.
                </p>

                <div className="mt-7 flex items-center gap-4">
                  <div className="h-px flex-1 bg-primary/10" />
                  <p className="font-serif text-[1.05rem] italic text-primary/80">— Aanya</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Section>


      {/* Values */}
      <Section id="values">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          variants={fadeUp}
        >
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow>Our Values</Eyebrow>
            <motion.h2 
              className="mt-6 font-serif text-[2.6rem] leading-tight sm:text-[3.1rem]" 
              style={{ color: palette.primary }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              The standards behind every bottle.
            </motion.h2>
            <motion.p 
              className="mt-5 text-[1.02rem] leading-relaxed" 
              style={{ color: "rgba(26,26,62,0.72)" }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Thoughtful formulations, honest communication, and responsible choices—so your skincare feels as good as it
              looks.
            </motion.p>
          </div>

          <div className="mt-16 grid gap-7 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            <ValueCard icon={Droplets} title="Purity">
              Clean, purposeful ingredients—no unnecessary fillers, no fragrance overload, no harsh compromises.
            </ValueCard>
            <ValueCard icon={BadgeCheck} title="Transparency">
              Clear labels, real percentages, and straightforward routines you can trust from day one.
            </ValueCard>
            <ValueCard icon={Recycle} title="Sustainability">
              Responsible sourcing and mindful packaging choices designed to reduce impact—quietly, consistently.
            </ValueCard>
            <ValueCard icon={Beaker} title="Efficacy">
              Barrier-first, results-forward formulas backed by modern cosmetic science and careful testing.
            </ValueCard>
            <ValueCard icon={Sparkles} title="Sensory Luxury">
              Silky textures, fast-absorbing finishes, and a ritual that feels premium every time you use it.
            </ValueCard>
            <ValueCard icon={ShieldCheck} title="Integrity">
              Gentle by design, strict on quality, and committed to doing what’s right—even when it’s harder.
            </ValueCard>
          </div>
        </motion.div>
      </Section>


      {/* Manufacturing & Quality */}
      <Section>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          variants={fadeUp}
          className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16"
        >
          <div>
            <Eyebrow>Quality You Can Trust</Eyebrow>
            <motion.h2 
              className="mt-6 font-serif text-[2.6rem] leading-tight sm:text-[3.1rem]" 
              style={{ color: palette.primary }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Crafted with care. Verified with rigor.
            </motion.h2>
            <motion.p 
              className="mt-6 text-[1.02rem] leading-relaxed" 
              style={{ color: "rgba(26,26,62,0.72)" }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Every batch is developed and produced in a GMP-certified facility in Bangalore, India—where precise
              processes and strict controls ensure consistency, purity, and performance.
            </motion.p>

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {[
                {
                  title: "GMP-Certified Manufacturing",
                  desc: "Controlled environments, validated processes, and documented traceability.",
                  Icon: Factory
                },
                {
                  title: "Ingredient Integrity",
                  desc: "Supplier screening and formulation standards built for sensitive skin.",
                  Icon: Beaker
                },
                {
                  title: "Stability & Safety Testing",
                  desc: "Temperature, time, and packaging stress tests for real-world reliability.",
                  Icon: ShieldCheck
                },
                {
                  title: "Batch-Level Quality Checks",
                  desc: "Appearance, pH, viscosity, and microbiology checks before release.",
                  Icon: BadgeCheck
                }
              ].map(({ title, desc, Icon }) => (
                <div
                  key={title}
                  className="group relative rounded-[24px] border bg-white/55 p-6 shadow-[0_24px_60px_-36px_rgba(26,26,62,0.22)] backdrop-blur-md transition-all duration-300 hover:shadow-[0_32px_80px_-44px_rgba(197,160,89,0.26)] hover:-translate-y-0.5 hover:border-secondary/20 hover:bg-white/65 overflow-hidden"
                  style={{ borderColor: "rgba(26,26,62,0.10)" }}
                >
                  <div
                    className="absolute -right-12 -top-12 h-40 w-40 rounded-full blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-50"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 50%, rgba(197,160,89,0.30), transparent 70%)"
                    }}
                  />
                  <div className="flex items-start gap-3 relative z-10">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-transform duration-300 group-hover:scale-110"
                      style={{
                        borderColor: "rgba(26,26,62,0.12)",
                        background:
                          "linear-gradient(180deg, rgba(197,160,89,0.15) 0%, rgba(26,29,54,0.06) 100%)"
                      }}
                    >
                      <Icon className="h-5 w-5" style={{ color: palette.primary }} strokeWidth={1.6} />
                    </div>
                    <div>
                      <p className="font-serif text-[1.35rem] leading-tight" style={{ color: palette.primary }}>
                        {title}
                      </p>
                      <p className="mt-2 text-[0.98rem] leading-relaxed text-primary/75">
                        {desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div
              className="group relative rounded-[28px] border bg-gradient-to-br from-white/65 to-white/55 p-8 shadow-[0_44px_100px_-58px_rgba(26,26,62,0.30)] backdrop-blur-xl sm:p-10 transition-all duration-300 hover:shadow-[0_50px_120px_-50px_rgba(197,160,89,0.25)] hover:border-secondary/20 overflow-hidden"
              style={{ borderColor: "rgba(26,26,62,0.10)" }}
            >
              <div
                className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-40"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(197,160,89,0.25), transparent 70%)"
                }}
              />
              <div className="relative z-10">
                <h3 className="font-serif text-[2rem] leading-tight" style={{ color: palette.primary }}>
                  Clean commitments
                </h3>
                <p className="mt-4 text-[1.02rem] leading-relaxed text-primary/75">
                  Formulated to meet modern expectations—without sacrificing elegance.
                </p>

                <div className="mt-9 grid gap-4">
                  {[
                    { label: "Cruelty Free", Icon: Rabbit },
                    { label: "Organic", Icon: Leaf },
                    { label: "Paraben Free", Icon: Droplets },
                    { label: "Sulfate Free", Icon: Sparkles }
                  ].map(({ label, Icon }) => (
                    <div
                      key={label}
                      className="group/item flex items-center justify-between rounded-[20px] border bg-white/50 px-5 py-4 transition-all duration-300 hover:bg-white/70 hover:shadow-[0_16px_40px_-22px_rgba(197,160,89,0.20)] hover:-translate-y-0.5 hover:border-secondary/25 cursor-pointer"
                      style={{ borderColor: "rgba(26,26,62,0.08)" }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-2xl transition-transform duration-300 group-hover/item:scale-110"
                          style={{
                            background:
                              "linear-gradient(180deg, rgba(197,160,89,0.15) 0%, rgba(26,29,54,0.06) 100%)"
                          }}
                        >
                          <Icon className="h-5 w-5" style={{ color: palette.primary }} strokeWidth={1.6} />
                        </div>
                        <p className="text-[0.98rem] font-semibold text-primary/90">
                          {label}
                        </p>
                      </div>
                      <BadgeCheck className="h-5 w-5 text-secondary transition-transform duration-300 group-hover/item:scale-110" strokeWidth={1.8} />
                    </div>
                  ))}
                </div>
              </div>
	            </div>
	          </div>
	        </motion.div>
	      </Section>

      {/* Certifications */}
      <Section>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          variants={fadeUp}
          className="mx-auto max-w-6xl"
        >
          <div className="text-center">
            <Eyebrow>Certifications</Eyebrow>
            <motion.h2 
              className="mt-6 font-serif text-[2.6rem] leading-tight sm:text-[3.1rem]" 
              style={{ color: palette.primary }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Clinically mindful, cruelty-conscious.
            </motion.h2>
            <motion.p 
              className="mt-5 text-[1.02rem] leading-relaxed" 
              style={{ color: "rgba(26,26,62,0.72)" }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              We keep our standards visible—so you can choose with confidence.
            </motion.p>
          </div>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {[
              { icon: ShieldCheck, label: "Dermatologist Tested", delay: 0 },
              { icon: Rabbit, label: "Cruelty-Free", delay: 0.05 },
              { icon: Droplets, label: "Paraben-Free", delay: 0.1 },
              { icon: Sparkles, label: "Sulphate-Free", delay: 0.15 },
              { icon: Leaf, label: "Vegan", delay: 0.2 },
              { icon: Factory, label: "GMP Manufacturing", delay: 0.25 }
            ].map(({ icon, label, delay }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.4, delay, ease: "easeOut" }}
              >
                <CertBadge icon={icon} label={label} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* CTA */}
      <section className="section-shell pb-20 sm:pb-24 lg:pb-28">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          variants={fadeUp}
          className="group relative overflow-hidden rounded-[28px] border p-10 text-center backdrop-blur-xl sm:p-16 transition-all duration-300 hover:shadow-[0_50px_120px_-45px_rgba(26,29,54,0.40)] hover:-translate-y-0.5"
          style={{
            borderColor: "rgba(197,160,89,0.25)",
            background:
              "linear-gradient(135deg, rgba(26,29,54,0.95) 0%, rgba(26,29,54,0.84) 50%, rgba(197,160,89,0.32) 100%)",
            boxShadow: "0 44px 100px -60px rgba(26,29,54,0.55)"
          }}
        >
          <div
            className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"
            style={{ background: "rgba(197,160,89,0.35)" }}
          />
          <div
            className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"
            style={{ background: "rgba(249,248,255,0.25)" }}
          />

          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.62em]" style={{ color: "rgba(255,255,255,0.80)" }}>
              A ritual worth keeping
            </p>
            <h2 className="mt-7 font-serif text-[2.8rem] leading-tight text-white sm:text-[3.3rem]">
              Experience skincare that truly cares
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-[1.05rem] leading-relaxed" style={{ color: "rgba(255,255,255,0.82)" }}>
              Discover formulas made for calm confidence—clean, clinical, and quietly luxurious from the first application.
            </p>

            <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row sm:gap-3">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Link
                  href="/products"
                  className="group/btn relative inline-flex w-full items-center justify-center rounded-full bg-white px-8 py-4 text-[12px] font-bold uppercase tracking-[0.24em] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(0,0,0,0.32)] active:translate-y-0 sm:w-auto overflow-hidden"
                  style={{ color: palette.primary }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary/0 via-secondary/10 to-secondary/0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                  <span className="relative">Shop Now</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <a
                  href="/"
                  className="group/btn inline-flex w-full items-center justify-center rounded-full border px-8 py-4 text-[12px] font-bold uppercase tracking-[0.24em] text-white/95 transition-all duration-300 hover:bg-white/15 hover:border-white/60 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.20)] sm:w-auto"
                  style={{ borderColor: "rgba(255,255,255,0.35)" }}
                >
                  Back to Home
                </a>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
