import { SUPABASE_TABLES } from "@/lib/supabase/schema"

/**
 * Aggregate dashboard stats: total sales, orders, revenue, customers.
 * Returns { totalSales, totalOrders, totalRevenue, totalCustomers }
 */
export async function adminGetDashboardStats(supabase) {
  const [ordersRes, customersRes, paymentsRes] = await Promise.all([
    supabase.from(SUPABASE_TABLES.orders).select("id, total_amount, status", { count: "exact" }),
    supabase
      .from(SUPABASE_TABLES.profiles)
      .select("id", { count: "exact" })
      .neq("role", "admin"),
    supabase
      .from(SUPABASE_TABLES.payments)
      .select("amount, status")
      .eq("status", "paid"),
  ])

  const totalOrders = ordersRes.count ?? (ordersRes.data?.length ?? 0)
  const totalCustomers = customersRes.count ?? (customersRes.data?.length ?? 0)

  const totalSales = (ordersRes.data ?? []).reduce(
    (sum, o) => sum + (parseFloat(o.total_amount) || 0),
    0
  )
  const totalRevenue = (paymentsRes.data ?? []).reduce(
    (sum, p) => sum + (parseFloat(p.amount) || 0),
    0
  )

  return {
    data: { totalSales, totalOrders, totalRevenue, totalCustomers },
    error: ordersRes.error || customersRes.error || paymentsRes.error,
  }
}

/**
 * Fetch the 3 most recent orders for the notifications panel.
 */
export async function adminGetRecentOrders(supabase) {
  return supabase
    .from(SUPABASE_TABLES.orders)
    .select("id, total_amount, status, created_at")
    .order("created_at", { ascending: false })
    .limit(3)
}

/**
 * Fetch daily order totals for the last 14 days (this week + previous week).
 * Returns two arrays of 7 numbers each: thisWeek and lastWeek.
 */
export async function adminGetWeeklyRevenue(supabase) {
  const now = new Date()
  const twoWeeksAgo = new Date(now)
  twoWeeksAgo.setDate(now.getDate() - 14)

  const { data, error } = await supabase
    .from(SUPABASE_TABLES.orders)
    .select("total_amount, created_at")
    .gte("created_at", twoWeeksAgo.toISOString())
    .order("created_at", { ascending: true })

  if (error || !data) {
    return { data: { thisWeek: [0, 0, 0, 0, 0, 0, 0], lastWeek: [0, 0, 0, 0, 0, 0, 0] }, error }
  }

  // Build 7-day buckets
  const thisWeek = Array(7).fill(0)
  const lastWeek = Array(7).fill(0)

  data.forEach((order) => {
    const date = new Date(order.created_at)
    const daysAgo = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    const amount = parseFloat(order.total_amount) || 0

    if (daysAgo < 7) {
      thisWeek[6 - daysAgo] += amount
    } else if (daysAgo < 14) {
      lastWeek[13 - daysAgo] += amount
    }
  })

  return { data: { thisWeek, lastWeek }, error: null }
}

/**
 * Fetch today's operations summary: new orders since midnight, pending shipments.
 */
export async function adminGetOperationsSummary(supabase) {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const [newOrdersRes, pendingRes, ticketsRes] = await Promise.all([
    supabase
      .from(SUPABASE_TABLES.orders)
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfDay.toISOString()),
    supabase
      .from(SUPABASE_TABLES.orders)
      .select("id", { count: "exact", head: true })
      .eq("status", "processing"),
    supabase
      .from(SUPABASE_TABLES.supportTickets)
      .select("id", { count: "exact", head: true })
      .eq("status", "open")
  ])

  return {
    data: {
      newOrders: newOrdersRes.count ?? 0,
      pendingShipments: pendingRes.count ?? 0,
      supportTickets: ticketsRes.count ?? 0,
    },
    error: newOrdersRes.error || pendingRes.error || ticketsRes.error,
  }
}

export async function adminGetSalesByCategory(supabase) {
  const { data, error } = await supabase
    .from(SUPABASE_TABLES.orderItems)
    .select(`
      total_price,
      product:products(category)
    `)
  
  if (error || !data) return { data: [], error }

  const categoryMap = {}
  data.forEach(item => {
    const category = item.product?.category || "Uncategorized"
    const amount = parseFloat(item.total_price) || 0
    categoryMap[category] = (categoryMap[category] || 0) + amount
  })

  const formattedData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  return { data: formattedData, error: null }
}

export async function adminGetSalesByLocation(supabase) {
  const { data, error } = await supabase
    .from(SUPABASE_TABLES.orders)
    .select("total_amount, shipping_address_snapshot")

  if (error || !data) return { data: [], error }

  const locationMap = {}
  data.forEach(order => {
    const addr = order.shipping_address_snapshot || {}
    const loc = addr.state || addr.city || "Unknown"
    const amount = parseFloat(order.total_amount) || 0
    locationMap[loc] = (locationMap[loc] || 0) + amount
  })

  const formattedData = Object.entries(locationMap)
    .map(([name, sales]) => ({ name, sales }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5)

  return { data: formattedData, error: null }
}
