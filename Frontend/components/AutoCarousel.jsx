"use client";

import { useEffect, useMemo, useState } from "react";

export default function AutoCarousel({
  slides,
  intervalMs = 3000,
  pauseOnHover = true,
  className = "",
}) {
  const normalizedSlides = useMemo(() => (Array.isArray(slides) ? slides : []), [slides]);
  const slideCount = normalizedSlides.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (slideCount < 2) return undefined;
    if (isPaused) return undefined;

    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slideCount);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs, isPaused, slideCount]);

  useEffect(() => {
    if (activeIndex >= slideCount) setActiveIndex(0);
  }, [activeIndex, slideCount]);

  return (
    <div
      className={`relative h-[360px] w-full overflow-hidden sm:h-[500px] ${className}`}
      onMouseEnter={pauseOnHover ? () => setIsPaused(true) : undefined}
      onMouseLeave={pauseOnHover ? () => setIsPaused(false) : undefined}
    >
      <div
        className="flex h-full w-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {normalizedSlides.map((slide) => (
          <div key={slide.src} className="h-full w-full shrink-0 bg-offWhite">
            <img
              src={slide.src}
              alt={slide.alt}
              className="h-full w-full object-cover object-center"
              draggable="false"
              loading="eager"
            />
          </div>
        ))}
      </div>

      {slideCount > 1 ? (
        <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
          {normalizedSlides.map((slide, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={`${slide.src}-dot`}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  isActive ? "bg-ink" : "bg-ink/30 hover:bg-ink/50"
                }`}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
