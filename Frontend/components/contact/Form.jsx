"use client";

import React, { useState } from "react";

export default function Form() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    issue: "",
    message: "",
    company: "",
    captchaToken: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });

  function onChangeField(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: "", text: "" });

    if (!form.name.trim()) {
      setStatus({ type: "error", text: "Please enter your name." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setStatus({ type: "error", text: "Please enter a valid email address." });
      return;
    }
    if (!form.issue) {
      setStatus({ type: "error", text: "Please select an issue." });
      return;
    }
    if (form.message.trim().length < 10) {
      setStatus({ type: "error", text: "Please write a message with at least 10 characters." });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          issue: form.issue,
          message: form.message.trim(),
          company: form.company.trim(),
          captchaToken: form.captchaToken.trim(),
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to send your message.");
      }

      setStatus({ type: "success", text: "Message sent successfully. We will get back to you soon." });
      setForm({ name: "", email: "", phone: "", issue: "", message: "", company: "", captchaToken: "" });
      
      setTimeout(() => {
        setStatus((prev) => (prev.type === "success" ? { type: "", text: "" } : prev));
      }, 5000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send your message.";
      setStatus({ type: "error", text: message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      aria-labelledby="form-heading"
      className="rounded-3xl border border-white/80 !bg-white/95 p-5 shadow-[0_18px_60px_rgba(26,26,62,0.08)] backdrop-blur-sm"
    >
      <h2
        id="form-heading"
        className="text-base font-semibold mb-4 text-[var(--ink)]"
      >
        Get in Touch
      </h2>

      <form
        className="space-y-3"
        aria-label="Contact form"
        noValidate
        onSubmit={handleSubmit}
      >
        <div className="hidden" aria-hidden="true">
          <label htmlFor="contact-company">Company</label>
          <input
            id="contact-company"
            type="text"
            name="company"
            value={form.company}
            onChange={onChangeField}
            autoComplete="off"
            tabIndex={-1}
          />
        </div>

        <div>
          <label htmlFor="contact-name" className="block text-xs font-medium mb-1 text-[var(--muted-ink)]">
            Your Name
          </label>
          <input
            id="contact-name"
            type="text"
            name="name"
            value={form.name}
            onChange={onChangeField}
            autoComplete="name"
            placeholder="Enter your full name"
          className="w-full rounded-xl border border-[#E8E0F2] bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[#C5A059]/10 transition"
            aria-required="true"
          />
        </div>

        <div>
          <label htmlFor="contact-email" className="block text-xs font-medium mb-1 text-[var(--muted-ink)]">
            Email Address
          </label>
          <input
            id="contact-email"
            type="email"
            name="email"
            value={form.email}
            onChange={onChangeField}
            autoComplete="email"
            placeholder="Enter your email address"
          className="w-full rounded-xl border border-[#E8E0F2] bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[#C5A059]/10 transition"
            aria-required="true"
          />
        </div>

        <div>
          <label htmlFor="contact-phone" className="block text-xs font-medium mb-1 text-[var(--muted-ink)]">
            Phone Number{' '}
            <span className="text-[var(--muted)] font-normal">(optional)</span>
          </label>
          <input
            id="contact-phone"
            type="tel"
            name="phone"
            value={form.phone}
            onChange={onChangeField}
            autoComplete="tel"
            placeholder="+91 98765 43210"
          className="w-full rounded-xl border border-[#E8E0F2] bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[#C5A059]/10 transition"
          />
        </div>

        <div>
          <label htmlFor="contact-issue" className="block text-xs font-medium mb-1 text-[var(--muted-ink)]">
            Select Issue
          </label>
          <select
            id="contact-issue"
            name="issue"
            value={form.issue}
            onChange={onChangeField}
          className="w-full rounded-xl border border-[#E8E0F2] bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[#C5A059]/10 transition"
            aria-required="true"
          >
            <option value="" disabled>Select an issue</option>
            <option value="order-status">Order status</option>
            <option value="return-request">Return request</option>
            <option value="product-inquiry">Product inquiry</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="contact-message" className="block text-xs font-medium mb-1 text-[var(--muted-ink)]">
            Your Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            value={form.message}
            onChange={onChangeField}
            rows={4}
            placeholder="Describe your query in detail..."
          className="w-full rounded-xl border border-[#E8E0F2] bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[#C5A059]/10 transition resize-none"
            aria-required="true"
          />
        </div>

        <div className="flex items-center gap-4 pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-[#1A1A3E] hover:bg-[#121226] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(26,26,62,0.18)] transition"
            aria-label="Submit your message to our support team"
          >
            {submitting ? "Sending..." : "Send Message"}
          </button>
          <a
            href="/track-order"
            className="text-sm font-medium text-[var(--accent-deep)] hover:underline transition"
            aria-label="Track your existing order"
          >
            Track Your Order &rsaquo;
          </a>
        </div>
        <p className="text-[11px] text-[var(--muted)]">
          CAPTCHA can be enabled later by wiring a provider token into this form.
        </p>
        {status.text ? (
          <p
            className={`text-sm ${
              status.type === "success" ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {status.text}
          </p>
        ) : null}
      </form>
    </section>
  );
}
