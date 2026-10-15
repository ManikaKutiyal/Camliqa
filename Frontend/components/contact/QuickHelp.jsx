"use client";

import React from 'react'

export const QuickHelp = () => (
  <aside
    aria-label="Quick help section"
    className="rounded-3xl border border-white/80 !bg-white/95 p-4 shadow-[0_18px_60px_rgba(26,26,62,0.08)] backdrop-blur-sm"
  >
    <h3 className="text-sm font-semibold text-[#1A1A3E] mb-2">Need Help?</h3>
    <p className="text-sm text-[#1A1A3E]/65 mb-3">
      Our support team is ready to help you quickly.
    </p>
    <button
      type="button"
      aria-label="Start a live chat with our support team"
      className="bg-[#1A1A3E] text-white text-sm px-4 py-2.5 rounded-full shadow-[0_14px_30px_rgba(26,26,62,0.18)] hover:bg-[#121226] transition"
    >
      Start Chat
    </button>
  </aside>
)
