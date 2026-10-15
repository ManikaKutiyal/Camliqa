"use client";

import Link from "next/link";
import { Eye, ExternalLink, ChevronDown } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const selectToneByValue = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  processing: "bg-blue-50 text-blue-800 border-blue-200",
  shipped: "bg-indigo-50 text-indigo-800 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-800 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-800 border-rose-200",
};

export default function OrderRow({ order, onView, onStatusChange, statusUpdatingRawId }) {
  const raw = String(order.statusValue || "pending").toLowerCase();
  const toneClass = selectToneByValue[raw] || "bg-slate-50 text-slate-700 border-slate-200";
  const isUpdating = statusUpdatingRawId === order.rawId;
  const statusOptions = (() => {
    if (STATUS_OPTIONS.some((o) => o.value === raw)) return STATUS_OPTIONS;
    return [
      ...STATUS_OPTIONS,
      { value: raw, label: order.status || raw },
    ];
  })();

  async function handleStatusSelect(event) {
    const next = event.target.value;
    if (!onStatusChange || next === raw) return;
    const previous = raw;
    try {
      await onStatusChange(order.rawId, next);
    } catch {
      event.target.value = previous;
      alert("Failed to update status. Please try again.");
    }
  }

  return (
    <tr className="hover:bg-slate-50/30 transition-colors group">
      <td className="px-6 py-4">
        <Link
          href={`/store-admin/orders/${order.rawId}`}
          className="text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1.5"
        >
          #{order.id}
          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      </td>
      <td className="px-6 py-4 text-sm font-medium text-slate-900">{order.customer}</td>
      <td className="px-6 py-4 text-sm text-slate-500">{order.date}</td>
      <td className="px-6 py-4 text-sm font-bold text-slate-900">{order.total}</td>
      <td className="px-6 py-4">
        <div className="relative inline-flex min-w-[148px] max-w-[200px]">
          <select
            aria-label={`Order status for #${order.id}`}
            value={raw}
            disabled={isUpdating || !onStatusChange}
            onChange={handleStatusSelect}
            className={`w-full appearance-none cursor-pointer rounded-full border py-1.5 pl-3 pr-9 text-xs font-bold shadow-sm outline-none transition hover:opacity-95 focus:ring-2 focus:ring-slate-900/15 disabled:cursor-wait disabled:opacity-60 ${toneClass}`}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center">
            {isUpdating ? (
              <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
            )}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <button
          type="button"
          onClick={() => onView(order)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </button>
      </td>
    </tr>
  );
}
