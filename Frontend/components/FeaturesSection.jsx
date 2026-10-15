const features = [
  {
    icon: "✓",
    title: "Dermatologically Tested"
  },
  {
    icon: "⚗",
    title: "Clinically Proven Ingredients"
  },
  {
    icon: "○",
    title: "No Harmful Chemicals"
  }
];

export default function FeaturesSection() {
  return (
    <section className="relative mt-20 w-full overflow-hidden border-y border-secondary/20 bg-base py-2 md:mt-24 md:py-3">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_18%_30%,rgba(197,160,89,0.08)_0%,rgba(197,160,89,0)_52%),radial-gradient(900px_circle_at_85%_20%,rgba(197,160,89,0.06)_0%,rgba(197,160,89,0)_54%)]" />
      <div className="section-shell relative z-10 grid gap-2.5 sm:grid-cols-3 sm:gap-3 lg:gap-4">
        {features.map((feature, index) => (
          <article
            key={feature.title}
            className="animate-rise group flex items-center justify-center gap-3 rounded-xl2 bg-white px-4 py-1.5 text-primary/80 shadow-soft ring-1 ring-divider transition duration-300 hover:bg-white hover:ring-secondary/30"
            style={{ animationDelay: `${index * 120}ms` }}
          >
            <span className="inline-flex h-7.5 w-7.5 items-center justify-center rounded-full bg-secondary/10 text-[0.95rem] leading-none text-secondary ring-1 ring-secondary/20 transition group-hover:bg-secondary/15">
              {feature.icon}
            </span>
            <p className="text-[0.93rem] font-semibold tracking-[0.01em] text-primary/80">{feature.title}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
