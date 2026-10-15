"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

export const mockConversations = [
  {
    question: "How can I strengthen thinning hair?",
    answer:
      "Thinning hair can happen because of stress, heat styling, poor nutrition, or scalp buildup. Start with a gentle sulfate-free shampoo, use lightweight hair oils like rosemary or argan oil, and avoid excessive heat tools. Products with biotin, keratin, and caffeine can help strengthen roots and improve hair density over time. Consistency in scalp care and a healthy diet also play an important role."
  },
  {
    question: "How can I improve dull skin and get a natural glow?",
    answer:
      "Dull skin is often caused by dehydration, dead skin buildup, lack of sleep, or sun damage. Use a gentle cleanser, exfoliate 1–2 times a week, and apply a hydrating moisturizer daily. Ingredients like vitamin C, hyaluronic acid, and niacinamide help brighten and hydrate the skin. Drinking enough water and wearing sunscreen every day can also improve your natural glow."
  },
  {
    question: "What is the best skincare routine?",
    answer:
      "A simple and effective skincare routine includes cleansing, moisturizing, and sunscreen during the day. In the morning, use a gentle cleanser, lightweight moisturizer, and SPF 30+ sunscreen. At night, cleanse again and apply treatments like serums or acne products before moisturizing. Choose products based on your skin type such as oily, dry, combination, or sensitive skin."
  },
  {
    question: "What is the best product for acne-prone skin?",
    answer:
      "Acne-prone skin benefits from lightweight, non-comedogenic products that do not clog pores. Ingredients like salicylic acid help clear pores, while niacinamide reduces redness and oiliness. Benzoyl peroxide can help treat active breakouts, and hyaluronic acid keeps the skin hydrated without feeling greasy. Always use sunscreen during the day to protect healing skin and prevent acne marks."
  }
];

const starterTopics = [
  {
    title: "How can I strengthen thinning hair?",
    image: "/collections/hair_care_banner.png",
    imagePosition: "center",
  },
  {
    title: "How can I improve dull skin and get a natural glow?",
    image: "/collections/light_bottles_group.png",
    imagePosition: "center 62%",
  },
  {
    title: "What is the best skincare routine?",
    image: "/collections/dark_bottles_group.png",
    imagePosition: "center 58%",
  },
  {
    title: "What is the best product for acne-prone skin?",
    image: "/collections/clinical_serum.png",
    imagePosition: "center 48%",
  },
];

