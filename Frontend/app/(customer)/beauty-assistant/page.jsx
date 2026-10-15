"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const SUGGESTED_QUESTIONS = [
  "What's best for dry, sensitive skin?",
  "How do I build a morning skincare routine?",
  "Which ingredients help with hyperpigmentation?",
  "Can I use Vitamin C and Retinol together?",
  "What's the best hair care routine for frizzy hair?",
];

const BEAUTY_KNOWLEDGE = {
  "dry": "For dry, sensitive skin I recommend layering hydration:\n\n1. **Gentle Cleanser** – Avoid sulfates. Use a cream or oil-based cleanser.\n2. **Hyaluronic Acid Serum** – Apply to damp skin for triple-depth hydration.\n3. **Ceramide Moisturiser** – Locks in moisture and restores the skin barrier.\n4. **SPF 30+ Sunscreen** – Daily protection prevents further moisture loss.\n\nFrom the Camliqa line, our **Hyaluronic Acid** and **Ceramides** formulations are specifically designed for this concern. Would you like product recommendations?",
  "morning": "Here's a dermatologist-approved morning routine:\n\n**Step 1 – Cleanse** (60 sec gentle cleanse)\n**Step 2 – Tone** (optional, balances pH)\n**Step 3 – Vitamin C Serum** (antioxidant protection, brightens)\n**Step 4 – Eye Cream** (apply with ring finger, gently)\n**Step 5 – Moisturise** (hydrate and seal)\n**Step 6 – SPF** (non-negotiable, even indoors)\n\nConsistency is key — results typically appear after 4–6 weeks of daily use.",
  "hyperpigmentation": "For hyperpigmentation, these clinically-proven ingredients are most effective:\n\n- **Vitamin C** – Stabilised antioxidant that inhibits melanin production\n- **Niacinamide** – Clinical-grade B3 that reduces dark spots and evens tone\n- **Retinol** – Accelerates cell turnover to fade post-inflammatory pigmentation\n- **AHAs (Glycolic/Lactic Acid)** – Exfoliate and reveal fresher skin\n\nPatience is essential — allow 8–12 weeks for visible improvement. Always pair with SPF as these ingredients increase sun sensitivity.",
  "vitamin c retinol": "Yes, but with care! Here's how to combine them safely:\n\n**Option 1 – AM/PM Split (Easiest)**\n- Morning: Vitamin C + SPF\n- Evening: Retinol\n\n**Option 2 – Alternate Nights**\n- Night 1: Vitamin C\n- Night 2: Retinol\n\n**Why they can conflict:** Vitamin C works best at a low pH, while Retinol can be destabilised at low pH. Layering directly may cause irritation.\n\nCamliqa's **Encapsulated Retinol** is formulated to minimise irritation, making it gentler for combination use.",
  "frizzy hair": "For frizzy hair, the key is moisture balance and barrier repair:\n\n**Routine:**\n1. **Sulphate-free Shampoo** – 2–3x per week max\n2. **Deep Conditioning Mask** – Weekly, focus on mid-lengths to ends\n3. **Leave-in Conditioner** – Apply to damp hair before styling\n4. **Hair Oil (Serum)** – Seal the cuticle, add shine\n\n**Key Ingredients to look for:**\n- Argan or Jojoba Oil\n- Keratin\n- Panthenol (Pro-Vitamin B5)\n\nCamliqa's **Hair Ritual** line is formulated to reduce breakage and restore smooth, glossy lengths.",
};

