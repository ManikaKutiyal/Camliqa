export default function AIChatSection() {
  const concerns = [
    "Dryness & Dehydration",
    "Fine Lines & Wrinkles",
    "Dark Spots & Pigmentation",
    "Acne & Blemishes",
    "Sensitivity & Redness"
  ];

  return (
    <section className="section-shell py-20 md:py-24">
      <div className="mx-auto max-w-[1024px] overflow-hidden rounded-[24px] border border-primary/10 bg-section/65 shadow-[0_26px_70px_-48px_rgba(26,29,54,0.25)]">
        <div className="grid md:grid-cols-2">
          <div className="border-b border-primary/10 bg-gradient-to-br from-[#f6f0e6] via-white to-[#f7f3fb] px-9 py-12 text-primary md:border-b-0 md:border-r md:border-r-primary/10 md:px-11 md:py-14">
            <p className="text-[11px] uppercase tracking-[0.24em] text-secondary">AI Routine</p>
            <h2 className="mt-4 font-serif text-[2.35rem] leading-[1.08] text-primary">
              Your Personalized
              <br />
              Skincare Ritual
            </h2>
            <p className="mt-5 text-[1.02rem] leading-[1.85] text-primary/65">
              Our AI analyzes your unique skin profile to recommend the perfect clinical formulations tailored to your
              needs.
            </p>

            <p className="mt-10 text-[11px] uppercase tracking-[0.24em] text-secondary">Common Concerns</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {concerns.map((concern) => (
                <button
                  key={concern}
                  type="button"
                  className="rounded-full border border-secondary/20 bg-white/70 px-4 py-2.5 text-[12px] font-medium tracking-[0.01em] text-primary/70 transition duration-300 ease-out hover:-translate-y-0.5 hover:border-secondary/40 hover:bg-white"
                >
                  {concern}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-base px-9 py-12 md:px-11 md:py-14">
            <p className="text-[11px] uppercase tracking-[0.24em] text-primary/50">Tell Us About Your Skin</p>
            <div className="mt-5 rounded-[18px] border border-primary/15 bg-white/70 px-6 py-5">
              <textarea
                placeholder="Describe your skin concerns, goals, or current routine..."
                rows={5}
                className="w-full resize-none bg-transparent text-sm leading-[1.85] text-primary/70 outline-none placeholder:text-primary/40"
              />
            </div>

            <button
              type="button"
              className="mt-8 w-full rounded-full bg-primary px-7 py-4 text-base font-semibold text-white shadow-[0_16px_40px_-26px_rgba(26,29,54,0.3)] transition duration-300 ease-out hover:shadow-[0_0_0_1px_rgba(197,160,89,0.35),0_0_36px_rgba(197,160,89,0.16)]"
            >
              Get Your Routine
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
