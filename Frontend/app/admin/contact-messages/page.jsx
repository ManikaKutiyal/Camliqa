"use client";

import { useEffect, useMemo, useState } from "react";

function formatDate(value) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function StoreAdminContactMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  async function loadMessages() {
    setError("");
    const response = await fetch("/api/contact-messages", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.error || "Failed to load contact messages.");
    }
    setMessages(payload.data || []);
  }

  useEffect(() => {
    async function run() {
      setLoading(true);
      try {
        await loadMessages();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load contact messages.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    run();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter((m) =>
      [m.name, m.email, m.phone, m.issue, m.message]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [messages, query]);

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contact Messages</h1>
          <p className="text-sm text-slate-500">Messages submitted from the customer contact form</p>
        </div>
        <button
          type="button"
          onClick={async () => {
            try {
              setLoading(true);
              await loadMessages();
            } catch (err) {
              const message = err instanceof Error ? err.message : "Failed to refresh messages.";
              setError(message);
            } finally {
              setLoading(false);
            }
          }}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Refresh
        </button>
      </header>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, issue, or message"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading messages...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No contact messages found.</div>
        ) : (
          <>
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Issue</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3">Submitted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{row.name}</td>
                    <td className="px-4 py-3 text-slate-700">{row.email}</td>
                    <td className="px-4 py-3 text-slate-700">{row.phone || "-"}</td>
                    <td className="px-4 py-3 text-slate-700">{row.issue}</td>
                    <td className="px-4 py-3 text-slate-700 max-w-xl whitespace-pre-wrap">{row.message}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(row.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-3 p-3 md:hidden">
            {filtered.map((row) => (
              <article key={row.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{row.name}</p>
                    <p className="truncate text-xs text-slate-500">{row.email}</p>
                  </div>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-600">{row.issue}</span>
                </div>
                <p className="mt-2 line-clamp-3 text-sm text-slate-700 whitespace-pre-wrap">{row.message}</p>
                <p className="mt-2 text-xs text-slate-500">{formatDate(row.created_at)}</p>
              </article>
            ))}
          </div>
          </>
        )}
      </div>
    </section>
  );
}
