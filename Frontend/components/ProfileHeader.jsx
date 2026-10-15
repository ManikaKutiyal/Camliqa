export default function ProfileHeader({ title, description }) {
  return (
    <div className="text-center">
      <p className="customer-section-label">Customer Account</p>
      <h1 className="customer-section-title mx-auto">{title}</h1>
      {description ? <p className="mx-auto mt-4 max-w-2xl text-base text-[var(--muted-ink)]">{description}</p> : null}
    </div>
  );
}