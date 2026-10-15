"use client";

import React, { useRef } from 'react';
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import Image from 'next/image';

const steps = [
  {
    number: "01",
    title: "Share Your Story",
    description: "Tell us about your skin type, daily habits, and personal concerns.",
  },
  {
    number: "02",
    title: "We Listen & Analyze",
    description: "Our AI maps your unique profile against thousands of ingredient-skin interactions.",
  },
  {
    number: "03",
    title: "Your Ritual, Revealed",
    description: "Receive a bespoke routine of products handpicked for your biology and lifestyle.",
  },
];

export default function AISkinLab({ onOpenAI }) {
  const router = useRouter();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const handleOpenAI = (event) => {
    event?.preventDefault?.();
    if (typeof onOpenAI === "function") {
      onOpenAI();
    }
    router.push("/ai-beauty-advisor");
  };

  const imgY = useTransform(scrollYProgress, [0, 1], [25, -25]);

  return (
    <section ref={sectionRef} id="ai" className="relative overflow-hidden py-12 sm:py-28">
      {/* Ambient warm washes handled by global canvas */}

      <div className="section-shell relative z-10">
        {/* ─── Grid: Image left + Content right ─── */}
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.15fr] xl:gap-20">

          {/* ── Left: Editorial Image Composition ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex items-center justify-center"
          >
            {/* Main image */}
            <div className="group relative w-full max-w-[360px] overflow-hidden rounded-[2.5rem] border border-secondary/15 bg-white/60 shadow-[0_26px_70px_-52px_rgba(26,29,54,0.28)]">
              <motion.div style={{ y: imgY }} className="relative aspect-[3/4.2]">
                <Image
                  src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=85&w=900"
                  alt="Luxury skincare ritual consultation"
                  fill
                  className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-[1.03]"
                  priority
                />
              </motion.div>

              {/* Warm overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#f6f0e6]/40 via-transparent to-[#f7f3fb]/10" />

              {/* Inner thin frame */}
              <div className="pointer-events-none absolute inset-4 rounded-[2rem] border border-secondary/20" />
            </div>

            {/* Floating accent badge — top right of image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.7, delay: 1.2 }}
              className="absolute -right-2 top-[10%] z-20 sm:right-[-4%]"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-secondary/25 bg-white/80 shadow-[0_12px_40px_-28px_rgba(26,29,54,0.2)] backdrop-blur-xl">
                <div className="text-center">
                  <p className="font-serif text-[1.1rem] text-primary">30s</p>
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-secondary">Ritual</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right: Content + Timeline ── */}
          <div className="flex flex-col justify-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-6 inline-flex w-fit items-center gap-2.5 rounded-full border border-secondary/20 bg-secondary/10 px-4 py-1.5"
            >
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-secondary">AI Beauty Advisor</span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: 0.4 }}
              className="font-serif text-[1.8rem] leading-[1.1] text-primary sm:text-[2.2rem] lg:text-[2.4rem]"
            >
              Your Personal{" "}
              <br className="hidden sm:block" />
              <span className="italic text-secondary">Beauty Consultant</span>
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.55 }}
              className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-primary/60"
            >
              Our AI-powered chatbot guides you through a quick, thoughtful conversation about
              your skin — then curates a personalized ritual designed exclusively for you.
            </motion.p>

            {/* ── Elegant divider ── */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
              transition={{ duration: 1, delay: 0.7 }}
              className="my-10 flex items-center gap-4 origin-left max-w-[280px]"
            >
              <span className="h-[1px] flex-1 bg-gradient-to-r from-secondary/35 to-transparent" />
              <span className="h-1.5 w-1.5 rotate-45 border border-secondary/35" />
              <span className="h-[1px] flex-1 bg-gradient-to-l from-secondary/35 to-transparent" />
            </motion.div>

            {/* ── Process Steps ── */}
            <div className="space-y-0">
              {steps.map((step, idx) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: 24 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{
                    duration: 0.8,
                    delay: 0.8 + idx * 0.16,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="group relative flex gap-6"
                >
                  {/* Vertical timeline line + number */}
                  <div className="flex flex-col items-center">
                    <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-secondary/20 bg-white/90 transition-all duration-700 group-hover:border-secondary/45 group-hover:shadow-[0_0_24px_rgba(197,160,89,0.12)]">
                      <span className="font-serif text-[13px] text-secondary/55 transition-colors duration-500 group-hover:text-secondary">
                        {step.number}
                      </span>
                    </div>
                    {idx < steps.length - 1 && (
                      <motion.div
                        initial={{ scaleY: 0 }}
                        animate={isInView ? { scaleY: 1 } : {}}
                        transition={{ duration: 0.8, delay: 1.0 + idx * 0.2 }}
                        className="w-[1px] flex-1 origin-top bg-gradient-to-b from-secondary/25 to-secondary/10"
                        style={{ minHeight: "100%" }}
                      />
                    )}
                  </div>

                  {/* Step text */}
                  <div className="pb-10">
                    <h3 className="font-serif text-[1.1rem] text-primary/85 transition-colors duration-500 group-hover:text-primary">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 max-w-sm text-[0.88rem] leading-relaxed text-primary/45 transition-colors duration-500 group-hover:text-primary/60">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ── CTA ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 1.4 }}
              className="flex flex-wrap items-center gap-6"
            >
              <button
                type="button"
                onClick={handleOpenAI}
                className="group relative inline-flex items-center gap-4 overflow-hidden border border-primary bg-primary px-8 py-3.5 text-[10px] font-bold uppercase tracking-[0.35em] text-white transition-all duration-500 hover:bg-primary/90 hover:shadow-[0_14px_40px_-22px_rgba(26,29,54,0.25)]"
              >
                <span className="relative z-10">Begin Consultation</span>
                <span className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 text-xs transition-transform duration-500 group-hover:translate-x-0.5">
                  →
                </span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-secondary/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </button>
              <span className="text-[10px] tracking-[0.2em] text-primary/30 uppercase">
                Takes only 30 seconds
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
