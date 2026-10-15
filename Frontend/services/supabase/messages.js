import { createClient } from '@/lib/supabase/client';

export async function getContactMessages(supabase) {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  return { data, error };
}

export async function markMessageAsRead(supabase, messageId, isRead = true) {
  const { data, error } = await supabase
    .from('contact_messages')
    .update({ read: isRead })
    .eq('id', messageId)
    .select()
    .single();

  return { data, error };
}

export async function deleteContactMessage(supabase, messageId) {
  const { error } = await supabase
    .from('contact_messages')
    .delete()
    .eq('id', messageId);

  return { error };
}
