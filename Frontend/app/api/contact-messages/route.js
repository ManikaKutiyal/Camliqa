import { NextResponse } from "next/server";

import { requireAdminUser } from "@/lib/security/auth";
import { HttpError, toErrorResponse } from "@/lib/security/errors";
import { assertRateLimit } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/request";
import { verifyCaptchaToken } from "@/lib/security/captcha";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/server/supabase-admin";
import { sendResendEmail } from "@/lib/email/resend";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    const ip = getClientIp(request.headers);
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const phone = String(body?.phone || "").trim();
    const issue = String(body?.issue || "").trim();
    const message = String(body?.message || "").trim();
    const honeypot = String(body?.company || body?.website || "").trim();
    const captchaToken = String(body?.captchaToken || body?.captcha_token || "").trim();

    assertRateLimit({
      key: `contact-message:${ip || "unknown"}:${email || "anonymous"}`,
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });

    // Honeypot fields are ignored silently so simple bots do not learn that
    // the request was filtered.
    if (honeypot) {
      return NextResponse.json({ ok: true }, { status: 202 });
    }

    const captchaResult = await verifyCaptchaToken({ token: captchaToken, ip });
    if (!captchaResult.success) {
      throw new HttpError(400, captchaResult.message || "Captcha verification failed.");
    }

    if (!name || name.length < 2) {
      throw new HttpError(400, "Please enter your name.");
    }
    if (!EMAIL_REGEX.test(email)) {
      throw new HttpError(400, "Please enter a valid email.");
    }
    if (!issue) {
      throw new HttpError(400, "Please select an issue.");
    }
    if (!message || message.length < 10) {
      throw new HttpError(400, "Please enter a message (minimum 10 characters).");
    }
    if (phone && phone.length > 30) {
      throw new HttpError(400, "Phone number is too long.");
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("contact_messages")
      .insert({ name, email, phone: phone || null, issue, subject: issue || null, message })
      .select("id")
      .single();

    if (error) {
      throw new HttpError(400, error.message);
    }

    try {
      const issueLabel = issue.replace(/-/g, " ");
      await sendResendEmail({
        to: email,
        subject: "We received your message — thank you",
        html: `
          <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;color:#222;line-height:1.55">
            <p style="margin:0 0 12px">Hi ${escapeHtml(name)},</p>
            <p style="margin:0 0 12px">Thank you for reaching out to us. We’ve received your message about <strong>${escapeHtml(issueLabel)}</strong> and truly appreciate you taking the time to write in.</p>
            <p style="margin:0 0 12px">Our team will review your note and get back to you as soon as we can.</p>
            <p style="margin:0 0 12px;color:#555;font-size:14px">With gratitude,<br/>Template Support</p>
            <hr style="border:none;border-top:1px solid #e7e7e7;margin:20px 0" />
            <p style="margin:0;font-size:12px;color:#888">Reference: message #${data?.id ?? ""}</p>
          </div>`,
      });
    } catch (mailErr) {
      console.error("Contact thank-you email failed:", mailErr);
    }

    return NextResponse.json({ data });
  } catch (error) {
    return toErrorResponse(error, "Failed to send message.");
  }
}

export async function GET() {
  try {
    const { admin } = await requireAdminUser();
    const { data, error } = await admin
      .from("contact_messages")
      .select("id, name, email, phone, issue, subject, message, read, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      throw new HttpError(400, error.message);
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    return toErrorResponse(error, "Failed to load contact messages.");
  }
}
