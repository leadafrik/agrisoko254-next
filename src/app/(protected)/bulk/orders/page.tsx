"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { kenyaCounties } from "@/data/kenyaCounties";

type BulkOrderCategory = "produce" | "livestock" | "inputs" | "service";

const CATEGORY_OPTIONS = [
  { value: "", label: "All categories" },
  { value: "produce", label: "Produce" },
  { value: "livestock", label: "Livestock" },
  { value: "inputs", label: "Inputs" },
  { value: "service", label: "Service" },
];

const formatBudget = (order: any) => {
  const { min, max } = order.budget || {};
  if (typeof min === "number" && typeof max === "number") return `KES ${min.toLocaleString()} – ${max.toLocaleString()}`;
  if (typeof min === "number") return `From KES ${min.toLocaleString()}`;
  if (typeof max === "number") return `Up to KES ${max.toLocaleString()}`;
  return "Budget not set";
};

const formatLocation = (order: any) => {
  const parts = [order.deliveryLocation?.ward, order.deliveryLocation?.constituency, order.deliveryLocation?.county].filter(Boolean);
  return parts.length ? parts.join(", ") : "Location not set";
};

function BulkOrdersBoardInner() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState<BulkOrderCategory | "">("");
  const [county, setCounty] = useState("");
  const [mineOnly, setMineOnly] = useState(searchParams.get("mine") === "true");
  const [canPost, setCanPost] = useState(false);
  const [canRespond, setCanRespond] = useState(false);
  const [accessLoading, setAccessLoading] = useState(true);

  const countyOptions = useMemo(() => kenyaCounties.map((c) => c.name), []);

  useEffect(() => {
    if (!user) { setAccessLoading(false); return; }
    let active = true;
    setAccessLoading(true);
    apiRequest(API_ENDPOINTS.bulkApplications.myStatus)
      .then((s: any) => {
        if (!active) return;
        setCanPost(Boolean(s?.canPostB2BDemand || s?.isAdmin));
        setCanRespond(Boolean(s?.canRespondToB2BDemand || s?.canOfferToOpenDemand || s?.isAdmin));
      })
      .catch(() => {})
      .finally(() => { if (active) setAccessLoading(false); });
    return () => { active = false; };
  }, [user]);

  const loadOrders = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ limit: "30" });
      if (mineOnly) params.set("mine", "true");
      if (category) params.set("category", category);
      if (county) params.set("county", county);
      const res = await apiRequest(`${API_ENDPOINTS.bulkOrders.list}?${params}`);
      setOrders(Array.isArray(res?.data) ? res.data : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load bulk orders.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [category, county, mineOnly, user]);

  useEffect(() => { if (user) loadOrders(); }, [loadOrders, user]);

  if (!user) return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="rounded-2xl border border-stone-100 bg-white p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-terra-600">Bulk buying</p>
        <h1 className="mt-2 text-2xl font-bold text-stone-900">Bulk demand board</h1>
        <p className="mt-2 text-sm text-stone-500">Sign in first to access institutional demand.</p>
        <Link href="/login?redirect=/bulk/orders" className="mt-5 inline-block rounded-xl bg-terra-500 px-5 py-3 text-sm font-semibold text-white hover:bg-terra-600">Sign in to continue</Link>
      </div>
    </div>
  );

  if (!accessLoading && !canPost && !canRespond) return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8">
        <h1 className="text-2xl font-bold text-amber-900">Bulk access required</h1>
        <p className="mt-2 text-sm text-amber-800">Apply as a bulk buyer or bulk seller first. Approved users, accounts with live listings, and trusted accounts older than 30 days can offer delivery here.</p>
        <Link href="/bulk" className="mt-5 inline-block rounded-xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-700">Open bulk application</Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-5">
      <section className="rounded-2xl border border-stone-100 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-terra-600">Agrisoko B2B</p>
            <h1 className="mt-1 text-2xl font-bold text-stone-900">Bulk demand board</h1>
            <p className="mt-1 text-sm text-stone-500">Institutional orders, supplier bids, and buyer decisions in one buyer-first workflow.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canPost && <Link href="/bulk/orders/new" className="rounded-xl bg-terra-500 px-4 py-2 text-sm font-semibold text-white hover:bg-terra-600">Post bulk order</Link>}
            {canRespond && <Link href="/bulk/seller/orders" className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50">Seller portal</Link>}
            <Link href="/bulk" className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50">Bulk access status</Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-100 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <select value={category} onChange={(e) => setCategory(e.target.value as BulkOrderCategory | "")} className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:border-terra-400">
            {CATEGORY_OPTIONS.map((o) => <option key={o.label} value={o.value}>{o.label}</option>)}
          </select>
          <select value={county} onChange={(e) => setCounty(e.target.value)} className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:border-terra-400">
            <option value="">All counties</option>
            {countyOptions.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <label className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-700 cursor-pointer">
            <input type="checkbox" checked={mineOnly} onChange={(e) => setMineOnly(e.target.checked)} />
            My orders only
          </label>
          <button type="button" onClick={loadOrders} className="rounded-xl border border-stone-200 px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50">Refresh</button>
        </div>
      </section>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="rounded-2xl border border-stone-100 bg-white p-6 text-sm text-stone-500">Loading bulk orders...</div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-stone-100 bg-white p-6 text-sm text-stone-500">No bulk orders match this filter yet.</div>
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {orders.map((order) => (
            <article key={order._id} className="rounded-2xl border border-stone-100 bg-white p-5 hover:-translate-y-0.5 transition">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">{order.category}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${order.status === "open" ? "bg-emerald-100 text-emerald-700" : order.status === "awarded" ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-700"}`}>{order.status}</span>
              </div>
              <h2 className="mt-3 text-lg font-semibold text-stone-900">{order.title}</h2>
              <p className="mt-1 text-sm text-stone-600">{order.itemName}</p>
              <div className="mt-4 rounded-xl bg-stone-50 p-3 text-sm text-stone-700 space-y-1">
                <p><strong>Quantity:</strong> {order.quantity} {order.unit}</p>
                <p><strong>Budget:</strong> {formatBudget(order)}</p>
                <p><strong>Delivery:</strong> {formatLocation(order)} ({order.deliveryScope})</p>
                <p><strong>Bids:</strong> {order.bidCount || 0}</p>
                {order.myBid && <p><strong>Your bid:</strong> {order.myBid.status} – KES {Number(order.myBid.quoteAmount || 0).toLocaleString()}</p>}
              </div>
              <div className="mt-4">
                <Link href={`/bulk/orders/${order._id}`} className="rounded-xl bg-terra-500 px-4 py-2 text-sm font-semibold text-white hover:bg-terra-600">
                  {canRespond && order.status === "open" ? "View & bid" : "View details"}
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

export default function BulkOrdersBoardPage() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto px-4 py-8 text-sm text-stone-500">Loading...</div>}>
      <BulkOrdersBoardInner />
    </Suspense>
  );
}
