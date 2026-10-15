"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Navbar from "@/components/Navbar";

const mockConversations = [
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
    imagePosition: "center"
  },
  {
    title: "How can I improve dull skin and get a natural glow?",
    image: "/collections/light_bottles_group.png",
    imagePosition: "center 62%"
  },
  {
    title: "What is the best skincare routine?",
    image: "/collections/dark_bottles_group.png",
    imagePosition: "center 58%"
  },
  {
    title: "What is the best product for acne-prone skin?",
    image: "/collections/clinical_serum.png",
    imagePosition: "center 48%"
  }
];

const starterTopicTags = ["Hair Care", "Skin Glow", "Daily Ritual", "Targeted Care"];
const featuredWordColors = [
  "rgba(197, 160, 89, 0.3)",
  "rgba(108, 63, 197, 0.26)",
  "rgba(26, 29, 54, 0.24)",
  "rgba(197, 160, 89, 0.27)"
];

const quickPrompts = [
  "Build a simple AM/PM routine",
  "Help with dark spots and glow",
  "Best products for dry hair",
  "Gentle routine for sensitive skin"
];

export default function AIBeautyAdvisorPage() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);
  const [isFeaturedMoving, setIsFeaturedMoving] = useState(false);
  const mobileScrollRef = useRef(null);
  const chatScrollRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const featuredStopTimeoutRef = useRef(null);
  const hasInitializedFeaturedRef = useRef(false);
  const mockMap = useMemo(() => {
    const normalize = (value) => value.trim().toLowerCase();
    const map = new Map();
    mockConversations.forEach((item) => map.set(normalize(item.question), item.answer));
    return map;
  }, []);

  const sendMessage = (question) => {
    const trimmed = question.trim();
    if (!trimmed || isTyping) return;
    const answer =
      mockMap.get(trimmed.toLowerCase()) ||
      "For now, I can answer the four sample questions shown. Try one of those to preview responses.";
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setIsTyping(true);
    setInputValue("");
    const responseDelay = Math.max(550, Math.min(1200, Math.floor(answer.length / 8)));
    typingTimeoutRef.current = setTimeout(() => {
      setMessages((prev) => [...prev, { role: "ai", text: answer }]);
      setIsTyping(false);
      typingTimeoutRef.current = null;
    }, responseDelay);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(inputValue);
  };

  const handleTopicClick = (topic) => {
    sendMessage(topic.title);
  };

  const featuredTopic = starterTopics[featuredIndex];
  const featuredTag = starterTopicTags[featuredIndex];

  const startFeaturedTransition = () => {
    setIsFeaturedMoving(true);
    if (featuredStopTimeoutRef.current) {
      clearTimeout(featuredStopTimeoutRef.current);
    }
    featuredStopTimeoutRef.current = setTimeout(() => {
      setIsFeaturedMoving(false);
      featuredStopTimeoutRef.current = null;
    }, 560);
  };

  const paginateFeatured = (direction) => {
    startFeaturedTransition();
    setSlideDirection(direction);
    setFeaturedIndex((prev) => (prev + direction + starterTopics.length) % starterTopics.length);
  };

  const jumpToFeatured = (index) => {
    if (index === featuredIndex) return;
    startFeaturedTransition();
    const direction = index > featuredIndex ? 1 : -1;
    setSlideDirection(direction);
    setFeaturedIndex(index);
  };

  const handleFeaturedDragEnd = (_, info) => {
    const swipeThreshold = 70;
    if (info.offset.x > swipeThreshold) {
      paginateFeatured(-1);
      return;
    }
    if (info.offset.x < -swipeThreshold) {
      paginateFeatured(1);
    }
  };

  useEffect(() => {
    if (mobileScrollRef.current) {
      mobileScrollRef.current.scrollTo({
        top: mobileScrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const autoSlideTimer = setInterval(() => {
      startFeaturedTransition();
      setSlideDirection(1);
      setFeaturedIndex((prev) => (prev + 1) % starterTopics.length);
    }, 30000);
    return () => clearInterval(autoSlideTimer);
  }, []);

  useEffect(() => {
    if (!hasInitializedFeaturedRef.current) {
      hasInitializedFeaturedRef.current = true;
      return;
    }
    startFeaturedTransition();
  }, [featuredIndex]);

  useEffect(() => {
    return () => {
      if (featuredStopTimeoutRef.current) {
        clearTimeout(featuredStopTimeoutRef.current);
      }
    };
  }, []);

  return (
    <main className="camliqa-aurora flex h-[100dvh] min-h-screen flex-col overflow-x-hidden bg-base text-primary antialiased selection:bg-secondary/25 selection:text-primary">
      <Navbar aiActive />

      <section className="w-full flex-1 min-h-0 px-0 pb-0 pt-0">
        <div className="relative flex h-full flex-col">
            {/* Mobile/Tablet Layout */}
            <div
              ref={mobileScrollRef}
              data-lenis-prevent
              className="ai-scrollbar flex-1 h-full min-h-0 overflow-y-auto overscroll-contain scroll-smooth px-3 pb-24 pt-2 touch-pan-y sm:px-4 lg:hidden"
            >
              <div className="mx-auto max-w-[640px] text-center">
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

              <div className="mx-auto mt-10 w-full max-w-[560px] pb-2">
                <div className="relative overflow-hidden rounded-[30px] border border-primary/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.9)_0%,rgba(248,246,255,0.92)_52%,rgba(255,255,255,0.88)_100%)] px-4 pb-4 pt-5 shadow-[0_28px_80px_-52px_rgba(26,29,54,0.38)]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={`mobile-camliqa-${featuredIndex}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.45 }}
                      className="pointer-events-none absolute inset-0 flex items-center justify-center text-[2.25rem] font-serif tracking-[0.15em] transition-colors duration-300 sm:text-[2.55rem]"
                      style={{ color: isFeaturedMoving ? featuredWordColors[featuredIndex] : "transparent" }}
                    >
                      CAMLIQA
                    </motion.span>
                  </AnimatePresence>
                  <div className="mb-3 flex flex-col items-center gap-1 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-secondary/75">
                      Elite Selection
                    </p>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/45">
                      {featuredIndex + 1}/{starterTopics.length}
                    </span>
                  </div>

                  <div className="relative overflow-hidden rounded-[24px]">
                    <AnimatePresence mode="wait" initial={false} custom={slideDirection}>
                      <motion.div
                        key={`mobile-featured-${featuredIndex}`}
                        onClick={() => handleTopicClick(featuredTopic)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleTopicClick(featuredTopic);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        className="group relative w-full cursor-pointer overflow-hidden rounded-[24px] border border-secondary/15 bg-white/90 text-left"
                        custom={slideDirection}
                        initial={{ opacity: 0, x: slideDirection > 0 ? 42 : -42, scale: 0.985 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: slideDirection > 0 ? -42 : 42, scale: 0.985 }}
                        transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.18}
                        onDragEnd={handleFeaturedDragEnd}
                      >
                        <div className="relative h-[250px] w-full overflow-hidden sm:h-[300px]">
                          <Image
                            src={featuredTopic.image}
                            alt={featuredTopic.title}
                            fill
                            sizes="(min-width: 640px) 520px, 92vw"
                            className="object-cover transition duration-700 group-hover:scale-105"
                            style={{ objectPosition: featuredTopic.imagePosition }}
                          />
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/8 via-transparent to-transparent" />
                          <span className="absolute left-4 top-4 rounded-lg border border-white/50 bg-white/82 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.25em] text-primary/75">
                            Featured
                          </span>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              paginateFeatured(-1);
                            }}
                            className="absolute left-3 top-1/2 z-20 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/85 text-[0.9rem] text-primary/75 transition duration-300 hover:-translate-x-0.5 hover:text-secondary"
                            aria-label="Previous featured card"
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              paginateFeatured(1);
                            }}
                            className="absolute right-3 top-1/2 z-20 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/85 text-[0.9rem] text-primary/75 transition duration-300 hover:translate-x-0.5 hover:text-secondary"
                            aria-label="Next featured card"
                          >
                            →
                          </button>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div className="mt-4 flex flex-col items-center gap-2 text-center">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-secondary/75">
                        {featuredTag}
                      </p>
                      <p className="mt-1 text-[1.02rem] font-medium leading-snug text-primary/90">
                        {featuredTopic.title}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTopicClick(featuredTopic)}
                      className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary/70 transition hover:text-secondary"
                    >
                      Discover
                    </button>
                  </div>

                  <div className="mt-5 flex items-center gap-1.5">
                    <div className="flex flex-1 items-center gap-1.5">
                      {starterTopics.map((topic, index) => (
                        <button
                          key={`mobile-indicator-${topic.title}`}
                          type="button"
                          aria-label={`Go to featured card ${index + 1}`}
                          onClick={() => jumpToFeatured(index)}
                          className="flex-1"
                        >
                          <span
                            className={`block h-[2px] w-full rounded-full transition-all duration-500 ${
                              index === featuredIndex ? "bg-secondary/85" : "bg-primary/14"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mx-auto mt-7 max-w-[980px]">
                {messages.length > 0 ? (
                  <div className="space-y-3">
                    <AnimatePresence initial={false}>
                      {messages.map((message, index) => (
                        <motion.div
                          key={`${message.role}-${index}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.28, ease: "easeOut" }}
                          className={
                            message.role === "user"
                              ? "ml-auto w-fit max-w-[68%] rounded-2xl rounded-br-md border border-secondary/15 bg-[linear-gradient(145deg,rgba(246,240,230,0.92)_0%,rgba(255,255,255,0.95)_52%,rgba(247,243,251,0.9)_100%)] px-3.5 py-2.5 text-left text-[0.9rem] leading-relaxed text-[#111b21] shadow-[0_8px_20px_-18px_rgba(17,27,33,0.45)]"
                              : "mr-auto w-fit max-w-[80%] rounded-2xl rounded-bl-md border border-secondary/15 bg-white/92 px-3.5 py-2.5 text-left text-[0.9rem] leading-relaxed text-[#111b21] shadow-[0_8px_20px_-18px_rgba(17,27,33,0.35)]"
                          }
                        >
                          {message.text}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mr-auto w-fit rounded-2xl rounded-bl-md border border-secondary/15 bg-white/92 px-3.5 py-2.5 shadow-[0_8px_20px_-18px_rgba(17,27,33,0.35)]"
                      >
                        <div className="flex items-center gap-1.5">
                          {[0, 1, 2].map((dot) => (
                            <motion.span
                              key={`mobile-dot-${dot}`}
                              className="h-1.5 w-1.5 rounded-full bg-primary/55"
                              animate={{ y: [0, -2.5, 0], opacity: [0.45, 1, 0.45] }}
                              transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.12 }}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 rounded-[24px] border border-primary/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.9)_0%,rgba(248,246,255,0.92)_52%,rgba(255,255,255,0.88)_100%)] p-4 shadow-[0_20px_50px_-36px_rgba(26,29,54,0.28)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-secondary/75">
                      Welcome
                    </p>
                    <p className="text-[0.92rem] text-primary/75">
                      Ask a skincare question or pick one of these starter prompts.
                    </p>
                    <div className="grid gap-2.5">
                      {quickPrompts.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => handleTopicClick({ title: prompt })}
                          className="flex items-center justify-between rounded-xl border border-secondary/15 bg-white/88 px-3 py-2.5 text-left text-[0.86rem] text-primary/80 transition duration-300 hover:border-secondary/45 hover:text-primary"
                        >
                          <span>{prompt}</span>
                          <span className="text-secondary/70">→</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden flex-1 min-h-0 lg:grid lg:h-full lg:grid-cols-[minmax(300px,0.74fr)_minmax(0,1.26fr)] lg:gap-2 lg:px-1 lg:pb-1 lg:pt-1 xl:grid-cols-[minmax(330px,0.66fr)_minmax(0,1.34fr)] xl:gap-4 xl:px-3.5 2xl:px-4">
              <div
                data-lenis-prevent
                className="ai-scrollbar no-scrollbar min-h-0 h-full overflow-y-auto px-1 pb-1 pt-1 lg:pr-1.5 xl:pr-2.5"
              >
                <div className="relative flex h-full flex-col overflow-hidden rounded-[34px] border border-primary/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.9)_0%,rgba(248,246,255,0.92)_52%,rgba(255,255,255,0.88)_100%)] px-3.5 pb-4 pt-3.5 shadow-[0_34px_90px_-58px_rgba(26,29,54,0.45)] xl:px-6 xl:pb-5 xl:pt-6">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={`desktop-camliqa-${featuredIndex}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.45 }}
                      className="pointer-events-none absolute inset-0 flex items-center justify-center text-[2.95rem] font-serif tracking-[0.18em] transition-colors duration-300 lg:text-[3.3rem] xl:text-[3.75rem]"
                      style={{ color: isFeaturedMoving ? featuredWordColors[featuredIndex] : "transparent" }}
                    >
                      CAMLIQA
                    </motion.span>
                  </AnimatePresence>

                  <div className="relative z-10 text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-secondary/75">
                      AI Beauty Advisor
                    </p>
                    <h2 className="mt-2 font-serif text-[1.65rem] text-primary lg:text-[1.76rem] xl:mt-3 xl:text-[2.35rem]">
                      Your Personal
                      <span className="block text-secondary">Beauty Consultant</span>
                    </h2>
                    <p className="mx-auto mt-2.5 max-w-[27ch] text-[0.88rem] text-primary/60 xl:mt-3 xl:max-w-[28ch] xl:text-[0.9rem]">
                      Ask a beauty-related question or select a popular starter topic below.
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2 xl:mt-5">
                      <span className="h-[1px] w-10 bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
                      <span className="h-1.5 w-1.5 rotate-45 border border-secondary/40" />
                      <span className="h-[1px] w-10 bg-gradient-to-l from-transparent via-secondary/50 to-transparent" />
                    </div>
                  </div>

                  <div className="relative z-10 mt-4 xl:mt-6">
                    <div className="mb-2.5 flex flex-col items-center gap-1 text-center">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-secondary/75">
                        Elite Selection
                      </p>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/45">
                        {featuredIndex + 1}/{starterTopics.length}
                      </span>
                    </div>

                    <div className="relative overflow-hidden rounded-[28px]">
                      <AnimatePresence mode="wait" initial={false} custom={slideDirection}>
                        <motion.div
                          key={`desktop-featured-${featuredIndex}`}
                          onClick={() => handleTopicClick(featuredTopic)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              handleTopicClick(featuredTopic);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                          className="group relative w-full cursor-pointer overflow-hidden rounded-[28px] border border-secondary/15 bg-white/90 text-left"
                          custom={slideDirection}
                          initial={{ opacity: 0, x: slideDirection > 0 ? 54 : -54, scale: 0.985 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: slideDirection > 0 ? -54 : 54, scale: 0.985 }}
                          transition={{ duration: 0.48, ease: [0.22, 0.61, 0.36, 1] }}
                          drag="x"
                          dragConstraints={{ left: 0, right: 0 }}
                          dragElastic={0.18}
                          onDragEnd={handleFeaturedDragEnd}
                        >
                          <div className="relative h-[220px] w-full overflow-hidden xl:h-[300px] 2xl:h-[336px]">
                            <Image
                              src={featuredTopic.image}
                              alt={featuredTopic.title}
                              fill
                              sizes="(min-width: 1536px) 420px, (min-width: 1280px) 33vw, 94vw"
                              className="object-cover transition duration-700 group-hover:scale-105"
                              style={{ objectPosition: featuredTopic.imagePosition }}
                            />
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                            <span className="absolute left-5 top-5 rounded-lg border border-white/50 bg-white/84 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.25em] text-primary/75">
                              Featured
                            </span>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                paginateFeatured(-1);
                              }}
                              className="absolute left-4 top-1/2 z-20 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/85 text-[0.95rem] text-primary/75 transition duration-300 hover:-translate-x-0.5 hover:text-secondary"
                              aria-label="Previous featured card"
                            >
                              ←
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                paginateFeatured(1);
                              }}
                              className="absolute right-4 top-1/2 z-20 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/85 text-[0.95rem] text-primary/75 transition duration-300 hover:translate-x-0.5 hover:text-secondary"
                              aria-label="Next featured card"
                            >
                              →
                            </button>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    <div className="mt-4 flex flex-col items-center gap-2 text-center">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-secondary/75">
                          {featuredTag}
                        </p>
                        <p className="mt-1 text-[1.06rem] font-medium leading-snug text-primary/90">
                          {featuredTopic.title}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleTopicClick(featuredTopic)}
                        className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary/70 transition hover:text-secondary"
                      >
                        Discover
                      </button>
                    </div>

                    <div className="mt-5 flex items-center gap-2 xl:mt-6">
                      <div className="flex flex-1 items-center gap-2">
                        {starterTopics.map((topic, index) => (
                          <button
                            key={`desktop-indicator-${topic.title}`}
                            type="button"
                            onClick={() => jumpToFeatured(index)}
                            aria-label={`Go to featured card ${index + 1}`}
                            className="flex-1"
                          >
                            <span
                              className={`block h-[2px] w-full rounded-full transition-all duration-500 ${
                                index === featuredIndex ? "bg-secondary/85" : "bg-primary/14"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative flex min-h-0 flex-col lg:h-full">
                <div className="flex flex-1 min-h-0 items-stretch justify-center px-0 pb-0 pt-0">
                  <div className="flex h-full min-h-0 w-full max-w-none flex-col rounded-[28px] border border-primary/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.9)_0%,rgba(248,246,255,0.92)_52%,rgba(255,255,255,0.88)_100%)] shadow-[0_26px_70px_-48px_rgba(26,29,54,0.22)]">
                    <div
                      ref={chatScrollRef}
                      data-lenis-prevent
                      className="ai-scrollbar flex-1 min-h-0 overflow-y-auto overscroll-contain scroll-smooth px-4 pb-5 pt-4 touch-pan-y sm:px-5 xl:px-6 xl:pb-6 xl:pt-5 lg:no-scrollbar"
                    >
                      {messages.length > 0 ? (
                        <div className="space-y-3">
                          <AnimatePresence initial={false}>
                            {messages.map((message, index) => (
                              <motion.div
                                key={`${message.role}-${index}`}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.28, ease: "easeOut" }}
                                className={
                                  message.role === "user"
                                    ? "ml-auto w-fit max-w-[60%] rounded-2xl rounded-br-md border border-secondary/15 bg-[linear-gradient(145deg,rgba(246,240,230,0.92)_0%,rgba(255,255,255,0.95)_52%,rgba(247,243,251,0.9)_100%)] px-3.5 py-2.5 text-left text-[0.9rem] leading-relaxed text-[#111b21] shadow-[0_8px_20px_-18px_rgba(17,27,33,0.45)]"
                                    : "mr-auto w-fit max-w-[72%] rounded-2xl rounded-bl-md border border-secondary/15 bg-white/92 px-3.5 py-2.5 text-left text-[0.9rem] leading-relaxed text-[#111b21] shadow-[0_8px_20px_-18px_rgba(17,27,33,0.35)]"
                                }
                              >
                                {message.text}
                              </motion.div>
                            ))}
                          </AnimatePresence>
                          {isTyping && (
                            <motion.div
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mr-auto w-fit rounded-2xl rounded-bl-md border border-secondary/15 bg-white/92 px-3.5 py-2.5 shadow-[0_8px_20px_-18px_rgba(17,27,33,0.35)]"
                            >
                              <div className="flex items-center gap-1.5">
                                {[0, 1, 2].map((dot) => (
                                  <motion.span
                                    key={`desktop-dot-${dot}`}
                                    className="h-1.5 w-1.5 rounded-full bg-primary/55"
                                    animate={{ y: [0, -2.5, 0], opacity: [0.45, 1, 0.45] }}
                                    transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.12 }}
                                  />
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3.5 xl:space-y-5">
                          <div className="rounded-[22px] border border-secondary/15 bg-white/92 px-3.5 py-3 text-[0.9rem] text-primary/90 shadow-[0_18px_40px_-28px_rgba(26,29,54,0.22)] xl:px-5 xl:py-4 xl:text-[0.95rem]">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-secondary/70">
                              AI Beauty Advisor
                            </p>
                            <p className="mt-2 text-[1rem] font-medium text-primary/95">
                              Hi, I am your personal skincare advisor.
                            </p>
                            <p className="mt-1.5 text-[0.88rem] text-primary/60 xl:mt-2 xl:text-[0.9rem]">
                              Ask about routines, product matches, or ingredient advice to start your ritual.
                            </p>
                          </div>
                          <div className="grid gap-2.5 xl:gap-3">
                            {quickPrompts.map((prompt) => (
                              <button
                                key={prompt}
                                type="button"
                                onClick={() => handleTopicClick({ title: prompt })}
                                className="flex items-center justify-between rounded-2xl border border-secondary/15 bg-white/88 px-3.5 py-2.5 text-left text-[0.88rem] text-primary/85 transition duration-300 hover:-translate-y-0.5 hover:border-secondary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/35 xl:px-4 xl:py-3 xl:text-[0.9rem]"
                              >
                                <span>{prompt}</span>
                                <span className="text-secondary/70">→</span>
                              </button>
                            ))}
                          </div>
                          <div className="hidden rounded-[22px] border border-secondary/15 bg-gradient-to-br from-[#f6f0e6] via-white to-[#f7f3fb] px-5 py-4 text-primary/85 shadow-[0_16px_36px_-26px_rgba(26,29,54,0.2)] xl:block">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-secondary/70">
                              How it works
                            </p>
                            <p className="mt-2 text-[0.9rem]">
                              Share your concern, we analyze ingredients and recommend a ritual in seconds.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 border-t border-secondary/10 px-4 pb-3.5 pt-3.5 xl:px-6 xl:pb-4 xl:pt-4">
                      <form
                        onSubmit={handleSubmit}
                        className="group flex items-center gap-2 rounded-full border border-secondary/15 bg-white/92 px-3 py-2 text-primary/70 transition focus-within:border-secondary/45 focus-within:shadow-[0_0_0_1px_rgba(197,160,89,0.25),0_0_30px_rgba(197,160,89,0.16)]"
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
                          className="flex-1 bg-transparent text-[0.8rem] outline-none placeholder:text-primary/55 xl:text-[0.82rem]"
                        />
                        <button
                          type="submit"
                          disabled={!inputValue.trim() || isTyping}
                          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary via-[#1a1d36] to-primary px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition duration-300 hover:scale-[1.02] hover:shadow-[0_12px_30px_-18px_rgba(26,29,54,0.45)] disabled:cursor-not-allowed disabled:opacity-60 xl:px-4"
                        >
                          {isTyping ? "Wait" : "Send"}
                          <span className="text-[11px] transition-transform duration-300 group-hover:translate-x-0.5">↗</span>
                        </button>
                      </form>
                      <p className="mt-3 text-center text-[10px] uppercase tracking-[0.28em] text-primary/40">
                        Powered by Camliqa
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
        </div>

      </section>

      <div className="fixed bottom-0 left-0 right-0 z-[60] bg-base/90 px-4 pb-2 pt-1.5 backdrop-blur lg:hidden">
        <div className="section-shell max-w-[1440px]">
          <div className="grid lg:grid-cols-2">
            <div className="hidden lg:block" />
            <div className="rounded-[24px] border border-primary/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.9)_0%,rgba(248,246,255,0.92)_52%,rgba(255,255,255,0.88)_100%)] px-4 py-3 shadow-[0_18px_50px_-28px_rgba(26,29,54,0.22)]">
              <form
                onSubmit={handleSubmit}
                className="group flex items-center gap-2.5 rounded-full border border-secondary/15 bg-white/92 px-3 py-2 text-primary/70 transition focus-within:border-secondary/45 focus-within:shadow-[0_0_0_1px_rgba(197,160,89,0.25),0_0_30px_rgba(197,160,89,0.16)]"
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
                  className="flex-1 bg-transparent text-[0.82rem] outline-none placeholder:text-primary/55"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary via-[#1a1d36] to-primary px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition duration-300 hover:scale-[1.02] hover:shadow-[0_12px_30px_-18px_rgba(26,29,54,0.45)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isTyping ? "Wait" : "Send"}
                  <span className="text-[11px] transition-transform duration-300 group-hover:translate-x-0.5">↗</span>
                </button>
              </form>
            </div>
          </div>
          <div className="mt-2 text-center text-[9px] uppercase tracking-[0.32em] text-primary/45">
            Powered by Camliqa
          </div>
        </div>
      </div>

    </main>
  );
}
