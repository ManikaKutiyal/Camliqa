import { NextResponse } from "next/server"
import { requireAuthenticatedUser } from "@/lib/security/auth"
import { createAdminClient } from "@/lib/server/supabase-admin"
import { getAffiliateByUserId, getAffiliateOrders } from "@/services/supabase/affiliates"

export async function GET(request) {
  try {
    const { user, error: authError } = await requireAuthenticatedUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()
    const { data: affiliate } = await getAffiliateByUserId(supabase, user.id)

    if (!affiliate) {
      return NextResponse.json({ error: "Not an affiliate" }, { status: 404 })
    }

    const { data: orders } = await getAffiliateOrders(supabase, affiliate.code)

    return NextResponse.json({
      success: true,
      stats: {
        code: affiliate.code,
        commission_rate: affiliate.commission_rate,
        total_earnings: affiliate.total_earnings,
        paid_earnings: affiliate.paid_earnings,
        pending_earnings: affiliate.pending_earnings,
        status: affiliate.status,
      },
      orders: orders || []
    })

  } catch (error) {
    console.error("Affiliate stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
