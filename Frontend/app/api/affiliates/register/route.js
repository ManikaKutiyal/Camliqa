import { NextResponse } from "next/server"
import { requireAuthenticatedUser } from "@/lib/security/auth"
import { createAdminClient } from "@/lib/server/supabase-admin"
import { registerAffiliate } from "@/services/supabase/affiliates"

export async function POST(request) {
  try {
    const { user, error: authError } = await requireAuthenticatedUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const nameSeed = body.name || user.user_metadata?.full_name || user.email?.split("@")[0] || ""

    const supabase = createAdminClient()
    const { data, error, alreadyRegistered } = await registerAffiliate(supabase, user.id, nameSeed)

    if (error) {
      console.error("Affiliate registration error:", error)
      return NextResponse.json({ error: "Failed to register affiliate" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      alreadyRegistered,
      affiliate: data
    })

  } catch (error) {
    console.error("Affiliate registration unhandled error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
