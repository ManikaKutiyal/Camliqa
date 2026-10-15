import { NextResponse } from "next/server";

import { HttpError, toErrorResponse } from "@/lib/security/errors";
import { sendOrderConfirmationEmailForOrder } from "@/lib/server/order-confirmation";
import { processShiprocketFulfillment } from "@/lib/server/shiprocket-flow";
import { verifyRazorpayWebhookSignature } from "@/lib/server/razorpay";
import { createAdminClient } from "@/lib/server/supabase-admin";

function getPaymentEventDetails(payload) {
  const event = String(payload?.event || "");
  const paymentEntity = payload?.payload?.payment?.entity || null;
  const orderEntity = payload?.payload?.order?.entity || null;
  const fallbackEntity = payload?.payload?.payment_link?.entity || payload?.payload?.refund?.entity || null;

  if (event === "payment.captured" || event === "order.paid") {
    return {
      status: "paid",
      gatewayOrderId: paymentEntity?.order_id || orderEntity?.id || fallbackEntity?.order_id || null,
      gatewayPaymentId: paymentEntity?.id || null,
      paymentEntity: paymentEntity || orderEntity || fallbackEntity,
    };
  }

  if (event === "payment.failed") {
    return {
      status: "failed",
      gatewayOrderId: paymentEntity?.order_id || orderEntity?.id || fallbackEntity?.order_id || null,
      gatewayPaymentId: paymentEntity?.id || null,
      paymentEntity: paymentEntity || orderEntity || fallbackEntity,
    };
  }

  return null;
}

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!verifyRazorpayWebhookSignature({ body: rawBody, signature })) {
      throw new HttpError(401, "Invalid webhook signature.");
    }

    const payload = JSON.parse(rawBody || "{}");
    const details = getPaymentEventDetails(payload);

    // Razorpay can retry or send unrelated events; acknowledge them cleanly.
    if (!details?.gatewayOrderId) {
      return NextResponse.json({ received: true, ignored: true });
    }

    const admin = createAdminClient();
    const { data, error } = await admin.rpc("checkout_mark_payment_event_secure", {
      p_gateway_order_id: details.gatewayOrderId,
      p_gateway_payment_id: details.gatewayPaymentId || null,
      p_status: details.status,
      p_gateway_signature: signature,
      p_gateway_payload: payload,
    });

    if (error) {
      throw new HttpError(400, error.message || "Unable to apply payment webhook.");
    }

    if (data?.became_paid && data?.order_id) {
      try {
        await sendOrderConfirmationEmailForOrder({
          supabase: admin,
          orderId: data.order_id,
        });
      } catch (emailError) {
        console.error("Payment webhook email follow-up failed:", emailError);
      }

      try {
        // Run Shiprocket flow asynchronously so we don't block the webhook response
        processShiprocketFulfillment(admin, data.order_id).catch(err => {
          console.error("Async Shiprocket fulfillment failed:", err);
        });
      } catch (shiprocketErr) {
        console.error("Payment webhook Shiprocket trigger failed:", shiprocketErr);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return toErrorResponse(error, "Failed to verify payment webhook.");
  }
}
