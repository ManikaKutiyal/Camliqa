import { SUPABASE_TABLES } from "@/lib/supabase/schema"

export async function adminGetCustomerProfiles(supabase) {
  return supabase
    .from(SUPABASE_TABLES.profiles)
    .select(`
      id,
      role,
      full_name,
      email,
      phone,
      created_at,
      user_addresses (
        id,
        label,
        city,
        state,
        country,
        postal_code
      ),
      orders (
        id
      )
    `)
    .order("created_at", { ascending: false })
}

export async function adminGetCustomerProfileByUserId(supabase, userId) {
  return supabase
    .from(SUPABASE_TABLES.profiles)
    .select(`
      id,
      role,
      full_name,
      phone,
      user_addresses (
        id,
        label,
        address_line_1,
        address_line_2,
        city,
        state,
        country,
        postal_code
      )
    `)
    .eq("id", userId)
    .single()
}
