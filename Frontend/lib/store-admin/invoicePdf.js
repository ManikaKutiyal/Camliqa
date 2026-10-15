"use client";

import { jsPDF } from "jspdf";

import { getInvoiceBranding } from "@/lib/store-admin/invoice-branding";
import { renderInvoicePdfContent } from "@/lib/store-admin/invoicePdfCore";

async function loadLogoDataUrl(path) {
  if (typeof window === "undefined") return null;
  try {
    const url = path.startsWith("http") ? path : `${window.location.origin}${path}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => reject(new Error("read"));
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** @param {Record<string, unknown>} order — normalized admin order from `mapDbOrderToAdminViewModel` */
export async function downloadStoreInvoicePdf(order) {
  if (!order?.rawId) {
    throw new Error("Missing order");
  }
  const b = getInvoiceBranding();
  const logoData = await loadLogoDataUrl(b.logoPath);
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  renderInvoicePdfContent(doc, order, b, logoData);

  const invNo = `INV-${new Date(order.createdAt || Date.now()).getFullYear()}-${order.id}`;
  const safeName = invNo.replace(/[^a-zA-Z0-9-_]/g, "_");
  doc.save(`invoice-${safeName}.pdf`);
}
