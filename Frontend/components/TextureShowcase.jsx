const textures = [
  {
    title: "Silky Absorption",
    text: "Lightweight serums that penetrate deep into skin layers without residue",
    image:
      "https://images.unsplash.com/photo-1714547509056-8873c83d03b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
  },
  {
    title: "Rich Nourishment",
    text: "Velvety creams that lock in hydration for lasting comfort",
    image:
      "https://images.unsplash.com/photo-1670160942428-22ecf8aae0b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
  },
  {
    title: "Active Delivery",
    text: "Targeted formulations designed for maximum ingredient efficacy",
    image:
      "https://images.unsplash.com/photo-1714547509046-0cf60126f331?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
  }
];

export default function TextureShowcase() {
  return (
    <section className="section-shell py-20 md:py-24 lg:py-28">
      <div className="mx-auto max-w-[1280px]">
        <div className="text-center">
          <h2 className="text-5xl leading-[1.08] text-ink sm:text-6xl md:text-[3.4rem]">
            Texture &amp; Sensory Experience
          </h2>
          <p className="mt-4 text-lg text-accentSecondary">
            Every formula tells a story through touch, absorption, and transformation
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {textures.map((texture) => (
            <article key={texture.title} className="group relative h-[510px] overflow-hidden rounded-[24px]">
              <img
                src={texture.image}
                alt={texture.title}
                className="absolute inset-0 h-full w-full object-cover transition duration-300 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/8" />
              <div className="absolute inset-x-0 bottom-0 p-8">
                <h3 className="text-[2.18rem] leading-[1.08] text-offWhite">{texture.title}</h3>
                <p className="mt-3 max-w-[18ch] text-[1.05rem] leading-[1.55] text-offWhite/90">{texture.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
