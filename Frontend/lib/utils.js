import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  }

  if (typeof value === "string" && value.trim()) {
    const numeric = Number(value.replace(/[^0-9.]/g, ""));
    if (Number.isFinite(numeric)) {
      return `₹${numeric.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
    }
    return value.startsWith("₹") ? value : `₹${value}`;
  }

  return "₹0";
}
