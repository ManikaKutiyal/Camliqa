import autoTable from "jspdf-autotable";

const COL = {
  ink: [34, 34, 34],
  muted: [120, 120, 120],
  line: [231, 231, 231],
  surface: [245, 245, 245],
  accent: [183, 123, 63],
};

function parseSnapshot(snapshot) {
  if (snapshot == null || snapshot === "") return null;
  let obj = snapshot;
  if (typeof snapshot === "string") {
    try {
      obj = JSON.parse(snapshot);
    } catch {
      return null;
    }
  }
  if (typeof obj !== "object" || obj === null) return null;
  return obj;
}

function formatLongDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function addDaysLong(iso, days) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  d.setDate(d.getDate() + Number(days || 0));
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function moneyPdf(n) {
  const v = Number(n || 0);
  return `Rs. ${v.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

/**
 * Draw invoice onto an existing jsPDF document (browser or Node).
 * @param {import("jspdf").jsPDF} doc
 * @param {Record<string, unknown>} order — view model from mapDbOrderToAdminViewModel
 * @param {object} b — branding from getInvoiceBranding()
 * @param {string | null} logoData — data URL or null
 */
export function renderInvoicePdfContent(doc, order, b, logoData) {
  if (!order?.rawId) {
    throw new Error("Missing order");
  }
  const items = Array.isArray(order.items) ? order.items : [];
  if (items.length === 0) {
    throw new Error("No line items to invoice");
  }

  const amounts = order.amounts || {
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
  };

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const m = 14;
  let y = m;

  const logoW = 22;
  const logoH = 22;
  if (logoData) {
    try {
      doc.addImage(logoData, "PNG", m, y, logoW, logoH);
    } catch {
      // ignore
    }
  } else {
    doc.setFillColor(...COL.ink);
    doc.roundedRect(m, y, 18, 18, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    const mark = (String(b.companyName || "S").trim().charAt(0) || "S").toUpperCase();
    doc.text(mark, m + 5.2, y + 12.5);
  }

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(b.companyName, m + logoW + 4, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.2);
  doc.setTextColor(...COL.muted);
  const addrLines = doc.splitTextToSize(b.address, 85);
  doc.text(addrLines, m + logoW + 4, y + 11);
  let ty = y + 11 + addrLines.length * 3.6;
  doc.text(`${b.phone}  |  ${b.email}`, m + logoW + 4, ty);
  ty += 4;
  doc.text(b.website, m + logoW + 4, ty);

  doc.setTextColor(...COL.ink);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("TAX INVOICE", pageW - m, y + 10, { align: "right" });

  y = Math.max(y + logoH, ty + 6) + 4;
  doc.setDrawColor(...COL.line);
  doc.setLineWidth(1.1);
  doc.line(m, y, pageW - m, y);
  y += 8;

  const snap = parseSnapshot(order.shippingSnapshot);
  const clientName = snap?.fullName || order.customer || "Customer";
  const companyLine = snap?.company || snap?.companyName || "";
  const shipLines = [];
  if (snap) {
    const street = [snap.addressLine1, snap.addressLine2].filter(Boolean).join(", ");
    if (street) shipLines.push(street);
    const loc = [snap.city, snap.state, snap.postalCode].filter(Boolean).join(", ");
    if (loc) shipLines.push(loc);
    if (snap.country) shipLines.push(String(snap.country));
  } else if (order.shippingAddress && order.shippingAddress !== "—") {
    shipLines.push(...String(order.shippingAddress).split("\n"));
  }

  const leftW = 92;
  const rightX = m + leftW + 8;
  const sectionHeaderY = y;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...COL.accent);
  doc.text("INVOICE TO:", m, sectionHeaderY);
  doc.text("INVOICE DETAILS", rightX, sectionHeaderY);
  y = sectionHeaderY + 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  let ly = y;
  doc.setFont("helvetica", "bold");
  doc.text(clientName, m, ly);
  doc.setFont("helvetica", "normal");
  ly += 4.5;
  if (companyLine) {
    doc.text(companyLine, m, ly);
    ly += 4.5;
  }
  for (const line of shipLines) {
    const parts = doc.splitTextToSize(line, leftW - 2);
    doc.text(parts, m, ly);
    ly += parts.length * 4.2;
  }
  if (snap?.phone) {
    doc.text(`Phone: ${snap.phone}`, m, ly);
    ly += 4.5;
  }
  if (order.email && order.email !== "—") {
    doc.text(`Email: ${order.email}`, m, ly);
    ly += 4.5;
  }

  const invNo = `INV-${new Date(order.createdAt || Date.now()).getFullYear()}-${order.id}`;
  const invDate = formatLongDate(order.createdAt);
  const due = addDaysLong(order.createdAt, b.paymentTermsDays);
  const orderStatus = order.status || "—";
  const paymentMethod = order.paymentMethod || "—";
  const paymentStatus = order.paymentStatus || "—";
  const shippingMethod = order.shippingMethod || "—";
  let ry = y;
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice #: ${invNo}`, rightX, ry);
  ry += 4.5;
  doc.text(`Order #: ${order.id || "—"}`, rightX, ry);
  ry += 4.5;
  doc.text(`Date: ${invDate}`, rightX, ry);
  ry += 4.5;
  doc.text(`Due Date: ${due}`, rightX, ry);
  ry += 4.5;
  doc.text(`Payment Terms: Net ${b.paymentTermsDays}`, rightX, ry);
  ry += 4.5;
  doc.text(`Order Status: ${orderStatus}`, rightX, ry);
  ry += 4.5;
  doc.text(`Payment: ${paymentMethod} (${paymentStatus})`, rightX, ry);
  ry += 4.5;
  doc.text(`Shipping Method: ${shippingMethod}`, rightX, ry);

  y = Math.max(ly, ry) + 6;

  const body = items.map((it, i) => {
    const desc =
      it.name +
      (it.variantLabel ? ` — ${it.variantLabel}` : "") +
      (it.sku && it.sku !== "—" ? ` (SKU: ${it.sku})` : "");
    return [
      String(i + 1),
      desc,
      String(it.quantity ?? 1),
      moneyPdf(it.unitAmount ?? 0),
      moneyPdf(it.lineAmount ?? 0),
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [["Sr.", "Description", "Qty", "Unit Price", "Total (Rs.)"]],
    body,
    theme: "plain",
    margin: { left: m, right: m },
    headStyles: {
      fillColor: COL.ink,
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
      halign: "left",
      valign: "middle",
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [40, 40, 40],
      valign: "middle",
    },
    alternateRowStyles: { fillColor: COL.surface },
    columnStyles: {
      0: { cellWidth: 11, halign: "center" },
      1: { cellWidth: "auto", halign: "left", minCellWidth: 52 },
      2: { cellWidth: 14, halign: "center" },
      3: { cellWidth: 36, halign: "right" },
      4: { cellWidth: 40, halign: "right" },
    },
    styles: {
      lineColor: COL.line,
      lineWidth: 0.2,
      cellPadding: { top: 2.2, bottom: 2.2, left: 2, right: 2.5 },
    },
  });

  const tableEndY = doc.lastAutoTable?.finalY ?? y;
  const afterTable = tableEndY + 6;
  const sub = amounts.subtotal ?? 0;
  const tax = amounts.tax ?? 0;
  const ship = amounts.shipping ?? 0;
  const tot = amounts.total ?? 0;
  const taxPct = sub > 0 && tax > 0 ? Math.round((tax / sub) * 1000) / 10 : null;

  const summaryLabelX = pageW - m - 74;
  const summaryValueRightX = pageW - m;
  let sy = afterTable;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text("Subtotal", summaryLabelX, sy);
  doc.text(moneyPdf(sub), summaryValueRightX, sy, { align: "right" });
  sy += 5.5;
  const taxLabel = taxPct != null ? `Tax (GST ${taxPct}%)` : "Tax";
  doc.text(taxLabel, summaryLabelX, sy);
  doc.text(moneyPdf(tax), summaryValueRightX, sy, { align: "right" });
  sy += 5.5;
  doc.text("Shipping", summaryLabelX, sy);
  doc.text(moneyPdf(ship), summaryValueRightX, sy, { align: "right" });
  sy += 7;
  doc.setDrawColor(...COL.line);
  doc.setLineWidth(0.35);
  doc.line(summaryLabelX - 2, sy - 1, summaryValueRightX, sy - 1);
  doc.line(summaryLabelX - 2, sy + 0.8, summaryValueRightX, sy + 0.8);

  sy += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COL.ink);
  doc.text("Total Amount", summaryLabelX, sy);
  doc.text(moneyPdf(tot), summaryValueRightX, sy, { align: "right" });

  sy += 16;
  if (sy > pageH - 52) {
    doc.addPage();
    sy = m;
  }

  doc.setFillColor(...COL.surface);
  doc.roundedRect(m, sy - 2, 88, 36, 2, 2, "F");
  doc.roundedRect(m + 95, sy - 2, 88, 36, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...COL.ink);
  doc.text("PAYMENT & DELIVERY", m + 3, sy + 2);
  doc.text("NOTES", m + 98, sy + 2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(55, 55, 55);
  const payBlock = [
    `Payment Method: ${paymentMethod}`,
    `Payment Status: ${paymentStatus}`,
    `Shipping Method: ${shippingMethod}`,
    `Order Status: ${orderStatus}`,
  ];
  const payLines = payBlock.flatMap((line) => doc.splitTextToSize(line, 80));
  doc.text(payLines, m + 3, sy + 7);
  const noteLines = doc.splitTextToSize(b.footerNote, 80);
  doc.text(noteLines, m + 98, sy + 7);

  const footY = pageH - 12;
  doc.setDrawColor(...COL.line);
  doc.setLineWidth(0.3);
  doc.line(m, footY - 4, pageW - m, footY - 4);
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text(`${b.website}  |  ${b.phone}  |  ${b.address}`, m, footY);
}
