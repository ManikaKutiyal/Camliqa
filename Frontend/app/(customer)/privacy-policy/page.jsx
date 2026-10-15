"use client";

import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ShieldCheck,
  Lock,
  Cookie,
  Database,
  Eye,
  FileText,
  Globe,
  RefreshCcw,
  Mail,
  Phone,
  MapPin,
  Sparkles,
} from "lucide-react";

function PageAtmosphere() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#FAF9FF] via-[#F7F3FF] to-[#FBFAFF]" />

      <motion.div
        animate={{
          x: [0, 80, 0],
          y: [0, 40, 0],
          opacity: [0.15, 0.28, 0.15],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[5%] left-[10%] w-[520px] h-[520px] bg-[#C5A059]/20 blur-[140px] rounded-full"
      />

      <motion.div
        animate={{
          x: [0, -120, 0],
          y: [0, 100, 0],
          opacity: [0.12, 0.22, 0.12],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[35%] right-[5%] w-[620px] h-[620px] bg-[#C5A059]/15 blur-[160px] rounded-full"
      />

      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.12, 0.22, 0.12],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[10%] left-[20%] w-[420px] h-[420px] bg-[#6B42AA]/10 blur-[120px] rounded-full"
      />
    </div>
  );
}

const sections = [
  {
    number: "01",
    title: "Information We Collect",
    icon: <Database size={24} />,
    content:
      "We collect personal information such as your name, email address, phone number, shipping address, and payment-related details to process your orders and improve your experience.",
  },

  {
    number: "02",
    title: "How We Use Your Information",
    icon: <ShieldCheck size={24} />,
    content:
      "Your information helps us process orders, provide customer support, personalize experiences, improve services, and communicate updates or promotional offers.",
  },

  {
    number: "03",
    title: "Cookies & Tracking",
    icon: <Cookie size={24} />,
    content:
      "We use cookies and analytics technologies to enhance browsing, remember preferences, and better understand how visitors interact with our website.",
  },

  {
    number: "04",
    title: "Sharing Information",
    icon: <Eye size={24} />,
    content:
      "We never sell your personal information. Data may only be shared with trusted payment, shipping, or technical service providers required to operate our business.",
  },

  {
    number: "05",
    title: "Data Security",
    icon: <Lock size={24} />,
    content:
      "We implement strong security practices and technical safeguards to protect your information against unauthorized access or misuse.",
  },

  {
    number: "06",
    title: "Your Rights",
    icon: <FileText size={24} />,
    content:
      "You may request access, correction, deletion, or limitation of your personal data at any time by contacting our support team.",
  },

  {
    number: "07",
    title: "Data Retention",
    icon: <Database size={24} />,
    content:
      "We retain information only as long as necessary for legal, operational, or customer service purposes.",
  },

  {
    number: "08",
    title: "Third-Party Links",
    icon: <Globe size={24} />,
    content:
      "Our website may contain external links. We are not responsible for the privacy practices of third-party websites.",
  },

  {
    number: "09",
    title: "Children's Privacy",
    icon: <ShieldCheck size={24} />,
    content:
      "Camliqa does not knowingly collect personal information from individuals under 18 years of age.",
  },

  {
    number: "10",
    title: "Policy Updates",
    icon: <RefreshCcw size={24} />,
    content:
      "We may update this Privacy Policy periodically. Changes will always be reflected on this page with updated dates.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAF9FF]">
      <PageAtmosphere />
      <Navbar />

      <main className="relative z-10 text-[#1A1A3E] antialiased">
        {/* HERO */}
        <section className="relative overflow-hidden py-32 sm:py-40">
          <div className="section-shell relative z-10">
            <div className="mx-auto max-w-6xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C5A059]/20 bg-white/50 px-5 py-2 text-sm backdrop-blur-xl">
                <ShieldCheck size={15} className="text-[#C5A059]" />

                <span className="tracking-wide text-[#1A1A3E]/70">
                  Camliqa International
                </span>
              </div>

              <h1 className="font-serif text-[4rem] leading-[0.95] tracking-tight text-[#1A1A3E] sm:text-7xl lg:text-[7rem]">
                Privacy{" "}
                <span className="italic font-light opacity-60">Policy</span>
              </h1>

              <p className="mx-auto mt-8 max-w-3xl text-[15px] leading-9 tracking-[0.04em] text-[#1A1A3E]/60 sm:text-lg">
                Your trust is sacred to us. Discover how Camliqa carefully
                protects, manages, and respects your personal information across
                every interaction.
              </p>

              <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
                <div className="rounded-full border border-white/40 bg-white/60 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.25em] text-[#1A1A3E]/50 backdrop-blur-xl">
                  Effective May 2025
                </div>

                <div className="rounded-full border border-white/40 bg-white/60 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.25em] text-[#1A1A3E]/50 backdrop-blur-xl">
                  Reviewed May 2026
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENTS */}
        <section className="pb-16">
          <div className="section-shell">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/40 bg-white/50 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.06)] backdrop-blur-2xl md:p-12">
              <div className="mb-10 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C5A059]/10 text-[#C5A059]">
                  <FileText size={24} />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C5A059]">
                    Navigation
                  </p>

                  <h2 className="mt-2 font-serif text-4xl text-[#1A1A3E]">
                    Contents
                  </h2>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {sections.map((item) => (
                  <a
                    key={item.number}
                    href={`#section-${item.number}`}
                    className="group relative overflow-hidden rounded-3xl border border-white/40 bg-white/40 p-5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-[#C5A059]/30 hover:bg-white/70 hover:shadow-[0_20px_40px_rgba(197,160,89,0.12)]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C5A059]/10 text-[#C5A059]">
                        {item.number}
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-[0.25em] text-[#1A1A3E]/40">
                          Section
                        </p>

                        <h3 className="mt-1 text-lg font-medium text-[#1A1A3E]">
                          {item.title}
                        </h3>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* POLICY SECTIONS */}
        <section className="pb-24">
          <div className="section-shell">
            <div className="space-y-10">
              {sections.map((section) => (
                <motion.div
                  key={section.number}
                  id={`section-${section.number}`}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="group relative overflow-hidden rounded-[2.5rem] border border-white/50 bg-white/45 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)] backdrop-blur-2xl transition-all duration-700 hover:-translate-y-1 hover:border-[#C5A059]/25 hover:bg-white/60 md:p-12"
                >
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
                    <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#C5A059]/10 blur-[120px]" />
                  </div>

                  <div className="relative z-10">
                    <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-[1.8rem] border border-white/40 bg-white/70 text-[#C5A059] shadow-[0_20px_40px_rgba(197,160,89,0.15)] backdrop-blur-xl">
                        {section.icon}
                      </div>

                      <div>
                        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.45em] text-[#C5A059]">
                          SECTION {section.number}
                        </p>

                        <h2 className="font-serif text-4xl leading-tight text-[#1A1A3E]">
                          {section.title}
                        </h2>
                      </div>
                    </div>

                    <p className="max-w-4xl text-[15px] leading-9 text-[#1A1A3E]/65 sm:text-lg">
                      {section.content}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section className="relative pb-28">
          <div className="section-shell">
            <div className="relative overflow-hidden rounded-[2.2rem] sm:rounded-[3rem] border border-[#C5A059]/20 bg-[#1A1A3E] px-5 py-10 sm:p-10 md:p-16 lg:p-20 text-white">
              <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[#C5A059]/20 blur-[120px]" />
              <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#6B42AA]/20 blur-[120px]" />

              <div className="relative z-10">
                <div className="max-w-3xl">
                  <p className="mb-4 text-[10px] font-black uppercase tracking-[0.45em] text-[#C5A059]">
                    SECTION 11
                  </p>

                  <h2 className="font-serif text-4xl leading-tight sm:text-5xl">
                    Contact Us
                  </h2>

                  <p className="mt-6 max-w-2xl text-[15px] leading-8 text-white/65 sm:text-base">
                    If you have questions regarding this Privacy Policy or your
                    personal data, our team is always here to assist you.
                  </p>
                </div>

<div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {[
    {
      icon: <Mail size={18} />,
      title: "Email",
      text: "camliqainternational@gmail.com",
    },

    {
      icon: <Phone size={18} />,
      title: "Phone",
      text: "+91 96767 58943",
    },

    {
      icon: <MapPin size={18} />,
      title: "Address",
      text: "Visakhapatnam, Andhra Pradesh",
    },
  ].map((item, idx) => (
    <div
      key={idx}
      className="group h-full rounded-[1.6rem] border border-white/10 bg-white/[0.06] p-4 sm:p-5 backdrop-blur-xl transition-all duration-500 hover:border-[#C5A059]/20 hover:bg-white/[0.09]"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex h-10 w-10 sm:h-11 sm:w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#C5A059]/10 text-[#C5A059]">
          {item.icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.28em] text-[#C5A059]/80">
            {item.title}
          </p>

          <p className="mt-2 break-words text-[13px] leading-6 text-white/65 sm:text-sm sm:leading-7">
            {item.text}
          </p>
        </div>
      </div>
    </div>
  ))}
</div>

                <div className="mt-16 border-t border-white/10 pt-8 text-center text-sm tracking-wide text-white/40">
                  © 2026 Camliqa International. All Rights Reserved.
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}