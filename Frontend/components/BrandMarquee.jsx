"use client";

import React from 'react';

const marqueeItems = [
  "RADIANT RESULTS",
  "NATURAL BEAUTY",
  "CHEMICAL-FREE CARE",
  "PURE INGREDIENTS",
  "CRUELTY FREE",
  "DERMATOLOGIST TESTED",
  "CLINICAL LUXURY"
];

export default function BrandMarquee() {
  return (
    <div className="relative w-full border-y border-[#C5A059]/10 bg-white/10 py-5 backdrop-blur-[2px] overflow-hidden">
      <div className="auto-marquee flex whitespace-nowrap">
        {/* First set of items */}
        <div className="flex items-center shrink-0">
          {marqueeItems.map((item, idx) => (
            <React.Fragment key={`first-${idx}`}>
              <span className="mx-12 text-[10px] font-medium uppercase tracking-[0.45em] text-[#1A1D36]/50">
                {item}
              </span>
              <span className="h-[3px] w-[3px] rounded-full bg-[#C5A059]/40" />
            </React.Fragment>
          ))}
        </div>
        {/* Second set of items for seamless loop */}
        <div className="flex items-center shrink-0">
          {marqueeItems.map((item, idx) => (
            <React.Fragment key={`second-${idx}`}>
              <span className="mx-12 text-[10px] font-medium uppercase tracking-[0.45em] text-[#1A1D36]/50">
                {item}
              </span>
              <span className="h-[3px] w-[3px] rounded-full bg-[#C5A059]/40" />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
