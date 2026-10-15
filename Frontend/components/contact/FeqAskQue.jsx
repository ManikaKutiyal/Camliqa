"use client";

import React from 'react'

const faqs = [
  {
    question: 'How can I track my order?',
    answer: 'Use the order tracking link in your confirmation email, or contact us with your order number.'
  },
  {
    question: 'What is your return policy?',
    answer: 'We accept returns within 30 days of delivery for eligible products in original condition.'
  },
  {
    question: 'How do I get a refund?',
    answer: 'Refunds are processed within 5-7 business days after the returned item has been inspected.'
  },
]

export default function FeqAskQue() {
  return (
    <section
      aria-labelledby="faq-heading"
      className="rounded-3xl border border-white/80 !bg-white/95 p-5 shadow-[0_18px_60px_rgba(26,26,62,0.08)] backdrop-blur-sm"
    >
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(f => ({
              "@type": "Question",
              "name": f.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": f.answer
              }
            }))
          })
        }}
      />

      <h2
        id="faq-heading"
        className="text-base font-semibold mb-4 text-[var(--ink)]"
      >
        Frequently Asked Questions
      </h2>

      <dl className="space-y-3">
        {faqs.map((faq) => (
          <div key={faq.question} className="flex items-start gap-2 text-sm">
            <span className="mt-1 font-bold leading-none text-[var(--accent)]" aria-hidden="true">•</span>
            <div>
              <dt className="font-medium text-[#1A1A3E]">{faq.question}</dt>
              <dd className="text-xs text-[#1A1A3E]/60 mt-0.5">{faq.answer}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  )
}
