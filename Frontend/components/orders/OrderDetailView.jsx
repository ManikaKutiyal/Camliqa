"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import {
  X,
  Package,
  Truck,
  User,
  ExternalLink,
  Printer,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";

import { downloadStoreInvoicePdf } from "@/lib/store-admin/invoicePdf";

export default function OrderDetailView({ order, isOpen, onClose }) {
  const [isPdfExport, setIsPdfExport] = useState(false);

  if (!order) return null;

  const handleInvoicePdf = async () => {
    try {
      setIsPdfExport(true);
      await downloadStoreInvoicePdf(order);
    } catch (err) {
      console.error(err);
      alert(err?.message || "Could not generate the invoice PDF.");
    } finally {
      setIsPdfExport(false);
    }
  };

  const detailLoading = Boolean(order.detailLoading);
  const detailError = order.detailError || null;
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-[70] w-full max-w-lg bg-white shadow-2xl overflow-y-auto"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Order Details</h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <p className="text-sm text-slate-500">#{order.id}</p>
                    {order.rawId ? (
                      <Link
                        href={`/store-admin/orders/${order.rawId}`}
                        className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                        onClick={onClose}
                      >
                        View full page
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    ) : null}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  type="button"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 p-6 space-y-8">
                {detailLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
                    <div className="h-8 w-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                    <p className="text-sm font-medium">Loading line items and address…</p>
                  </div>
                ) : null}

                {detailError ? (
                  <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                    {detailError}
                  </p>
                ) : null}

                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Order status</p>
                      <p className="text-xs text-slate-500">{order.status}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Customer</h3>
                  <div className="space-y-3 rounded-xl border border-slate-100 p-4">
                    <div className="flex items-start gap-3">
                      <User className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900">{order.customer}</p>
                        {order.email ? (
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                            <Mail className="h-3 w-3 shrink-0" />
                            {order.email}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    {order.phone && order.phone !== "—" ? (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        {order.phone}
                      </div>
                    ) : null}
                  </div>
                </div>

                {order.shippingAddress && order.shippingAddress !== "—" ? (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Shipping address</h3>
                    <div className="flex items-start gap-3 rounded-xl border border-slate-100 p-4">
                      <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                        {order.shippingAddress}
                      </p>
                    </div>
                    {order.shippingMethod && order.shippingMethod !== "—" ? (
                      <p className="text-xs text-slate-500">
                        Method: <span className="font-semibold text-slate-700">{order.shippingMethod}</span>
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {!detailLoading && items.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Items ({items.length})
                    </h3>
                    <ul className="rounded-xl border border-slate-100 divide-y divide-slate-100">
                      {items.map((item) => (
                        <li key={item.id} className="p-4 flex gap-3">
                          <div className="h-14 w-14 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                            {item.image ? (
                              <img src={item.image} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-slate-300 text-lg">
                                📦
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              SKU {item.sku}
                              {item.variantLabel ? ` · ${item.variantLabel}` : ""} · Qty {item.quantity}
                            </p>
                            <p className="text-xs text-slate-600 mt-1">{item.lineTotal}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Payment</h3>
                  <div className="rounded-xl border border-slate-100 p-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Status</span>
                      <span className="font-semibold text-slate-900">{order.paymentStatus ?? "—"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Method</span>
                      <span className="font-semibold text-slate-900">{order.paymentMethod ?? "—"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Totals</h3>
                  <div className="rounded-xl border border-slate-100 divide-y divide-slate-100">
                    <div className="p-4 flex items-center justify-between text-sm">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-medium text-slate-900">{order.subtotal ?? order.total}</span>
                    </div>
                    {order.tax ? (
                      <div className="p-4 flex items-center justify-between text-sm">
                        <span className="text-slate-500">Tax</span>
                        <span className="font-medium text-slate-900">{order.tax}</span>
                      </div>
                    ) : null}
                    {order.shipping ? (
                      <div className="p-4 flex items-center justify-between text-sm">
                        <span className="text-slate-500">Shipping</span>
                        <span className="font-medium text-slate-900">{order.shipping}</span>
                      </div>
                    ) : null}
                    <div className="p-4 flex items-center justify-between text-sm bg-slate-50/50 rounded-b-xl">
                      <span className="font-bold text-slate-900">Total</span>
                      <span className="font-bold text-slate-900">{order.total}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleInvoicePdf}
                    disabled={
                      isPdfExport || detailLoading || !Array.isArray(order.items) || order.items.length === 0
                    }
                    className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isPdfExport ? (
                      <span className="h-4 w-4 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin inline-block" />
                    ) : (
                      <Printer className="h-4 w-4" />
                    )}
                    Invoice PDF
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
