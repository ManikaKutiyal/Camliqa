"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
 Mail,
 Phone,
 MapPin,
 Clock,
 Send,
 BadgeCheck,
 ChevronDown,
 Share2,
 PlayCircle,
 AtSign,
 MessagesSquare,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const palette = {
 primary: "#1A1A3E",
 secondary: "#C5A059",
 accentSoft: "rgba(232,226,248,0.92)",
};

const fadeUp = {
 hidden: { opacity: 0, y: 22 },
 show: { opacity: 1, y: 0 },
};

function Section({ children, className = "", ...props }) {
 return (
 <section
 className={`section-shell py-20 sm:py-28 lg:py-32 ${className}`}
 {...props}
 >
 <div className="relative">{children}</div>
 </section>
 );
}

function Eyebrow({ children, center = false }) {
 return (
 <div className={`flex items-center gap-3 ${center ? "justify-center" : ""}`}>
 <div className="h-px w-6 bg-gradient-to-r from-secondary/60 to-transparent" />
 <p className="text-[10px] font-bold uppercase tracking-[0.62em] text-secondary">
 {children}
 </p>
 </div>
 );
}

const faqs = [
 {
 q: "How long does shipping take?",
 a: "Standard delivery takes 3–5 business days across India. Express options are available at checkout for select pincodes.",
 },
 {
 q: "Are your products suitable for sensitive skin?",
 a: "Yes — all our formulas are barrier-first and dermatologist-tested, designed specifically with sensitive and reactive skin in mind.",
 },
 {
 q: "Can I return a product if it doesn't suit me?",
 a: "We offer a 15-day return policy on unopened products. For opened products that cause irritation, reach out and we'll work something out.",
 },
 {
 q: "Do you ship internationally?",
 a: "Not yet, but we're working on it! Currently we ship across all major cities and towns in India.",
 },
 {
 q: "How do I know which products are right for me?",
 a: "Drop us a message with your skin concerns and we'll personally recommend a routine that fits — no algorithm, just real advice.",
 },
];

function FAQItem({ q, a }) {
 const [open, setOpen] = useState(false);
 return (
 <div
 onClick={() => setOpen(!open)}
 className={[
 "group relative rounded-[20px] border bg-white/55 backdrop-blur-md",
 "overflow-hidden cursor-pointer transition-all duration-300",
 open
 ? "border-secondary/30 shadow-[0_24px_60px_-28px_rgba(197,160,89,0.18)]"
 : "border-primary/10 hover:border-secondary/20 hover:shadow-[0_18px_40px_-24px_rgba(197,160,89,0.14)]",
 ].join(" ")}
 >
 <div className="flex items-center justify-between gap-4 px-6 py-5">
 <p className="font-serif text-[1.05rem] text-primary">{q}</p>
 <ChevronDown
 className="h-4 w-4 shrink-0 text-secondary transition-transform duration-300"
 style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
 strokeWidth={2}
 />
 </div>
 <div
 className="overflow-hidden transition-all duration-300"
 style={{ maxHeight: open ? "200px" : "0px" }}
 >
 <p className="px-6 pb-6 text-[0.97rem] leading-relaxed text-primary/70">
 {a}
 </p>
 </div>
 </div>
 );
}

const inputBase =
 "w-full rounded-2xl border bg-white/55 px-5 py-4 text-[0.97rem] text-primary placeholder:text-primary/30 backdrop-blur-md outline-none transition-all duration-300 hover:border-primary/20";

