"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, MapPin, Phone } from "lucide-react";

const returnPolicyItems = [
  "We do not accept returns on products that have been opened or used.",
  "Returns are only accepted in the case of:",
  "Damaged products",
  "Defective products",
  "Wrong item delivered",
  "Unboxing video and photographs should be provided for strong evidence."
];

const reportingItems = [
  "Order ID",
  "Photos or videos of the product",
  "Description of the issue"
];

const refundItems = [
  "Offer a replacement product, or",
  "Provide a refund (if replacement is not available)",
  "Refunds will be processed within 5-7 business days.",
  "The refund will be credited to the original payment method."
];

const nonRefundableItems = [
  "Change of mind",
  "Product not suitable for skin/hair type",
  "Allergic reactions (customers are advised to do a patch test)",
  "Delay caused by courier services"
];

const contactItems = [
  {
    id: "phone",
    label: "Phone Number",
    value: "9676758943",
    href: "tel:+919676758943",
    Icon: Phone,
    ariaLabel: "Call 9676758943"
  },
  {
    id: "email",
    label: "Email Address",
    value: "camliqainternational@gmail.com",
    href: "mailto:camliqainternational@gmail.com",
    Icon: Mail,
    ariaLabel: "Email camliqainternational@gmail.com"
  },
  {
    id: "address",
    label: "Office Address",
    value: "Chinnamushidiwada, Sujathanagar, Visakhapatnam, 530047 A.P.",
    href:
      "https://maps.google.com/?q=Chinnamushidiwada,+Sujathanagar,+Visakhapatnam,+530047+A.P.",
    Icon: MapPin,
    ariaLabel: "Open Chinnamushidiwada, Sujathanagar, Visakhapatnam in Google Maps",
    external: true
  }
];

