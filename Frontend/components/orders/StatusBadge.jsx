"use client";

export default function StatusBadge({ status }) {
  const styles = {
    Pending: "bg-amber-50 text-amber-700 border-amber-100",
    Processing: "bg-blue-50 text-blue-700 border-blue-100",
    Shipped: "bg-indigo-50 text-indigo-700 border-indigo-100",
    Delivered: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Cancelled: "bg-rose-50 text-rose-700 border-rose-100",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${styles[status] || "bg-slate-50 text-slate-600 border-slate-100"}`}>
      {status}
    </span>
  );
}
