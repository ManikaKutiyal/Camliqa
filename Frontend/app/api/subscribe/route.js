import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { sendResendEmail } from "@/lib/email/resend";
import {
  isValidNewsletterEmail,
  normalizeNewsletterEmail,
  subscribeToNewsletter,
} from "@/services/supabase/newsletter";

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_WINDOW = 5;

function checkRateLimit(ip) {
  if (!ip) return true;

  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record) {
    rateLimitMap.set(ip, { count: 1, firstRequest: now });
    return true;
  }

  if (now - record.firstRequest > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, firstRequest: now });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function POST(request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { status: "error", message: "Too many attempts. Please try again later." },
        { status: 429 },
      );
    }

    const contentType = request.headers.get("content-type") || "";
    let emailValue = "";
    if (contentType.includes("application/json")) {
      const body = await request.json();
      emailValue = body?.email;
    } else {
      const formData = await request.formData();
      emailValue = formData.get("email");
    }

    const email = normalizeNewsletterEmail(emailValue);
    if (!email) {
      return NextResponse.json(
        { status: "error", message: "Please enter your email address." },
        { status: 400 },
      );
    }
    if (!isValidNewsletterEmail(email)) {
      return NextResponse.json(
        { status: "error", message: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const { error, isNew } = await subscribeToNewsletter(supabase, email);
    if (error) {
      return NextResponse.json(
        { status: "error", message: "Could not subscribe right now. Please try again." },
        { status: 500 },
      );
    }

    if (isNew) {
      try {
        await sendResendEmail({
          to: email,
          subject: "Welcome to Camliqa Newsletter!",
          html: `
            <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a3e; line-height: 1.6; border: 1px solid #e7e7e7; border-radius: 16px; background-color: #fffaf7;">
              <h2 style="color: #1a1a3e; font-size: 24px; margin-top: 0; font-family: serif; border-bottom: 1px solid #e8dece; padding-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Welcome to Camliqa</h2>
              <p style="font-size: 15px; margin: 16px 0 12px;">Hi there,</p>
              <p style="font-size: 15px; margin: 12px 0;">Thank you for subscribing to our newsletter! You are now part of our exclusive circle.</p>
              <p style="font-size: 15px; margin: 12px 0;">Stay tuned for expert beauty rituals, special product restocks, and exclusive promotions crafted just for you.</p>
              <p style="font-size: 14px; color: #666; margin-top: 24px; border-top: 1px solid #e8dece; padding-top: 12px;">Warmly,<br/>The Camliqa Team</p>
            </div>
          `
        });
      } catch (welcomeErr) {
        console.error("Failed to send welcome newsletter email:", welcomeErr);
      }
    }

    return NextResponse.json(
      isNew
        ? { status: "success", message: "Subscribed successfully! Welcome aboard." }
        : { status: "success", message: "You're already subscribed. Thank you!" },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Newsletter is unavailable right now.";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
