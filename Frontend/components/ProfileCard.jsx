export default function ProfileCard({ profile, onEdit }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-[var(--line)] bg-white/90 shadow-[0_18px_60px_rgba(26,22,18,0.08)]">
      <div className="border-b border-[var(--line)] bg-gradient-to-r from-[var(--surface)] to-white px-6 py-6 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-[var(--line)] bg-[var(--accent-soft)] text-2xl font-black text-[var(--accent-deep)]">
            {(profile.name || "U")
              .split(" ")
              .map((part) => part[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>

          <div className="space-y-1">
            <p className="customer-section-label">Profile</p>
            <h2 className="text-2xl font-black text-[var(--ink)]">{profile.name}</h2>
            <p className="text-sm text-[var(--muted-ink)]">Your account details at a glance</p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 px-6 py-6 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-start">
        <div className="space-y-5">
          <DetailRow label="Name" value={profile.name} />
          <DetailRow label="Email" value={profile.email} />
          <DetailRow label="Phone" value={profile.phone} />

          {(profile.customerId || profile.dateJoined) ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {profile.customerId ? <DetailRow label="Customer ID" value={profile.customerId} /> : null}
              {profile.dateJoined ? <DetailRow label="Date Joined" value={profile.dateJoined} /> : null}
            </div>
          ) : null}

          {profile.address ? (
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]/60 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent-deep)]">Address</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-ink)]">{profile.address}</p>
            </div>
          ) : null}
        </div>

        <div className="flex lg:justify-end">
          <button type="button" onClick={onEdit} className="customer-primary-button w-full lg:w-auto">
            Edit Profile
          </button>
        </div>
      </div>
    </section>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-[var(--line)] bg-[var(--surface)]/40 px-5 py-4">
      <span className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent-deep)]">{label}</span>
      <span className="text-base font-semibold text-[var(--ink)]">{value}</span>
    </div>
  );
}