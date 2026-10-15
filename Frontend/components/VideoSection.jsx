"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from "framer-motion";
import Reveal from './Reveal';

export default function VideoSection() {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  const scale = useTransform(scrollYProgress, [0.1, 0.7], [0.4, 1]);
  const width = useTransform(scrollYProgress, [0.1, 0.7], ["30%", "75%"]);
  const borderRadius = useTransform(scrollYProgress, [0.1, 0.7], ["6rem", "2rem"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.7, 0.9], [0, 1, 1, 0.9]);

  return (
    <section ref={containerRef} className="relative h-[50vh] w-full sm:h-[120vh]">
      {/* Sticky container that holds everything in view */}
      <div className="sticky top-0 flex h-[48vh] w-full flex-col items-center justify-start pt-6 overflow-hidden sm:h-screen sm:justify-center sm:pt-0">
        
        {/* Content Wrapper - Using flex to prevent overlap between header and video */}
        <div className="flex w-full flex-col items-center gap-2 sm:gap-14">
          
          {/* Text Header */}
          <motion.div 
            style={{ 
              opacity: useTransform(scrollYProgress, [0, 0.3], [0.6, 1]),
              y: useTransform(scrollYProgress, [0, 0.5], ["20px", "0px"])
            }}
            className="text-center"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-secondary sm:text-[11px]">
              The Campaign
            </p>
            <h2 className="mt-2 font-serif text-[1.8rem] leading-[1.1] text-primary sm:mt-4 sm:text-[2.2rem] lg:text-[3rem]">
              Everyday Beauty. <span className="italic text-secondary">Luxurious Touch.</span>
            </h2>
          </motion.div>

          {/* Video Wrapper */}
          <motion.div
            style={{
              scale,
              width,
              borderRadius,
              opacity
            }}
            className="relative aspect-video overflow-hidden border border-secondary/20 bg-white/10 shadow-2xl backdrop-blur-md lg:aspect-[21/9]"
          >
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src="https://videos.pexels.com/video-files/9698783/9698783-uhd_3840_2160_25fps.mp4"
              autoPlay
              muted
              loop
              playsInline
            />
            
            {/* Subtle Overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

            {/* Floating UI Info */}
            <motion.div 
              style={{ opacity: useTransform(scrollYProgress, [0.4, 0.6], [0, 1]) }}
              className="pointer-events-none absolute inset-x-0 bottom-6 px-6 sm:bottom-10 sm:px-8"
            >
              <div className="mx-auto flex max-w-3xl items-center justify-between rounded-xl border border-white/20 bg-black/10 px-6 py-4 backdrop-blur-xl sm:rounded-2xl">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-secondary">Cinema Edit</p>
                  <p className="mt-1 font-serif text-lg text-white sm:text-xl">The Art of Purity</p>
                </div>
                <p className="text-[8px] font-medium uppercase tracking-[0.3em] text-white/50 hidden sm:block">© 2026 Camliqa Films</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
