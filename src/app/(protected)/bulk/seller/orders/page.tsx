"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

const fmt = (v?: number) => (typeof v === "number" ? `KES ${v.toLocaleString()}` : "-");
const fmtDate = (v?: string) => {
  if (!v) return "-";
  const d = new Date(v);
  return isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
};

const CATEGORY_LABELS: Record<string, string> = { produce: "Produce", livestock: "Livestock", inputs: "Inputs", service: "Services" };

const STATUS_META: Record<string, { label: string; cls: string }> = {
  awarded: { label: "Awarded", cls: "bg-amber-100 text-amber-700" },
  closed: { label: "Closed", cls: "bg-stone-200 text-stone-700" },
  cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-700" },
};

const COMPLETION_META: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pending completion", cls: "bg-stone-100 text-stone-700" },
  buyer_marked: { label: "Buyer confirmed", cls: "bg-sky-100 text-sky-700" },
  seller_marked: { label: "Seller confirmed", cls: "bg-violet-100 text-violet-700" },
  completed: { label: "Completed", cls: "bg-emerald-100 text-emerald-700" },
  presumed_complete: { label: "Presumed complete", cls: "bg-amber-100 text-amber-700" },
};

type ViewFilter = "all" | "needs_action" | "accepted" | "invoiced";
const VIEW_LABELS: Record<ViewFilter, string> = { all: "All orders", needs_action: "Needs action", accepted: "Accepted", invoiced: "Invoiced" };

