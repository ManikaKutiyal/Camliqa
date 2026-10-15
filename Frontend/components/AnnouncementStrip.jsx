const announcements = [
  "Enjoy free shipping on every order!",
  "Build Your Own Bundle - Save up to 15%",
  "Free sunscreen on orders above ₹65",
  "Join Trust Circle rewards for exclusive benefits"
];

export default function AnnouncementStrip() {
  const tape = [...announcements, ...announcements];

  return (
    <section className="border-b border-black/5 bg-section">
      <div className="overflow-hidden py-2.5">
        <div className="announcement-track flex min-w-max items-center gap-10 px-4 text-sm text-accentSecondary">
          {tape.map((line, index) => (
            <p key={`${line}-${index}`} className="whitespace-nowrap">
              {line}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
