import { NEWSLETTER_STATUS, SUPABASE_TABLES } from "@/lib/supabase/schema"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeNewsletterEmail(rawEmail) {
  return String(rawEmail ?? "").trim().toLowerCase();
}

export function isValidNewsletterEmail(email) {
  return EMAIL_PATTERN.test(email);
}

export async function subscribeToNewsletter(supabase, email) {
  const normalizedEmail = normalizeNewsletterEmail(email);
  if (!normalizedEmail || !isValidNewsletterEmail(normalizedEmail)) {
    return {
      error: { message: "Invalid email address.", code: "INVALID_EMAIL" },
      isNew: false,
    };
  }

  // Insert-first strategy works with strict RLS (public insert, no public read).
  const { data: inserted, error: insertError } = await supabase
    .from(SUPABASE_TABLES.newsletterSubs)
    .insert({
      email: normalizedEmail,
      active: NEWSLETTER_STATUS.active,
    })
    .select()
    .single();

  if (!insertError) {
    return { data: inserted, error: null, isNew: true };
  }

  const duplicateConstraintCodes = new Set(["23505"]);
  const isDuplicate =
    duplicateConstraintCodes.has(String(insertError.code)) ||
    /duplicate key|already exists|unique constraint/i.test(
      String(insertError.message || ""),
    );

  if (isDuplicate) {
    return { data: null, error: null, isNew: false };
  }

  return { data: null, error: insertError, isNew: false };
}
