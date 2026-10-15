"use client";

import React from 'react'

export default function OurLocation() {
  return (
    <section
      aria-labelledby="location-heading"
      className="rounded-3xl border border-white/80 overflow-hidden !bg-white/95 shadow-[0_18px_60px_rgba(26,26,62,0.08)] backdrop-blur-sm"
    >
   
      <h2
        id="location-heading"
        className="sr-only"
      >
        Our Store Location – 123 Market Road, New Delhi
      </h2>

      <div className="relative w-full h-64 md:h-72 bg-[#F6F1FB]">
        <iframe
          title="YourStore location – 123 Market Road, Lajpat Nagar, New Delhi, India"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.008274841537!2d77.23809607227359!3d28.569514233254264!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce3ad71f3e7cd%3A0xbdd2afa9763d8799!2s123%2C%20Market%20Rd%2C%20Block%20I%2C%20Lajpat%20Nagar%20II%2C%20Lajpat%20Nagar%2C%20New%20Delhi%2C%20Delhi%20110024%2C%20India!5e0!3m2!1sen!2sus!4v1776872781082!5m2!1sen!2sus"
          className="w-full h-full border-0"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          aria-label="Google Maps showing YourStore at 123 Market Road, New Delhi"
        />

        <a
          href="https://maps.google.com/?q=123+Market+Road+New+Delhi"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white text-[#1A1A3E] text-xs font-semibold border border-white/80 rounded-full px-3 py-1.5 shadow-[0_12px_24px_rgba(26,26,62,0.10)] hover:opacity-90 transition"
          aria-label="Open YourStore location in Google Maps"
        >
          View on Map
        </a>
      </div>
    </section>
  )
}
