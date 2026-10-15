import { SUPABASE_TABLES, SUPABASE_BUCKETS } from "@/lib/supabase/schema"

function slugifyTitle(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "post";
}

async function getUniquePostSlug(supabase, requestedSlug, currentPostId = null) {
  const baseSlug = slugifyTitle(requestedSlug);
  const { data } = await supabase
    .from(SUPABASE_TABLES.journalPosts)
    .select("id, slug")
    .like("slug", `${baseSlug}%`);

  const taken = new Set(
    (data || [])
      .filter((row) => row.id !== currentPostId)
      .map((row) => row.slug),
  );
  if (!taken.has(baseSlug)) return baseSlug;
  let suffix = 2;
  while (taken.has(`${baseSlug}-${suffix}`)) suffix++;
  return `${baseSlug}-${suffix}`;
}

// ─────────────────────────────────────────────────────────────
// Storefront
// ─────────────────────────────────────────────────────────────

/**
 * Fetch all published journal posts for the storefront blog/journal page.
 */
export async function getPublishedJournalPosts(supabase, limit = 20) {
  return supabase
    .from(SUPABASE_TABLES.journalPosts)
    .select(`
      id,
      title,
      slug,
      excerpt,
      cover_image_url,
      published_at,
      tags,
      seo_title,
      seo_description,
      author_id,
      profiles (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(limit);
}

/**
 * Fetch a single published post by slug (for post detail page).
 */
export async function getJournalPostBySlug(supabase, slug) {
  return supabase
    .from(SUPABASE_TABLES.journalPosts)
    .select(`
      id,
      title,
      slug,
      content,
      excerpt,
      cover_image_url,
      published_at,
      tags,
      seo_title,
      seo_description,
      profiles (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq("slug", slug)
    .eq("published", true)
    .single();
}

/**
 * Fetch posts by tag (for tag filter pages).
 */
export async function getJournalPostsByTag(supabase, tag, limit = 12) {
  return supabase
    .from(SUPABASE_TABLES.journalPosts)
    .select(`
      id,
      title,
      slug,
      excerpt,
      cover_image_url,
      published_at,
      tags
    `)
    .eq("published", true)
    .contains("tags", [tag])
    .order("published_at", { ascending: false })
    .limit(limit);
}

// ─────────────────────────────────────────────────────────────
// Admin
// ─────────────────────────────────────────────────────────────

/**
 * Fetch all posts (published and drafts) for admin.
 */
export async function adminGetJournalPosts(supabase) {
  return supabase
    .from(SUPABASE_TABLES.journalPosts)
    .select(`
      id,
      title,
      slug,
      excerpt,
      cover_image_url,
      published,
      published_at,
      tags,
      created_at,
      profiles (
        id,
        full_name
      )
    `)
    .order("created_at", { ascending: false });
}

/**
 * Create a new journal post.
 */
export async function adminCreateJournalPost(supabase, postValues) {
  const uniqueSlug = await getUniquePostSlug(
    supabase,
    postValues.slug || postValues.title,
  );

  const payload = {
    ...postValues,
    slug: uniqueSlug,
    published_at: postValues.published ? (postValues.published_at || new Date().toISOString()) : null,
  };

  return supabase
    .from(SUPABASE_TABLES.journalPosts)
    .insert(payload)
    .select()
    .single();
}

/**
 * Update an existing journal post.
 */
export async function adminUpdateJournalPost(supabase, postId, values) {
  const nextSlug = values.slug || values.title;
  const uniqueSlug = nextSlug
    ? await getUniquePostSlug(supabase, nextSlug, postId)
    : undefined;

  const payload = {
    ...values,
    ...(uniqueSlug ? { slug: uniqueSlug } : {}),
    ...(values.published && !values.published_at
      ? { published_at: new Date().toISOString() }
      : {}),
  };

  return supabase
    .from(SUPABASE_TABLES.journalPosts)
    .update(payload)
    .eq("id", postId)
    .select()
    .single();
}

/**
 * Delete a journal post.
 */
export async function adminDeleteJournalPost(supabase, postId) {
  return supabase
    .from(SUPABASE_TABLES.journalPosts)
    .delete()
    .eq("id", postId);
}

/**
 * Upload a journal cover image to Supabase Storage.
 */
export async function uploadJournalImage(supabase, filePath, file, options = {}) {
  return supabase.storage
    .from(SUPABASE_BUCKETS.journalImages)
    .upload(filePath, file, options);
}

export function getJournalImagePublicUrl(supabase, filePath) {
  return supabase.storage
    .from(SUPABASE_BUCKETS.journalImages)
    .getPublicUrl(filePath);
}
