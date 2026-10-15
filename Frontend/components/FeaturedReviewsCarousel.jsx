"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function StarRow({ rating }) {
  return (
    <p className="mt-4 text-lg tracking-[0.14em] text-[#ffca4d]">
      {"★".repeat(Math.max(0, Math.min(5, Math.round(Number(rating) || 0))))}
      {"☆".repeat(5 - Math.max(0, Math.min(5, Math.round(Number(rating) || 0))))}
    </p>
  );
}

export default function FeaturedReviewsCarousel({ reviews }) {
  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const displayReviews = useMemo(() => {
    if (safeReviews.length <= 1) return safeReviews;
    return [...safeReviews, safeReviews[0]];
  }, [safeReviews]);

  const canSlide = safeReviews.length > 1;
  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [touchStartX, setTouchStartX] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!canSlide) return undefined;
    const timer = setInterval(() => {
      setIsAnimating(true);
      setIndex((prev) => prev + 1);
    }, 3800);
    return () => clearInterval(timer);
  }, [canSlide]);

  const currentActiveDot = safeReviews.length
    ? index >= safeReviews.length
      ? 0
      : index
    : 0;

  const onTransitionEnd = () => {
    if (!canSlide) return;
    if (index === safeReviews.length) {
      setIsAnimating(false);
      setIndex(0);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsAnimating(true));
      });
    }
  };

  const goTo = (target) => {
    if (!canSlide) return;
    setIsAnimating(true);
    setIndex(target);
  };

  const onTouchStart = (event) => {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  };

  const onTouchEnd = (event) => {
    if (!canSlide || touchStartX == null) return;
    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
    const delta = touchStartX - touchEndX;
    if (Math.abs(delta) < 35) return;

    if (delta > 0) {
      goTo(index + 1);
    } else {
      const prevIndex = index <= 0 ? safeReviews.length - 1 : index - 1;
      goTo(prevIndex);
    }
    setTouchStartX(null);
  };

  if (!safeReviews.length) {
    return (
      <p className="mt-8 text-center text-sm text-[var(--muted)]">
        No featured testimonials yet. Mark up to 8 reviews as featured from admin.
      </p>
    );
  }

  return (
    <div className="mt-10">
      <div
        ref={containerRef}
        className="overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className={`flex ${isAnimating ? "transition-transform duration-700 ease-out" : ""}`}
          style={{ transform: `translateX(-${index * 100}%)` }}
          onTransitionEnd={onTransitionEnd}
        >
          {displayReviews.map((item, listIndex) => (
            <div key={`${item.id}-${listIndex}`} className="w-full shrink-0 px-1 md:px-2">
              <article className="rounded-[1.5rem] border border-[#e4d7c8] bg-[#fcfaf7] p-5 shadow-[0_16px_35px_rgba(63,41,22,0.06)] transition hover:-translate-y-0.5 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {item.avatarUrl ? (
                      <img
                        src={item.avatarUrl}
                        alt={item.name}
                        className="h-14 w-14 rounded-full object-cover ring-1 ring-[#e3d5c6] sm:h-16 sm:w-16"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#f3e6d8] text-xl font-bold text-[#8f5a2d] ring-1 ring-[#e3d5c6] sm:h-16 sm:w-16">
                        {(item.name || "U").slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold leading-none text-[var(--ink)] sm:text-2xl">
                        {item.name}
                      </h3>
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        {item.role}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-full border border-[#e4d7c8] bg-[#fff8ef] px-3 py-1.5 text-sm font-semibold text-[#d7a11b] sm:px-4 sm:py-2 sm:text-base">
                    ★ {item.rating}
                  </div>
                </div>

                <StarRow rating={item.rating} />

                <p className="mt-5 text-base leading-8 text-[var(--muted-ink)] sm:text-lg sm:leading-9">
                  {item.quote}
                </p>

                <p className="mt-6 text-xs text-[#9f8975] sm:text-sm">{item.time}</p>
              </article>
            </div>
          ))}
        </div>
      </div>

      {safeReviews.length > 1 ? (
        <div className="mt-5 flex items-center justify-center gap-2">
          {safeReviews.map((review, dotIndex) => (
            <button
              key={review.id}
              type="button"
              onClick={() => goTo(dotIndex)}
              className={`h-2.5 rounded-full transition-all ${
                currentActiveDot === dotIndex
                  ? "w-7 bg-[#8f5a2d]"
                  : "w-2.5 bg-[#d9c7b4] hover:bg-[#b89676]"
              }`}
              aria-label={`Go to review ${dotIndex + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
