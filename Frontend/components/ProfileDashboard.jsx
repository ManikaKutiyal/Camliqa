"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRightLeft,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Coins,
  LifeBuoy,
  Link2,
  Mail,
  MapPinned,
  MessageSquare,
  Pencil,
  PhoneCall,
  Plus,
  ShieldCheck,
  Store,
  Ticket,
  Trash2,
  Unlink,
  CircleDollarSign,
  UserRound,
  Settings2,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { saveProfileData, addAddressData, updateAddressData, deleteAddressData, saveAccountPreferences } from "@/services/profile";
import ProfileSidebar from "./ProfileSidebar";
import MyOrdersPageView from "./MyOrdersPageView";

const initialAddressDraft = {
  lastName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
};

export default function ProfileDashboard({ initialData }) {
  const { logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams?.get("tab");
  const [data, setData] = useState(() => initialData);
  const [activeSection, setActiveSection] = useState(tab || "profile");

  useEffect(() => {
    if (tab) {
      setActiveSection(tab);
    }
  }, [tab]);
  const [profileDraft, setProfileDraft] = useState(() => ({
    name: initialData.profile.name,
    email: initialData.profile.email,
    phone: initialData.profile.phone,
  }));
  const [addressDraft, setAddressDraft] = useState(initialAddressDraft);
  const [addressError, setAddressError] = useState("");
  const [editingAddress, setEditingAddress] = useState(null); // {id, draft}
  const [saveStatus, setSaveStatus] = useState(""); // "saving" | "saved" | "error"
  const [prefStatus, setPrefStatus] = useState(""); // "saving" | "saved" | "error"
  const [prefMessage, setPrefMessage] = useState("");

  useEffect(() => {
    const language = data?.preferences?.language;
    const currency = data?.preferences?.currency;
    if (language) {
      document.documentElement.lang = language.toLowerCase();
      localStorage.setItem("preferred_language", language);
    }
    if (currency) {
      localStorage.setItem("preferred_currency", currency);
    }
  }, [data?.preferences?.language, data?.preferences?.currency]);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  function updateProfileDraft(field, value) {
    setProfileDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveProfile(event) {
    event.preventDefault();
    setSaveStatus("saving");
    try {
      await saveProfileData({ name: profileDraft.name, phone: profileDraft.phone });
      setData((current) => ({
        ...current,
        profile: { ...current.profile, ...profileDraft },
      }));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 2500);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(""), 3000);
    }
  }

  function updateAddressDraft(field, value) {
    setAddressDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function addAddress(event) {
    event.preventDefault();
    const required = ["firstName", "lastName", "line1", "city", "state", "postalCode"];
    const missing = required.some((f) => !addressDraft[f]?.trim());
    if (missing) {
      setAddressError("Please fill in all required fields.");
      return;
    }
    try {
      const saved = await addAddressData(addressDraft);
      const newAddr = {
        id: saved.id,
        firstName: saved.first_name || "",
        lastName: saved.last_name || "",
        line1: saved.address_line1,
        line2: saved.address_line2 || "",
        city: saved.city,
        state: saved.state,
        postalCode: saved.postal_code,
        country: saved.country || "India",
        phone: saved.phone || "",
        isDefault: saved.is_default,
      };
      setData((current) => ({
        ...current,
        profile: {
          ...current.profile,
          addresses: [...current.profile.addresses, newAddr],
        },
      }));
      setAddressDraft(initialAddressDraft);
      setAddressError("");
    } catch {
      setAddressError("Failed to save address. Please try again.");
    }
  }

  async function handleEditAddress(id, draft) {
    try {
      const saved = await updateAddressData(id, draft);
      setData((current) => ({
        ...current,
        profile: {
          ...current.profile,
          addresses: current.profile.addresses.map((a) =>
            a.id === id
              ? {
                  ...a,
                  firstName: saved.first_name || "",
                  lastName: saved.last_name || "",
                  line1: saved.address_line1,
                  line2: saved.address_line2 || "",
                  city: saved.city,
                  state: saved.state,
                  postalCode: saved.postal_code,
                  phone: saved.phone || "",
                }
              : a
          ),
        },
      }));
      setEditingAddress(null);
    } catch {
      alert("Failed to update address.");
    }
  }

  async function handleDeleteAddress(id) {
    if (!confirm("Delete this address?")) return;
    try {
      await deleteAddressData(id);
      setData((current) => ({
        ...current,
        profile: {
          ...current.profile,
          addresses: current.profile.addresses.filter((a) => a.id !== id),
        },
      }));
    } catch {
      alert("Failed to delete address.");
    }
  }

  function toggleSocialAccount(provider) {
    setData((current) => ({
      ...current,
      profile: {
        ...current.profile,
        socialAccounts: current.profile.socialAccounts.map((account) => {
          if (account.provider !== provider) {
            return account;
          }

          const linked = !account.linked;
          let connectedAccount = "Not linked";

          if (linked) {
            connectedAccount = provider === "Google" ? "arya@gmail.com" : "arya@icloud.com";
          }

          return {
            ...account,
            linked,
            account: connectedAccount,
          };
        }),
      },
    }));
  }

  async function persistSettings(nextPreferences, nextNotifications) {
    if (
      JSON.stringify(nextPreferences) === JSON.stringify(data.preferences) &&
      JSON.stringify(nextNotifications) === JSON.stringify(data.notifications)
    ) {
      return;
    }
    setPrefStatus("saving");
    try {
      const saved = await saveAccountPreferences({
        preferences: nextPreferences,
        notifications: nextNotifications,
      });
      setData((current) => ({
        ...current,
        preferences: saved?.preferences || nextPreferences,
        notifications: saved?.notifications || nextNotifications,
      }));
      setPrefStatus("saved");
      setPrefMessage("Preferences updated successfully.");
      if (saved?.preferences?.language) {
        document.documentElement.lang = saved.preferences.language.toLowerCase();
        localStorage.setItem("preferred_language", saved.preferences.language);
      }
      if (saved?.preferences?.currency) {
        localStorage.setItem("preferred_currency", saved.preferences.currency);
      }
      setTimeout(() => {
        setPrefStatus("");
        setPrefMessage("");
      }, 2500);
    } catch (error) {
      setPrefStatus("error");
      setPrefMessage(error instanceof Error ? error.message : "Failed to update preferences.");
      setTimeout(() => {
        setPrefStatus("");
        setPrefMessage("");
      }, 3000);
    }
  }

  async function updatePreference(field) {
    const nextPreferences = { ...data.preferences, [field]: !data.preferences[field] };
    const nextNotifications = { ...data.notifications };
    setData((current) => ({ ...current, preferences: nextPreferences }));
    await persistSettings(nextPreferences, nextNotifications);
  }

  async function updatePreferenceValue(field, value) {
    const nextPreferences = { ...data.preferences, [field]: value };
    const nextNotifications = { ...data.notifications };
    setData((current) => ({ ...current, preferences: nextPreferences }));
    await persistSettings(nextPreferences, nextNotifications);
  }

  async function updateNotification(field) {
    const nextPreferences = { ...data.preferences };
    const nextNotifications = { ...data.notifications, [field]: !data.notifications[field] };
    setData((current) => ({ ...current, notifications: nextNotifications }));
    await persistSettings(nextPreferences, nextNotifications);
  }

  function handleSectionSelect(tabId) {
    if (tabId === "wishlist") {
      router.push("/wishlist");
      return;
    }
    setActiveSection(tabId);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <ProfileSidebar activeSection={activeSection} />

      <main className="rounded-3xl border border-[var(--line)] bg-white/70 backdrop-blur-xl p-6 shadow-[0_24px_70px_rgba(108,63,197,0.04)] sm:p-8 lg:p-10 transition-all duration-300 hover:shadow-[0_28px_80px_rgba(201,168,76,0.06)]">
        {activeSection === "profile" ? (
          <ProfileSection
            profile={data.profile}
            profileDraft={profileDraft}
            onProfileChange={updateProfileDraft}
            onProfileSave={saveProfile}
            saveStatus={saveStatus}
            onAddressChange={updateAddressDraft}
            onAddressSubmit={addAddress}
            addressDraft={addressDraft}
            addressError={addressError}
            onToggleSocialAccount={toggleSocialAccount}
            editingAddress={editingAddress}
            onEditStart={(addr) => setEditingAddress({ id: addr.id, draft: { firstName: addr.firstName, lastName: addr.lastName, line1: addr.line1, line2: addr.line2, city: addr.city, state: addr.state, postalCode: addr.postalCode, phone: addr.phone || "" } })}
            onEditChange={(field, value) => setEditingAddress((e) => ({ ...e, draft: { ...e.draft, [field]: value } }))}
            onEditSave={() => handleEditAddress(editingAddress.id, editingAddress.draft)}
            onEditCancel={() => setEditingAddress(null)}
            onDeleteAddress={handleDeleteAddress}
          />
        ) : null}

        {activeSection === "orders" ? <MyOrdersPageView /> : null}
        {activeSection === "payments" ? (
          <PaymentsSection payments={data.payments} currency={data.preferences.currency} />
        ) : null}
        {activeSection === "notifications" ? (
          <NotificationsSection
            notifications={data.notifications}
            onToggle={updateNotification}
            saveStatus={prefStatus}
            saveMessage={prefMessage}
          />
        ) : null}
      </main>
    </div>
  );
}

function ProfileSection({
  profile,
  profileDraft,
  onProfileChange,
  onProfileSave,
  saveStatus,
  onAddressChange,
  onAddressSubmit,
  addressDraft,
  addressError,
  onToggleSocialAccount,
  editingAddress,
  onEditStart,
  onEditChange,
  onEditSave,
  onEditCancel,
  onDeleteAddress,
}) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Profile" />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={onProfileSave} className="space-y-5 rounded-3xl border border-[var(--line)] bg-white/40 backdrop-blur-md p-6 shadow-[0_12px_40px_rgba(108,63,197,0.02)] transition-all duration-300 hover:shadow-[0_16px_50px_rgba(201,168,76,0.03)]">
          <CardTitle icon={UserRound} title="User Details" subtitle="Name, email, phone, and role" />
          <TextField label="Name" value={profileDraft.name} onChange={(event) => onProfileChange("name", event.target.value)} />
          <TextField label="Email" type="email" value={profileDraft.email} disabled={true} onChange={() => {}} />
          <TextField label="Phone" type="tel" value={profileDraft.phone} onChange={(event) => onProfileChange("phone", event.target.value)} />

          <div className="grid gap-4 rounded-2xl border border-[var(--line)] bg-white/70 p-4.5 sm:grid-cols-2">
            <InfoTile label="Customer ID" value={profile.customerId} />
            <InfoTile label="Member Since" value={profile.memberSince} />
          </div>

          <button type="submit" disabled={saveStatus === "saving"} className="customer-primary-button w-full sm:w-auto disabled:opacity-60">
            {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "✓ Saved" : saveStatus === "error" ? "Error – try again" : "Save Profile"}
          </button>
        </form>

        <div className="space-y-6">
          <div className="rounded-3xl border border-[var(--line)] bg-white/40 backdrop-blur-md p-6 shadow-[0_12px_40px_rgba(108,63,197,0.02)] transition-all duration-300 hover:shadow-[0_16px_50px_rgba(201,168,76,0.03)]">
            <CardTitle icon={MapPinned} title="Addresses" subtitle="Saved delivery and billing addresses" />

            <div className="mt-4 space-y-3">
              {profile.addresses.length > 0 ? (
                profile.addresses.map((address) =>
                  editingAddress?.id === address.id ? (
                    <AddressEditForm
                      key={address.id}
                      draft={editingAddress.draft}
                      onChange={onEditChange}
                      onSave={onEditSave}
                      onCancel={onEditCancel}
                    />
                  ) : (
                    <AddressCard
                      key={address.id}
                      address={address}
                      onEdit={() => onEditStart(address)}
                      onDelete={() => onDeleteAddress(address.id)}
                    />
                  )
                )
              ) : (
                <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white px-4 py-5 text-sm text-[var(--muted-ink)]">
                  No saved addresses yet. Add your first address below.
                </div>
              )}
            </div>

            <form onSubmit={onAddressSubmit} className="mt-6 space-y-4 rounded-2xl border border-[var(--line)] bg-white/80 p-5 shadow-sm transition-all duration-300 focus-within:border-[var(--accent-secondary)] focus-within:shadow-[0_8px_30px_rgba(201,168,76,0.05)]">
              <p className="text-sm font-bold uppercase tracking-wider text-[var(--accent-primary)] mb-1">Add Address</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField label="First Name" value={addressDraft.firstName} onChange={(event) => onAddressChange("firstName", event.target.value)} />
                <TextField label="Last Name" value={addressDraft.lastName} onChange={(event) => onAddressChange("lastName", event.target.value)} />
              </div>
              <TextField label="Address Line 1" value={addressDraft.line1} onChange={(event) => onAddressChange("line1", event.target.value)} />
              <TextField label="Address Line 2" value={addressDraft.line2} onChange={(event) => onAddressChange("line2", event.target.value)} />
              <div className="grid gap-3 sm:grid-cols-3">
                <TextField label="City" value={addressDraft.city} onChange={(event) => onAddressChange("city", event.target.value)} />
                <TextField label="State" value={addressDraft.state} onChange={(event) => onAddressChange("state", event.target.value)} />
                <TextField label="Postal Code" value={addressDraft.postalCode} onChange={(event) => onAddressChange("postalCode", event.target.value)} />
              </div>

              {addressError ? <p className="text-sm text-red-600">{addressError}</p> : null}

              <button type="submit" className="customer-secondary-button w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Address
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}



