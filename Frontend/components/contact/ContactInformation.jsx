"use client";

import React from 'react'

export default function ContactInformation() {
  return (
    <section
      aria-labelledby="contact-info-heading"
      className="rounded-3xl border border-white/80 !bg-white/95 p-5 shadow-[0_18px_60px_rgba(26,26,62,0.08)] backdrop-blur-sm"
    >
      <h2
        id="contact-info-heading"
        className="text-base font-semibold mb-4 text-[var(--ink)]"
      >
        Contact Information
      </h2>

      {/* <address> tells Google this is contact/location data */}
      <address className="not-italic">
        <ul className="space-y-3 text-sm">

          {/* Phone */}
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-[var(--muted)]" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </span>
            <div>
              <span className="text-xs text-[var(--muted)]">Call Us: </span>
              <a
                href="tel:+919876543210"
                className="font-medium text-[#1A1A3E] hover:text-[#C5A059] transition"
                aria-label="Call us at +91 98765 43210"
              >
                +91 98765 43210
              </a>
            </div>
          </li>

          {/* Email */}
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-[var(--muted)]" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </span>
            <div>
              <span className="text-xs text-[var(--muted)]">Email Us: </span>
              <a
                href="mailto:support@yourstore.com"
                className="font-medium text-[#1A1A3E] hover:text-[#C5A059] transition"
                aria-label="Email us at support@yourstore.com"
              >
                support@yourstore.com
              </a>
            </div>
          </li>

          {/* Address */}
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-[var(--muted)]" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </span>
            <div>
              <span className="text-xs text-[var(--muted)]">Visit Us: </span>
              <span className="font-medium text-[#1A1A3E]">
                123, Market Road, New Delhi, India
              </span>
            </div>
          </li>

          {/* Hours */}
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-[var(--muted)]" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </span>
            <div>
              <p className="font-medium text-[#1A1A3E]">Working Hours:</p>
              <p className="text-xs text-[#1A1A3E]/60 mt-0.5">Mon – Sat: 9 AM – 6 PM</p>
              <p className="text-xs text-[#1A1A3E]/60">Sunday: Closed</p>
            </div>
          </li>

        </ul>
      </address>
    </section>
  )
}
