const steps = [
  {
    step: "01",
    title: "Cleanse",
    text: "Start with a pH-balanced cleanser to remove buildup without stripping the barrier."
  },
  {
    step: "02",
    title: "Treat",
    text: "Apply active serums based on concern: acne, pigmentation, texture, or hydration."
  },
  {
    step: "03",
    title: "Protect",
    text: "Seal with moisturizer and broad-spectrum SPF to preserve long-term skin health."
  }
];

export default function RoutineStepsSection() {
  return (
    <section className="section-shell pb-12 pt-2 md:pb-16">
      <h2 className="text-3xl text-ink sm:text-4xl">Build A Minimal Routine</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {steps.map((item) => (
          <article key={item.step} className="rounded-2xl bg-white p-5 shadow-soft">
            <p className="text-xs uppercase tracking-[0.2em] text-accentSecondary">Step {item.step}</p>
            <h3 className="mt-2 text-2xl text-accentPrimary">{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-accentSecondary/85">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
