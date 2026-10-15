import { NextResponse } from "next/server";

import { requireAdminUser } from "@/lib/security/auth";
import { toErrorResponse } from "@/lib/security/errors";
import { adminUpdateReview } from "@/services/supabase/reviews";

function isMissingFeaturedColumnError(error) {
  const message = String(error?.message || "");
  return error?.code === "42703" || /is_featured.*does not exist/i.test(message);
}

async function applyLegacyFeaturedFallback(supabase, id, isFeatured) {
  // Fallback mode for DBs without `is_featured` column: map featured state to status.
  // featured=true -> approved, featured=false -> pending
  if (isFeatured) {
    const { count, error: countError } = await supabase
      .from("product_reviews")
      .select("id", { head: true, count: "exact" })
      .eq("status", "approved");
    if (countError) {
      return { data: null, error: countError };
    }
    const { data: current, error: currentError } = await supabase
      .from("product_reviews")
      .select("id, status")
      .eq("id", id)
      .maybeSingle();
    if (currentError) {
      return { data: null, error: currentError };
    }
    if (!current) {
      return { data: null, error: { message: "Review not found.", code: "NOT_FOUND" } };
    }
    if (current.status !== "approved" && (count || 0) >= 8) {
      return { data: null, error: { message: "You can only feature up to 8 reviews.", code: "MAX_FEATURED" } };
    }
  }

  return supabase
    .from("product_reviews")
    .update({ status: isFeatured ? "approved" : "pending" })
    .eq("id", id)
    .select()
    .single();
}

export async function PATCH(request, { params }) {
  try {
    const { admin: supabase } = await requireAdminUser();
    const resolvedParams = await params;
    const id = String(resolvedParams?.id || "").trim();
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Review id is required." }, { status: 400 });
    }

    const updates = {};
    if (body.status) updates.status = body.status;
    if (typeof body.is_featured === "boolean") updates.is_featured = body.is_featured;

    if (!Object.keys(updates).length) {
      return NextResponse.json(
        { error: "Provide status or featured value to update." },
        { status: 400 },
      );
    }

    if (updates.is_featured === true) {
      const { data: currentReview, error: currentReviewError } = await supabase
        .from("product_reviews")
        .select("is_featured")
        .eq("id", id)
        .maybeSingle();

      if (currentReviewError) {
        if (isMissingFeaturedColumnError(currentReviewError)) {
          const { data, error } = await applyLegacyFeaturedFallback(supabase, id, true);
          if (error) {
            const status =
              error.code === "NOT_FOUND" ? 404 : error.code === "MAX_FEATURED" ? 400 : 400;
            return NextResponse.json({ error: error.message }, { status });
          }
          return NextResponse.json({ data });
        }
        return NextResponse.json({ error: currentReviewError.message }, { status: 400 });
      }

      if (!currentReview) {
        return NextResponse.json({ error: "Review not found." }, { status: 404 });
      }

      if (!currentReview.is_featured) {
        const { count, error: countError } = await supabase
          .from("product_reviews")
          .select("id", { head: true, count: "exact" })
          .eq("is_featured", true);

        if (countError) {
          return NextResponse.json({ error: countError.message }, { status: 400 });
        }

        if ((count || 0) >= 8) {
          return NextResponse.json(
            { error: "You can only feature up to 8 reviews." },
            { status: 400 },
          );
        }
      }
    }

    const { data, error } = await adminUpdateReview(supabase, id, updates);
    if (error) {
      if (isMissingFeaturedColumnError(error)) {
        if (typeof body.is_featured === "boolean") {
          const { data: fallbackData, error: fallbackError } = await applyLegacyFeaturedFallback(
            supabase,
            id,
            body.is_featured,
          );
          if (fallbackError) {
            const status =
              fallbackError.code === "NOT_FOUND"
                ? 404
                : fallbackError.code === "MAX_FEATURED"
                  ? 400
                  : 400;
            return NextResponse.json({ error: fallbackError.message }, { status });
          }
          return NextResponse.json({ data: fallbackData });
        }
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return toErrorResponse(error, "Failed to update review.");
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { admin: supabase } = await requireAdminUser();
    const resolvedParams = await params;
    const id = String(resolvedParams?.id || "").trim();

    if (!id) {
      return NextResponse.json({ error: "Review id is required." }, { status: 400 });
    }

    const { error } = await supabase.from("product_reviews").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return toErrorResponse(error, "Failed to delete review.");
  }
}
