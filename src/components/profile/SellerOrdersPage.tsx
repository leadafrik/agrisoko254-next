"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatKes, formatLongDate } from "@/lib/marketplace";

const SELLER_STATUS_LABELS: Record<string, string> = {
  awaiting_payment_confirmation: "Awaiting payment confirmation",
  ready_to_ship: "Ready to ship",
  delivery_in_progress: "Delivery in progress",
  delivered: "Delivered",
};

const PAYMENT_LABELS: Record<string, string> = {
  submitted: "Submitted",
  verified: "Verified",
  rejected: "Rejected",
  refunded: "Refunded",
};

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workingId, setWorkingId] = useState("");

  const loadOrders = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await apiRequest(API_ENDPOINTS.orders.seller.list);
      const nextOrders = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.orders)
          ? response.orders
          : Array.isArray(response)
            ? response
            : [];
      setOrders(nextOrders);
    } catch (loadError: any) {
      setError(loadError?.message || "Unable to load seller orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, []);

  const updateStatus = async (orderId: string, status: "delivery_in_progress" | "delivered") => {
    setWorkingId(orderId);
    setError("");
    try {
      await apiRequest(API_ENDPOINTS.orders.seller.fulfillment(orderId), {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      await loadOrders();
    } catch (updateError: any) {
      setError(updateError?.message || "Unable to update seller fulfillment.");
    } finally {
      setWorkingId("");
    }
  };

  return (
    <div className="page-shell py-10 sm:py-12">
      <div className="mb-6">
        <p className="section-kicker">Seller fulfillment</p>
        <h1 className="mt-4 text-4xl font-bold text-stone-900">
          Manage delivery after payment clears
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600">
          Seller orders appear here once buyers complete managed checkout and the order is linked
          to your listing.
        </p>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="surface-card p-10 text-center text-stone-500">Loading seller orders...</div>
      ) : orders.length === 0 ? (
        <div className="surface-card p-10 text-center">
          <h2 className="text-2xl font-bold text-stone-900">No seller orders yet</h2>
          <p className="mt-3 text-sm text-stone-600">
            Once a buyer checks out against one of your listings, fulfillment work will appear
            here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const sellerStatus = order.sellerFulfillment?.status || "awaiting_payment_confirmation";
            const canStart = order.paymentStatus === "verified" && sellerStatus === "ready_to_ship";
            const canComplete =
              order.paymentStatus === "verified" &&
              (sellerStatus === "ready_to_ship" || sellerStatus === "delivery_in_progress");

            return (
              <div key={order._id} className="surface-card p-6">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-bold text-stone-900">{order.orderNumber}</h2>
                      <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-600">
                        {PAYMENT_LABELS[order.paymentStatus] || order.paymentStatus}
                      </span>
                      <span className="rounded-full border border-terra-200 bg-terra-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-terra-700">
                        {SELLER_STATUS_LABELS[sellerStatus] || sellerStatus}
                      </span>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      <div className="rounded-2xl bg-stone-50 px-4 py-3">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">
                          Buyer
                        </p>
                        <p className="mt-1 font-semibold text-stone-900">
                          {order.buyerSnapshot?.fullName || "Buyer"}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-stone-50 px-4 py-3">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">
                          County
                        </p>
                        <p className="mt-1 font-semibold text-stone-900">
                          {order.delivery?.county || "Not set"}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-stone-50 px-4 py-3">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">
                          Seller subtotal
                        </p>
                        <p className="mt-1 font-semibold text-stone-900">
                          {formatKes(order.sellerSubtotal) || "KES 0"}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {(order.items || []).map((item: any) => (
                        <div
                          key={`${order._id}-${item.listingId}`}
                          className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4"
                        >
                          <p className="font-semibold text-stone-900">{item.title}</p>
                          <p className="mt-1 text-sm text-stone-600">
                            {item.quantity} {item.unit || "units"} |{" "}
                            {formatKes(item.lineTotal) || "KES 0"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="w-full max-w-sm space-y-4">
                    <div className="soft-panel p-4 text-sm text-stone-700">
                      <p className="font-semibold text-stone-900">Delivery target</p>
                      <p className="mt-2">
                        {formatLongDate(order.delivery?.estimatedDeliveryDate) ||
                          "Delivery date pending"}
                      </p>
                    </div>

                    <div className="surface-card p-4">
                      <p className="text-sm font-semibold text-stone-900">Seller actions</p>
                      <div className="mt-3 grid gap-3">
                        <button
                          type="button"
                          disabled={!canStart || workingId === order._id}
                          onClick={() => void updateStatus(order._id, "delivery_in_progress")}
                          className="secondary-button w-full disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Start delivery
                        </button>
                        <button
                          type="button"
                          disabled={!canComplete || workingId === order._id}
                          onClick={() => void updateStatus(order._id, "delivered")}
                          className="primary-button w-full disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Mark delivered
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
