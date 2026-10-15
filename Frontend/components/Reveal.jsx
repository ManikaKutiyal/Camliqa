"use client";

import { motion, useInView, useAnimation } from 'framer-motion';
import { useEffect, useRef } from 'react';

export default function Reveal({ children, width = "fit-content", height = "auto", delay = 0.2, direction = "up" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const mainControls = useAnimation();

  const variants = {
    hidden: { 
      opacity: 0, 
      y: direction === "up" ? 15 : direction === "down" ? -15 : 0,
      x: direction === "left" ? 15 : direction === "right" ? -15 : 0,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      x: 0,
    },
  };

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
    }
  }, [isInView, mainControls]);

  return (
    <div ref={ref} style={{ position: "relative", width, height }}>
      <motion.div
        variants={variants}
        initial="hidden"
        animate={mainControls}
        transition={{ duration: 0.6, ease: "easeOut", delay }}
        style={{ height: height === "100%" ? "100%" : "auto" }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export function ImageReveal({ children, delay = 0.2 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className="relative w-full h-full overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 1.2, ease: "easeOut", delay }}
        className="relative w-full h-full"
      >
        {children}
      </motion.div>
    </div>
  );
}
