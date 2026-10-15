import { NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/lib/security/auth";
import { HttpError, toErrorResponse } from "@/lib/security/errors";

export async function POST(request) {
  try {
    const { supabase, user } = await requireAuthenticatedUser();

    const body = await request.json();
    const orderItemId = body?.order_item_id;
    const productId = body?.product_id;
    const rating = Number(body?.rating);
    const review = String(body?.review || "").trim();

    if (!orderItemId || !productId) {
      throw new HttpError(400, "Missing order or product details.");
    }
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      throw new HttpError(400, "Rating must be between 1 and 5.");
    }
    if (!review) {
      throw new HttpError(400, "Please write a review message.");
    }

    // The customer must own the order item and the order must be delivered
    // before we even attempt the insert. RLS enforces the same rule in DB.
    const { data: orderRow, error: ownershipError } = await supabase
      .from("orders")
      .select("id, status, order_items(id, product_id)")
      .eq("user_id", user.id)
      .eq("status", "delivered")
      .order("created_at", { ascending: false });

    if (ownershipError) {
      throw new HttpError(400, ownershipError.message);
    }

    const matchedItem = (orderRow || [])
      .flatMap((order) => order.order_items || [])
      .find((item) => item.id === orderItemId && item.product_id === productId);

    if (!matchedItem) {
      throw new HttpError(403, "Reviews are allowed only after your order has been delivered.");
    }

    const { data: existingReview, error: existingReviewError } = await supabase
      .from("product_reviews")
      .select("id")
      .eq("order_item_id", orderItemId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingReviewError) {
      throw new HttpError(400, existingReviewError.message);
    }
    if (existingReview) {
      throw new HttpError(409, "You have already reviewed this delivered item.");
    }

    const { data, error } = await supabase
      .from("product_reviews")
      .insert({
        order_item_id: orderItemId,
        product_id: productId,
        user_id: user.id,
        rating,
        review,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      throw new HttpError(400, error.message);
    }

    return NextResponse.json({ data });
  } catch (error) {
    return toErrorResponse(error, "Failed to submit review.");
  }
}
