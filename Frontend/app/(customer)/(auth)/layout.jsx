export default function AuthLayout({ children }) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fcfaf7_0%,#f6f1ea_100%)] text-[var(--foreground)] lg:h-screen lg:overflow-hidden">
      {children}
    </main>
  );
}
