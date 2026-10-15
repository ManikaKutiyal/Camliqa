"use client";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const productImage = "/terms/t-c.jpeg";

const sections = [
  {
    id: "general-information",
    number: "01",
    title: "General Information",
    body: [
      "Camliqa is a skin and hair care brand offering natural and handmade cosmetic products. All products are formulated with care; however, results may vary depending on individual skin and hair types."
    ]
  },
  {
    id: "eligibility",
    number: "02",
    title: "Eligibility",
    body: [
      "By using this website, you confirm that you are at least 18 years old or using the website under the supervision of a parent or legal guardian."
    ]
  },
  {
    id: "product-information",
    number: "03",
    title: "Product Information",
    list: [
      "All product descriptions, images, and pricing are subject to change without notice.",
      "We strive to display product colors and details accurately; however, actual results may vary.",
      "Our products are made using natural ingredients, but we do not guarantee that they are free from allergens."
    ]
  },
  {
    id: "usage-disclaimer",
    number: "04",
    title: "Usage Disclaimer",
    list: [
      "Perform a patch test before using any product.",
      "Camliqa is not responsible for any allergic reactions or adverse effects.",
      "Products are for external use only unless specified."
    ],
    tone: "accent"
  },
  {
    id: "orders-payments",
    number: "05",
    title: "Orders and Payments",
    body: [
      "All orders are subject to availability and acceptance. Prices are listed in INR and are inclusive of taxes as applicable. We reserve the right to cancel or refuse any order at our discretion."
    ]
  },
  {
    id: "shipping-policy",
    number: "06",
    title: "Shipping Policy",
    body: [
      "We ship globally using carbon-neutral logistics providers. Orders are processed within 1-3 business days. Estimated delivery times:"
    ],
    shippingNotes: [
      "Orders are processed within 3 business days.",
      "Timelines vary by location.",
      "Camliqa is not responsible for delays caused by courier services."
    ],
    tone: "muted"
  },
  {
    id: "returns-refunds",
    number: "07",
    title: "Returns and Refunds",
    body: [
      "Due to the nature of cosmetic products, returns are not accepted once the product is opened."
    ],
    note: "Refunds or replacements will be provided only for damaged or defective products. Required: unboxing video recordings and photographs.",
    noteEmphasis: "Customers must report issues within 3 days of delivery."
  },
  {
    id: "intellectual-property",
    number: "08",
    title: "Intellectual Property",
    body: [
      "All content on this website, including logos, images, text, and designs, is the property of Camliqa and may not be used without permission."
    ]
  },
  {
    id: "privacy",
    number: "09",
    title: "Privacy",
    body: [
      "Your personal information is handled according to our Privacy Policy. We do not sell or misuse your data."
    ]
  },
  {
    id: "limitation-liability",
    number: "10",
    title: "Limitation of Liability",
    body: [
      "Camliqa shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website."
    ]
  },
  {
    id: "governing-law",
    number: "11",
    title: "Governing Law",
    body: [
      "These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Andhra Pradesh."
    ]
  },
  {
    id: "changes-to-terms",
    number: "12",
    title: "Changes to Terms",
    body: [
      "Camliqa reserves the right to update or modify these Terms at any time without prior notice."
    ]
  }
];

