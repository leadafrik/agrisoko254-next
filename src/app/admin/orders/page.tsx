"use client";

import { useEffect, useState } from "react";
import { adminApiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApiRequest(API_ENDPOINTS.admin.orders.list)
      .then((d) => setOrders(d?.orders ?? d ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Orders</h1>
      {loading ? <p className="text-stone-400">Loading...</p> : orders.length === 0 ? (
        <p className="text-stone-400">No orders yet.</p>
      ) : (
        <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>{["Buyer", "Item", "Amount", "Status", "Date"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {orders.map((o: any) => (
                <tr key={o._id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 font-medium text-stone-800">{o.buyer?.name ?? "–"}</td>
                  <td className="px-4 py-3 text-stone-600 truncate max-w-[200px]">{o.listing?.title ?? "–"}</td>
                  <td className="px-4 py-3 font-semibold">KES {o.totalAmount?.toLocaleString() ?? "–"}</td>
                  <td className="px-4 py-3"><span className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded text-xs">{o.status}</span></td>
                  <td className="px-4 py-3 text-stone-400 text-xs">{new Date(o.createdAt).toLocaleDateString("en-KE")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
