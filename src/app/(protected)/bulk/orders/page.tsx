"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatKes, formatLongDate, getBudgetLabel } from "@/lib/marketplace";

export default function BulkOrdersBoardPage() {
  const searchParams = useSearchParams();
  const mine = searchParams.get("mine") === "true";
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({
      limit: "20",
    });
    if (mine) params.set("mine", "true");

    apiRequest(`${API_ENDPOINTS.bulkOrders.list}?${params.toString()}`)
      .then((response) => setOrders(response?.data ?? response?.orders ?? response ?? []))
      .catch((loadError) => setError(loadError?.message || "Unable to load the bulk order board."))
      .finally(() => setLoading(false));
  }, [mine]);

  return (
    <div className="page-shell py-10 sm:py-12">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="section-kicker">Bulk order board</p>
          <h1 className="mt-4 text-4xl font-bold text-stone-900">Open institutional demand</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600">
            Approved bulk users can review open demand, compare budget signals, and decide where to
            place serious offers.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/bulk" className="secondary-button">
            Bulk access page
          </Link>
          <Link href={mine ? "/bulk/orders" : "/bulk/orders?mine=true"} className="primary-button">
            {mine ? "View all open orders" : "Show my procurement flow"}
          </Link>
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="surface-card p-10 text-center text-stone-500">Loading bulk orders...</div>
      ) : orders.length === 0 ? (
        <div className="surface-card p-10 text-center">
          <h2 className="text-2xl font-bold text-stone-900">No bulk orders available</h2>
          <p className="mt-3 text-sm text-stone-600">
            Either there is no open institutional demand right now or your access level limits what
            you can see.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {orders.map((order) => (
            <div key={order._id} className="surface-card p-6">
              <div className="flex flex-wrap items-center gap-3">
                <p className="section-kicker">{order.category || "Bulk order"}</p>
                <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-600">
                  {order.status}
                </span>
              </div>

              <h2 className="mt-4 text-3xl font-bold text-stone-900">{order.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">{order.description}</p>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-stone-50 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">County</p>
                  <p className="mt-1 font-semibold text-stone-900">{order.deliveryLocation?.county || "Not set"}</p>
                </div>
                <div className="rounded-2xl bg-stone-50 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Budget</p>
                  <p className="mt-1 font-semibold text-stone-900">
                    {getBudgetLabel(order.budget) || formatKes(order.estimatedBudgetPerOrder) || "Negotiable"}
                  </p>
                </div>
                <div className="rounded-2xl bg-stone-50 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Quantity</p>
                  <p className="mt-1 font-semibold text-stone-900">
                    {order.quantity ? `${order.quantity.toLocaleString()} ${order.unit || ""}`.trim() : "Not stated"}
                  </p>
                </div>
                <div className="rounded-2xl bg-stone-50 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Posted</p>
                  <p className="mt-1 font-semibold text-stone-900">{formatLongDate(order.createdAt) || "Recently"}</p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4 border-t border-stone-100 pt-4 text-sm text-stone-600">
                <span>{order.bidCount || 0} bid(s)</span>
                <span>{order.myBid ? "You already have a bid here" : "No bid from you yet"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