export default function ContactPage() {
 const [form, setForm] = useState({
 name: "",
 email: "",
 subject: "",
 message: "",
 });
 const [focused, setFocused] = useState(null);
 const [submitted, setSubmitted] = useState(false);

 const handleChange = (e) =>
 setForm({ ...form, [e.target.name]: e.target.value });

 const inputStyle = (field) => ({
 borderColor:
 focused === field ? "rgba(197,160,89,0.50)" : "rgba(26,26,62,0.12)",
 boxShadow:
 focused === field
 ? "0 0 0 3px rgba(197,160,89,0.10), 0 18px 40px -22px rgba(197,160,89,0.18)"
 : "0 12px 28px -18px rgba(26,26,62,0.10)",
 });

 const handleSubmit = (e) => {
 e.preventDefault();
 setSubmitted(true);
 };

 return (
 <main className="camliqa-aurora min-h-screen bg-base text-primary antialiased selection:bg-secondary/25 selection:text-primary">
 <Navbar />

 {/* ── Hero ── */}
 <section
 className="grain-overlay relative isolate overflow-hidden"
 style={{
 background:
 "radial-gradient(circle_at_14%_18%,rgba(244,234,219,0.9)_0%,rgba(244,234,219,0)_28%),radial-gradient(circle_at_82%_18%,rgba(232,226,248,0.92)_0%,rgba(232,226,248,0)_26%),linear-gradient(90deg,#f5eddc_0%,#fcfbf9_52%,#f2ecfb_100%)",
 }}
 >
 <div
 className="pointer-events-none absolute inset-0 opacity-50"
 style={{
 background:
 "radial-gradient(circle at 22% 12%, rgba(26,29,54,0.08) 0%, transparent 40%), radial-gradient(circle at 78% 38%, rgba(232,226,248,0.55) 0%, transparent 42%)",
 }}
 />

 <div className="section-shell relative z-10 py-20 lg:py-28">
 <motion.div
 initial="hidden"
 whileInView="show"
 viewport={{ once: true, amount: 0.4 }}
 transition={{ duration: 0.8, ease: "easeOut" }}
 variants={fadeUp}
 className="mx-auto max-w-2xl text-center"
 >
 <Eyebrow center>We'd love to hear from you</Eyebrow>
 <h1 className="mt-6 font-serif text-[3.2rem] leading-[1.2] tracking-tight sm:text-[4.4rem] sm:leading-[1.02] lg:text-[5rem]">
 <span className="text-primary">Get in Touch</span>
 </h1>
 <p
 className="mt-8 mx-auto max-w-xl text-[1.02rem] leading-relaxed sm:text-[1.08rem]"
 style={{ color: "rgba(26,26,62,0.74)" }}
 >
 Questions about your order, your skin, or our formulas — we're
 here, and we actually reply.
 </p>
 </motion.div>

 {/* Quick-contact chips */}
 <motion.div
 initial={{ opacity: 0, y: 16 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.7, delay: 0.2 }}
 className="mt-10 flex flex-wrap justify-center gap-3"
 >
 {[
 { icon: Mail, label: "hello@camliqa.com" },
 { icon: Phone, label: "+91 98765 43210" },
 { icon: Clock, label: "Mon–Sat, 10am–6pm IST" },
 ].map(({ icon: Icon, label }) => (
 <div
 key={label}
 className="inline-flex items-center gap-2 rounded-full border bg-white/65 px-5 py-2.5 text-[0.9rem] font-medium text-primary/78 backdrop-blur-md shadow-[0_12px_30px_-14px_rgba(26,26,62,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-18px_rgba(197,160,89,0.18)] hover:border-secondary/20"
 style={{ borderColor: "rgba(26,26,62,0.10)" }}
 >
 <Icon className="h-4 w-4 text-secondary" strokeWidth={1.8} />
 {label}
 </div>
 ))}
 </motion.div>
 </div>
 </section>

 {/* ── Form + Info Grid ── */}
 <Section>
 <motion.div
 initial="hidden"
 whileInView="show"
 viewport={{ once: true, amount: 0.2 }}
 transition={{ duration: 0.75, ease: "easeOut" }}
 variants={fadeUp}
 className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14"
 >
 {/* ── Contact Form Card ── */}
 <div
 className="group relative overflow-hidden rounded-[28px] border bg-white/60 p-9 shadow-[0_44px_100px_-55px_rgba(26,26,62,0.28)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_50px_120px_-48px_rgba(197,160,89,0.22)] hover:border-secondary/20 sm:p-10"
 style={{ borderColor: "rgba(26,26,62,0.10)" }}
 >
 <div
 className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-40"
 style={{ background: palette.accentSoft }}
 />

 <div className="relative z-10">
 <Eyebrow>Send a Message</Eyebrow>

 {submitted ? (
 <motion.div
 initial={{ opacity: 0, scale: 0.96 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.45 }}
 className="flex flex-col items-center py-10 text-center"
 >
 <div
 className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border"
 style={{
 borderColor: "rgba(197,160,89,0.30)",
 background:
 "linear-gradient(135deg, rgba(197,160,89,0.15) 0%, rgba(26,29,54,0.06) 100%)",
 }}
 >
 <BadgeCheck
 className="h-7 w-7 text-secondary"
 strokeWidth={1.6}
 />
 </div>
 <h3 className="font-serif text-[2rem] text-primary">
 Message Received
 </h3>
 <p className="mt-3 max-w-xs text-[0.97rem] leading-relaxed text-primary/65">
 Thank you for reaching out. Our team will get back to you
 within 24 hours.
 </p>
 <button
 onClick={() => {
 setSubmitted(false);
 setForm({ name: "", email: "", subject: "", message: "" });
 }}
 className="mt-8 rounded-full border px-8 py-3 text-[11px] font-bold uppercase tracking-[0.22em] transition-all duration-300 hover:bg-secondary/5 hover:border-secondary/30"
 style={{
 borderColor: "rgba(26,26,62,0.20)",
 color: palette.primary,
 }}
 >
 Send Another
 </button>
 </motion.div>
 ) : (
 <>
 <h2
 className="mt-4 font-serif text-[2.2rem] leading-tight"
 style={{ color: palette.primary }}
 >
 Write to us
 </h2>
 <p className="mt-2 text-[0.97rem] leading-relaxed text-primary/65">
 We respond within 24 hours on working days.
 </p>

 <form onSubmit={handleSubmit} className="mt-8 space-y-5">
 <div className="grid gap-5 sm:grid-cols-2">
 <div>
 <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.26em] text-primary/55">
 Your Name
 </label>
 <input
 type="text"
 name="name"
 value={form.name}
 onChange={handleChange}
 onFocus={() => setFocused("name")}
 onBlur={() => setFocused(null)}
 placeholder="Priya Sharma"
 required
 className={inputBase}
 style={inputStyle("name")}
 />
 </div>
 <div>
 <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.26em] text-primary/55">
 Email Address
 </label>
 <input
 type="email"
 name="email"
 value={form.email}
 onChange={handleChange}
 onFocus={() => setFocused("email")}
 onBlur={() => setFocused(null)}
 placeholder="priya@email.com"
 required
 className={inputBase}
 style={inputStyle("email")}
 />
 </div>
 </div>

 <div>
 <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.26em] text-primary/55">
 Subject
 </label>
 <select
 name="subject"
 value={form.subject}
 onChange={handleChange}
 onFocus={() => setFocused("subject")}
 onBlur={() => setFocused(null)}
 className={inputBase}
 style={inputStyle("subject")}
 >
 <option value="">Choose a topic…</option>
 <option>Order Query</option>
 <option>Skin Consultation</option>
 <option>Returns &amp; Refunds</option>
 <option>Partnership</option>
 <option>Other</option>
 </select>
 </div>

 <div>
 <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.26em] text-primary/55">
 Message
 </label>
 <textarea
 name="message"
 value={form.message}
 onChange={handleChange}
 onFocus={() => setFocused("message")}
 onBlur={() => setFocused(null)}
 rows={5}
 placeholder="Tell us what's on your mind…"
 required
 className={inputBase}
 style={{ ...inputStyle("message"), resize: "none" }}
 />
 </div>

 <motion.button
 type="submit"
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.97 }}
 className="group/btn relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-full px-8 py-4 text-[12px] font-bold uppercase tracking-[0.24em] text-white transition-all duration-300 hover:shadow-[0_28px_70px_rgba(26,26,62,0.32)]"
 style={{
 background:
 "linear-gradient(135deg, rgba(26,29,54,1) 0%, rgba(26,29,54,0.92) 100%)",
 boxShadow: "0 20px 50px rgba(26,29,54,0.22)",
 }}
 >
 <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity duration-500 group-hover/btn:opacity-100" />
 <Send className="relative h-4 w-4" strokeWidth={1.8} />
 <span className="relative">Send Message</span>
 </motion.button>
 </form>
 </>
 )}
 </div>
 </div>

 {/* ── Contact Info ── */}
 <div className="flex flex-col gap-5">
 <Eyebrow>Contact Details</Eyebrow>
 <h2
 className="font-serif text-[2.2rem] leading-tight"
 style={{ color: palette.primary }}
 >
 Find us here
 </h2>
 <p className="text-[0.97rem] leading-relaxed text-primary/65">
 Reach out on any channel that suits you best.
 </p>

 <div className="mt-2 space-y-4">
 {[
 { icon: Mail, label: "Email", value: "hello@camliqa.com" },
 { icon: Phone, label: "Phone", value: "+91 98765 43210" },
 {
 icon: MapPin,
 label: "Studio",
 value: "Koramangala, Bangalore — 560034",
 },
 {
 icon: Clock,
 label: "Hours",
 value: "Mon–Sat · 10:00am – 6:00pm IST",
 },
 ].map(({ icon: Icon, label, value }) => (
 <div
 key={label}
 className="group flex items-start gap-4 rounded-[20px] border bg-white/55 p-5 backdrop-blur-md transition-all duration-300 hover:border-secondary/20 hover:shadow-[0_20px_48px_-24px_rgba(197,160,89,0.18)] hover:-translate-y-0.5"
 style={{ borderColor: "rgba(26,26,62,0.10)" }}
 >
 <div
 className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-transform duration-300 group-hover:scale-110"
 style={{
 borderColor: "rgba(26,26,62,0.12)",
 background:
 "linear-gradient(180deg, rgba(197,160,89,0.15) 0%, rgba(26,29,54,0.06) 100%)",
 }}
 >
 <Icon
 className="h-5 w-5"
 style={{ color: palette.primary }}
 strokeWidth={1.6}
 />
 </div>
 <div>
 <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-primary/55">
 {label}
 </p>
 <p className="mt-1 text-[0.97rem] text-primary/85">{value}</p>
 </div>
 </div>
 ))}
 </div>

 {/* Social Buttons */}
 <div className="mt-1">
 <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.26em] text-primary/55">
 Follow Along
 </p>
 <div className="grid grid-cols-3 gap-3">
 {[
 {
 icon: AtSign,
 label: "Instagram",
 href: "https://www.instagram.com",
 },
 {
 icon: MessagesSquare,
 label: "WhatsApp",
 href: "https://www.whatsapp.com",
 },
 {
 icon: PlayCircle,
 label: "YouTube",
 href: "https://www.youtube.com",
 },
 ].map(({ icon: Icon, label, href }) => (
 <Link
 key={label}
 href={href}
 target="_blank"
 rel="noopener noreferrer"
 className="group flex items-center justify-center gap-2 rounded-[16px] border bg-white/50 py-3.5 text-[12px] font-semibold text-primary/75 backdrop-blur-md transition-all duration-300 cursor-pointer hover:border-secondary/25 hover:shadow-[0_16px_40px_-20px_rgba(197,160,89,0.18)] hover:-translate-y-0.5 hover:bg-white/70"
 style={{ borderColor: "rgba(26,26,62,0.10)" }}
 >
 <Icon
 className="h-4 w-4 text-secondary transition-transform duration-300 group-hover:scale-110"
 strokeWidth={1.8}
 />
 {label}
 </Link>
 ))}
 </div>
 </div>
 </div>
 </motion.div>
 </Section>

 {/* ── FAQ ── */}
 <Section className="pt-0">
 <motion.div
 initial="hidden"
 whileInView="show"
 viewport={{ once: true, amount: 0.2 }}
 transition={{ duration: 0.75, ease: "easeOut" }}
 variants={fadeUp}
 className="mx-auto max-w-3xl"
 >
 <div className="text-center">
 <Eyebrow center>Quick Answers</Eyebrow>
 <h2
 className="mt-6 font-serif text-[2.6rem] leading-tight sm:text-[3.1rem]"
 style={{ color: palette.primary }}
 >
 Frequently asked questions
 </h2>
 <p className="mt-4 text-[0.97rem] leading-relaxed text-primary/65">
 The things most people want to know, answered simply.
 </p>
 </div>

 <div className="mt-12 space-y-4">
 {faqs.map((faq) => (
 <FAQItem key={faq.q} {...faq} />
 ))}
 </div>
 </motion.div>
 </Section>

 {/* ── CTA Band ── */}
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
 boxShadow: "0 44px 100px -60px rgba(26,29,54,0.55)",
 }}
 >
 <div
 className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full blur-3xl opacity-40 transition-opacity duration-500 group-hover:opacity-60"
 style={{ background: "rgba(197,160,89,0.35)" }}
 />
 <div
 className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full blur-3xl opacity-30 transition-opacity duration-500 group-hover:opacity-50"
 style={{ background: "rgba(249,248,255,0.25)" }}
 />

 <div className="relative z-10">
 <p
 className="text-[10px] font-bold uppercase tracking-[0.62em]"
 style={{ color: "rgba(255,255,255,0.80)" }}
 >
 A ritual worth keeping
 </p>
 <h2 className="mt-7 font-serif text-[2.8rem] leading-tight text-white sm:text-[3.3rem]">
 Ready to begin your ritual?
 </h2>
 <p
 className="mx-auto mt-6 max-w-2xl text-[1.05rem] leading-relaxed"
 style={{ color: "rgba(255,255,255,0.82)" }}
 >
 Discover formulas made for calm confidence — clean, clinical, and
 quietly luxurious from the first application.
 </p>

 <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row sm:gap-3">
 <motion.div
 whileHover={{ scale: 1.03 }}
 whileTap={{ scale: 0.98 }}
 className="w-full sm:w-auto"
 >
 <Link
 href="/products"
 className="group/btn relative inline-flex w-full items-center justify-center overflow-hidden rounded-full bg-white px-8 py-4 text-[12px] font-bold uppercase tracking-[0.24em] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(0,0,0,0.32)] sm:w-auto"
 style={{ color: palette.primary }}
 >
 <div className="absolute inset-0 bg-gradient-to-r from-secondary/0 via-secondary/10 to-secondary/0 opacity-0 transition-opacity duration-500 group-hover/btn:opacity-100" />
 <span className="relative">Shop Now</span>
 </Link>
 </motion.div>
 <motion.div
 whileHover={{ scale: 1.03 }}
 whileTap={{ scale: 0.98 }}
 className="w-full sm:w-auto"
 >
 <Link
 href="/"
 className="inline-flex w-full items-center justify-center rounded-full border px-8 py-4 text-[12px] font-bold uppercase tracking-[0.24em] text-white/95 transition-all duration-300 hover:bg-white/15 hover:border-white/60 hover:-translate-y-1 sm:w-auto"
 style={{ borderColor: "rgba(255,255,255,0.35)" }}
 >
 Back to Home
 </Link>
 </motion.div>
 </div>
 </div>
 </motion.div>
 </section>

 <Footer />
 </main>
 );
}