function PaymentsSection({ payments }) {
  const [expanded, setExpanded] = useState(null);
  const parseINR = (raw) => Number(String(raw || "").replace(/[^\d.]/g, "")) || 0;
  const formatAmount = (rawValue) => {
    const inrValue = parseINR(rawValue);
    return `₹${inrValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  };

  const transactions = (payments.transactions || []).map((tx) => ({
    ...tx,
    amount: formatAmount(tx.amount),
    totalAmount: formatAmount(tx.totalAmount || tx.amount),
    items: (tx.items || []).map((item) => ({
      ...item,
      price: formatAmount(item.price),
      subtotal: formatAmount(item.subtotal || 0),
    })),
  }));

  return (
    <div className="space-y-6">
      <SectionHeader title="Payments" description="Track your spending history and see exactly what you paid for." />
      <div className="grid gap-4 md:grid-cols-2">
        <SummaryCard icon={CircleDollarSign} label="Total Spent" value={formatAmount(payments.totalSpent)} />
        <SummaryCard icon={ArrowRightLeft} label="Transactions" value={String(transactions.length)} />
      </div>
      <div className="rounded-3xl border border-[var(--line)] bg-white/40 backdrop-blur-md p-6 shadow-sm">
        <CardTitle icon={ArrowRightLeft} title="Transaction History" subtitle="Click a transaction to see item breakdown" />
        <div className="mt-4 space-y-3">
          {transactions.length === 0 ? (
            <p className="text-sm text-[var(--muted-ink)]">No transactions yet.</p>
          ) : transactions.map((tx) => (
            <div key={tx.id} className="rounded-2xl border border-[var(--line)] bg-white overflow-hidden transition-all duration-300 hover:border-[var(--accent-secondary)] hover:shadow-[0_8px_30px_rgba(201,168,76,0.04)]">
              <button
                type="button"
                onClick={() => setExpanded(expanded === tx.id ? null : tx.id)}
                className="flex w-full items-center justify-between gap-3 p-4 text-left"
              >
                <div>
                  <p className="font-semibold text-[var(--ink)]">{tx.label}</p>
                  <p className="text-sm text-[var(--muted-ink)]">{tx.id} · {tx.date}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-[var(--ink)]">{tx.amount}</span>
                  <StatusPill tone={tx.status === "paid" ? "success" : "neutral"} label={tx.status} />
                </div>
              </button>
              {expanded === tx.id && tx.items?.length > 0 ? (
                <div className="border-t border-[var(--line)] px-4 pb-4 pt-3 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted-ink)]">Project/Product Spend Details</p>
                    {tx.orderId ? (
                      <p className="text-xs font-semibold text-[var(--muted-ink)]">Order #{tx.orderId}</p>
                    ) : null}
                  </div>
                  {tx.items.map((item, i) => (
                    <div key={i} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]/60 p-3">
                      <div className="flex items-start gap-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-16 w-16 shrink-0 rounded-xl border border-[var(--line)] object-cover bg-white"
                          />
                        ) : (
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-dashed border-[var(--line)] bg-white text-[10px] font-semibold uppercase tracking-wide text-[var(--muted-ink)]">
                            No Image
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[var(--ink)]">{item.name}</p>
                          <div className="mt-1 grid gap-1 text-xs text-[var(--muted-ink)] sm:grid-cols-3">
                            <p>Qty: <span className="font-semibold text-[var(--ink)]">{item.qty}</span></p>
                            <p>Unit Price: <span className="font-semibold text-[var(--ink)]">{item.price}</span></p>
                            <p>Subtotal: <span className="font-semibold text-[var(--ink)]">{item.subtotal}</span></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end border-t border-[var(--line)] pt-3">
                    <p className="text-sm font-bold text-[var(--ink)]">Transaction Total: {tx.totalAmount}</p>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



function PreferencesSection({ preferences, onToggle, onValueChange, saveStatus, saveMessage }) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Preferences" description="Manage account preferences and privacy / GDPR controls." />

      <div className="grid gap-4 md:grid-cols-2">
        <SummaryCard icon={Settings2} label="Language" value={preferences.language} />
        <SummaryCard icon={ShieldCheck} label="Currency" value="INR" />
      </div>

      <div className="rounded-3xl border border-[var(--line)] bg-white/40 backdrop-blur-md p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--ink)]">Language</span>
            <select
              value={preferences.language}
              onChange={(event) => onValueChange("language", event.target.value)}
              className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm font-medium text-[var(--ink)] outline-none transition-all duration-200 hover:border-[var(--accent)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
            >
              <option>English</option>
              <option>Hindi</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--ink)]">Currency</span>
            <input
              value="INR"
              readOnly
              className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm font-medium text-[var(--ink)] outline-none"
            />
          </label>
        </div>

        <div className="mt-6 border-t border-[var(--line)] pt-5">
          <CardTitle icon={ShieldCheck} title="Privacy / GDPR" subtitle="Store browsing and marketing preferences" />
        </div>
        <div className="mt-4 space-y-3">
          <ToggleRow label="Save browsing history" checked={preferences.saveBrowsingHistory} onToggle={() => onToggle("saveBrowsingHistory")} />
          <ToggleRow label="Marketing emails" checked={preferences.marketingEmails} onToggle={() => onToggle("marketingEmails")} />
          <ToggleRow label="GDPR consent" checked={preferences.gdprConsent} onToggle={() => onToggle("gdprConsent")} />
        </div>
        {saveStatus ? (
          <p
            className={`mt-4 text-sm ${
              saveStatus === "error" ? "text-red-600" : "text-emerald-600"
            }`}
          >
            {saveStatus === "saving" ? "Saving preferences..." : saveMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function NotificationsSection({ notifications, onToggle, saveStatus, saveMessage }) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Notifications" description="Enable or disable email, push, and WhatsApp notifications." />

      <div className="rounded-3xl border border-[var(--line)] bg-white/40 backdrop-blur-md p-6 shadow-sm">
        <div className="space-y-3">
          <ToggleRow label="Email notifications" checked={notifications.email} onToggle={() => onToggle("email")} />
          <ToggleRow label="WhatsApp notifications" checked={notifications.whatsapp} onToggle={() => onToggle("whatsapp")} />
        </div>
        {saveStatus ? (
          <p
            className={`mt-4 text-sm ${
              saveStatus === "error" ? "text-red-600" : "text-emerald-600"
            }`}
          >
            {saveStatus === "saving" ? "Saving notification settings..." : saveMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function SupportSection({ support }) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Support" description="See tickets and contact support from the profile area." />

      <div className="grid gap-4 md:grid-cols-2">
        <SummaryCard icon={Mail} label="Support Email" value={support.contactEmail} />
        <SummaryCard icon={PhoneCall} label="Contact Options" value="Email, chat, phone" />
      </div>

      <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)]/40 p-5">
        <CardTitle icon={Ticket} title="User Tickets" subtitle="Current support requests" />
        <div className="mt-4 space-y-3">
          {support.tickets.map((ticket) => (
            <div key={ticket.id} className="flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-[var(--ink)]">{ticket.subject}</p>
                <p className="text-sm text-[var(--muted-ink)]">{ticket.id} · Updated {ticket.updated}</p>
              </div>
              <StatusPill tone={ticket.status === "Open" ? "warning" : "success"} label={ticket.status} />
            </div>
          ))}
        </div>

        <button type="button" className="customer-primary-button mt-5 w-full sm:w-auto">
          <MessageSquare className="mr-2 h-4 w-4" />
          Contact Support
        </button>
      </div>
    </div>
  );
}

function SectionHeader({ title, description }) {
  return (
    <div>
      <p className="customer-section-label">{title}</p>
      {description ? <p className="mt-2 max-w-3xl text-sm text-[var(--muted-ink)] sm:text-base">{description}</p> : null}
    </div>
  );
}

function CardTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent-primary)] text-white">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-base font-bold text-[var(--ink)]">{title}</p>
        {subtitle ? <p className="text-sm text-[var(--muted-ink)]">{subtitle}</p> : null}
      </div>
    </div>
  );
}

function TextField({ label, value, onChange, type = "text", disabled = false }) {
  const inputMode = type === "email" ? "email" : type === "tel" ? "tel" : "text";

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[var(--ink)]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        inputMode={inputMode}
        className="w-full rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 text-base text-[var(--ink)] placeholder:text-[var(--muted-ink)] focus:border-[var(--accent-secondary)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--accent-secondary)]/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </label>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]/50 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent-deep)]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[var(--ink)]">{value}</p>
    </div>
  );
}

function AddressCard({ address, onEdit, onDelete }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-5 transition-all duration-300 hover:border-[var(--accent-secondary)] hover:shadow-[0_8px_30px_rgba(201,168,76,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-[var(--ink)]">{address.firstName} {address.lastName}</p>
        <div className="flex items-center gap-2">
          {address.isDefault ? <StatusPill tone="success" label="Default" /> : null}
          <button type="button" onClick={onEdit} className="rounded-xl border border-[var(--line)] p-1.5 text-[var(--ink)] hover:bg-[var(--surface)] transition" title="Edit">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={onDelete} className="rounded-xl border border-red-200 p-1.5 text-red-500 hover:bg-red-50 transition" title="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <p className="mt-1 text-sm text-[var(--muted-ink)]">{address.line1}</p>
      {address.line2 ? <p className="text-sm text-[var(--muted-ink)]">{address.line2}</p> : null}
      <p className="text-sm text-[var(--muted-ink)]">{address.city}, {address.state} {address.postalCode}</p>
      {address.phone ? <p className="mt-1 text-sm text-[var(--muted-ink)]">{address.phone}</p> : null}
    </div>
  );
}

function AddressEditForm({ draft, onChange, onSave, onCancel }) {
  return (
    <div className="rounded-2xl border border-[var(--accent-secondary)] bg-white/90 p-5 space-y-4 shadow-sm animate-rise">
      <p className="text-sm font-bold uppercase tracking-wider text-[var(--accent-primary)] mb-1">Edit Address</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField label="First Name" value={draft.firstName} onChange={(e) => onChange("firstName", e.target.value)} />
        <TextField label="Last Name" value={draft.lastName} onChange={(e) => onChange("lastName", e.target.value)} />
      </div>
      <TextField label="Address Line 1" value={draft.line1} onChange={(e) => onChange("line1", e.target.value)} />
      <TextField label="Address Line 2" value={draft.line2} onChange={(e) => onChange("line2", e.target.value)} />
      <div className="grid gap-3 sm:grid-cols-3">
        <TextField label="City" value={draft.city} onChange={(e) => onChange("city", e.target.value)} />
        <TextField label="State" value={draft.state} onChange={(e) => onChange("state", e.target.value)} />
        <TextField label="Postal Code" value={draft.postalCode} onChange={(e) => onChange("postalCode", e.target.value)} />
      </div>
      <TextField label="Phone" type="tel" value={draft.phone} onChange={(e) => onChange("phone", e.target.value)} />
      <div className="flex gap-2">
        <button type="button" onClick={onSave} className="customer-primary-button">Save Changes</button>
        <button type="button" onClick={onCancel} className="customer-secondary-button">Cancel</button>
      </div>
    </div>
  );
}

function SocialAccountRow({ account, onToggle }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-[var(--ink)]">{account.provider}</p>
        <p className="text-sm text-[var(--muted-ink)]">{account.account}</p>
      </div>
      <button type="button" onClick={onToggle} className="inline-flex items-center gap-2 self-start rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--ink)]">
        {account.linked ? <Unlink className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
        {account.linked ? "Unlink" : "Link"}
      </button>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-3xl border border-[var(--line)] bg-white/70 p-6 shadow-sm transition-all duration-300 hover:shadow-[0_12px_40px_rgba(201,168,76,0.04)] hover:border-[var(--accent-secondary)]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent-primary)] text-white">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm text-[var(--muted-ink)]">{label}</p>
          <p className="text-lg font-bold text-[var(--ink)]">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, checked, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent-secondary)] focus:ring-offset-2 ${
        checked
          ? "border-[rgba(201,168,76,0.4)] bg-[rgba(201,168,76,0.03)]"
          : "border-[var(--line)] bg-white hover:border-[#e8d9cf]"
      }`}
    >
      <span className="text-sm font-semibold text-[var(--ink)]">{label}</span>
      <span className={`flex h-6 w-11 items-center rounded-full p-1 transition-all duration-200 ${checked ? "bg-[var(--accent-secondary)]" : "bg-[var(--line)]"}`}>
        <span className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </span>
    </button>
  );
}

function StatusPill({ label, tone }) {
  const toneClasses = {
    success: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    neutral: "bg-[var(--surface)] text-[var(--ink)]",
  };

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${toneClasses[tone]}`}>{label}</span>;
}