export default function BulkSellerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [canRespond, setCanRespond] = useState(false);
  const [accessLoading, setAccessLoading] = useState(true);
  const [view, setView] = useState<ViewFilter>("all");

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiRequest(API_ENDPOINTS.bulkOrders.sellerOrders);
      setOrders(Array.isArray(res?.data) ? res.data : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load awarded orders.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) { setAccessLoading(false); return; }
    let active = true;
    setAccessLoading(true);
    apiRequest(API_ENDPOINTS.bulkApplications.myStatus)
      .then((s: any) => {
        if (!active) return;
        setCanRespond(Boolean(s?.canRespondToB2BDemand || s?.canOfferToOpenDemand || s?.isAdmin));
      })
      .catch(() => {})
      .finally(() => { if (active) setAccessLoading(false); });
    return () => { active = false; };
  }, [user]);

  useEffect(() => { if (canRespond) loadOrders(); }, [canRespond, loadOrders]);

  const stats = useMemo(() => {
    let needsAction = 0, accepted = 0, invoiced = 0;
    orders.forEach((o) => {
      const isActionable = o.status === "awarded" && o.acceptedBid?.status === "accepted" && !o.sellerAcceptedAt;
      if (isActionable) needsAction++;
      if (o.sellerAcceptedAt) accepted++;
      if (o.invoice) invoiced++;
    });
    return { total: orders.length, needsAction, accepted, invoiced };
  }, [orders]);

  const filtered = useMemo(() => {
    const isActionable = (o: any) => o.status === "awarded" && o.acceptedBid?.status === "accepted" && !o.sellerAcceptedAt;
    return [...orders]
      .filter((o) => {
        if (view === "needs_action") return isActionable(o);
        if (view === "accepted") return Boolean(o.sellerAcceptedAt);
        if (view === "invoiced") return Boolean(o.invoice);
        return true;
      })
      .sort((a, b) => {
        const aA = isActionable(a) ? 1 : 0, bA = isActionable(b) ? 1 : 0;
        if (aA !== bA) return bA - aA;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [orders, view]);

  const handleAcceptOrder = async (orderId: string) => {
    const note = window.prompt("Optional note for order acceptance:");
    try {
      setError(""); setNotice("");
      await apiRequest(API_ENDPOINTS.bulkOrders.sellerAccept(orderId), {
        method: "POST",
        body: JSON.stringify({ note: note || undefined }),
      });
      setNotice("Order accepted and invoice issued.");
      await loadOrders();
      setView("invoiced");
    } catch (err: any) {
      setError(err?.message || "Failed to accept order.");
    }
  };

  if (!user) return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="rounded-2xl border border-stone-100 bg-white p-8">
        <h1 className="text-2xl font-bold text-stone-900">Bulk seller orders</h1>
        <p className="mt-2 text-sm text-stone-500">Sign in first to continue.</p>
        <Link href="/login?redirect=/bulk/seller/orders" className="mt-5 inline-block rounded-xl bg-terra-500 px-5 py-3 text-sm font-semibold text-white hover:bg-terra-600">Sign in</Link>
      </div>
    </div>
  );

  if (!accessLoading && !canRespond) return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8">
        <h1 className="text-2xl font-bold text-amber-900">Bulk seller approval required</h1>
        <p className="mt-2 text-sm text-amber-800">Apply as a bulk seller first. This page unlocks after admin approval.</p>
        <Link href="/bulk?role=seller" className="mt-5 inline-block rounded-xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-700">Apply as seller</Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
      {/* Header */}
      <section className="rounded-2xl border border-stone-100 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-terra-600">Seller portal</p>
            <h1 className="mt-1 text-2xl font-bold text-stone-900">Bulk seller workflow</h1>
            <p className="mt-1 text-sm text-stone-500">Review awarded orders, accept fast, and issue invoices cleanly.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/bulk/orders" className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50">Open demand board</Link>
            <button type="button" onClick={loadOrders} className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50">Refresh</button>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-4">
          <div className="rounded-xl bg-stone-50 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-stone-500">Total</p>
            <p className="text-lg font-semibold text-stone-900">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-amber-700">Needs action</p>
            <p className="text-lg font-semibold text-amber-900">{stats.needsAction}</p>
          </div>
          <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-sky-700">Accepted</p>
            <p className="text-lg font-semibold text-sky-900">{stats.accepted}</p>
          </div>
          <div className="rounded-xl border border-terra-100 bg-terra-50 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-terra-600">Invoiced</p>
            <p className="text-lg font-semibold text-terra-700">{stats.invoiced}</p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="rounded-2xl border border-stone-100 bg-white p-3">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(VIEW_LABELS) as ViewFilter[]).map((v) => (
            <button key={v} type="button" onClick={() => setView(v)} className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${view === v ? "bg-terra-500 text-white" : "border border-stone-200 bg-white text-stone-700 hover:bg-stone-50"}`}>{VIEW_LABELS[v]}</button>
          ))}
        </div>
      </section>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}

      {loading ? (
        <div className="rounded-2xl border border-stone-100 bg-white p-6 text-sm text-stone-500">Loading awarded orders...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-stone-100 bg-white p-6 text-sm text-stone-500">
          {view === "all" ? "No awarded orders yet." : `No orders in "${VIEW_LABELS[view]}" right now.`}
        </div>
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {filtered.map((order) => {
            const invoice = order.invoice || null;
            const acceptedBid = order.acceptedBid || null;
            const needsSellerAcceptance = order.status === "awarded" && acceptedBid?.status === "accepted" && !order.sellerAcceptedAt;
            const statusMeta = STATUS_META[order.status] || { label: order.status, cls: "bg-stone-100 text-stone-700" };
            const completionM = COMPLETION_META[order.completionStatus || "pending"] || COMPLETION_META.pending;

            return (
              <article key={order._id} className="rounded-2xl border border-stone-100 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">{CATEGORY_LABELS[order.category] || order.category}</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${completionM.cls}`}>{completionM.label}</span>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusMeta.cls}`}>{statusMeta.label}</span>
                </div>

                <h2 className="mt-3 text-lg font-semibold text-stone-900">{order.title}</h2>
                <p className="mt-1 text-sm text-stone-600">{order.itemName}</p>

                <div className="mt-4 rounded-xl bg-stone-50 p-3 text-sm text-stone-700 space-y-1">
                  <p><strong>Buyer:</strong> {order.buyerId?.fullName || "Buyer"}</p>
                  <p><strong>County:</strong> {order.deliveryLocation?.county || "-"}</p>
                  {(order.deliveryLocation?.ward || order.deliveryLocation?.constituency) && (
                    <p><strong>Area:</strong> {[order.deliveryLocation?.ward, order.deliveryLocation?.constituency].filter(Boolean).join(", ")}</p>
                  )}
                  <p><strong>Accepted quote:</strong> {fmt(acceptedBid?.quoteAmount)}</p>
                  <p><strong>Delivery date:</strong> {fmtDate(acceptedBid?.deliveryDate)}</p>
                  {order.sellerAcceptedAt && <p><strong>Seller accepted:</strong> {fmtDate(order.sellerAcceptedAt)}</p>}
                  {order.buyerMarkedCompleteAt && <p><strong>Buyer confirmed:</strong> {fmtDate(order.buyerMarkedCompleteAt)}</p>}
                </div>

                {invoice && (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 space-y-1">
                    <p><strong>Invoice:</strong> {invoice.invoiceNumber}</p>
                    <p><strong>Buyer total:</strong> {fmt(invoice.totalBuyerAmount)}</p>
                    <p><strong>Platform fee:</strong> {fmt(invoice.platformFeeAmount)}</p>
                    <p><strong>Status:</strong> {invoice.status}</p>
                    <p><strong>Email:</strong> {invoice.emailSentAt ? `Sent ${fmtDate(invoice.emailSentAt)}` : "Pending"}</p>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/bulk/orders/${order._id}`} className="rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50">View details</Link>
                  {needsSellerAcceptance && (
                    <button type="button" onClick={() => handleAcceptOrder(order._id)} className="rounded-xl bg-terra-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-terra-600">Accept + issue invoice</button>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
