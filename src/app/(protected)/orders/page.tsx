"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-amber-100 text-amber-700",
  confirmed:  "bg-blue-100 text-blue-700",
  delivered:  "bg-forest-100 text-forest-700",
  cancelled:  "bg-red-100 text-red-600",
  completed:  "bg-forest-100 text-forest-700",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest(API_ENDPOINTS.orders.my)
      .then((d) => setOrders(d?.orders ?? d ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen text-stone-400">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold font-display text-stone-900 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <p>No orders yet.</p>
          <Link href="/browse" className="mt-4 inline-block text-terra-600 font-medium hover:underline">Browse listings</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order._id} className="bg-white rounded-xl border border-stone-100 p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-semibold text-stone-800">{order.listing?.title ?? "Order"}</p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${STATUS_COLORS[order.status] ?? "bg-stone-100 text-stone-600"}`}>
                  {order.status}
                </span>
              </div>
              {order.totalAmount && (
                <p className="text-lg font-bold text-stone-900">KES {order.totalAmount.toLocaleString()}</p>
              )}
              <Link href={`/orders/${order._id}`} className="mt-3 inline-block text-sm text-terra-600 font-medium hover:underline">
                View details →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
