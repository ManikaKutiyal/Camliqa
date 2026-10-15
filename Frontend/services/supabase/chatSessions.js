import { SUPABASE_TABLES } from "@/lib/supabase/schema"

/**
 * Create or update a chat session by sessionId.
 * Appends a new message to the messages array.
 */
export async function upsertChatSession(supabase, { sessionId, userId = null, messages }) {
  const { data: existing } = await supabase
    .from(SUPABASE_TABLES.chatSessions)
    .select("id, messages")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (existing) {
    return supabase
      .from(SUPABASE_TABLES.chatSessions)
      .update({ messages, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select()
      .single();
  }

  return supabase
    .from(SUPABASE_TABLES.chatSessions)
    .insert({
      session_id: sessionId,
      user_id: userId || null,
      messages,
    })
    .select()
    .single();
}

/**
 * Fetch a chat session by sessionId (for restoring conversation history).
 */
export async function getChatSession(supabase, sessionId) {
  return supabase
    .from(SUPABASE_TABLES.chatSessions)
    .select("id, session_id, user_id, messages, created_at, updated_at")
    .eq("session_id", sessionId)
    .maybeSingle();
}

/**
 * Link an anonymous session to a signed-in user after login.
 */
export async function linkChatSessionToUser(supabase, sessionId, userId) {
  return supabase
    .from(SUPABASE_TABLES.chatSessions)
    .update({ user_id: userId })
    .eq("session_id", sessionId)
    .is("user_id", null);
}

/**
 * Get all chat sessions for a signed-in user (for account history).
 */
export async function getUserChatSessions(supabase, userId) {
  return supabase
    .from(SUPABASE_TABLES.chatSessions)
    .select("id, session_id, messages, created_at, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(20);
}

/**
 * Admin: fetch all chat sessions for moderation / analytics.
 */
export async function adminGetChatSessions(supabase) {
  return supabase
    .from(SUPABASE_TABLES.chatSessions)
    .select(`
      id,
      session_id,
      user_id,
      messages,
      created_at,
      updated_at,
      profiles (
        id,
        full_name,
        email
      )
    `)
    .order("updated_at", { ascending: false })
    .limit(200);
}
