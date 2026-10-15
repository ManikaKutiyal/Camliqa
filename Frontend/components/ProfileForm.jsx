"use client";

export default function ProfileForm({ values, errors, onChange, onSubmit, onCancel }) {
  return (
    <form onSubmit={onSubmit} className="overflow-hidden rounded-3xl border border-[var(--line)] bg-white/90 shadow-[0_18px_60px_rgba(26,22,18,0.08)]">
      <div className="border-b border-[var(--line)] bg-gradient-to-r from-[var(--surface)] to-white px-6 py-6 sm:px-8">
        <p className="customer-section-label">Edit Profile</p>
        <h2 className="mt-2 text-2xl font-black text-[var(--ink)]">Update your details</h2>
        <p className="mt-2 text-sm text-[var(--muted-ink)]">All fields are required before you can save.</p>
      </div>

      <div className="space-y-5 px-6 py-6 sm:px-8">
        <Field label="Name" name="name" type="text" value={values.name} error={errors.name} onChange={onChange} />
        <Field label="Email" name="email" type="email" value={values.email} error={errors.email} onChange={onChange} />
        <Field label="Phone" name="phone" type="tel" value={values.phone} error={errors.phone} onChange={onChange} />

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button type="submit" className="customer-primary-button w-full sm:w-auto">
            Save Changes
          </button>
          <button type="button" onClick={onCancel} className="customer-secondary-button w-full sm:w-auto">
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

function Field({ label, name, type, value, error, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[var(--ink)]">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        inputMode={name === "phone" ? "numeric" : undefined}
        className="w-full rounded-2xl border border-[var(--line)] bg-[var(--surface)]/40 px-4 py-3 text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:bg-white"
        placeholder={`Enter ${label.toLowerCase()}`}
      />
      {error ? <span className="mt-2 block text-sm text-red-600">{error}</span> : null}
    </label>
  );
}