function ContactItem({ label, value, href, Icon, ariaLabel, external }) {
  const handleCopy = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
    }
  };

  return (
    <a
      href={href}
      aria-label={ariaLabel}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="group grid w-full grid-cols-1 gap-4 rounded-2xl border border-primary/10 bg-white/70 px-5 py-4 text-left shadow-[0_20px_50px_-40px_rgba(26,29,54,0.25)] transition duration-300 hover:-translate-y-0.5 hover:border-secondary/35 hover:shadow-[0_26px_70px_-48px_rgba(197,160,89,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
    >
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-secondary/20 bg-secondary/10 text-secondary transition duration-300 group-hover:scale-105 group-hover:bg-secondary/15">
          <Icon className="h-5 w-5" strokeWidth={1.6} />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary/45">{label}</p>
          <p className="mt-1 break-words text-[0.95rem] font-medium text-primary/65 sm:text-[0.98rem]">
            {value}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copy ${label}`}
        className="inline-flex h-9 w-full items-center justify-center rounded-full border border-secondary/20 bg-white/80 px-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-secondary/80 transition duration-300 hover:border-secondary/40 hover:text-secondary sm:w-auto sm:px-4"
      >
        Copy
      </button>
    </a>
  );
}

export default function RefundReturnPolicyPage() {
  return (
    <main className="camliqa-aurora min-h-screen bg-base text-primary antialiased selection:bg-secondary/25 selection:text-primary">
      <Navbar />

      <section
        className="grain-overlay relative isolate overflow-hidden"
        style={{
          background:
            "radial-gradient(circle_at_16%_20%,rgba(244,234,219,0.9)_0%,rgba(244,234,219,0)_30%),radial-gradient(circle_at_84%_16%,rgba(232,226,248,0.92)_0%,rgba(232,226,248,0)_26%),linear-gradient(90deg,#f5eddc_0%,#fcfbf9_52%,#f2ecfb_100%)"
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(circle at 22% 12%, rgba(26,29,54,0.08) 0%, transparent 40%), radial-gradient(circle at 78% 38%, rgba(232,226,248,0.55) 0%, transparent 42%)"
          }}
        />
        <div className="section-shell relative z-10 py-20 sm:py-28 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.62em] text-secondary">Legal &amp; Policy</p>
            <h1 className="mt-6 font-serif text-[3.1rem] leading-[1.15] tracking-tight sm:text-[4.2rem] sm:leading-[1.05] lg:text-[4.9rem]">
              Refund &amp; <span className="italic text-secondary">Return Policy</span>
            </h1>
            <p className="mt-6 text-[1.02rem] leading-relaxed text-primary/65 sm:text-[1.08rem]">
              Our commitment to transparency and your satisfaction in every ritual. We ensure that your journey with our
              sanctuary is as pure as our ingredients.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell pb-16 sm:pb-20">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <article
            className="rounded-[28px] border border-primary/10 bg-section/65 p-7 shadow-[0_22px_60px_-40px_rgba(26,29,54,0.22)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_70px_-44px_rgba(26,29,54,0.28)] sm:p-9"
          >
            <div className="flex items-center gap-3">
              <span className="text-[12px] font-bold uppercase tracking-[0.32em] text-secondary">01</span>
              <h2 className="font-serif text-[1.6rem] text-primary sm:text-[1.85rem]">Return Policy</h2>
            </div>
            <ul className="mt-5 space-y-3 text-[1rem] leading-relaxed text-primary/70">
              {returnPolicyItems.map((item, index) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-secondary" />
                  <span className={index >= 2 ? "font-semibold text-primary/75" : ""}>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article
            className="rounded-[28px] border border-primary/10 bg-section/70 p-7 text-primary shadow-[0_24px_70px_-40px_rgba(26,29,54,0.22)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_32px_80px_-44px_rgba(26,29,54,0.28)] sm:p-9"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[12px] font-bold uppercase tracking-[0.32em] text-secondary">02</span>
                <h2 className="mt-2 font-serif text-[1.6rem] text-primary sm:text-[1.85rem]">Reporting an Issue</h2>
              </div>
              <div className="rounded-[18px] border border-primary/10 bg-white/70 px-4 py-3 text-left transition duration-300 hover:-translate-y-0.5 hover:border-secondary/30 hover:shadow-[0_18px_40px_-32px_rgba(197,160,89,0.25)]">
                <p className="text-[10px] uppercase tracking-[0.3em] text-primary/55">Timeline</p>
                <p className="mt-2 text-[1rem] font-semibold text-primary/75">Within 72 Hours</p>
              </div>
            </div>
            <p className="mt-5 text-[0.98rem] leading-relaxed text-primary/70">
              Customers must report any issue within 72 hours of delivery. To raise a request, contact us with:
            </p>
            <ul className="mt-5 space-y-3 text-[0.98rem] text-primary/70">
              {reportingItems.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <article
            className="rounded-[24px] border border-primary/10 bg-section/60 p-7 shadow-[0_18px_50px_-40px_rgba(26,29,54,0.22)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_26px_60px_-44px_rgba(26,29,54,0.28)] sm:p-8"
          >
            <div className="flex items-center gap-3">
              <span className="text-[12px] font-bold uppercase tracking-[0.32em] text-secondary">03</span>
              <h2 className="font-serif text-[1.55rem] text-primary">Refund / Replacement</h2>
            </div>
            <p className="mt-4 text-[1rem] leading-relaxed text-primary/70">
              Once the issue is verified, we will:
            </p>
            <ul className="mt-4 space-y-3 text-[1rem] text-primary/75">
              {refundItems.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-secondary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article
            className="rounded-[24px] border border-primary/10 bg-section/60 p-7 shadow-[0_18px_50px_-40px_rgba(26,29,54,0.22)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_26px_60px_-44px_rgba(26,29,54,0.28)] sm:p-8"
          >
            <div className="flex items-center gap-3">
              <span className="text-[12px] font-bold uppercase tracking-[0.32em] text-secondary">04</span>
              <h2 className="font-serif text-[1.55rem] text-primary">Non-Refundable Cases</h2>
            </div>
            <p className="mt-4 text-[1rem] leading-relaxed text-primary/70">
              We do not offer refunds or returns in the following cases:
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {nonRefundableItems.map((item) => (
                <div
                  key={item}
                  className="rounded-[14px] border border-secondary/15 bg-white/80 px-4 py-3 text-[0.95rem] text-primary/75 transition duration-300 hover:-translate-y-0.5 hover:border-secondary/30 hover:shadow-[0_16px_36px_-28px_rgba(197,160,89,0.2)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="mt-10 space-y-8">
          <article
            className="rounded-[24px] border border-primary/10 bg-section/60 p-7 shadow-[0_18px_50px_-40px_rgba(26,29,54,0.22)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_26px_60px_-44px_rgba(26,29,54,0.28)] sm:p-8"
          >
            <p className="text-[12px] font-bold uppercase tracking-[0.32em] text-secondary">05</p>
            <h3 className="mt-3 font-serif text-[1.4rem] text-primary">Cancellation Policy</h3>
            <p className="mt-3 text-[0.98rem] leading-relaxed text-primary/70">
              Orders can be cancelled before they are shipped. Once the order is shipped, cancellation is not
              possible.
            </p>
          </article>

          <article
            className="rounded-[24px] border border-primary/10 bg-section/60 p-7 shadow-[0_18px_50px_-40px_rgba(26,29,54,0.22)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_26px_60px_-44px_rgba(26,29,54,0.28)] sm:p-8"
          >
            <p className="text-[12px] font-bold uppercase tracking-[0.32em] text-secondary">06</p>
            <h3 className="mt-3 font-serif text-[1.4rem] text-primary">Shipping Charges</h3>
            <p className="mt-3 text-[0.98rem] leading-relaxed text-primary/70">
              Shipping charges are non-refundable. In case of damaged or wrong products, we will bear the replacement
              shipping cost.
            </p>
          </article>

          <article
            className="rounded-[26px] border border-secondary/20 bg-gradient-to-br from-[#f6f0e6] via-white to-[#f7f3fb] px-8 py-12 text-primary shadow-[0_30px_80px_-45px_rgba(12,16,31,0.35)] sm:px-10"
          >
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-[12px] font-bold uppercase tracking-[0.32em] text-secondary">07</span>
              <h3 className="font-serif text-[1.8rem] text-primary sm:text-[2.05rem]">Contact Us</h3>
            </div>
            <p className="mt-4 text-[1.02rem] leading-relaxed text-primary/70">
              For any questions or concerns, contact us at:
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {contactItems.map((item) => (
                <ContactItem key={item.id} {...item} />
              ))}
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-primary/10 bg-white/70 shadow-[0_24px_60px_-46px_rgba(26,29,54,0.2)]">
              <div className="h-[260px] w-full sm:h-[320px]">
                <iframe
                  title="Camliqa office location"
                  src="https://maps.google.com/?q=Chinnamushidiwada,+Sujathanagar,+Visakhapatnam,+530047+A.P.&output=embed"
                  className="h-full w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </article>
        </div>
      </section>

      <Footer />
    </main>
  );
}
