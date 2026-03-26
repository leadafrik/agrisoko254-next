"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { adminApiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

export default function AdminBulkOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");

  const summary = useMemo(() => orders.reduce(
    (acc, o) => { acc.total++; if (o.status === "open") acc.open++; if (o.status === "awarded") acc.awarded++; if (o.status === "closed") acc.closed++; return acc; },
    { total: 0, open: 0, awarded: 0, closed: 0 }
  ), [orders]);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ limit: "100" });
      if (statusFilter) params.set("status", statusFilter);
      if (category) params.set("category", category);
      if (search.trim()) params.set("search", search.trim());
      const res = await adminApiRequest(`${API_ENDPOINTS.bulkOrders.adminList}?${params}`);
      setOrders(Array.isArray(res?.data) ? res.data : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load bulk orders.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, category, search]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-5">
      <section className="rounded-2xl border border-stone-100 bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-terra-600">Admin</p>
        <h1 className="mt-2 text-3xl font-bold text-stone-900">Bulk orders</h1>
        <p className="mt-1 text-sm text-stone-500">Track institutional demand, bids, and award status.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {[["Total", summary.total], ["Open", summary.open], ["Awarded", summary.awarded], ["Closed", summary.closed]].map(([label, val]) => (
            <div key={String(label)} className="rounded-xl bg-stone-50 px-4 py-3">
              <p className="text-xs uppercase tracking-widest text-stone-500">{label}</p>
              <p className="text-2xl font-semibold text-stone-900">{val}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:outline-none">
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="awarded">Awarded</option>
            <option value="closed">Closed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:outline-none">
            <option value="">All categories</option>
            <option value="produce">Produce</option>
            <option value="livestock">Livestock</option>
            <option value="inputs">Inputs</option>
            <option value="service">Service</option>
          </select>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, item, county..." className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:outline-none md:col-span-2" />
        </div>
      </section>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <section className="rounded-2xl border border-stone-100 bg-white overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-stone-500">Loading bulk orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-6 text-sm text-stone-500">No bulk orders found.</div>
        ) : (
          <div className="divide-y divide-stone-100">
            {orders.map((order) => (
              <article key={order._id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">{order.category}</span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${order.status === "open" ? "bg-emerald-100 text-emerald-700" : order.status === "awarded" ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-700"}`}>{order.status}</span>
                    </div>
                    <h2 className="mt-2 text-lg font-semibold text-stone-900">{order.title}</h2>
                    <p className="text-sm text-stone-600">{order.itemName} — {order.quantity} {order.unit}</p>
                  </div>
                  <div className="text-sm text-stone-600">
                    <p>{order.buyerId?.fullName || "Buyer"}</p>
                    <p>{order.buyerId?.email || "No email"}</p>
                    <p>{order.deliveryLocation?.county || "No county"}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-stone-600">
                  <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1">Bids: {order.bidCount || 0}</span>
                  <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1">Delivery: {order.deliveryScope}</span>
                  <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1">Budget: {order.budget?.min ? `KES ${order.budget.min.toLocaleString()}` : "-"}{order.budget?.max ? ` to KES ${order.budget.max.toLocaleString()}` : ""}</span>
                </div>
                {order.acceptedBid?.sellerId && (
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-stone-700">
                    <p className="font-semibold text-stone-900">Fulfilling seller: {order.acceptedBid.sellerId.fullName || order.acceptedBid.sellerId.name || "Seller"}</p>
                    <p className="mt-1">Quote: {typeof order.acceptedBid.quoteAmount === "number" ? `KES ${order.acceptedBid.quoteAmount.toLocaleString()}` : "-"}</p>
                    <p className="mt-1">Delivery date: {order.acceptedBid.deliveryDate ? new Date(order.acceptedBid.deliveryDate).toLocaleDateString() : "Flexible"}</p>
                  </div>
                )}
                <div className="mt-4">
                  <Link href={`/bulk/orders/${order._id}`} className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50">Open order</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
