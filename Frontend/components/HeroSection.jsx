import AutoCarousel from "@/components/AutoCarousel";

const HERO_SLIDES = [
  {
    src: "https://hips.hearstapps.com/hmg-prod/images/gh-best-skincare-products-6557978b58b57.png?crop=0.888888888888889xw:1xh;center,top&resize=1200:*",
    alt: "Skincare products collage",
  },
  {
    src: "https://framerusercontent.com/images/Oa6DU79w7VRN6QwcwPOmc33H4.jpg",
    alt: "Aesthetic skincare routine flat lay",
  },
  {
    src: "https://thumbs.dreamstime.com/b/aesthetic-skincare-product-mockup-showcasing-frosted-glass-bottles-metallic-details-set-against-neutral-background-focusing-358212829.jpg",
    alt: "Aesthetic skincare product mockup",
  },
  {
    src: "https://apackaginggroup.com/cdn/shop/articles/aesthetic-cosmetic-jars_9ed124f1-dc13-4947-815e-c6e171624f8a_600x.png?v=1763748812",
    alt: "Aesthetic cosmetic jars",
  },
  {
    src: "https://img.freepik.com/premium-photo/mockup-packaging-design-cosmetics_1278346-10228.jpg",
    alt: "Cosmetics packaging mockup",
  },
];

export default function HeroSection() {
  return (
    <section className="section-shell mt-8 py-12 md:mt-10 md:py-16 lg:mt-12 lg:py-[4.5rem]">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.08fr] lg:gap-14">
        <div className="animate-rise order-2 px-1 lg:order-1">
          <p className="mb-5 text-xs uppercase tracking-[0.42em] text-[#C5A059] luxury-text-glow">Clinical Luxury</p>
          <h1 className="max-w-lg text-5xl font-light leading-[1.1] tracking-normal text-ink sm:text-6xl lg:text-7xl lg:leading-[1.1]">
            Latest Skincare
            <br />
            Formulations
          </h1>
          <p className="mt-8 max-w-lg text-lg leading-relaxed text-[#C5A059]/80">
            Experience the intersection of science and sensory luxury. Each formula is designed to transform your
            skin with clinically proven ingredients.
          </p>
          <button
            type="button"
            className="mt-10 rounded-full bg-primary px-10 py-4 text-base font-semibold text-white shadow-soft transition duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(197,160,89,0.3)]"
          >
            Shop Now
          </button>
        </div>

        <div className="animate-soft-zoom order-1 relative overflow-hidden rounded-[1.6rem] bg-white shadow-card lg:order-2">
          <AutoCarousel slides={HERO_SLIDES} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/5 via-transparent to-white/20" />
        </div>
      </div>
    </section>
  );
}