function CamliqaAIIcon({ className = "h-10 w-10" }) {
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
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

export default function AIConsultantOverlay({ isOpen, onClose, showIntro }) {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const mobileScrollRef = useRef(null);
  const chatScrollRef = useRef(null);
  const mockMap = useMemo(() => {
    const normalize = (value) => value.trim().toLowerCase();
    const map = new Map();
    mockConversations.forEach((item) => map.set(normalize(item.question), item.answer));
    return map;
  }, []);

  const sendMessage = (question) => {
    const trimmed = question.trim();
    if (!trimmed) return;
    const answer =
      mockMap.get(trimmed.toLowerCase()) ||
      "For now, I can answer the four sample questions shown. Try one of those to preview responses.";
    setMessages((prev) => [...prev, { role: "user", text: trimmed }, { role: "ai", text: answer }]);
    setInputValue("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(inputValue);
  };

  const handleTopicClick = (topic) => {
    sendMessage(topic.title);
  };

  useEffect(() => {
    if (mobileScrollRef.current) {
      mobileScrollRef.current.scrollTo({
        top: mobileScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isOpen]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-stretch justify-center overscroll-contain bg-white/35 backdrop-blur-md sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
        >
          <motion.aside
            className="relative flex h-full w-full max-w-full flex-col overflow-hidden overscroll-contain bg-white shadow-[0_45px_140px_-70px_rgba(26,29,54,0.5)] sm:h-[86vh] sm:max-w-[560px] sm:rounded-[28px] lg:max-w-[764px] lg:rounded-[36px] xl:max-w-[864px] xl:rounded-[46px]"
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
            onWheel={(event) => event.stopPropagation()}
            onTouchMove={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-primary/10 bg-gradient-to-r from-white via-[#f7f3fb] to-white px-5 py-4 xl:px-7">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/70 transition hover:border-secondary/40 hover:text-primary xl:px-4 xl:py-2"
              >
                <span className="text-base">×</span>
                Back to Camliqa
              </button>
            </div>

            {/* Mobile/Tablet Layout */}
            <div
              ref={mobileScrollRef}
              className="ai-scrollbar flex-1 overflow-y-auto overscroll-contain px-6 pb-28 pt-7 lg:hidden"
            >
              <div className="mx-auto max-w-[460px] text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-secondary/70">
                  AI Beauty Advisor
                </p>
                <h2 className="mt-3 font-serif text-[2.2rem] text-primary sm:text-[2.5rem]">
                  Your Personal
                  <span className="block text-secondary">Beauty Consultant</span>
                </h2>
                <p className="mt-3 text-[0.9rem] text-primary/60">
                  Ask a beauty-related question or select a popular starter topic below.
                </p>
                <div className="mt-5 flex items-center justify-center gap-2">
                  <span className="h-[1px] w-10 bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
                  <span className="h-1.5 w-1.5 rotate-45 border border-secondary/40" />
                  <span className="h-[1px] w-10 bg-gradient-to-l from-transparent via-secondary/50 to-transparent" />
                </div>
              </div>

              <div className="mt-8 flex gap-4 overflow-x-auto pb-3 no-scrollbar">
                {starterTopics.map((topic) => (
                  <button
                    key={topic.title}
                    type="button"
                    onClick={() => handleTopicClick(topic)}
                    className="group min-w-[210px] overflow-hidden rounded-2xl border border-secondary/15 bg-white/90 text-left shadow-[0_18px_46px_-26px_rgba(26,29,54,0.28)] transition duration-300 hover:-translate-y-1 hover:border-secondary/50 hover:shadow-[0_24px_60px_-30px_rgba(26,29,54,0.36)]"
                  >
                    <div className="relative h-[140px] w-full overflow-hidden">
                      <Image
                        src={topic.image}
                        alt={topic.title}
                        fill
                        sizes="210px"
                        className="object-cover transition duration-700 group-hover:scale-105"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent" />
                    </div>
                    <div className="flex items-start justify-between gap-3 px-3 py-3">
                      <span className="text-[11px] font-medium text-primary/70 transition-colors duration-300 group-hover:text-secondary">
                        {topic.title}
                      </span>
                      <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-primary/15 text-xs text-primary/60 transition group-hover:border-secondary/50 group-hover:text-secondary">
                        ↗
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {messages.length > 0 && (
                <div className="mt-8 space-y-4">
                  {messages.map((message, index) => (
                    <motion.div
                      key={`${message.role}-${index}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className={
                        message.role === "user"
                          ? "ml-auto w-fit max-w-[60%] rounded-2xl rounded-br-md bg-gradient-to-br from-primary/10 via-white/60 to-secondary/10 px-3.5 py-2.5 text-left text-[0.9rem] leading-relaxed text-[#111b21] shadow-[0_8px_20px_-18px_rgba(17,27,33,0.45)]"
                          : "mr-auto w-fit max-w-[72%] rounded-2xl rounded-bl-md border border-[#ece1ca] bg-white px-3.5 py-2.5 text-left text-[0.9rem] leading-relaxed text-[#111b21] shadow-[0_8px_20px_-18px_rgba(17,27,33,0.35)]"
                      }
                    >
                      {message.text}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-primary/10 bg-white/95 px-5 py-4 backdrop-blur lg:hidden">
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-3 rounded-full border border-primary/15 bg-white px-4 py-2 text-primary/70 shadow-[0_10px_30px_-20px_rgba(26,29,54,0.2)]"
              >
                <input
                  type="text"
                  placeholder="Ask a question or reply..."
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleSubmit(event);
                    }
                  }}
                  className="flex-1 bg-transparent text-[0.85rem] outline-none placeholder:text-primary/40"
                />
                <button
                  type="submit"
                  className="rounded-full bg-primary px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-primary/90"
                >
                  Send
                </button>
              </form>
            </div>

            {/* Desktop Layout */}
            <div className="hidden h-full flex-1 min-h-0 flex-col lg:grid lg:grid-cols-[minmax(380px,0.75fr)_minmax(0,1.25fr)]">
              <div className="ai-scrollbar min-h-0 overflow-y-auto overscroll-contain px-6 pb-8 pt-7 lg:pr-5">
                <div className="mx-auto max-w-[460px] text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-secondary/70">
                    AI Beauty Advisor
                  </p>
                  <h2 className="mt-3 font-serif text-[2.2rem] text-primary sm:text-[2.5rem]">
                    Your Personal
                    <span className="block text-secondary">Beauty Consultant</span>
                  </h2>
                  <p className="mt-3 text-[0.9rem] text-primary/60">
                    Ask a beauty-related question or select a popular starter topic below.
                  </p>
                  <div className="mt-5 flex items-center justify-center gap-2">
                    <span className="h-[1px] w-10 bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
                    <span className="h-1.5 w-1.5 rotate-45 border border-secondary/40" />
                    <span className="h-[1px] w-10 bg-gradient-to-l from-transparent via-secondary/50 to-transparent" />
                  </div>
                </div>

                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {starterTopics.map((topic) => (
                    <button
                      key={topic.title}
                      type="button"
                      onClick={() => handleTopicClick(topic)}
                      className="group overflow-hidden rounded-[24px] border border-secondary/15 bg-white/90 text-left shadow-[0_18px_46px_-28px_rgba(26,29,54,0.3)] transition duration-500 hover:-translate-y-1 hover:border-secondary/50 hover:shadow-[0_28px_64px_-32px_rgba(26,29,54,0.38)]"
                    >
                      <div className="relative h-[150px] w-full overflow-hidden">
                        <Image
                          src={topic.image}
                          alt={topic.title}
                          fill
                          sizes="(min-width: 1024px) 260px, 210px"
                          className="object-cover transition duration-700 group-hover:scale-105"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent" />
                      </div>
                      <div className="flex items-start justify-between gap-3 px-3 py-3">
                        <span className="text-[11px] font-medium text-primary/70 transition-colors duration-300 group-hover:text-secondary">
                          {topic.title}
                        </span>
                        <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-primary/15 text-xs text-primary/60 transition group-hover:border-secondary/50 group-hover:text-secondary">
                          ↗
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative flex min-h-0 flex-col">
                <div
                  ref={chatScrollRef}
                  className="ai-scrollbar flex-1 overflow-y-auto overscroll-contain px-6 pb-32 pt-7"
                >
                  {messages.length > 0 && (
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <motion.div
                          key={`${message.role}-${index}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className={
                            message.role === "user"
                              ? "ml-auto w-fit max-w-[60%] rounded-2xl rounded-br-md bg-gradient-to-br from-primary/10 via-white/60 to-secondary/10 px-3.5 py-2.5 text-left text-[0.9rem] leading-relaxed text-[#111b21] shadow-[0_8px_20px_-18px_rgba(17,27,33,0.45)]"
                              : "mr-auto w-fit max-w-[72%] rounded-2xl rounded-bl-md border border-[#ece1ca] bg-white px-3.5 py-2.5 text-left text-[0.9rem] leading-relaxed text-[#111b21] shadow-[0_8px_20px_-18px_rgba(17,27,33,0.35)]"
                          }
                        >
                          {message.text}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-primary/10 bg-white/95 px-5 py-4 backdrop-blur">
                  <form
                    onSubmit={handleSubmit}
                    className="flex items-center gap-3 rounded-full border border-primary/15 bg-white px-4 py-2 text-primary/70 shadow-[0_10px_30px_-20px_rgba(26,29,54,0.2)]"
                  >
                    <input
                      type="text"
                      placeholder="Ask a question or reply..."
                      value={inputValue}
                      onChange={(event) => setInputValue(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleSubmit(event);
                        }
                      }}
                      className="flex-1 bg-transparent text-[0.85rem] outline-none placeholder:text-primary/40"
                    />
                    <button
                      type="submit"
                      className="rounded-full bg-primary px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-primary/90"
                    >
                      Send
                    </button>
                  </form>
                  <p className="mt-3 text-center text-[10px] uppercase tracking-[0.28em] text-primary/35">
                    Powered by Camliqa
                  </p>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {showIntro ? (
                <motion.div
                  className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="flex flex-col items-center gap-3 rounded-[28px] border border-secondary/20 bg-white/95 px-10 py-8 text-center shadow-[0_35px_90px_-45px_rgba(26,29,54,0.4)]"
                    initial={{ opacity: 0, scale: 0.92, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <span className="camliqa-ai-icon-wrap is-active flex h-12 w-12 items-center justify-center">
                      <CamliqaAIIcon className="h-10 w-10" />
                    </span>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-secondary/70">
                      AI Beauty Advisor
                    </p>
                    <p className="font-serif text-xl text-primary">Camliqa AI</p>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
