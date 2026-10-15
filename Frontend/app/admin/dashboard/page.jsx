"use client";
import { createClient } from "@/lib/supabase/client";
import {
  adminGetDashboardStats,
  adminGetRecentOrders,
  adminGetWeeklyRevenue,
  adminGetOperationsSummary,
  adminGetSalesByCategory,
  adminGetSalesByLocation
} from "@/services/supabase";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend } from "recharts";
import { useEffect, useState } from 'react';


export default function DashboardPage() {
  const [activeTrend, setActiveTrend] = useState("this");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  // Real data states
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0
  });
  const [trendData, setTrendData] = useState({
    thisWeek: [0, 0, 0, 0, 0, 0, 0],
    lastWeek: [0, 0, 0, 0, 0, 0, 0]
  });
  const [notificationsData, setNotificationsData] = useState([]);
  const [operationsData, setOperationsData] = useState({
    newOrders: 0,
    pendingShipments: 0
  });
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [salesByLocation, setSalesByLocation] = useState([]);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();

      const [statsRes, trendsRes, ordersRes, opsRes, catRes, locRes] = await Promise.all([
        adminGetDashboardStats(supabase),
        adminGetWeeklyRevenue(supabase),
        adminGetRecentOrders(supabase),
        adminGetOperationsSummary(supabase),
        adminGetSalesByCategory(supabase),
        adminGetSalesByLocation(supabase)
      ]);

      if (statsRes.data) setDashboardStats(statsRes.data);
      if (trendsRes.data) setTrendData(trendsRes.data);
      if (opsRes.data) setOperationsData(opsRes.data);
      if (catRes?.data) setSalesByCategory(catRes.data);
      if (locRes?.data) setSalesByLocation(locRes.data);

      if (ordersRes.data) {
        setNotificationsData(
          ordersRes.data.map((order, i) => ({
            id: order.id,
            title: `New order ${order.id.substring(0, 8)}`,
            note: `Total: ₹${order.total_amount} (${order.status})`
          }))
        );
      }

      setLoading(false);
    }

    loadData();
  }, []);

  const stats = [
    {
      title: "Total Sales",
      value: `₹${dashboardStats.totalSales.toLocaleString("en-IN")}`,
      note: "All time",
    },
    {
      title: "Total Orders",
      value: dashboardStats.totalOrders.toLocaleString(),
      note: "All time",
    },
    {
      title: "Total Revenue",
      value: `₹${dashboardStats.totalRevenue.toLocaleString("en-IN")}`,
      note: "All time",
    },
    {
      title: "Total Customers",
      value: dashboardStats.totalCustomers.toLocaleString(),
      note: "All time",
    },
  ];

  const activeTrends = activeTrend === "this" ? trendData.thisWeek : trendData.lastWeek;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const lineData = activeTrends.map((val, i) => ({
    name: days[i],
    revenue: val
  }));

  const monthlyTarget = 500;
  const targetData = [
    { name: 'Progress', value: dashboardStats.totalOrders, fill: '#334155' }
  ];
  const COLORS = ['#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'];

  const handleToggleNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  const currentPeriodLabel = activeTrend === "this" ? "This week" : "Last week";

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 overflow-x-hidden">
      <div className="flex min-h-screen w-full">
        <div className="flex-1 w-full">
          <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Overview
              </p>
              <h1 className="text-2xl font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-500">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search reports"
                  className="bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400"
                />
              </div>
              <div className="relative">
                <button
                  className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition"
                  onClick={handleToggleNotifications}
                  type="button"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
                    <path d="M13.73 21a2 2 0 01-3.46 0" />
                  </svg>
                  {notificationsData.length > 0 && (
                    <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-rose-500 text-[10px] font-semibold text-white flex items-center justify-center">
                      {notificationsData.length}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-lg z-50">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Notifications
                    </p>
                    <div className="mt-3 space-y-3">
                      {notificationsData.length > 0 ? notificationsData.map((item) => (
                        <div key={item.id} className="rounded-lg bg-slate-50 p-3">
                          <p className="text-sm font-semibold text-slate-800">
                            {item.title}
                          </p>
                          <p className="text-xs text-slate-500">{item.note}</p>
                        </div>
                      )) : (
                        <p className="text-sm text-slate-500">No new notifications</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </header>

          <main className="space-y-6 px-4 py-6 sm:px-6">
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.title}
                  className="rounded-2xl bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)]"
                >
                  <p className="text-sm text-slate-500">{stat.title}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <h3 className="text-2xl font-semibold">{stat.value}</h3>
                    {stat.trend && (
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${stat.trendUp
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                          }`}
                      >
                        {stat.trend}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-slate-400">{stat.note}</p>
                </div>
              ))}
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="rounded-2xl bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)] xl:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Revenue Analytics</h2>
                    <p className="text-sm text-slate-500">
                      Current week vs previous week
                    </p>
                  </div>
                  <div className="flex gap-2 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setActiveTrend("this")}
                      className={`flex items-center gap-2 rounded-full px-3 py-1 transition ${activeTrend === "this"
                          ? "bg-slate-200 text-slate-800"
                          : "text-slate-400 hover:text-slate-600"
                        }`}
                    >
                      <span className="h-2 w-2 rounded-full bg-slate-700" />
                      This week
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTrend("last")}
                      className={`flex items-center gap-2 rounded-full px-3 py-1 transition ${activeTrend === "last"
                          ? "bg-slate-200 text-slate-800"
                          : "text-slate-400 hover:text-slate-600"
                        }`}
                    >
                      <span className="h-2 w-2 rounded-full bg-slate-300" />
                      Last week
                    </button>
                  </div>
                </div>
                <div className="mt-6 rounded-xl bg-slate-50 p-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dx={-10} tickFormatter={(val) => `₹${val}`} />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [`₹${value}`, 'Revenue']}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#334155" strokeWidth={3} dot={{ r: 4, fill: '#334155', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
                <h2 className="text-lg font-semibold">Monthly Target</h2>
                <p className="text-sm text-slate-500">
                  Target achievement · {currentPeriodLabel}
                </p>
                <div className="mt-6 flex flex-col items-center justify-center h-48 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%" cy="50%"
                      innerRadius="70%" outerRadius="100%"
                      barSize={15}
                      data={targetData}
                      startAngle={90} endAngle={-270}
                    >
                      <RadialBar background={{ fill: '#f1f5f9' }} dataKey="value" cornerRadius={10} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-slate-800">{dashboardStats.totalOrders}</span>
                    <span className="text-xs text-slate-500">/ {monthlyTarget}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="rounded-2xl bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
                <h2 className="text-lg font-semibold">Sales by Location</h2>
                <p className="text-sm text-slate-500">Top performing regions</p>
                <div className="mt-6 h-56">
                  {salesByLocation.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesByLocation} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 20 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <Tooltip
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value) => [`₹${value}`, 'Sales']}
                        />
                        <Bar dataKey="sales" fill="#475569" radius={[0, 4, 4, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-slate-400">No data available</div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
                <h2 className="text-lg font-semibold">Sales Breakdown</h2>
                <p className="text-sm text-slate-500">By product category</p>
                <div className="mt-6 h-56">
                  {salesByCategory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={salesByCategory}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {salesByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value) => [`₹${value}`, 'Sales']}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-slate-400">No data available</div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
                <h2 className="text-lg font-semibold">Operations Summary</h2>
                <p className="text-sm text-slate-500">Today at a glance</p>
                <div className="mt-6 space-y-4 text-sm">
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                    <div>
                      <p className="font-medium">New Orders</p>
                      <p className="text-xs text-slate-500">Since midnight</p>
                    </div>
                    <span className="text-lg font-semibold text-slate-900">
                      {operationsData.newOrders}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                    <div>
                      <p className="font-medium">Pending Shipments</p>
                      <p className="text-xs text-slate-500">To fulfil today</p>
                    </div>
                    <span className="text-lg font-semibold text-slate-900">
                      {operationsData.pendingShipments}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                    <div>
                      <p className="font-medium">Support Tickets</p>
                      <p className="text-xs text-slate-500">Awaiting response</p>
                    </div>
                    <span className="text-lg font-semibold text-slate-900">
                      {operationsData.supportTickets ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
