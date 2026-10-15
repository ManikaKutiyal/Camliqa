"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "./Reveal";

const InnerCircle = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | already | error
  const [message, setMessage] = useState("");

  const handleJoin = async () => {
    const trimmed = email.trim();
    if (!trimmed) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json();

      if (!res.ok || data.status === "error") {
        setStatus("error");
        setMessage(data.message || "Something went wrong. Please try again.");
        return;
      }

      // Distinguish "already subscribed" vs new
      if (data.message?.toLowerCase().includes("already")) {
        setStatus("already");
      } else {
        setStatus("success");
      }
      setMessage(data.message || "Welcome to the Circle.");
    } catch {
      setStatus("error");
      setMessage("Could not connect. Please check your connection and try again.");
    }
  };

  const isJoined = status === "success" || status === "already";

  return (
    <section id="inner-circle" className="relative overflow-hidden py-20 sm:py-28 lg:py-48">
      {/* Backdrop */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
          }}
        >
          <div className="absolute inset-0 bg-primary/5 backdrop-blur-[2px]" />
        </div>

        {/* Cinematic Ambient Glows */}
        <div className="absolute -left-1/4 top-1/4 h-[800px] w-[800px] rounded-full bg-secondary/10 blur-[140px] pointer-events-none" />
        <div className="absolute -right-1/4 top-0 h-[700px] w-[700px] rounded-full bg-[#6C3FC5]/12 blur-[140px] pointer-events-none" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[1000px] w-[1000px] rounded-full bg-[#6C3FC5]/5 blur-[160px] pointer-events-none" />
      </div>

      <div className="section-shell relative z-10 mx-auto max-w-5xl px-4 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
          {/* Left — headline */}
          <Reveal>
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.45em] text-secondary sm:mb-8 sm:text-[10px] sm:tracking-[0.8em]">
                Exclusive Invitation
              </p>
              <h2 className="font-serif text-[2.4rem] leading-[1.05] text-primary sm:text-[3.5rem] lg:text-[5.5rem] tracking-tight">
                The <span className="italic text-secondary">Inner</span> Circle.
              </h2>
              <p className="mt-6 max-w-[340px] text-[0.95rem] leading-relaxed text-primary/60 italic font-light sm:mt-8 sm:max-w-lg sm:text-[1.15rem]">
                A sanctuary for the discerning. Bespoke rituals, private revelations, and the alchemy of our latest innovations—delivered directly to your sanctuary.
              </p>
            </div>
          </Reveal>

          {/* Right — form / confirmation */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {isJoined ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center text-center lg:items-start lg:text-left gap-3"
                >
                  <p className="font-serif text-[1.8rem] italic text-secondary sm:text-3xl">
                    {status === "already"
                      ? "You're already in the Circle"
                      : "Welcome to the Circle"}
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-primary/40 sm:text-[10px] sm:tracking-[0.4em]">
                    {status === "already"
                      ? "You are already subscribed"
                      : "The ritual has begun"}
                  </p>
                  {message && (
                    <p className="text-[12px] text-primary/50 mt-1">{message}</p>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col gap-8 sm:gap-10"
                >
                  <div className="relative group">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === "error") setStatus("idle");
                      }}
                      placeholder="Your email address"
                      disabled={status === "loading"}
                      className={`w-full bg-white/40 border rounded-2xl px-6 py-5 text-[1rem] text-primary placeholder-primary/25 outline-none transition-all font-serif italic text-center focus:bg-white/60 sm:rounded-none sm:bg-transparent sm:border-0 sm:border-b sm:px-0 sm:py-6 sm:text-xl sm:text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                        status === "error"
                          ? "border-red-300 focus:border-red-400"
                          : "border-primary/10 focus:border-secondary/50"
                      }`}
                      onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                    />
                    <button
                      onClick={handleJoin}
                      disabled={status === "loading" || !email.trim()}
                      className="mt-6 mx-auto flex w-fit rounded-full bg-primary px-12 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-white shadow-xl transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed sm:mx-0 sm:mt-0 sm:absolute sm:right-0 sm:bottom-6 sm:w-auto sm:bg-transparent sm:py-0 sm:text-secondary sm:shadow-none sm:tracking-[0.4em] sm:rounded-none sm:border-0 sm:hover:text-primary sm:group-hover:translate-x-1"
                    >
                      {status === "loading" ? (
                        <span className="flex items-center gap-2">
                          <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Joining...
                        </span>
                      ) : (
                        "Join Ritual"
                      )}
                    </button>
                  </div>

                  {/* Error message */}
                  {status === "error" && message && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[11px] text-red-500/80 text-center sm:text-left -mt-4"
                    >
                      {message}
                    </motion.p>
                  )}

                  <div className="flex items-center justify-center gap-4 sm:justify-start sm:gap-6">
                    <span className="h-px w-8 bg-primary/10" />
                    <p className="whitespace-nowrap text-[8px] uppercase tracking-[0.22em] text-primary/30 sm:text-[9px] sm:tracking-[0.3em]">
                      Privately Curated • No Spam
                    </p>
                    <span className="h-px w-8 bg-primary/10 flex-1 hidden sm:block" />
                    <span className="h-px w-8 bg-primary/10 sm:hidden" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Decorative vertical line */}
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 h-24 w-px bg-gradient-to-t from-secondary/40 to-transparent" />
    </section>
  );
};

export default InnerCircle;
