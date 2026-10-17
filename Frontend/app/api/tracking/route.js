import { NextResponse } from "next/server"
import { getShiprocketEnv, hasShiprocketEnv } from "@/lib/server/env"
import { createAdminClient } from "@/lib/server/supabase-admin"
import { SUPABASE_TABLES } from "@/lib/supabase/schema"

import { getShiprocketToken } from "@/lib/server/shiprocket-client"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("orderId") // Internal DB order UUID
    const awb = searchParams.get("awb") // Optional direct tracking by AWB

    if (!orderId && !awb) {
      return NextResponse.json({ error: "Order ID or AWB code is required" }, { status: 400 })
    }

    if (!hasShiprocketEnv()) {
      return NextResponse.json(
        { error: "Tracking service unavailable (missing credentials)" },
        { status: 503 }
      )
    }

    let targetAwb = awb
    const supabase = createAdminClient()

    if (!targetAwb) {
      // Look up AWB in the database
      const { data: order } = await supabase
        .from(SUPABASE_TABLES.shiprocketOrders)
        .select("awb_code")
        .eq("order_id", orderId)
        .maybeSingle()
      
      if (!order || !order.awb_code) {
        // Fallback to checking main orders table
        const { data: mainOrder } = await supabase
          .from(SUPABASE_TABLES.orders)
          .select("awb_code")
          .eq("id", orderId)
          .maybeSingle()
          
        if (!mainOrder || !mainOrder.awb_code) {
          return NextResponse.json({ error: "No tracking information available for this order yet." }, { status: 404 })
        }
        targetAwb = mainOrder.awb_code
      } else {
        targetAwb = order.awb_code
      }
    }

    const token = await getShiprocketToken()
    const { baseUrl } = getShiprocketEnv()
    
    // Call Shiprocket Track AWB API
    const res = await fetch(`${baseUrl}/courier/track/awb/${targetAwb}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("Shiprocket tracking error:", err)
      return NextResponse.json({ error: "Failed to fetch tracking data from carrier" }, { status: 502 })
    }

    const trackingData = await res.json()
    
    return NextResponse.json({
      success: true,
      awb: targetAwb,
      tracking: trackingData
    })

  } catch (error) {
    console.error("Tracking API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
