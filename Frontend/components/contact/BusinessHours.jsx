"use clirent";

import React from 'react'

export const BusinessHours = () => (
  <aside
    aria-label="Business working hours"
    className="rounded-3xl border border-white/80 !bg-white/95 p-4 shadow-[0_18px_60px_rgba(26,26,62,0.08)] backdrop-blur-sm"
  >
    <h3 className="text-sm font-semibold text-[#1A1A3E] mb-2">Working Hours</h3>
    <dl className="text-sm text-[#1A1A3E]/65 flex flex-col gap-1">
      <div className="flex justify-between">
        <dt className="sr-only">Monday to Friday</dt>
        <dd>Mon – Fri: 9:00 AM – 6:00 PM</dd>
      </div>
      <div className="flex justify-between">
        <dt className="sr-only">Saturday</dt>
        <dd>Saturday: 10:00 AM – 4:00 PM</dd>
      </div>
      <div className="flex justify-between">
        <dt className="sr-only">Sunday</dt>
        <dd>Sunday: Closed</dd>
      </div>
    </dl>
  </aside>
)
