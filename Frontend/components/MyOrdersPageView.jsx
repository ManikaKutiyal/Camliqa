"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { downloadStoreInvoicePdf } from "@/lib/store-admin/invoicePdf";
import { getCustomerOrders, getCustomerOrderForInvoice, getStorefrontProducts } from "@/services/supabase";
import { mapDbOrderToAdminViewModel } from "@/services/store-admin/orders.service";
import { formatCurrency } from "@/lib/utils";

const tabs = ["All Orders", "Processing", "Delivered", "Cancelled"];
const filterModes = ["All Time", "Last 30 Days", "Delivered", "Cancelled"];
const cancelReasons = [
  "Ordered by mistake",
  "Found a better price",
  "Delivery is too slow",
  "Need to change the item",
  "Other",
];
const reviewTags = [
  "True to size",
  "Good quality",
  "Fast delivery",
  "Looks premium",
  "Damaged",
];

const accentPalette = [
  "from-[#2f2f2f] to-[#8c8c8c]",
  "from-[#d0d0d0] to-[#8f8f8f]",
  "from-[#ebe1d4] to-[#c6b29d]",
  "from-[#d7c7b2] to-[#a28563]",
  "from-[#ddd7cf] to-[#b9b3aa]",
];



function formatDate(value) {
  if (!value) {
    return "Date pending";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Date pending";
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusCategory(status) {
  const normalizedStatus = String(status ?? "").toLowerCase();

  if (normalizedStatus.includes("cancel")) {
    return "Cancelled";
  }

  if (normalizedStatus.includes("deliver")) {
    return "Delivered";
  }

  return "Processing";
}

function getCustomerStatusLabel(status) {
  const normalizedStatus = String(status ?? "").toLowerCase();

  if (normalizedStatus === "pending") {
    return "Order placed";
  }

  if (normalizedStatus === "processing") {
    return "Processing";
  }

  if (normalizedStatus === "shipped") {
    return "Shipped";
  }

  if (normalizedStatus === "delivered") {
    return "Delivered successfully";
  }

  if (normalizedStatus === "cancelled") {
    return "Cancelled";
  }

  return normalizedStatus
    ? normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)
    : "Processing";
}

function buildTimeline(createdAt, rawStatus) {
  const placedTime = createdAt
    ? `${formatDate(createdAt)} • ${new Date(createdAt).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })}`
    : "Pending";

  const isProcessing = rawStatus === "processing";
  const isPacked = rawStatus === "packed";
  const isShipped = rawStatus === "shipped";
  const isDelivered = rawStatus === "delivered";
  const isCancelled = rawStatus === "cancelled";

  if (isCancelled) {
    return [
      { label: "Order Placed", time: placedTime, done: true },
      { label: "Order Cancelled", time: "Processing cancellation", done: true },
      { label: "Refund Initiated", time: "Pending", done: false },
      { label: "Refund Complete", time: "Pending", done: false },
    ];
  }

  return [
    { label: "Order Placed", time: placedTime, done: true },
    { label: "Order Packed", time: "Processing in warehouse", done: isProcessing || isPacked || isShipped || isDelivered },
    { label: "Order Shipped", time: "Pending courier scan", done: isShipped || isDelivered },
    { label: "Out for Delivery", time: "Pending", done: isDelivered },
    { label: "Delivered", time: "Pending", done: isDelivered },
  ];
}

function pickAccent(id) {
  const text = String(id ?? "");
  let sum = 0;

  for (let index = 0; index < text.length; index += 1) {
    sum += text.charCodeAt(index);
  }

  return accentPalette[sum % accentPalette.length];
}

function formatShippingSummary(snapshot) {
  if (snapshot == null || snapshot === "") return "";
  let obj = snapshot;
  if (typeof snapshot === "string") {
    try {
      obj = JSON.parse(snapshot);
    } catch {
      return "";
    }
  }
  if (typeof obj !== "object" || obj === null) return "";
  const name = obj.fullName ? String(obj.fullName) : "";
  const cityLine = [obj.city, obj.state, obj.postalCode].filter(Boolean).join(", ");
  if (name && cityLine) return `${name} · ${cityLine}`;
  return name || cityLine || "";
}

function mapSupabaseOrder(order, index) {
  const firstPayment = Array.isArray(order.payments) ? order.payments[0] : null;
  const firstItem = Array.isArray(order.order_items) && order.order_items.length > 0 ? order.order_items[0] : null;

  const status = order.status ?? firstPayment?.status ?? "pending";
  const category = getStatusCategory(status);
  const orderId = String(order.id ?? index + 1);
  const productName =
    firstItem?.product_title ?? order.product_name ?? order.product_title ?? order.title ?? order.name ?? `Order ${orderId.slice(-6)}`;

  return {
    id: `#${orderId.slice(-8).toUpperCase()}`,
    name: productName,
    price: formatCurrency(order.total_amount ?? firstPayment?.amount),
    quantity: firstItem?.quantity ?? order.quantity ?? 1,
    rating: order.rating ?? null,
    category,
    payment: firstPayment?.method ?? order.payment_method ?? "Not available",
    status: order.customer_status ?? getCustomerStatusLabel(status),
    deliveryDate: formatDate(order.delivery_date ?? order.created_at),
    refundStatus:
      category === "Cancelled"
        ? order.refund_status ?? "Refund Pending"
        : order.refund_status ?? "",
    refundTimeline:
      category === "Cancelled"
        ? order.refund_timeline ?? "Expected in 3-5 business days"
        : order.refund_timeline ?? "",
    courier: order.courier_name || order.courier || "Not available",
    awbCode: order.awb_code || null,
    timeline: buildTimeline(order.created_at, status),
    variant: (() => {
      const v = firstItem?.variant_label ?? order.variant ?? order.variant_name ?? order.sku;
      if (!v || v === "Not available") return "Not available";
      // Strip any existing "Size: " prefix and leading colons/spaces from raw DB value
      const clean = String(v).trim()
        .replace(/^size\s*:\s*/i, "")
        .replace(/^[:\s]+/, "")
        .trim();
      return clean ? `Size: ${clean}` : "Not available";
    })(),
    accent: pickAccent(order.id ?? index),
    rawId: order.id,
    rawCreatedAt: order.created_at,
    rawStatus: status,
    productId: firstItem?.product_id,
    orderItemId: firstItem?.id,
    rawPrice: order.total_amount ?? firstPayment?.amount ?? 0,
    imageUrl: firstItem?.products?.image_url,
    shippingSummary: formatShippingSummary(order.shipping_address_snapshot),
  };
}

function mapStorefrontProduct(product, index) {
  return {
    id: String(product.id ?? `product-${index}`),
    rawId: product.id ?? null,
    name: product.title ?? `Product ${index + 1}`,
    price: formatCurrency(product.discount_price || product.price),
    subtitle: product.description ?? "Product recommendation",
    accent: pickAccent(product.id ?? index),
    imageUrl: product.image_url ?? null,
  };
}

function canSubmitReviewForOrder(order) {
  if (!order) return false;
  return Boolean(order.productId && order.orderItemId);
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        d="M4 7h16M7 12h10m-7 5h4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function Star({ filled }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        d="M12 3.8l2.54 5.15 5.69.83-4.11 4 .97 5.66L12 16.75 6.91 19.44l.97-5.66-4.11-4 5.69-.83L12 3.8z"
        fill={filled ? "#222222" : "none"}
        stroke="#222222"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function PackageIllustration() {
  return (
    <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-[#FFFFFF] shadow-[0_16px_40px_rgba(34,34,34,0.08)]">
      <div className="relative h-24 w-24 rounded-[28px] border-2 border-[#222222] bg-[#F5F5F5]">
        <div className="absolute inset-x-3 top-4 h-2 rounded-full bg-[#222222]" />
        <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-[#222222]" />
        <div className="absolute bottom-4 left-4 right-4 h-8 rounded-2xl border border-dashed border-[#8A8A8A]" />
      </div>
    </div>
  );
}

function ProductThumb({ accent, imageUrl }) {
  if (imageUrl) {
    return (
      <div className={`flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br ${accent} overflow-hidden border border-[#e7e7e7]`}>
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      </div>
    );
  }
  return (
    <div className={`flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br ${accent}`}>
      <div className="h-10 w-10 rounded-2xl bg-white/85" />
    </div>
  );
}

function buildProductUpdateHref(order) {
  const variant = order.variant ?? "";
  const [variantSize] = String(variant).split("/");
  const size = variantSize?.replace(/^size\s*/i, "").trim() || "";

  const params = new URLSearchParams();
  params.set("orderId", order.id);
  params.set("name", order.name);
  params.set("quantity", String(order.quantity ?? 1));

  if (variant) {
    params.set("variant", variant);
  }

  if (size) {
    params.set("size", size);
  }

  if (order.price) {
    params.set("price", order.price);
  }

  if (order.deliveryDate) {
    params.set("deliveryDate", order.deliveryDate);
  }

  if (order.status) {
    params.set("deliveryStatus", order.status);
  }

  if (order.category) {
    params.set("category", order.category);
  }

  if (order.courier) {
    params.set("courier", order.courier);
  }

  return `/product_update_page?${params.toString()}`;
}

function OrderSkeleton() {
  return (
    <div className="animate-pulse rounded-[30px] border border-[#e7e7e7] bg-white p-5 shadow-[0_16px_40px_rgba(34,34,34,0.02)]">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="h-20 w-20 flex-shrink-0 rounded-[22px] bg-gray-200/60" />
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-7 w-1/3 rounded-lg bg-gray-200/60" />
            <div className="h-5 w-24 rounded-full bg-gray-200/40" />
          </div>
          <div className="h-4 w-1/4 rounded bg-gray-100/80" />
          <div className="flex gap-6">
            <div className="h-4 w-20 rounded bg-gray-100/80" />
            <div className="h-4 w-20 rounded bg-gray-100/80" />
          </div>
        </div>
        <div className="flex gap-3 sm:flex-col">
          <div className="h-10 w-32 rounded-full bg-gray-200/50" />
          <div className="h-10 w-32 rounded-full bg-gray-200/50" />
        </div>
      </div>
    </div>
  );
}

function SuggestedProductSkeleton() {
  return (
    <div className="min-w-[240px] animate-pulse rounded-[24px] border border-[#e7e7e7] bg-white p-4">
      <div className="h-32 w-full rounded-[22px] bg-gray-200/50" />
      <div className="mt-4 space-y-2">
        <div className="h-5 w-2/3 rounded bg-gray-200/60" />
        <div className="h-4 w-1/2 rounded bg-gray-100/80" />
      </div>
      <div className="mt-5 flex items-center justify-between">
        <div className="h-4 w-16 rounded bg-gray-100/80" />
        <div className="h-8 w-20 rounded-full bg-gray-200/50" />
      </div>
    </div>
  );
}

export default function MyOrdersPageView() {
  const { user, isHydrated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [recommendedItems, setRecommendedItems] = useState([]);
  const [activeTab, setActiveTab] = useState("All Orders");
  const [filterMode, setFilterMode] = useState("All Time");
  const [orderSearch, setOrderSearch] = useState("");
  const [interestSearch, setInterestSearch] = useState("");
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const [reviewingOrderId, setReviewingOrderId] = useState(null);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState(cancelReasons[0]);
  const [cancelNote, setCancelNote] = useState("");
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [invoicePdfRawId, setInvoicePdfRawId] = useState(null);

  useEffect(() => {
    let isActive = true;

    async function loadCustomerOrders() {
      try {
        setIsLoading(true);
        if (!isHydrated) {
          return;
        }

        if (!user?.id) {
          setIsLoading(false);
          return;
        }

        const supabase = createClient();
        const { data, error } = await getCustomerOrders(supabase, user.id);

        if (!isActive) {
          return;
        }

        if (error) {
          console.error("Failed to load customer orders from Supabase", error);
          setIsLoading(false);
          return;
        }

        const mappedOrders = (data ?? []).map((order, index) => mapSupabaseOrder(order, index));

        setOrders(mappedOrders);
        setTrackingOrderId(mappedOrders[0]?.id ?? null);
      } catch (error) {
        console.error("Unexpected error while loading Supabase orders", error);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadCustomerOrders();

    if (!isHydrated || !user?.id) {
      return () => {
        isActive = false;
      };
    }

    const supabase = createClient();
    const channel = supabase
      .channel(`customer-orders-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadCustomerOrders();
        }
      )
      .subscribe();

    return () => {
      isActive = false;
      supabase.removeChannel(channel);
    };
  }, [isHydrated, user?.id]);

  useEffect(() => {
    let isActive = true;

    async function loadRecommendations() {
      try {
        const supabase = createClient();
        const { data, error } = await getStorefrontProducts(supabase);

        if (!isActive) {
          return;
        }

        if (error) {
          console.error("Failed to load storefront products", error);
          return;
        }

        const mappedProducts = (data ?? []).map((product, index) => mapStorefrontProduct(product, index));
        setRecommendedItems(mappedProducts);
      } catch (error) {
        console.error("Unexpected error while loading recommendations", error);
      }
    }

    loadRecommendations();

    return () => {
      isActive = false;
    };
  }, []);

  const displayedOrders = useMemo(() => {
    return orders.filter((order) => {
      const tabMatch = activeTab === "All Orders" || order.category === activeTab;
      const searchMatch =
        !orderSearch ||
        [order.name, order.id, order.variant, order.status]
          .join(" ")
          .toLowerCase()
          .includes(orderSearch.toLowerCase());

      let filterMatch = true;
      if (filterMode === "Delivered") {
        filterMatch = order.category === "Delivered";
      }
      if (filterMode === "Cancelled") {
        filterMatch = order.category === "Cancelled";
      }
      if (filterMode === "Last 30 Days") {
        filterMatch = true;
      }

      return tabMatch && searchMatch && filterMatch;
    });
  }, [activeTab, filterMode, orderSearch, orders]);

  const suggestedProducts = useMemo(() => {
    return recommendedItems.filter((item) => {
      if (!interestSearch) {
        return true;
      }
      return [item.name, item.subtitle]
        .join(" ")
        .toLowerCase()
        .includes(interestSearch.toLowerCase());
    });
  }, [interestSearch, recommendedItems]);

  const trackingOrder =
    orders.find((order) => order.id === trackingOrderId) ?? orders[0] ?? null;
  const reviewingOrder = orders.find((order) => order.id === reviewingOrderId) ?? null;

  const counts = useMemo(
    () => ({
      "All Orders": orders.length,
      Processing: orders.filter((item) => item.category === "Processing").length,
      Delivered: orders.filter((item) => item.category === "Delivered").length,
      Cancelled: orders.filter((item) => item.category === "Cancelled").length,
    }),
    [orders],
  );

  async function handleDownloadInvoicePdf(order) {
    if (!user?.id || !order?.rawId) {
      return;
    }
    try {
      setInvoicePdfRawId(order.rawId);
      const supabase = createClient();
      const { data, error } = await getCustomerOrderForInvoice(
        supabase,
        order.rawId,
        user.id
      );
      if (error) {
        throw error;
      }
      if (!data) {
        throw new Error("Order not found.");
      }
      const payload = mapDbOrderToAdminViewModel(data);
      if (!payload?.items?.length) {
        throw new Error("This order has no items to invoice.");
      }
      await downloadStoreInvoicePdf(payload);
    } catch (err) {
      console.error("Invoice PDF failed:", err);
      alert(err?.message || "Could not download invoice. Please try again.");
    } finally {
      setInvoicePdfRawId(null);
    }
  }

  function handleBuyAgain(order) {
    if (!order.productId) {
      return;
    }
    router.push(`/products/${order.productId}`);
  }

  function openCancel(orderId) {
    setCancelOrderId(orderId);
    setCancelReason(cancelReasons[0]);
    setCancelNote("");
  }

  async function submitCancel(orderId) {
    const targetOrder = orders.find((order) => order.id === orderId);
    if (!targetOrder) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", targetOrder.rawId);

      if (error) throw error;

      setOrders(orders.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            category: "Cancelled",
            status: "Cancelled by customer",
            timeline: buildTimeline(o.rawCreatedAt, "cancelled")
          };
        }
        return o;
      }));

      setCancelOrderId(null);
    } catch (err) {
      console.error("Failed to cancel order:", err);
    }
  }

  function toggleTag(tag) {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    );
  }

  async function submitReview() {
    if (!reviewingOrder) {
      return;
    }
    if (!user?.id || !canSubmitReviewForOrder(reviewingOrder)) {
      alert("Unable to submit review for this order.");
      return;
    }
    const submittedRating = Number(reviewStars);
    const submittedOrderId = reviewingOrder.id;
    if (!Number.isFinite(submittedRating) || submittedRating < 1 || submittedRating > 5) {
      alert("Please select a valid star rating.");
      return;
    }
    try {
      const response = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_item_id: reviewingOrder.orderItemId,
          product_id: reviewingOrder.productId,
          rating: submittedRating,
          review: reviewText,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to submit review right now. Please try again.");
      }
      // Update the rating on the order card immediately
      setOrders((prev) => {
        if (!Array.isArray(prev)) return [];
        return prev.map((o) =>
          o && o.id === submittedOrderId ? { ...o, rating: submittedRating } : o
        );
      });
      alert("Review submitted successfully. It is now visible in admin reviews as pending.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to submit review right now. Please try again.";
      let debugError = error;
      if (error && typeof error === "object") {
        try {
          debugError = JSON.parse(JSON.stringify(error));
        } catch {
          debugError = String(error);
        }
      }
      console.error("Review submit failed:", message, debugError);
      alert(message);
    } finally {
      setReviewingOrderId(null);
      setReviewStars(5);
      setReviewText("");
      setSelectedTags([]);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[30px] border border-[#e7e7e7] bg-[#FFFFFF] p-5 shadow-[0_16px_40px_rgba(34,34,34,0.06)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#8A8A8A]">Account / My Orders</p>
            <h1 className="mt-2 text-3xl font-black text-[#222222]">Order page</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#444444]">
              Search past purchases, discover relevant items, track deliveries,
              manage cancellations and refunds, and leave product reviews from one place.
            </p>
          </div>

          <div className="w-full shrink-0 sm:w-auto sm:flex sm:justify-end">
            <Link
              href="/"
              className="inline-flex min-h-[44px] w-full shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-[#d9d9d9] bg-white px-6 py-2.5 text-center text-sm font-semibold text-[#222222] no-underline sm:w-auto"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-[30px] border border-[#e7e7e7] bg-[#F5F5F5] px-6 py-14 text-center shadow-[0_16px_40px_rgba(34,34,34,0.04)]">
          <PackageIllustration />
          <h2 className="mt-8 text-3xl font-black text-[#222222]">
            You have not placed any orders yet.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#444444]">
            Once you place an order, this page will show your items, delivery progress,
            refund updates, and review options.
          </p>
          <div className="mt-6 flex justify-center px-2">
            <Link
              href="/"
              className="inline-flex min-h-[44px] w-full max-w-xs items-center justify-center whitespace-nowrap rounded-full border border-[#d9d9d9] bg-white px-6 py-2.5 text-center text-sm font-semibold text-[#222222] no-underline sm:w-auto sm:max-w-none"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-[30px] border border-[#e7e7e7] bg-[#FFFFFF] p-5 shadow-[0_16px_40px_rgba(34,34,34,0.06)]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <label className="flex flex-1 items-center gap-3 rounded-2xl border border-[#e7e7e7] bg-[#FFFFFF] px-4 py-3 text-sm text-[#444444]">
                <SearchIcon />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(event) => setOrderSearch(event.target.value)}
                  placeholder="Search orders by product, status, or order ID"
                  className="w-full bg-transparent outline-none placeholder:text-[#8A8A8A]"
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  const currentIndex = filterModes.indexOf(filterMode);
                  const nextMode = filterModes[(currentIndex + 1) % filterModes.length];
                  setFilterMode(nextMode);
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#e7e7e7] bg-[#FFFFFF] px-4 py-3 text-sm font-semibold text-[#444444]"
              >
                <FilterIcon />
                {filterMode}
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${activeTab === tab
                      ? "bg-[#222222] text-white"
                      : "bg-[#F5F5F5] text-[#444444]"
                    }`}
                >
                  {tab} ({counts[tab]})
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-[#e7e7e7] bg-[#FFFFFF] p-5 shadow-[0_16px_40px_rgba(34,34,34,0.06)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#8A8A8A]">Interest Section</p>
                <h2 className="mt-2 text-2xl font-black text-[#222222]">
                  Find items you might be interested in
                </h2>
                <p className="mt-2 text-sm text-[#444444]">
                  Based on your recent views, we thought you might like these picks.
                </p>
              </div>

              <label className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#e7e7e7] bg-[#FFFFFF] px-4 py-3 text-sm text-[#444444] lg:min-w-[360px]">
                <SearchIcon />
                <input
                  type="text"
                  value={interestSearch}
                  onChange={(event) => setInterestSearch(event.target.value)}
                  placeholder="Find items you might be interested in"
                  className="w-full bg-transparent outline-none placeholder:text-[#8A8A8A]"
                />
              </label>
            </div>

            <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
              {isLoading ? (
                [1, 2, 3, 4].map((i) => <SuggestedProductSkeleton key={i} />)
              ) : suggestedProducts.length > 0 ? (
                suggestedProducts.map((item) => (
                  <article
                    key={item.id}
                    className="min-w-[240px] rounded-[24px] border border-[#e7e7e7] bg-[#F5F5F5] p-4"
                  >
                    <div className={`flex h-32 items-center justify-center overflow-hidden rounded-[22px] bg-gradient-to-br ${item.accent}`}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-14 w-14 rounded-[20px] bg-white/85" />
                      )}
                    </div>
                    <p className="mt-4 text-lg font-bold text-[#222222]">{item.name}</p>
                    <p className="mt-1 text-sm text-[#8A8A8A]">{item.subtitle}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#444444]">{item.price}</span>
                      <Link
                        href={item.rawId ? `/products/${item.rawId}` : "/products"}
                        className="rounded-full border border-[#e7e7e7] bg-white px-3 py-2 text-xs font-semibold text-[#444444] no-underline"
                      >
                        View Item
                      </Link>
                    </div>
                  </article>
                ))
              ) : (
                <div className="w-full rounded-[24px] border border-[#e7e7e7] bg-[#F5F5F5] p-5 text-sm text-[#444444]">
                  Recommendations will appear here once products are available in Supabase.
                </div>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <OrderSkeleton key={i} />
              ))}
            </div>
          ) : displayedOrders.length === 0 ? (
            <div className="rounded-[30px] border border-[#e7e7e7] bg-[#F5F5F5] px-6 py-14 text-center shadow-[0_16px_40px_rgba(34,34,34,0.04)]">
              <h2 className="text-2xl font-black text-[#222222]">
                No orders found.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#444444]">
                There are no orders that match your current filter.
              </p>
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("All Orders");
                    setFilterMode("All Time");
                    setOrderSearch("");
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-[#d9d9d9] bg-[#222222] px-5 py-3 text-sm font-semibold text-white"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                {displayedOrders.map((order) => (
                  <article
                    key={order.id}
                    onClick={() => setTrackingOrderId(order.id)}
                    className="cursor-pointer rounded-[30px] border border-[#e7e7e7] bg-[#FFFFFF] p-5 shadow-[0_16px_40px_rgba(34,34,34,0.06)] transition-shadow hover:shadow-[0_16px_40px_rgba(34,34,34,0.12)]"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                        <div className="flex min-w-0 flex-1 gap-4">
                          <ProductThumb accent={order.accent} imageUrl={order.imageUrl} />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-xl font-black text-[#222222]">{order.name}</h3>
                              <span className="rounded-full bg-[#F5F5F5] px-3 py-1 text-xs font-semibold text-[#8A8A8A]">
                                {order.id}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-[#444444]">{order.variant}</p>
                            {order.shippingSummary ? (
                              <p className="mt-2 text-sm text-[#444444]">
                                <span className="font-semibold text-[#222222]">Ship to: </span>
                                {order.shippingSummary}
                              </p>
                            ) : null}
                            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[#444444]">
                              <span>Price: {order.price}</span>
                              <span>Quantity: {order.quantity}</span>
                              <span>Delivery: {order.deliveryDate}</span>
                            </div>
                            {order.rating != null && (
                              <div className="mt-3 flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star key={star} filled={star <= Math.round(order.rating)} />
                                ))}
                                <span className="ml-2 text-sm text-[#8A8A8A]">{order.rating}</span>
                              </div>
                            )}
                            <p className="mt-3 text-sm font-medium text-[#444444]">{order.status}</p>

                            {order.refundStatus ? (
                              <div className="mt-4 rounded-2xl border border-[#e7e7e7] bg-[#F5F5F5] px-4 py-3">
                                <p className="text-sm font-bold text-[#222222]">{order.refundStatus}</p>
                                <p className="mt-1 text-sm text-[#444444]">{order.refundTimeline}</p>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-x-4">
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTrackingOrderId(order.id);
                            }}
                            className="w-full whitespace-nowrap rounded-full bg-[#222222] px-4 py-2 text-center text-sm font-semibold text-white"
                          >
                            Track Order
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBuyAgain(order);
                            }}
                            className="w-full whitespace-nowrap rounded-full border border-[#e7e7e7] bg-[#FFFFFF] px-4 py-2 text-center text-sm font-semibold text-[#444444]"
                          >
                            Buy Again
                          </button>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Link
                            href={buildProductUpdateHref(order)}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-full border border-[#e7e7e7] bg-[#FFFFFF] px-4 py-2 text-center text-sm font-semibold text-[#444444] no-underline"
                          >
                            Product Update
                          </Link>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openCancel(order.id);
                            }}
                            disabled={order.category === "Cancelled"}
                            className="w-full whitespace-nowrap rounded-full border border-[#e7e7e7] bg-[#FFFFFF] px-4 py-2 text-center text-sm font-semibold text-[#444444] disabled:cursor-not-allowed disabled:text-[#8A8A8A]"
                          >
                            Cancel Order
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!canSubmitReviewForOrder(order)) {
                                alert("This order item cannot be reviewed yet.");
                                return;
                              }
                              setReviewingOrderId(order.id);
                            }}
                            disabled={!canSubmitReviewForOrder(order)}
                            title={!canSubmitReviewForOrder(order) ? "Review unavailable for this item" : ""}
                            className="w-full whitespace-nowrap rounded-full border border-[#e7e7e7] bg-[#FFFFFF] px-4 py-2 text-center text-sm font-semibold text-[#444444] disabled:cursor-not-allowed disabled:text-[#8A8A8A]"
                          >
                            Rate Product
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadInvoicePdf(order)}
                            disabled={invoicePdfRawId === order.rawId}
                            className="w-full whitespace-nowrap rounded-full border border-[#e7e7e7] bg-[#FFFFFF] px-4 py-2 text-center text-sm font-semibold text-[#444444] disabled:cursor-wait disabled:opacity-70"
                          >
                            {invoicePdfRawId === order.rawId ? "Preparing PDF…" : "Invoice PDF"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {cancelOrderId === order.id ? (
                      <div className="mt-5 rounded-[24px] border border-[#e7e7e7] bg-[#F5F5F5] p-4">
                        <p className="text-lg font-bold text-[#222222]">Reason for cancellation?</p>
                        <div className="mt-4 grid gap-4 lg:grid-cols-[220px_1fr_auto]">
                          <select
                            value={cancelReason}
                            onChange={(event) => setCancelReason(event.target.value)}
                            className="rounded-2xl border border-[#e7e7e7] bg-white px-4 py-3 text-sm text-[#444444] outline-none"
                          >
                            {cancelReasons.map((reason) => (
                              <option key={reason} value={reason}>
                                {reason}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={cancelNote}
                            onChange={(event) => setCancelNote(event.target.value)}
                            placeholder="Optional note"
                            className="rounded-2xl border border-[#e7e7e7] bg-white px-4 py-3 text-sm text-[#444444] outline-none placeholder:text-[#8A8A8A]"
                          />
                          <button
                            type="button"
                            onClick={() => submitCancel(order.id)}
                            className="rounded-2xl bg-[#222222] px-4 py-3 text-sm font-semibold text-white"
                          >
                            Submit
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>

              <aside className="space-y-6">
                {trackingOrder ? (
                  <section className="rounded-[30px] border border-[#e7e7e7] bg-[#FFFFFF] p-5 shadow-[0_16px_40px_rgba(34,34,34,0.06)]">
                    <p className="text-sm font-semibold text-[#8A8A8A]">Track Item Page</p>
                    <div className="mt-4 flex items-center gap-4 border-b border-[#e7e7e7] pb-6">
                      <ProductThumb accent={trackingOrder.accent} imageUrl={trackingOrder.imageUrl} />
                      <div className="min-w-0">
                        <h3 className="text-xl font-black text-[#222222]">{trackingOrder.name}</h3>
                        <p className="mt-1 text-sm text-[#444444]">
                          {(() => {
                            const v = trackingOrder.variant;
                            if (!v || v === "Not available") return "";
                            // Strip any leading "Size: " or ": " prefixes, then re-apply cleanly
                            const str = String(v).trim()
                              .replace(/^size\s*:\s*/i, "")
                              .replace(/^[:\s]+/, "")
                              .trim();
                            return str ? `Size: ${str}` : "";
                          })()}
                        </p>
                        <p className="mt-2 text-sm font-medium text-[#444444]">
                          Courier: {trackingOrder.courier}
                        </p>
                        {trackingOrder.awbCode && (
                          <>
                            <p className="mt-1 text-sm font-mono font-bold text-[#222222]">
                              AWB: {trackingOrder.awbCode}
                            </p>
                            <a
                              href={`https://shiprocket.co/tracking/${trackingOrder.awbCode}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#222222] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-black transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Track Shipment ↗
                            </a>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 rounded-[24px] bg-[#F5F5F5] px-4 py-4">
                      <p className="text-sm font-semibold text-[#8A8A8A]">Delivery Estimate</p>
                      <p className="mt-1 text-xl font-black text-[#222222]">
                        {trackingOrder.deliveryDate}
                      </p>
                    </div>

                    <div className="mt-5 space-y-4">
                      {trackingOrder.timeline.map((step, index) => (
                        <div key={`${trackingOrder.id}-${step.label}`} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <span
                              className={`h-3.5 w-3.5 rounded-full ${step.done ? "bg-[#222222]" : "border border-[#8A8A8A] bg-white"
                                }`}
                            />
                            {index < trackingOrder.timeline.length - 1 ? (
                              <span className="mt-1 h-10 w-px bg-[#d8d8d8]" />
                            ) : null}
                          </div>
                          <div className="pb-3">
                            <p className="text-sm font-bold text-[#222222]">{step.label}</p>
                            <p className="mt-1 text-sm text-[#444444]">{step.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}

              </aside>
            </div>
          )}
        </>
      )}

      {reviewingOrder ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-2xl rounded-[30px] border border-[#e7e7e7] bg-white p-6 shadow-[0_24px_70px_rgba(34,34,34,0.18)]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4 rounded-2xl bg-[#F5F5F5] p-3">
                <ProductThumb accent={reviewingOrder.accent} imageUrl={reviewingOrder.imageUrl} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#8A8A8A]">Rate the Product</p>
                  <h3 className="mt-1 text-2xl font-black text-[#222222]">{reviewingOrder.name}</h3>
                  <p className="mt-2 text-sm text-[#444444]">How do you like the product?</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReviewingOrderId(null)}
                className="rounded-full border border-[#e7e7e7] px-3 py-1 text-sm font-semibold text-[#444444]"
              >
                Close
              </button>
            </div>

            <div className="mt-6 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewStars(star)}
                  className="text-[#222222]"
                >
                  <Star filled={star <= reviewStars} />
                </button>
              ))}
            </div>

            <textarea
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              placeholder="Write your review"
              className="mt-5 min-h-32 w-full rounded-[24px] border border-[#e7e7e7] bg-[#F5F5F5] px-4 py-4 text-sm text-[#444444] outline-none placeholder:text-[#8A8A8A]"
            />

            <div className="mt-5 flex flex-wrap gap-2">
              {reviewTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${selectedTags.includes(tag)
                      ? "bg-[#222222] text-white"
                      : "border border-[#e7e7e7] bg-white text-[#444444]"
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setReviewingOrderId(null)}
                className="rounded-full border border-[#e7e7e7] bg-white px-4 py-2 text-sm font-semibold text-[#444444]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitReview}
                className="rounded-full bg-[#222222] px-4 py-2 text-sm font-semibold text-white"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
