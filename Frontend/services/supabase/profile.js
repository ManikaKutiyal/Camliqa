import { createClient } from "@/lib/supabase/client";
import { SUPABASE_TABLES } from "@/lib/supabase/schema";

export async function getCustomerProfileByUserId(supabase, userId) {
  if (!userId) return null;
  
  const { data, error } = await supabase
    .from(SUPABASE_TABLES.profiles)
    .select(`
      id,
      full_name,
      avatar_url,
      role
    `)
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
  return data;
}

export async function getCustomerProfilePreview() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    return getCustomerProfileByUserId(supabase, user.id);
  } catch (error) {
    console.error("Profile preview error:", error);
    return null;
  }
}