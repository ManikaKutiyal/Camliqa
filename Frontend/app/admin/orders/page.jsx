"use client";

import { useEffect, useState, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Package,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-700',
    icon: Clock,
  },
  processing: {
    label: 'Processing',
    className: 'bg-blue-100 text-blue-700',
    icon: RefreshCw,
  },
  shipped: {
    label: 'Shipped',
    className: 'bg-indigo-100 text-indigo-700',
    icon: Truck,
  },
  delivered: {
    label: 'Delivered',
    className: 'bg-emerald-100 text-emerald-700',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-700',
    icon: XCircle,
  },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${config.className}`}>
      <Icon size={11} />
      {config.label}
    </span>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          total_amount,
          created_at,
          shipping_address_snapshot,
          profiles (
            full_name,
            email,
            phone
          ),
          order_items (
            product_title,
            quantity,
            unit_price
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedOrders = (data || []).map(order => {
        // Format shipping address nicely
        const addr = order.shipping_address_snapshot;
        let formattedAddr = '—';
        if (addr) {
          let obj = addr;
          if (typeof addr === 'string') {
            try { obj = JSON.parse(addr); } catch { }
          }
          if (typeof obj === 'object' && obj !== null) {
            const lines = [];
            if (obj.fullName) lines.push(obj.fullName);
            if (obj.phone) lines.push(obj.phone);
            const street = [obj.addressLine1, obj.addressLine2].filter(Boolean).join(", ");
            if (street) lines.push(street);
            const locality = [obj.city, obj.state, obj.postalCode].filter(Boolean).join(", ");
            if (locality) lines.push(locality);
            if (obj.country) lines.push(obj.country);
            formattedAddr = lines.join("\n");
          } else {
            formattedAddr = String(addr);
          }
        }

        return {
          id: order.id,
          createdAt: order.created_at,
          total: order.total_amount,
          status: order.status === 'pending' ? 'Pending' : order.status === 'shipped' ? 'Shipped' : order.status === 'delivered' ? 'Delivered' : order.status,
          user: {
            name: order.profiles?.full_name || 'Unnamed Customer',
            email: order.profiles?.email || 'No email',
            phone: order.profiles?.phone || 'No phone',
            address: formattedAddr
          },
          products: (order.order_items || []).map(oi => ({
            name: oi.product_title,
            quantity: oi.quantity,
            price: oi.unit_price
          }))
        };
      });

      setOrders(mappedOrders);
    } catch (error) {
      console.error('Failed to fetch orders', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      const supabase = createClient();
      const lowercaseStatus = status.toLowerCase();
      const { error } = await supabase
        .from('orders')
        .update({ status: lowercaseStatus })
        .eq('id', id);
      if (error) throw error;
      // Optimistic update
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: lowercaseStatus } : o));
      if (selectedOrder?.id === id) {
        setSelectedOrder(prev => ({ ...prev, status: lowercaseStatus }));
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    } finally {
      setUpdating(null);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const customerName = o.profiles?.full_name || '';
      const customerEmail = o.profiles?.email || '';
      const shortId = String(o.id || '').slice(0, 8).toUpperCase();

      const matchesSearch =
        !searchTerm ||
        shortId.includes(searchTerm.toUpperCase()) ||
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const shipped = orders.filter(o => o.status === 'shipped').length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const revenue = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    return { total, pending, shipped, delivered, revenue };
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Stats Strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Orders', value: stats.total, icon: ShoppingBag, color: 'text-primary' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600' },
          { label: 'Shipped', value: stats.shipped, icon: Truck, color: 'text-indigo-600' },
          { label: 'Revenue', value: formatCurrency(stats.revenue), icon: Package, color: 'text-emerald-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl bg-white border border-secondary/10 px-5 py-4 shadow-sm flex items-center gap-4">
            <div className={`rounded-xl p-2 bg-secondary/5 ${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-xs text-primary/40 uppercase tracking-widest">{label}</p>
              <p className={`text-lg font-semibold ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-primary/30">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search by order ID, name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-secondary/10 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-all ${statusFilter === s
                  ? 'bg-primary text-white'
                  : 'bg-white border border-secondary/10 text-primary/50 hover:bg-secondary/5'
                }`}
            >
              {s}
            </button>
          ))}
          <button
            onClick={fetchOrders}
            className="ml-2 p-2 rounded-lg bg-white border border-secondary/10 text-primary/50 hover:bg-secondary/5 transition"
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-5 py-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-secondary/10 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-secondary/10 bg-secondary/5">
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/40">Order ID</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/40">Customer</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/40">Date</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/40">Amount</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/40">Status</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary/10">
              {isLoading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    {[120, 160, 100, 80, 100, 40].map((w, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className={`h-5 bg-secondary/10 rounded-lg`} style={{ width: w }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const shortId = String(order.id).slice(0, 8).toUpperCase();
                  return (
                    <tr key={order.id} className="hover:bg-secondary/5 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-primary/70 bg-secondary/10 px-2 py-1 rounded-lg">
                          #{shortId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-primary">{order?.user?.name}</p>
                        <p className="text-xs text-primary/40">{order?.user?.email}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-primary/60">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-primary">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-primary/40 hover:text-secondary hover:bg-secondary/10 rounded-lg transition-all"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-primary/30">
                      <ShoppingBag size={48} strokeWidth={1} />
                      <p className="text-sm font-medium">No orders found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onUpdateStatus={updateStatus}
            updating={updating}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function OrderDetailsModal({ order, onClose, onUpdateStatus, updating }) {
  const shortId = String(order.id).slice(0, 8).toUpperCase();
  const address = order.shipping_address_snapshot || {};
  const addressStr = [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ].filter(Boolean).join(', ');

  const ALL_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-secondary/20 bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="border-b border-secondary/10 bg-secondary/5 px-8 py-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-primary">Order #{shortId}</h2>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-xs text-primary/40 uppercase tracking-widest">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="max-h-[65vh] overflow-y-auto">
          <div className="p-8 space-y-8">
            {/* Customer & Shipping */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/40 mb-3">Customer</h3>
                <p className="text-sm font-medium text-primary">{order.profiles?.full_name || '—'}</p>
                <p className="text-sm text-primary/60">{order.profiles?.email || '—'}</p>
                <p className="text-sm text-primary/60">{order.profiles?.phone || '—'}</p>
              </div>
              <div>
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/40 mb-3">Shipping Address</h3>
                <p className="text-sm text-primary/60">{addressStr || '—'}</p>
                {address.phone && <p className="text-sm text-primary/60 mt-1">📞 {address.phone}</p>}
              </div>
            </div>

            {/* Shiprocket Info */}
            {order.awb_code && (
              <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-5 py-4">
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-500 mb-3">
                  Shiprocket / Tracking
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-primary/40 text-xs">AWB Code</span>
                    <p className="font-mono font-bold text-indigo-700">{order.awb_code}</p>
                  </div>
                  {order.courier_name && (
                    <div>
                      <span className="text-primary/40 text-xs">Courier</span>
                      <p className="font-medium text-primary">{order.courier_name}</p>
                    </div>
                  )}
                  {order.shiprocket_order_id && (
                    <div>
                      <span className="text-primary/40 text-xs">SR Order ID</span>
                      <p className="font-mono text-primary/60">{order.shiprocket_order_id}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order Items */}
            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/40 mb-3">Order Items</h3>
              <div className="space-y-3">
                {(order.order_items || []).map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl border border-secondary/10 p-3 gap-4">
                    <div className="flex items-center gap-3">
                      {item.products?.image_url ? (
                        <img
                          src={item.products.image_url}
                          alt={item.product_title}
                          className="h-12 w-12 rounded-lg object-cover border border-secondary/10"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-secondary/5 border border-secondary/10 flex items-center justify-center text-primary/20">
                          <Package size={18} />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-primary">{item.product_title}</p>
                        {item.variant_label && item.variant_label !== 'Default' && (
                          <p className="text-xs text-primary/40">{item.variant_label}</p>
                        )}
                        <p className="text-xs text-primary/40">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-primary shrink-0">
                      {formatCurrency(item.total_price)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Info */}
            {order.payments?.[0] && (
              <div>
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/40 mb-3">Payment</h3>
                <div className="flex items-center gap-4 rounded-xl border border-secondary/10 p-4 text-sm">
                  <div className="flex-1">
                    <span className="text-primary/40">Method</span>
                    <p className="capitalize font-medium text-primary">{order.payments[0].method || '—'}</p>
                  </div>
                  <div className="flex-1">
                    <span className="text-primary/40">Status</span>
                    <p className={`capitalize font-medium ${order.payments[0].status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {order.payments[0].status}
                    </p>
                  </div>
                  <div className="flex-1">
                    <span className="text-primary/40">Amount</span>
                    <p className="font-semibold text-primary">{formatCurrency(order.payments[0].amount)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Update Status */}
            <div className="border-t border-secondary/10 pt-6">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/40 mb-4">Update Status</h3>
              <div className="flex flex-wrap gap-2">
                {ALL_STATUSES.map((status) => {
                  const config = STATUS_CONFIG[status];
                  const isActive = order.status === status;
                  const isUpdating = updating === order.id;
                  return (
                    <button
                      key={status}
                      onClick={() => onUpdateStatus(order.id, status)}
                      disabled={isActive || isUpdating}
                      className={`flex-1 min-w-[100px] rounded-xl py-2.5 text-[10px] font-semibold uppercase tracking-wider transition-all disabled:cursor-not-allowed ${isActive
                          ? `${config.className} opacity-100`
                          : 'bg-secondary/5 text-primary/40 hover:bg-secondary/10'
                        }`}
                    >
                      {isUpdating && !isActive ? '...' : config.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-secondary/10 px-8 py-5 flex items-center justify-between bg-secondary/5">
          <p className="text-sm text-primary/50">Total Amount</p>
          <p className="font-serif text-2xl text-primary">{formatCurrency(order.total_amount)}</p>
        </div>
      </motion.div>
    </div>
  );
}
