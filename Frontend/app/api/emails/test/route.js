import { NextResponse } from "next/server";
import { sendResendEmail } from "@/lib/email/resend";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = body?.email || request.nextUrl.searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { status: "error", message: "Email is required. Send JSON body with { \"email\": \"your@email.com\" }" },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY || "";
    const senderEmail = process.env.RESEND_FROM_EMAIL || process.env.RESEND_SENDER_EMAIL || "onboarding@resend.dev";

    if (!apiKey) {
      return NextResponse.json(
        {
          status: "simulated",
          message: "RESEND_API_KEY is not configured yet. The email send was simulated.",
          config: { senderEmail, to: email }
        },
        { status: 200 }
      );
    }

    const data = await sendResendEmail({
      to: email,
      subject: "Camliqa — Resend Email Integration Test Successful!",
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a3e; line-height: 1.6; border: 1px solid #e7e7e7; border-radius: 16px; background-color: #fffaf7;">
          <h2 style="color: #1a1a3e; font-size: 24px; margin-top: 0; font-family: serif; border-bottom: 1px solid #e8dece; padding-bottom: 12px;">Email Integration Configured!</h2>
          <p style="font-size: 15px; margin: 16px 0 12px;">Congratulations! Your Resend email integration is working perfectly on <strong>Camliqa Ecommerce</strong>.</p>
          <div style="background-color: #ffffff; border: 1px solid #e8dece; border-radius: 12px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 6px; font-size: 13px; color: #1a1a3e/70;"><strong>Sender:</strong> ${senderEmail}</p>
            <p style="margin: 0; font-size: 13px; color: #1a1a3e/70;"><strong>Recipient:</strong> ${email}</p>
          </div>
          <p style="font-size: 14px; color: #666; margin-bottom: 0;">If this email arrived in your inbox, you are ready to send magic links, order confirmations, and customer messages live!</p>
        </div>
      `,
    });

    return NextResponse.json({
      status: "success",
      message: "Email sent successfully!",
      resendData: data
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error occurred.";
    console.error("Test email failed:", error);
    return NextResponse.json(
      { status: "error", message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  // Allow simple GET requests for quick browser/testing checks
  const email = request.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json(
      { status: "error", message: "Please provide an email parameter. E.g., /api/emails/test?email=test@example.com" },
      { status: 400 }
    );
  }

  // Reuse POST logic
  const mockRequest = {
    json: async () => ({ email }),
    nextUrl: request.nextUrl
  };
  return POST(mockRequest);
}
