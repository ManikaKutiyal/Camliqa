import "server-only";

import crypto from "node:crypto";

import {
  getRazorpayEnv,
  hasLiveRazorpayEnv,
  hasLiveRazorpayWebhookSecret,
} from "@/lib/server/env";

function toSubunits(amount) {
  return Math.max(0, Math.round(Number(amount || 0) * 100));
}

export async function createRazorpayOrder({ amount, receipt, notes }) {
  if (!hasLiveRazorpayEnv()) {
    return {
      mode: "mock",
      keyId: null,
      order: null,
    };
  }

  const { keyId, keySecret } = getRazorpayEnv();
  const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${authHeader}`,
    },
    body: JSON.stringify({
      amount: toSubunits(amount),
      currency: "INR",
      receipt,
      notes,
      payment_capture: 1,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = payload?.error?.description || payload?.error?.reason || "Unable to create Razorpay order.";
    throw new Error(detail);
  }

  return {
    mode: "live",
    keyId,
    order: payload,
  };
}

export function verifyRazorpayWebhookSignature({ body, signature }) {
  if (!hasLiveRazorpayWebhookSecret()) {
    return false;
  }

  const { webhookSecret } = getRazorpayEnv();
  const expected = crypto.createHmac("sha256", webhookSecret).update(body).digest("hex");
  const received = String(signature || "");

  if (!received || received.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}
