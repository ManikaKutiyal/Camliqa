"use client";

import OrderRow from "./OrderRow";

export default function OrderTable({
  orders,
  totalCount,
  onViewOrder,
  onStatusChange,
  statusUpdatingRawId,
}) {
  const total = typeof totalCount === "number" ? totalCount : orders.length;
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">Order ID</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">Customer Name</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">Date</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">Total Amount</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.length > 0 ? (
              orders.map((order) => (
                <OrderRow
                  key={order.rawId}
                  order={order}
                  onView={onViewOrder}
                  onStatusChange={onStatusChange}
                  statusUpdatingRawId={statusUpdatingRawId}
                />
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">
                  No orders found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 p-3 md:hidden">
        {orders.length > 0 ? (
          orders.map((order) => (
            <article key={order.rawId} className="rounded-xl border border-slate-200 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Order ID</p>
                  <p className="truncate text-sm font-bold text-indigo-600">#{order.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onViewOrder(order)}
                  className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700"
                >
                  View
                </button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-slate-500">Customer</p>
                  <p className="truncate font-semibold text-slate-800">{order.customer}</p>
                </div>
                <div>
                  <p className="text-slate-500">Date</p>
                  <p className="font-semibold text-slate-800">{order.date}</p>
                </div>
                <div>
                  <p className="text-slate-500">Total</p>
                  <p className="font-semibold text-slate-900">{order.total}</p>
                </div>
                <div>
                  <p className="text-slate-500">Status</p>
                  <p className="font-semibold capitalize text-slate-800">{order.status || order.statusValue}</p>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
            No orders found matching your filters.
          </div>
        )}
      </div>

      <div className="px-4 py-4 border-t border-slate-100 bg-slate-50/30 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-slate-500 font-medium">
          Showing <span className="text-slate-900">{orders.length}</span> of{" "}
          <span className="text-slate-900">{total}</span> orders
        </p>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all" disabled>
            Previous
          </button>
          <button className="px-4 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