const tocItems = [
  ...sections.map((section) => ({
    id: section.id,
    label: `${section.number}. ${section.title}`
  })),
  { id: "contact-us", label: "13. Contact Us" }
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

export default function TermsConditionsPage() {
  return (
    <main className="camliqa-aurora min-h-screen bg-base text-primary antialiased selection:bg-secondary/25 selection:text-primary">
      <Navbar />

      <section
        className="grain-overlay relative isolate overflow-hidden"
        style={{
          background:
            "radial-gradient(circle_at_18%_18%,rgba(244,234,219,0.88)_0%,rgba(244,234,219,0)_30%),radial-gradient(circle_at_82%_12%,rgba(232,226,248,0.9)_0%,rgba(232,226,248,0)_26%),linear-gradient(90deg,#f5eddc_0%,#fcfbf9_52%,#f2ecfb_100%)"
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
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <div className="h-px w-6 bg-gradient-to-r from-secondary/60 to-transparent" />
              <p className="text-[10px] font-bold uppercase tracking-[0.62em] text-secondary">Legal Documentation</p>
            </div>
            <h1 className="mt-6 font-serif text-[3.2rem] leading-[1.2] tracking-tight sm:text-[4.4rem] sm:leading-[1.05] lg:text-[5.2rem]">
              Terms &amp; <span className="text-secondary italic">Conditions</span>
            </h1>
            <p className="mt-8 max-w-2xl text-[1.02rem] leading-relaxed text-primary/65 sm:text-[1.08rem]">
              Welcome to Camliqa. These terms govern your use of our website and purchase of our botanical skincare
              products. By accessing our platform, you embrace our philosophy of slow beauty and clinical efficacy.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/55">
              <span className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-white/70 px-4 py-2">
                Updated policy
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-white/70 px-4 py-2">
                Camliqa legal
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell pb-20 sm:pb-28">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.32fr)_minmax(0,0.68fr)]">
          <aside className="hidden lg:flex lg:flex-col lg:gap-6">
            <div className="sticky top-28 space-y-6">
              <div className="rounded-[22px] border border-primary/10 bg-section/55 p-6 shadow-[0_20px_60px_-46px_rgba(26,29,54,0.22)] backdrop-blur-md">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60">Table of Contents</p>
                <div className="mt-5 flex flex-col gap-3">
                  {tocItems.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="group flex items-center justify-between rounded-full border border-transparent px-3 py-2 text-[0.94rem] text-primary/65 transition hover:border-secondary/20 hover:bg-white/70 hover:text-primary"
                    >
                      <span>{item.label}</span>
                      <span className="text-secondary opacity-0 transition group-hover:opacity-100">•</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="rounded-[22px] border border-primary/10 bg-gradient-to-br from-[#f6f0e6] via-white to-[#f7f3fb] p-6 shadow-[0_18px_50px_-44px_rgba(26,29,54,0.24)]">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60">Need help?</p>
                <p className="mt-4 text-[0.98rem] leading-relaxed text-primary/70">
                  For questions about orders, shipping, or returns, our team is ready to help.
                </p>
                <div className="mt-4 space-y-2 text-[0.98rem] text-primary">
                  <p className="font-semibold">camliqainternational@gmail.com</p>
                  <p className="font-semibold">9676758943</p>
                </div>
                <a
                  href="#contact-us"
                  className="mt-5 inline-flex items-center gap-2 text-[0.8rem] font-semibold uppercase tracking-[0.2em] text-secondary"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </aside>

          <div className="space-y-14">
            {sections.map((section, index) => {
              const cardTone =
                section.tone === "accent"
                  ? "border-secondary/25 bg-[#fbf7ef]"
                  : section.tone === "muted"
                    ? "border-primary/10 bg-[#fbf8f1]"
                    : "border-primary/10 bg-section/60 backdrop-blur-sm";

              const textTone = section.tone === "accent" ? "text-primary/70" : "text-primary/70";
              const titleTone = section.tone === "accent" ? "text-primary" : "text-primary";
              const numberTone = section.tone === "accent" ? "text-secondary" : "text-secondary";

              const isProductInfo = section.id === "product-information";
              const isShipping = section.id === "shipping-policy";

              return (
                <div key={section.id} className="space-y-10">
                  <article
                    id={section.id}
                    className={`rounded-[26px] border p-8 shadow-[0_24px_70px_-48px_rgba(26,29,54,0.26)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_32px_90px_-52px_rgba(26,29,54,0.3)] sm:p-10 ${cardTone}`}
                  >
                    <div className="flex flex-wrap items-center gap-4">
                      <span className={`text-[12px] font-bold uppercase tracking-[0.32em] ${numberTone}`}>
                        {section.number}
                      </span>
                      <h2 className={`font-serif text-[1.62rem] sm:text-[2rem] ${titleTone}`}>{section.title}</h2>
                    </div>

                    {isProductInfo ? (
                      <div className="mt-6 grid gap-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
                        <div className={`${textTone} space-y-4 text-[0.98rem] leading-relaxed`}>
                          {section.body?.map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                          ))}
                          {section.list && (
                            <ul className="space-y-4">
                              {section.list.map((item) => (
                                <li key={item} className="flex gap-3">
                                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-secondary" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div className="hidden lg:block">
                          <div className="group overflow-hidden rounded-[18px] border border-secondary/15 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.45)]">
                            <Image
                              src={productImage}
                              alt="Camliqa product lineup"
                              width={900}
                              height={700}
                              className="h-auto w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {section.body && (
                          <div className={`mt-5 space-y-4 text-[0.98rem] leading-relaxed ${textTone}`}>
                            {section.body.map((paragraph) => (
                              <p key={paragraph}>{paragraph}</p>
                            ))}
                          </div>
                        )}

                        {section.list && (
                          <ul className={`mt-5 space-y-4 text-[0.98rem] leading-relaxed ${textTone}`}>
                            {section.list.map((item) => (
                              <li key={item} className="flex gap-3">
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-secondary" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}

                    {isProductInfo && (
                      <div className="mt-6 lg:hidden">
                        <div className="group mx-auto w-full max-w-[420px] overflow-hidden rounded-[18px] border border-secondary/15 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.45)]">
                          <Image
                            src={productImage}
                            alt="Camliqa product lineup"
                            width={900}
                            height={700}
                            className="h-auto w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                          />
                        </div>
                      </div>
                    )}

                    {!isProductInfo && (
                      <>
                        {isShipping && section.shippingNotes && (
                          <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            {section.shippingNotes.map((note) => (
                              <div
                                key={note}
                                className="flex items-center gap-3 rounded-[14px] border border-primary/10 bg-section/65 px-4 py-3 text-[0.96rem] text-primary/75"
                              >
                                <span className="h-2 w-2 rounded-full bg-secondary" />
                                <span>{note}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {section.note && (
                      <div className="mt-6 rounded-[18px] border border-secondary/15 bg-[#fef9ef] p-5 text-[0.98rem] text-primary/70">
                        <p>{section.note}</p>
                        {section.noteEmphasis && (
                          <p className="mt-2 font-semibold text-primary">{section.noteEmphasis}</p>
                        )}
                      </div>
                    )}
                  </article>

                  {index < sections.length - 1 && (
                    <div className="flex items-center justify-center">
                      <div className="h-px w-full max-w-[520px] bg-gradient-to-r from-transparent via-secondary/25 to-transparent" />
                    </div>
                  )}
                </div>
              );
            })}

            <article
              id="contact-us"
              className="rounded-[26px] border border-secondary/20 bg-gradient-to-br from-[#f6f0e6] via-white to-[#f7f3fb] px-8 py-12 text-primary shadow-[0_30px_80px_-45px_rgba(12,16,31,0.35)] sm:px-10"
            >
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-[12px] font-bold uppercase tracking-[0.32em] text-secondary">13</span>
                <h2 className="font-serif text-[1.8rem] text-primary sm:text-[2.05rem]">Contact Us</h2>
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
        </div>
      </section>

      <Footer />
    </main>
  );
}