function getBotResponse(userMessage) {
  const msg = userMessage.toLowerCase();

  if (msg.includes("dry") || msg.includes("sensitive")) return BEAUTY_KNOWLEDGE["dry"];
  if (msg.includes("morning") || msg.includes("routine")) return BEAUTY_KNOWLEDGE["morning"];
  if (msg.includes("hyperpigmentation") || msg.includes("dark spot") || msg.includes("pigment")) return BEAUTY_KNOWLEDGE["hyperpigmentation"];
  if ((msg.includes("vitamin c") && msg.includes("retinol")) || msg.includes("together") || msg.includes("combine")) return BEAUTY_KNOWLEDGE["vitamin c retinol"];
  if (msg.includes("frizz") || msg.includes("hair")) return BEAUTY_KNOWLEDGE["frizzy hair"];

  return "Thank you for your question! As your Camliqa Beauty Assistant, I specialise in skincare and haircare advice based on our clinically-backed formulations.\n\nCould you tell me more about your specific concern? For example:\n- Your skin type (dry, oily, combination, sensitive)\n- The concern you'd like to address\n- Your current routine\n\nI'm here to guide you to your most radiant self. ✨";
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C5A059]/10 border border-[#C5A059]/20">
        <span className="text-sm">✦</span>
      </div>
      <div className="rounded-2xl rounded-bl-sm bg-white/70 border border-[#1A1D36]/8 px-5 py-4 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-[#C5A059]/60"
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";

  // Simple markdown bold parser
  const formatText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold text-[#1A1D36]">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const renderContent = (text) =>
    text.split("\n").map((line, i) => (
      <span key={i}>
        {formatText(line)}
        {i < text.split("\n").length - 1 && <br />}
      </span>
    ));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`flex items-end gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
          isUser
            ? "bg-[#1A1D36] text-white"
            : "bg-[#C5A059]/10 border border-[#C5A059]/20"
        }`}
      >
        {isUser ? "U" : "✦"}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[75%] rounded-2xl px-5 py-4 text-[0.9rem] leading-relaxed shadow-sm ${
          isUser
            ? "rounded-br-sm bg-[#1A1D36] text-white/90"
            : "rounded-bl-sm bg-white/70 border border-[#1A1D36]/8 text-[#1A1D36]/85 backdrop-blur-sm"
        }`}
        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
      >
        {renderContent(msg.content)}
      </div>
    </motion.div>
  );
}

export default function BeautyAssistantPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Welcome to your Camliqa Beauty Assistant. ✦\n\nI'm here to guide you with personalised skincare and haircare advice, ritual recommendations, and ingredient insights — all grounded in clinical expertise.\n\nWhat can I help you discover today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setIsTyping(true);

    // Simulate thinking delay
    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 800));

    const response = getBotResponse(userText);
    setIsTyping(false);
    setMessages((prev) => [...prev, { role: "assistant", content: response }]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <main
      className="min-h-screen antialiased"
      style={{ backgroundColor: "#FDFBF8", fontFamily: "'Cormorant Garamond', Georgia, serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Cinzel:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-10 sm:pt-36 sm:pb-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_50%_0%,rgba(197,160,89,0.08),transparent_60%)]" />
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-[#C5A059] sm:text-[10px]">
              Powered by Clinical Intelligence
            </p>
            <h1
              className="mt-4 text-[2.4rem] font-normal leading-tight text-[#1A1D36] sm:text-[3.5rem]"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Your <span className="italic text-[#C5A059]">Beauty</span> Assistant
            </h1>
            <p className="mt-5 text-[1rem] leading-relaxed text-[#1A1D36]/60 sm:text-[1.1rem]">
              Ask anything about skincare rituals, ingredients, routines, or haircare. Personalised guidance, beautifully delivered.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Chat Container */}
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        {/* Suggested Questions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-6 flex flex-wrap gap-2 justify-center"
        >
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="rounded-full border border-[#C5A059]/30 bg-white/60 px-4 py-2 text-[0.75rem] text-[#1A1D36]/70 backdrop-blur-sm transition hover:border-[#C5A059]/70 hover:bg-[#C5A059]/5 hover:text-[#1A1D36]"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              {q}
            </button>
          ))}
        </motion.div>

        {/* Messages */}
        <div
          className="relative rounded-3xl border border-[#1A1D36]/8 shadow-[0_20px_60px_-20px_rgba(26,29,54,0.08)] overflow-hidden"
          style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.85) 0%, rgba(248,246,242,0.9) 100%)" }}
        >
          {/* Ambient glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_circle_at_80%_20%,rgba(197,160,89,0.05),transparent_50%)]" />

          {/* Messages area */}
          <div className="relative flex flex-col gap-6 overflow-y-auto px-5 py-7 sm:px-8 sm:py-10" style={{ minHeight: "420px", maxHeight: "520px" }}>
            <AnimatePresence>
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} />
              ))}
              {isTyping && <TypingIndicator />}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          {/* Divider */}
          <div className="border-t border-[#1A1D36]/6" />

          {/* Input area */}
          <div className="relative px-5 py-4 sm:px-8 sm:py-5">
            <div className="flex items-end gap-3">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your skin, hair, or a ritual..."
                className="flex-1 resize-none rounded-2xl border border-[#1A1D36]/10 bg-white/60 px-5 py-3.5 text-[0.95rem] text-[#1A1D36] placeholder-[#1A1D36]/30 outline-none backdrop-blur-sm transition focus:border-[#C5A059]/40 focus:bg-white/80"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  lineHeight: "1.5",
                  maxHeight: "120px",
                }}
                disabled={isTyping}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isTyping}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1A1D36] text-white shadow-lg transition hover:bg-[#1A1D36]/85 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12l7-7 7 7" />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-center text-[9px] uppercase tracking-[0.3em] text-[#1A1D36]/25">
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="mt-6 text-center text-[0.78rem] text-[#1A1D36]/40 leading-relaxed">
          Beauty Assistant provides general skincare guidance based on clinical research. For medical skin concerns, please consult a dermatologist.
        </p>

        {/* CTA back to shop */}
        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 opacity-25">
            <span className="h-px w-12 bg-[#C5A059]" />
            <div className="h-1 w-1 rounded-full bg-[#C5A059]" />
            <span className="h-px w-12 bg-[#C5A059]" />
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full border border-[#1A1D36]/15 bg-white/60 px-8 py-3.5 text-[0.78rem] font-bold uppercase tracking-[0.28em] text-[#1A1D36]/70 backdrop-blur-sm transition hover:border-[#C5A059]/50 hover:text-[#C5A059]"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Explore Camliqa Rituals
            <span className="text-sm">→</span>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
