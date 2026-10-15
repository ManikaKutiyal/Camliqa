"use client";

import { useMemo, useState, useEffect } from "react";
import { useAdminStore } from "@/store/useAdminStore";

export default function StoreAdminReviewsPage() {
  const isAuthenticated = useAdminStore((state) => state.isAuthenticated);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingReview, setViewingReview] = useState(null);
  const [updatingReviewId, setUpdatingReviewId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [optimisticFeaturedIds, setOptimisticFeaturedIds] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  async function loadReviews() {
    const response = await fetch("/api/store-admin/reviews", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) {
      console.error("Failed to load admin reviews:", payload?.error || "Unknown error");
      setLoading(false);
      return;
    }
    const data = payload?.data;
    if (data) {
      const mapped = data.map(r => {
        const dateObj = new Date(r.created_at);
        return {
          id: r.id,
          name: r.profiles?.full_name || "Unknown User",
          email: "User ID: " + (r.user_id || "").substring(0, 8),
          product: r.products?.title || "Unknown Product",
          rating: r.rating,
          review: r.review,
          avatarUrl: r.profiles?.avatar_url || null,
          isFeatured: Boolean(
            typeof r.is_featured === "boolean" ? r.is_featured : r.status === "approved",
          ),
          date: dateObj.toISOString().split('T')[0],
          time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: (r.status || "pending").charAt(0).toUpperCase() + (r.status || "pending").slice(1),
          initials: (r.profiles?.full_name || "U").charAt(0).toUpperCase()
        };
      });
      const optimisticSet = new Set(optimisticFeaturedIds);
      const merged = mapped.map((row) =>
        optimisticSet.has(row.id) ? { ...row, isFeatured: true } : row,
      );
      setReviews(merged);
      if (optimisticSet.size) {
        setOptimisticFeaturedIds((prev) =>
          prev.filter((id) => !merged.some((row) => row.id === id && row.isFeatured))
        );
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!isAuthenticated) return;
    loadReviews();
    const timer = setInterval(() => {
      loadReviews();
    }, 5000);
    return () => clearInterval(timer);
  }, [isAuthenticated]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const matchesSearch =
        review.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.review.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDate =
        !selectedDate || review.date === selectedDate;
      return matchesSearch && matchesDate;
    });
  }, [reviews, searchQuery, selectedDate]);

  const featuredCount = useMemo(
    () => reviews.filter((review) => review.isFeatured).length,
    [reviews],
  );

  const handleExportReviews = () => {
    const header = ["Name", "Email", "Product", "Rating", "Review", "Date", "Time", "Status"];
    const rows = filteredReviews.map((review) => [
      review.name,
      review.email,
      review.product,
      review.rating,
      review.review,
      review.date,
      review.time,
      review.status,
    ]);
    const csvContent = [header, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "reviews.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        alert(payload?.error || "Failed to update review status.");
        return;
      }
      loadReviews();
      if (viewingReview?.id === id) {
        setViewingReview(prev => ({
          ...prev,
          status: status.charAt(0).toUpperCase() + status.slice(1)
        }));
      }
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleViewReview = (review) => {
    setViewingReview(review);
  };

  const handleDeleteReview = async (id) => {
    if (confirm("Are you sure you want to delete this review?")) {
      const response = await fetch(`/api/reviews/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        alert(payload?.error || "Failed to delete review.");
        return;
      }
      setReviews((prev) => prev.filter((review) => review.id !== id));
    }
  };

  const handleToggleFeatured = async (review) => {
    setActionMessage("");
    setActionError("");

    if (review.isFeatured) {
      setActionMessage("Review is already featured on the homepage.");
      return;
    }

    if (featuredCount >= 8) {
      setActionError("You can only feature up to 8 reviews");
      return;
    }

    setUpdatingReviewId(review.id);
    setOptimisticFeaturedIds((prev) =>
      prev.includes(review.id) ? prev : [...prev, review.id],
    );
    setReviews((prev) =>
      prev.map((item) =>
        item.id === review.id ? { ...item, isFeatured: true } : item,
      ),
    );
    const response = await fetch(`/api/reviews/${review.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ is_featured: true }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setReviews((prev) =>
        prev.map((item) =>
          item.id === review.id ? { ...item, isFeatured: false } : item,
        ),
      );
      setOptimisticFeaturedIds((prev) => prev.filter((id) => id !== review.id));
      setActionError(payload?.error || "Failed to update featured review.");
      setUpdatingReviewId(null);
      return;
    }

    const isFeatured =
      typeof payload?.data?.is_featured === "boolean"
        ? payload.data.is_featured
        : payload?.data?.status
          ? payload.data.status === "approved"
          : true;

    setReviews((prev) =>
      prev.map((item) =>
        item.id === review.id ? { ...item, isFeatured } : item,
      ),
    );
    setOptimisticFeaturedIds((prev) => prev.filter((id) => id !== review.id));
    setActionMessage("Review added to homepage featured list.");
    setUpdatingReviewId(null);
  };

  return (
    <section className="w-full space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reviews</h1>
          <p className="text-sm text-slate-500">Manage and moderate product reviews</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportReviews}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
            Export Reviews
          </button>
        </div>
      </header>

      {loading ? (
        <div className="py-10 text-center text-slate-500">Loading reviews...</div>
      ) : (
        <>
          {actionError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {actionError}
            </div>
          ) : null}
          {actionMessage ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {actionMessage}
            </div>
          ) : null}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="w-fit rounded-xl border border-slate-200 bg-slate-50/90 px-3.5 py-2.5 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-[15px] w-[15px]" aria-hidden>
                    <path d="M12 2l3 6 6 .9-4.5 4.4 1 6.2L12 16l-5.5 3.5 1-6.2L3 8.9 9 8l3-6Z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Total reviews</p>
                  <p className="text-xl font-bold leading-tight tracking-tight text-slate-900 tabular-nums">
                    {reviews.length}
                  </p>
                </div>
              </div>
              <p className="mt-2 border-t border-slate-200/90 pt-1.5 text-[11px] text-slate-500">All time</p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <div className="flex w-full max-w-xs items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400"
              />
            </div>
              <div className="relative">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-600 outline-none focus:border-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <div className="hidden w-full overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Product</th>
                    <th className="px-6 py-3">Rating</th>
                    <th className="px-6 py-3">Review</th>
                    <th className="px-6 py-3">Homepage</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReviews.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-10 text-center text-slate-500">
                        No reviews found
                      </td>
                    </tr>
                  ) : filteredReviews.map((row) => (
                    <tr key={row.id} className="text-slate-600">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {row.avatarUrl ? (
                            <img
                              src={row.avatarUrl}
                              alt={row.name}
                              className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                              {row.initials}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{row.name}</p>
                            <p className="text-xs text-slate-500">{row.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-900">{row.product}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-amber-400">
                          {Array.from({ length: row.rating }).map((_, index) => (
                            <span key={index}>★</span>
                          ))}
                          {Array.from({ length: 5 - row.rating }).map((_, index) => (
                            <span key={`empty-${index}`} className="text-slate-300">
                              ★
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{row.review}</td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(row)}
                          disabled={updatingReviewId === row.id || row.isFeatured}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                            row.isFeatured
                              ? "border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          } disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          {updatingReviewId === row.id
                            ? "Saving..."
                            : row.isFeatured
                              ? "Featured"
                              : "Set Featured"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          row.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                          row.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        <p>{row.date}</p>
                        <p>{row.time}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {row.status !== 'Approved' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(row.id, 'approved')}
                              className="rounded-lg border border-emerald-200 p-2 text-emerald-600 hover:bg-emerald-50"
                              title="Approve Review"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </button>
                          )}
                          {row.status !== 'Rejected' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(row.id, 'rejected')}
                              className="rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"
                              title="Reject Review"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleViewReview(row)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                            aria-label="View full review"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(row.id)}
                            className="rounded-lg border border-rose-200 p-2 text-rose-500 hover:bg-rose-50"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                              <path d="M3 6h18" />
                              <path d="M8 6V4h8v2" />
                              <path d="M6 6l1 14h10l1-14" />
                              <path d="M10 11v6M14 11v6" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-3 p-3 md:hidden">
              {filteredReviews.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  No reviews found
                </div>
              ) : (
                filteredReviews.map((row) => (
                  <article key={row.id} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center gap-3">
                      {row.avatarUrl ? (
                        <img src={row.avatarUrl} alt={row.name} className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200" />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                          {row.initials}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{row.name}</p>
                        <p className="truncate text-xs text-slate-500">{row.product}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(row)}
                        disabled={updatingReviewId === row.id || row.isFeatured}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          row.isFeatured
                            ? "border border-amber-300 bg-amber-50 text-amber-800"
                            : "border border-slate-200 bg-white text-slate-600"
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {updatingReviewId === row.id ? "Saving..." : row.isFeatured ? "Featured" : "Feature"}
                      </button>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">{row.review}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                      <span>{row.date}</span>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => handleViewReview(row)} className="rounded-md border border-slate-200 px-2 py-1">View</button>
                        <button type="button" onClick={() => handleDeleteReview(row.id)} className="rounded-md border border-rose-200 px-2 py-1 text-rose-600">Delete</button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>

            <div className="border-t border-slate-100 px-6 py-4 text-xs text-slate-500">
              Showing {filteredReviews.length} review{filteredReviews.length === 1 ? "" : "s"}
            </div>
          </div>

          {viewingReview ? (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="review-dialog-title"
              onClick={() => setViewingReview(null)}
            >
              <div
                className="max-h-[min(560px,85vh)] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h2 id="review-dialog-title" className="text-lg font-bold text-slate-900">
                      Review
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">{viewingReview.product}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewingReview(null)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                    {viewingReview.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{viewingReview.name}</p>
                    <p className="text-xs text-slate-500">{viewingReview.email}</p>
                  </div>
                  <div className="flex shrink-0 gap-0.5 text-amber-400" aria-label={`${viewingReview.rating} out of 5 stars`}>
                    {Array.from({ length: viewingReview.rating }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                    {Array.from({ length: 5 - viewingReview.rating }).map((_, i) => (
                      <span key={`e-${i}`} className="text-slate-200">★</span>
                    ))}
                  </div>
                </div>
                <p className="mt-4 text-xs text-slate-400">
                  {viewingReview.date} · {viewingReview.time} · <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                    viewingReview.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                    viewingReview.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {viewingReview.status}
                  </span>
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {viewingReview.review}
                </p>
                <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
                  {viewingReview.status !== 'Approved' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(viewingReview.id, 'approved')}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                    >
                      Approve
                    </button>
                  )}
                  {viewingReview.status !== 'Rejected' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(viewingReview.id, 'rejected')}
                      className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition-colors"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
