"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";


const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const PinterestIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
  </svg>
);

const FooterLinkColumn = ({ title, links }) => (
  <div className="flex flex-col gap-4">
    <h3
      className="text-[#C5A059] font-bold tracking-[0.18em] text-xs uppercase mb-2 opacity-100"
      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
    >
      {title}
    </h3>
    {links.map((link) => (
      <a
        key={typeof link === "string" ? link : link.label}
        href={typeof link === "string" ? "#" : link.href}
        className="text-[#1A1D36]/70 text-sm tracking-wide hover:text-[#C5A059] transition-all duration-300 hover:translate-x-0.5"
        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1rem" }}
      >
        {typeof link === "string" ? link : link.label}
      </a>
    ))}
  </div>
);

const CamliqaFooter = () => {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  const handleJoin = () => {
    if (email.trim()) {
      setJoined(true);
    }
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Cinzel:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <footer
        className="w-full relative overflow-hidden pt-24 pb-10"
        style={{ backgroundColor: "transparent" }}
      >

        <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">
          {/* Top section: Brand + Navigation */}
          <div className="grid grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-x-8 gap-y-12 mb-16 sm:mb-28">
            {/* Brand column */}
            <div className="col-span-2 lg:col-span-1 flex flex-col gap-6 sm:gap-8">
              <div className="flex flex-col items-start gap-4">
                <div>
                  <h2
                    className="text-[#C5A059] text-4xl sm:text-6xl font-normal leading-none"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    CAMLIQA
                  </h2>
                  <p
                    className="text-[#C5A059] tracking-[0.25em] text-[10px] sm:text-[12px] uppercase opacity-100 mt-2 sm:mt-3"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    Readiate &nbsp;·&nbsp; Good &nbsp;·&nbsp; Energy
                  </p>
                </div>
              </div>
              <p
                className="text-[#1A1D36]/80 text-[16px] sm:text-[20px] leading-relaxed max-w-md opacity-100 font-medium"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                Discover the epitome of natural luxury. Exquisite skincare for a radiant, timeless glow.
              </p>
            </div>

            {/* Navigation columns */}
            <div className="col-span-1">
              <FooterLinkColumn
                title="Our World"
                links={[
                  { label: "Philosophy", href: "/about" },
                  { label: "Ingredients", href: "/#ingredients" },
                  { label: "Heritage", href: "/about#story" },
                  { label: "Sustainability", href: "/about#values" },
                ]}
              />
            </div>
            <div className="col-span-1">
              <FooterLinkColumn
                title="Collections"
                links={[
                  { label: "Skin Care", href: "/skin-care" },
                  { label: "Hair Care", href: "/hair-care" },
                  { label: "Body Care", href: "/products?category=Body%20Care" },
                ]}
              />
            </div>
            <div className="col-span-1">
              <FooterLinkColumn
                title="The Journal"
                links={[
                  { label: "Newsletter", href: "/#inner-circle" },
                  { label: "Beauty Assistant", href: "/beauty-assistant" },
                  { label: "Expert Advice", href: "/#social-proof" },
                ]}
              />
            </div>
            <div className="col-span-1">
              <FooterLinkColumn
                title="Support"
                links={[
                  { label: "Contact", href: "/contact-us" },
                  "FAQs",
                  { label: "Refund", href: "/refund-return-policy" },
                ]}
              />
            </div>
          </div>


          {/* Large Brand Mark */}
          <div className="mt-12 sm:mt-24 mb-[-2vw] sm:mb-[-2.5vw] select-none pointer-events-none">
            <h1 
              className="text-[#1A1D36]/5 text-[18vw] sm:text-[16vw] leading-none font-light text-center select-none"
              style={{ 
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                letterSpacing: "-0.02em",
                textTransform: 'uppercase'
              }}
            >
              CAMLIQA
            </h1>
          </div>

          {/* Bottom bar */}
          <div
            className="pt-8 sm:pt-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8"
            style={{ borderTop: "1px solid rgba(26,29,54,0.1)" }}
          >
            <p
              className="text-[#1A1D36]/65 text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-light text-center md:text-left"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              © 2026 CAMLIQA. All Rights Reserved.
            </p>

            <div className="flex items-center gap-6 sm:gap-10">
              {[
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Terms of Service", href: "/terms-conditions" }
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-[#1A1D36]/65 text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-light hover:text-[#C5A059] transition-colors duration-300"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
              <div className="flex items-center gap-6">
                {[
                  { icon: <InstagramIcon />, label: "Instagram" },
                  { icon: <FacebookIcon />, label: "Facebook" },
                  { icon: <PinterestIcon />, label: "Pinterest" },
                ].map(({ icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="text-[#1A1D36]/65 hover:text-[#C5A059] transition-colors duration-300"
                  >
                    {icon}
                  </a>
                ))}
              </div>
              <a
                href="#"
                className="text-[#1A1D36]/65 text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-light hover:text-[#C5A059] transition-colors duration-300"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                Site Credits
              </a>
            </div>
          </div>
        </div>

        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/p6.png")' }} />
      </footer>
    </>
  );
};

// export default CamliqaFooter;
export default CamliqaFooter;
