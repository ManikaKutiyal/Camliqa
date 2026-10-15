"use client";

import React from 'react'

const socials = [
  {
    name: 'Facebook',
    href: 'https://facebook.com/yourstore',
    bg: '#1877F2',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="20" height="20" aria-hidden="true">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/yourstore',
    bg: 'radial-gradient(circle at 30% 110%, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    name: 'Twitter / X',
    href: 'https://twitter.com/yourstore',
    bg: '#1DA1F2',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="20" height="20" aria-hidden="true">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
      </svg>
    ),
  },
  {
    name: 'WhatsApp',
    href: 'https://wa.me/919876543210',
    bg: '#25D366',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="20" height="20" aria-hidden="true">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  },
]

export default function ConnectWithUs() {
  return (
    <section
      aria-labelledby="social-heading"
      className="rounded-3xl border border-white/80 !bg-white/95 p-5 shadow-[0_18px_60px_rgba(26,26,62,0.08)] backdrop-blur-sm"
    >
      <h2
        id="social-heading"
        className="text-base font-semibold mb-2 text-[var(--ink)]"
      >
        Connect With Us
      </h2>

      {/* Social icons */}
      <nav aria-label="Social media links">
        <ul className="flex items-center gap-3 mb-4 list-none p-0 m-0">
          {socials.map((s) => (
            <li key={s.name}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit our ${s.name} page (opens in new tab)`}
                className="flex items-center justify-center w-10 h-10 rounded-full transition hover:scale-110 hover:shadow-md"
                style={{ background: s.bg }}
              >
                {s.icon}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Live chat button */}
      <button
        type="button"
        className="w-full rounded-xl bg-[var(--ink)] text-white text-sm font-semibold py-2.5 flex items-center justify-center gap-2 hover:opacity-90 transition"
        aria-label="Start a live chat with our support team"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Or Chat with Us Live!
      </button>
    </section>
  )
}
