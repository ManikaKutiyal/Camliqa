export default function AuthFormCard({ title, subtitle, children, footer }) {
  return (
    <section className="mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-[var(--line)] bg-white/95 shadow-[0_22px_70px_rgba(26,22,18,0.1)]">
      <div className="border-b border-[var(--line)] bg-gradient-to-r from-[var(--surface)] to-white px-6 py-7 sm:px-8">
        <h1 className="text-4xl font-black tracking-tight text-[var(--ink)] sm:text-5xl">{title}</h1>
        <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-deep)]">{subtitle}</p>
      </div>

      <div className="space-y-5 px-6 py-7 sm:px-8">{children}</div>

      {footer ? <div className="border-t border-[var(--line)] px-6 py-5 text-center sm:px-8">{footer}</div> : null}
    </section>
  );
}