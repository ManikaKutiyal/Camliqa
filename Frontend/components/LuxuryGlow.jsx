"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function LuxuryGlow() {
  return (
    <div 
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ background: 'linear-gradient(110deg, rgba(248,246,242,0.95) 0%, rgba(244,241,249,0.92) 100%)' }}
    >
      {/* Golden Ambient Glow (Top Left) */}
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-[20%] -left-[10%] h-[120%] w-[120%] rounded-full blur-[180px]"
        style={{
          background: 'radial-gradient(circle, rgba(197,160,89,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Deep Purple Glow (Bottom Right) */}
      <motion.div
        animate={{
          x: [0, -60, 0],
          y: [0, -40, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -bottom-[30%] -right-[20%] h-[120%] w-[120%] rounded-full blur-[200px]"
        style={{
          background: 'radial-gradient(circle, rgba(108,63,197,0.1) 0%, transparent 70%)',
        }}
      />

      {/* Subtle Purple Accent (Middle Left) */}
      <motion.div
        animate={{
          y: [0, 100, 0],
          opacity: [0.03, 0.05, 0.03],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[40%] -left-[10%] h-[60%] w-[60%] rounded-full blur-[150px]"
        style={{
          background: 'radial-gradient(circle, rgba(108,63,197,0.15) 0%, transparent 60%)',
        }}
      />

      {/* Central Radiance */}
      <div 
        className="absolute left-1/2 top-1/2 h-[100%] w-[100%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[220px] opacity-[0.03]"
        style={{
          background: 'radial-gradient(circle, rgba(197,160,89,0.2) 0%, transparent 60%)',
        }}
      />

      {/* Grain/Noise Overlay */}
      <div className="global-grain" />

      {/* Vignette for depth */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(26, 26, 62, 0.03) 100%)',
        }}
      />
    </div>
  );
}

