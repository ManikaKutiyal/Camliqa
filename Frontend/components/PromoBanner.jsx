export default function PromoBanner() {
  return (
    <section className="relative overflow-hidden bg-primary py-24 md:py-28 lg:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_18%_28%,rgba(197,160,89,0.38)_0%,rgba(197,160,89,0)_52%),radial-gradient(900px_circle_at_82%_20%,rgba(197,160,89,0.26)_0%,rgba(197,160,89,0)_56%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(197,160,89,0.09)_1px,transparent_1px),linear-gradient(to_bottom,rgba(197,160,89,0.06)_1px,transparent_1px)] bg-[size:86px_86px] opacity-20" />
      <div className="section-shell relative text-center text-offWhite">
        <p className="text-[11px] uppercase tracking-[0.28em] text-highlight">First Time?</p>
        <h2 className="mx-auto mt-6 max-w-3xl text-6xl leading-[1.07] sm:text-7xl">
          Unlock 15% Off
          <br />
          Your First Ritual
        </h2>
        <p className="mx-auto mt-7 max-w-3xl text-[1.02rem] leading-[1.75] text-offWhite/90 sm:text-[1.08rem]">
          Subscribe to receive exclusive access to new formulations, expert skincare tips, and personalized
          recommendations.
        </p>

        <div className="mx-auto mt-10 flex max-w-xl flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full rounded-full border border-offWhite/25 bg-offWhite/10 px-6 py-4 text-base text-offWhite outline-none placeholder:text-offWhite/65 sm:w-[346px]"
          />
          <button
            type="button"
            className="rounded-full border border-secondary/80 bg-offWhite px-8 py-4 text-base font-semibold text-primary transition duration-300 ease-out hover:border-highlight hover:shadow-[0_0_0_1px_rgba(197,160,89,0.25),0_0_34px_rgba(197,160,89,0.14)]"
          >
            Claim Offer
          </button>
        </div>

        <p className="mt-9 text-xs text-offWhite/58">By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}
