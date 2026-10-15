"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Preloader() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [isLoading, setIsLoading] = useState(isHomePage);

  useEffect(() => {
    if (!isHomePage) return;
    // Prevent scrolling while loading
    document.body.style.overflow = 'hidden';
    
    const timer = setTimeout(() => {
      setIsLoading(false);
      document.body.style.overflow = 'unset';
    }, 2800);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = 'unset';
    };
  }, [isHomePage]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 1, ease: [0.76, 0, 0.24, 1] }
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
        >
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
               style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/p6.png")' }} />
          
          <div className="relative flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, filter: "blur(10px)" }}
              animate={{ 
                scale: 1,
                opacity: 1,
                filter: "blur(0px)"
              }}
              exit={{ 
                scale: 1.3,
                opacity: 0,
                filter: "blur(15px)",
                transition: { duration: 0.8, ease: "easeIn" }
              }}
              transition={{ 
                duration: 1.8,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="flex flex-col items-center"
            >
              <span className="font-serif text-6xl tracking-[0.15em] text-primary sm:text-8xl luxury-text-glow">
                CAMLIQA
              </span>
              
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.6, ease: "easeInOut" }}
                className="mt-6 h-px bg-gradient-to-r from-transparent via-secondary to-transparent"
              />
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1 }}
                className="mt-4 text-[10px] font-bold uppercase tracking-[0.5em] text-secondary/80"
              >
                Purity Refined
              </motion.p>
            </motion.div>

            {/* Ambient Glows */}
            <motion.div 
              animate={{ 
                opacity: [0, 0.15, 0.1],
                scale: [0.8, 1.2, 1]
              }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute -z-10 h-64 w-64 rounded-full bg-secondary blur-[100px]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
