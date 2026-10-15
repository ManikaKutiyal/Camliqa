import { NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/lib/security/auth";
import { HttpError, toErrorResponse } from "@/lib/security/errors";
import { assertRateLimit } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/request";
import { buildCheckoutQuote, sanitizeShippingAddress } from "@/lib/server/checkout";
import { createRazorpayOrder } from "@/lib/server/razorpay";
import { createAdminClient } from "@/lib/server/supabase-admin";
import { SUPABASE_TABLES } from "@/lib/supabase/schema";

async function persistGatewayOrderDetails(admin, paymentId, razorpayOrder, currency) {
  const modernPayload = {
    provider: "razorpay",
    method: "razorpay",
    gateway_order_id: razorpayOrder.id,
    gateway_response: razorpayOrder,
    currency_code: currency,
  };

  const legacyPayload = {
    provider: "razorpay",
    method: "razorpay",
    provider_order_id: razorpayOrder.id,
    gateway_response: razorpayOrder,
    currency,
  };

  const modernResult = await admin
    .from(SUPABASE_TABLES.payments)
    .update(modernPayload)
    .eq("id", paymentId);

  if (!modernResult.error) {
    return;
  }

  const message = modernResult.error.message || "";
  const looksLikeLegacySchema =
    /column .*gateway_order_id.* does not exist/i.test(message) ||
    /column .*currency_code.* does not exist/i.test(message);

  if (!looksLikeLegacySchema) {
    throw new Error(message || "Unable to persist Razorpay order details.");
  }

  const legacyResult = await admin
    .from(SUPABASE_TABLES.payments)
    .update(legacyPayload)
    .eq("id", paymentId);

  if (legacyResult.error) {
    throw new Error(legacyResult.error.message || "Unable to persist Razorpay order details.");
  }
}

export async function POST(request) {
  try {
    const { supabase, user } = await requireAuthenticatedUser();
    const ip = getClientIp(request.headers);

    assertRateLimit({
      key: `checkout:create-order:${user.id}:${ip || "unknown"}`,
      limit: 6,
      windowMs: 10 * 60 * 1000,
    });

    const body = await request.json();
    const shippingAddress = sanitizeShippingAddress(body?.shippingAddress || body?.shipping_address);
    const quote = await buildCheckoutQuote({
      supabase,
      userId: user.id,
      items: body?.items,
      couponCode: body?.couponCode || body?.coupon_code || "",
      shippingMethod: body?.shippingMethod || body?.shipping_method,
    });

    const admin = createAdminClient();
    const { data: orderResult, error: orderError } = await admin.rpc(
      "checkout_create_order_secure",
      {
        p_user_id: user.id,
        p_items: quote.items.map((item) => ({
          product_id: item.productId,
          variant_id: item.variantId,
          quantity: item.quantity,
          product_title: item.title,
          variant_label: item.variantLabel,
          sku: item.sku,
          unit_price: item.unitPrice,
          total_price: Number((item.unitPrice * item.quantity).toFixed(2)),
        })),
        p_shipping_address: shippingAddress,
        p_shipping_method: quote.shippingMethod,
        p_coupon_id: quote.coupon?.id ?? null,
        p_coupon_code: quote.coupon?.code ?? null,
        p_amounts: quote.amounts,
        p_currency_code: quote.currency,
      },
    );

    if (orderError) {
      throw new HttpError(400, orderError.message || "Unable to create order.");
    }

    const orderId = orderResult?.order_id;
    const paymentId = orderResult?.payment_id;

    if (!orderId || !paymentId) {
      throw new HttpError(500, "Checkout did not return an order reference.");
    }

    let paymentSession = {
      mode: "mock",
      message:
        "Razorpay is not configured yet. The order has been created in pending payment state for later integration.",
    };

    try {
      const razorpay = await createRazorpayOrder({
        amount: quote.amounts.total,
        receipt: String(orderId),
        notes: {
          order_id: String(orderId),
          user_id: String(user.id),
        },
      });

      if (razorpay.mode === "live" && razorpay.order?.id) {
        await persistGatewayOrderDetails(admin, paymentId, razorpay.order, quote.currency);

        paymentSession = {
          mode: "live",
          keyId: razorpay.keyId,
          orderId: razorpay.order.id,
          amount: razorpay.order.amount,
          currency: razorpay.order.currency || quote.currency,
          name: "Vedonyx",
          description: `Order ${String(orderId).slice(0, 8).toUpperCase()}`,
          prefill: {
            name: shippingAddress.fullName,
            email: user.email || "",
            contact: shippingAddress.phone,
          },
          notes: {
            orderId,
            paymentId,
          },
        };
      }
    } catch (paymentError) {
      // We intentionally keep the order pending here so support can reconcile
      // the failed gateway bootstrap without losing the customer's checkout.
      await admin
        .from(SUPABASE_TABLES.payments)
        .update({
          gateway_response: {
            error: paymentError instanceof Error ? paymentError.message : "Payment setup failed.",
          },
        })
        .eq("id", paymentId);

      paymentSession = {
        mode: "unavailable",
        message:
          paymentError instanceof Error
            ? paymentError.message
            : "Unable to start the payment gateway right now.",
      };
    }

    return NextResponse.json({
      data: {
        orderId,
        paymentId,
        quote: {
          currency: quote.currency,
          amounts: quote.amounts,
          shippingMethod: quote.shippingMethod,
          coupon: quote.coupon
            ? {
                id: quote.coupon.id,
                code: quote.coupon.code,
                dealType: quote.coupon.dealType,
              }
            : null,
        },
        paymentSession,
      },
    });
  } catch (error) {
    return toErrorResponse(error, "Failed to create checkout order.");
  }
}
