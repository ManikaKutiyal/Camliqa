import { NextResponse } from "next/server";

import { buildInvoicePdfBase64 } from "@/lib/store-admin/invoicePdfServer";
import { sendResendEmail } from "@/lib/email/resend";
import { requireAuthenticatedUser } from "@/lib/security/auth";
import { HttpError, toErrorResponse } from "@/lib/security/errors";
import { getCustomerOrderForInvoice } from "@/services/supabase/orders";
import { mapDbOrderToAdminViewModel } from "@/services/store-admin/orders.service";

function orderConfirmationHtml(viewModel) {
  const items = Array.isArray(viewModel.items) ? viewModel.items : [];
  const rows = items
    .map(
      (it) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(it.name)}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${it.quantity ?? 1}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${escapeHtml(it.lineTotal || "")}</td></tr>`,
    )
    .join("");

  return `
  <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;color:#222">
    <h2 style="margin:0 0 12px">Thank you for your order</h2>
    <p style="margin:0 0 16px;color:#555">Hi ${escapeHtml(viewModel.customer || "there")}, we’ve received your order and your payment went through successfully.</p>
    <div style="background:#fbf8f4;border:1px solid #e7e7e7;border-radius:12px;padding:16px;margin-bottom:16px">
      <p style="margin:0 0 8px"><strong>Order</strong> #${escapeHtml(String(viewModel.id))}</p>
      <p style="margin:0 0 8px"><strong>Total</strong> ${escapeHtml(viewModel.total || "")}</p>
      <p style="margin:0;color:#666;font-size:14px">You’ll find your tax invoice attached as a PDF.</p>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <thead><tr style="background:#222;color:#fff"><th style="padding:8px;text-align:left">Item</th><th style="padding:8px">Qty</th><th style="padding:8px;text-align:right">Line</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin-top:20px;font-size:13px;color:#666">We’ll email you again when your order ships. If you have questions, just reply to this message.</p>
  </div>`;
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request) {
  try {
    const body = await request.json();
    const orderId = body?.orderId;
    if (!orderId || typeof orderId !== "string") {
      throw new HttpError(400, "orderId is required.");
    }

    const { supabase, user } = await requireAuthenticatedUser();

    const { data: row, error: fetchError } = await getCustomerOrderForInvoice(supabase, orderId, user.id);
    if (fetchError || !row) {
      throw new HttpError(404, fetchError?.message || "Order not found.");
    }

    const firstPayment = Array.isArray(row.payments) ? row.payments[0] : row.payments;
    const paymentStatus = String(firstPayment?.status || row.payment_status || "").toLowerCase();
    if (paymentStatus !== "paid") {
      throw new HttpError(409, "Confirmation emails are only sent for paid orders.");
    }

    const viewModel = mapDbOrderToAdminViewModel(row);
    const profileEmail = viewModel.email && viewModel.email !== "—" ? viewModel.email : null;
    const recipient = profileEmail || user.email;
    if (!recipient) {
      throw new HttpError(400, "No email on file for this account.");
    }

    const pdfBase64 = buildInvoicePdfBase64(viewModel);
    const invSafe = `invoice-order-${String(viewModel.id).replace(/[^a-zA-Z0-9-_]/g, "_")}.pdf`;

    await sendResendEmail({
      to: recipient,
      subject: `Order confirmed — #${viewModel.id}`,
      html: orderConfirmationHtml(viewModel),
      attachments: [{ filename: invSafe, content: pdfBase64 }],
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send confirmation email.";
    console.error("order-confirmation email:", message);
    return toErrorResponse(error, "Failed to send confirmation email.");
  }
}
