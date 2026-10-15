import "server-only";

import { sendResendEmail } from "@/lib/email/resend";
import { mapDbOrderToAdminViewModel } from "@/services/store-admin/orders.service";
import { SUPABASE_TABLES } from "@/lib/supabase/schema";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function orderConfirmationHtml(viewModel) {
  const itemsHtml = (viewModel.items || [])
    .map(
      (it) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(it.name)}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${it.quantity ?? 1}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${escapeHtml(it.lineTotal || "")}</td></tr>`,
    )
    .join("");

  return `
  <div style="font-family:system-ui,-apple-system,sans-serif;max-width:720px;margin:0 auto;color:#222;line-height:1.55">
    <h2 style="margin:0 0 12px">Thank you for your order</h2>
    <p style="margin:0 0 16px;color:#555">Hi ${escapeHtml(viewModel.customer || "there")}, we’ve received your order and your payment went through successfully.</p>
    <div style="background:#fbf8f4;border:1px solid #e7e7e7;border-radius:12px;padding:16px;margin-bottom:16px">
      <div><strong>Order ID:</strong> ${escapeHtml(viewModel.orderCode || viewModel.id || "")}</div>
      <div><strong>Date:</strong> ${escapeHtml(viewModel.orderDate || "")}</div>
      <div><strong>Total:</strong> ${escapeHtml(viewModel.total || "")}</div>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <thead><tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee">Item</th><th style="text-align:center;padding:8px;border-bottom:1px solid #eee">Qty</th><th style="text-align:right;padding:8px;border-bottom:1px solid #eee">Line Total</th></tr></thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <p style="margin-top:20px;font-size:13px;color:#666">We’ll email you again when your order ships. If you have questions, just reply to this message.</p>
  </div>`;
}

export async function getOrderForConfirmationEmail(supabase, orderId) {
  return supabase
    .from(SUPABASE_TABLES.orders)
    .select(`
      *,
      profiles(full_name, email, phone),
      order_items(*, products(title, image_url)),
      payments(id, status, method, amount, created_at)
    `)
    .eq("id", orderId)
    .single();
}

export async function sendOrderConfirmationEmailForOrder({ supabase, orderId, fallbackEmail = null }) {
  const { data: row, error } = await getOrderForConfirmationEmail(supabase, orderId);
  if (error || !row) {
    throw error || new Error("Order not found.");
  }

  const viewModel = mapDbOrderToAdminViewModel(row);
  const profileEmail = viewModel.email && viewModel.email !== "—" ? viewModel.email : null;
  const recipient = profileEmail || fallbackEmail;

  if (!recipient) {
    throw new Error("No email on file for this account.");
  }

  await sendResendEmail({
    to: recipient,
    subject: `Order Confirmation ${viewModel.orderCode || viewModel.id || ""}`,
    html: orderConfirmationHtml(viewModel),
  });

  return { row, viewModel, recipient };
}
