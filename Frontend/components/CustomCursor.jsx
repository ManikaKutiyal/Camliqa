"use client";

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isFinePointer, setIsFinePointer] = useState(false);

  // Core coordinates
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Spring physics for smooth "halo" following
  const springConfig = { damping: 25, stiffness: 250, mass: 0.5 };
  const haloX = useSpring(cursorX, springConfig);
  const haloY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: fine)');

    const updatePointerMode = () => setIsFinePointer(mediaQuery.matches);
    updatePointerMode();

    if (!mediaQuery.matches) {
      document.body.style.cursor = 'auto';
      return undefined;
    }

    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleHover = (e) => {
      const target = e.target;
      const isInteractive = 
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.closest('button') || 
        target.closest('a') ||
        target.classList.contains('cursor-magnetic');
      
      setIsHovered(isInteractive);
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleHover);
    document.body.style.cursor = 'none'; // Hide default cursor

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleHover);
      document.body.style.cursor = 'auto';
    };
  }, [isVisible]);

  if (!isFinePointer) return null;

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] mix-blend-difference">
      {/* The Pinpoint (Instant) */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.9)]"
      />

      {/* The Luxury Halo (Delayed/Smooth) */}
      <motion.div
        style={{
          x: haloX,
          y: haloY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isHovered ? 2.8 : 1,
          opacity: isHovered ? 0.9 : 0.5,
          borderWidth: isHovered ? '1px' : '1.5px',
        }}
        className="h-8 w-8 rounded-full border border-white bg-transparent shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300 ease-out"
      />
    </div>
  );
}
