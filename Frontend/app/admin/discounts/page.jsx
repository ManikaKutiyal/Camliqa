"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { adminGetCoupons, adminCreateCoupon, adminDeleteCoupon } from "@/services/supabase";

const initialCouponForm = {
  name: "",
  code: "",
  startsAt: "",
  endsAt: "",
  dealType: "discount",
  discountPercent: "",
  discountAmount: "",
  minimumOrderAmount: "",
  usageLimit: "",
  hidden: false,
  firstOrderOnly: false,
  note: "",
};

function formatDeal(c) {
  if (c.deal_type === "free_shipping") return "Free shipping";
  if (c.deal_type === "fixed_amount") return `₹${Number(c.discount_amount || 0).toLocaleString("en-IN")} off`;
  return `${Number(c.discount_percent || 0)}% off`;
}

export default function StoreAdminCouponsPage() {
  const [formValues, setFormValues] = useState(initialCouponForm);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadCoupons() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await adminGetCoupons(supabase);
    setCoupons(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleChange = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateCoupon = async () => {
    if (!formValues.code.trim()) {
      alert("Coupon code is required.");
      return;
    }
    if (formValues.endsAt && formValues.startsAt && new Date(formValues.endsAt) < new Date(formValues.startsAt)) {
      alert("End time must be after start time.");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const payload = {
      name: formValues.name.trim() || "Coupon",
      code: formValues.code.trim().toUpperCase(),
      deal_type: formValues.dealType,
      discount_percent:
        formValues.dealType === "discount" ? Number(formValues.discountPercent || 0) : null,
      discount_amount:
        formValues.dealType === "fixed_amount" ? Number(formValues.discountAmount || 0) : null,
      minimum_order_amount: Number(formValues.minimumOrderAmount || 0) || null,
      usage_limit: Number(formValues.usageLimit || 0) || null,
      starts_at: formValues.startsAt ? new Date(formValues.startsAt).toISOString() : null,
      ends_at: formValues.endsAt ? new Date(formValues.endsAt).toISOString() : null,
      active: true,
      description: JSON.stringify({
        note: formValues.note || "",
        hidden: Boolean(formValues.hidden),
        firstOrderOnly: Boolean(formValues.firstOrderOnly),
      }),
    };
    const { error } = await adminCreateCoupon(supabase, payload);
    setSaving(false);
    if (error) {
      alert("Failed to create coupon: " + error.message);
      return;
    }
    setFormValues(initialCouponForm);
    await loadCoupons();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this coupon?")) return;
    const supabase = createClient();
    await adminDeleteCoupon(supabase, id);
    await loadCoupons();
  };

  return (
    <section className="w-full space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-3xl font-bold text-slate-900">Coupons</div>
          <button type="button" onClick={handleCreateCoupon} disabled={saving} className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
            {saving ? "Saving..." : "Create Coupon"}
          </button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          <input type="text" placeholder="Coupon name" value={formValues.name} onChange={handleChange("name")} className="rounded-xl border border-slate-200 px-4 py-2 text-sm" />
          <input type="text" placeholder="Code (e.g. SAVE10)" value={formValues.code} onChange={handleChange("code")} className="rounded-xl border border-slate-200 px-4 py-2 text-sm uppercase" />
          <input type="datetime-local" value={formValues.startsAt} onChange={handleChange("startsAt")} className="rounded-xl border border-slate-200 px-4 py-2 text-sm" />
          <input type="datetime-local" value={formValues.endsAt} onChange={handleChange("endsAt")} className="rounded-xl border border-slate-200 px-4 py-2 text-sm" />
          <select value={formValues.dealType} onChange={handleChange("dealType")} className="rounded-xl border border-slate-200 px-4 py-2 text-sm">
            <option value="discount">Percentage discount</option>
            <option value="fixed_amount">Fixed amount</option>
            <option value="free_shipping">Free shipping</option>
          </select>
          <input type="number" placeholder="% off" value={formValues.discountPercent} onChange={handleChange("discountPercent")} className="rounded-xl border border-slate-200 px-4 py-2 text-sm" />
          <input type="number" placeholder="Fixed ₹ amount" value={formValues.discountAmount} onChange={handleChange("discountAmount")} className="rounded-xl border border-slate-200 px-4 py-2 text-sm" />
          <input type="number" placeholder="Minimum order amount" value={formValues.minimumOrderAmount} onChange={handleChange("minimumOrderAmount")} className="rounded-xl border border-slate-200 px-4 py-2 text-sm" />
          <input type="number" placeholder="Usage limit" value={formValues.usageLimit} onChange={handleChange("usageLimit")} className="rounded-xl border border-slate-200 px-4 py-2 text-sm" />
          <input type="text" placeholder="Internal note / description" value={formValues.note} onChange={handleChange("note")} className="rounded-xl border border-slate-200 px-4 py-2 text-sm lg:col-span-2" />
          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm">
            <input type="checkbox" checked={formValues.hidden} onChange={handleChange("hidden")} />
            Hidden/private coupon
          </label>
          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm">
            <input type="checkbox" checked={formValues.firstOrderOnly} onChange={handleChange("firstOrderOnly")} />
            First-order only
          </label>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">Coupon Management</h2>
        </div>
        <div className="w-full overflow-x-auto">
          {loading ? (
            <div className="py-10 text-center text-slate-500">Loading coupons...</div>
          ) : (
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Deal</th>
                  <th className="px-6 py-3">Min order</th>
                  <th className="px-6 py-3">Used / Limit</th>
                  <th className="px-6 py-3">Active window</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.length === 0 ? (
                  <tr><td colSpan="7" className="px-6 py-10 text-center text-slate-500">No coupons found</td></tr>
                ) : coupons.map((row) => (
                  <tr key={row.id} className="text-slate-600">
                    <td className="px-6 py-4 font-medium text-slate-900">{row.name}</td>
                    <td className="px-6 py-4"><span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600">{row.code}</span></td>
                    <td className="px-6 py-4">{formatDeal(row)}</td>
                    <td className="px-6 py-4">{row.minimum_order_amount ? `₹${Number(row.minimum_order_amount).toLocaleString("en-IN")}` : "-"}</td>
                    <td className="px-6 py-4">{Number(row.times_used || 0)} / {row.usage_limit || "∞"}</td>
                    <td className="px-6 py-4 text-xs">{row.starts_at ? new Date(row.starts_at).toLocaleString() : "Any"} → {row.ends_at ? new Date(row.ends_at).toLocaleString() : "No expiry"}</td>
                    <td className="px-6 py-4 text-right">
                      <button type="button" onClick={() => handleDelete(row.id)} className="rounded-lg border border-rose-200 p-2 text-rose-500 hover:bg-rose-50 transition" title="Delete coupon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                          <path d="M3 6h18" />
                          <path d="M8 6V4h8v2" />
                          <path d="M6 6l1 14h10l1-14" />
                          <path d="M10 11v6M14 11v6" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}
