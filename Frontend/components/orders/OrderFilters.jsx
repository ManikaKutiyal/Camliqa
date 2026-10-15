"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Filter, Calendar, ChevronDown, X, Check } from "lucide-react";

const DATE_PRESETS = [
  { id: "all", label: "All time" },
  { id: "last7", label: "Last 7 days" },
  { id: "last30", label: "Last 30 days" },
  { id: "last90", label: "Last 90 days" },
];

export default function OrderFilters({
  searchQuery = "",
  onSearchChange,
  onStatusChange,
  currentStatus,
  datePreset,
  onDatePresetChange,
  customRangeActive,
  advancedOpen,
  onAdvancedToggle,
  rangeFrom,
  rangeTo,
  onRangeFromChange,
  onRangeToChange,
  onAdvancedApply,
  onAdvancedReset,
}) {
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const dateMenuRef = useRef(null);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!dateMenuOpen) return;
      const el = dateMenuRef.current;
      if (el && !el.contains(event.target)) {
        setDateMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [dateMenuOpen]);

  const dateButtonLabel = customRangeActive
    ? "Custom range"
    : DATE_PRESETS.find((p) => p.id === datePreset)?.label ?? "All time";

  return (
    <div className="flex flex-col gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            placeholder="Search by Order ID, customer, or email..."
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900/5 outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative" ref={dateMenuRef}>
            <button
              type="button"
              onClick={() => setDateMenuOpen((open) => !open)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-colors ${
                dateMenuOpen
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "text-slate-700 bg-white border-slate-200 hover:bg-slate-50"
              }`}
              aria-expanded={dateMenuOpen}
              aria-haspopup="listbox"
            >
              <Calendar className={`h-4 w-4 ${dateMenuOpen ? "text-white" : "text-slate-400"}`} />
              <span className="whitespace-nowrap">{dateButtonLabel}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform ${dateMenuOpen ? "rotate-180 text-white" : "text-slate-400"}`}
              />
            </button>
            {dateMenuOpen ? (
              <ul
                className="absolute right-0 z-50 mt-2 min-w-[200px] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
                role="listbox"
              >
                {DATE_PRESETS.map((p) => {
                  const selected = !customRangeActive && datePreset === p.id;
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={selected}
                        className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                          selected ? "bg-slate-50 text-slate-900" : "text-slate-600 hover:bg-slate-50"
                        }`}
                        onClick={() => {
                          onDatePresetChange(p.id);
                          setDateMenuOpen(false);
                        }}
                      >
                        {p.label}
                        {selected ? <Check className="h-4 w-4 text-slate-900" /> : <span className="w-4" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => onAdvancedToggle()}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-colors ${
              advancedOpen
                ? "border-slate-900 bg-slate-900 text-white"
                : "text-slate-700 bg-white border-slate-200 hover:bg-slate-50"
            }`}
            aria-expanded={advancedOpen}
          >
            <Filter className={`h-4 w-4 ${advancedOpen ? "text-white" : "text-slate-400"}`} />
            Advanced
          </button>
        </div>
      </div>

      {advancedOpen ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">
            Custom date range
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block font-semibold text-slate-700">From</span>
              <input
                type="date"
                value={rangeFrom}
                onChange={(e) => onRangeFromChange(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/15"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-semibold text-slate-700">To</span>
              <input
                type="date"
                value={rangeTo}
                onChange={(e) => onRangeToChange(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/15"
              />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onAdvancedApply}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              Apply range
            </button>
            <button
              type="button"
              onClick={onAdvancedReset}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Clear custom range
            </button>
            {customRangeActive ? (
              <span className="text-xs text-slate-500">Filtering orders in your selected dates.</span>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => onStatusChange(status)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              currentStatus === status
                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {status}
          </button>
        ))}
        {currentStatus !== "All" && (
          <button
            type="button"
            onClick={() => onStatusChange("All")}
            className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-600 px-2 transition-colors"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
