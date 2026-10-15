import { jsPDF } from "jspdf";

import { getInvoiceBranding } from "@/lib/store-admin/invoice-branding";
import { renderInvoicePdfContent } from "@/lib/store-admin/invoicePdfCore";

/**
 * Build invoice PDF as base64 (for email attachments). No logo on server.
 * @param {Record<string, unknown>} order — view model from mapDbOrderToAdminViewModel
 */
export function buildInvoicePdfBase64(order) {
  const b = getInvoiceBranding();
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  renderInvoicePdfContent(doc, order, b, null);
  const dataUri = doc.output("datauristring");
  const parts = dataUri.split(",");
  return parts.length > 1 ? parts[1] : dataUri;
}
