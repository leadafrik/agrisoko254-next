"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatKes, formatLongDate } from "@/lib/marketplace";

const STATUS_LABELS: Record<string, string> = {
  payment_review: "Payment review",
  processing: "Processing",
  delivered: "Delivered",
  cancelled: "Cancelled",
  payment_rejected: "Payment rejected",
};

const PAYMENT_LABELS: Record<string, string> = {
  submitted: "Submitted",
  verified: "Verified",
  rejected: "Rejected",
  refunded: "Refunded",
};

const SELLER_STATUS_LABELS: Record<string, string> = {
  awaiting_payment_confirmation: "Awaiting payment verification",
  ready_to_ship: "Ready to ship",
  delivery_in_progress: "Delivery in progress",
  delivered: "Delivered",
};

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest(API_ENDPOINTS.orders.byId(params.id))
      .then((response) => setOrder(response?.data ?? response))
      .catch((loadError) => setError(loadError?.message || "Unable to load the order."))
      .finally(() => setLoading(false));
  }, [params.id]);

  const financialRows = useMemo(() => {
    if (!order) return [];
    return [
      { label: "Items subtotal", value: formatKes(order.subtotal) || "KES 0" },
      { label: "Delivery fee", value: formatKes(order.deliveryFee) || "KES 0" },
      { label: "Agrisoko fee", value: formatKes(order.platformFee) || "KES 0" },
      { label: "Total", value: formatKes(order.total) || "KES 0" },
    ];
  }, [order]);

  if (loading) {
    return (
      <div className="page-shell py-10 sm:py-12">
        <div className="surface-card p-10 text-center text-stone-500">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-shell py-10 sm:py-12">
        <div className="surface-card p-10 text-center">
          <h1 className="text-3xl font-bold text-stone-900">Order not found</h1>
          <p className="mt-3 text-sm text-stone-600">{error || "This order could not be loaded."}</p>
          <Link href="/orders" className="primary-button mt-6">
            Back to orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell py-10 sm:py-12">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-stone-500">
        <Link href="/orders" className="hover:text-terra-600">
          Orders
        </Link>
        <span>/</span>
        <span className="text-stone-900">{order.orderNumber || params.id}</span>
      </nav>

      <section className="grid gap-8 xl:grid-cols-[1fr_0.8fr]">
        <div className="space-y-6">
          <div className="hero-panel p-6 sm:p-8">
            <p className="section-kicker">Marketplace order</p>
            <h1 className="mt-4 text-4xl font-bold text-stone-900">
              {order.orderNumber || "Order details"}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              Your payment and delivery progress stay visible here from submission through
              fulfillment.
            </p>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-white/85 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Order status</p>
                <p className="mt-1 font-semibold text-stone-900">
                  {STATUS_LABELS[order.orderStatus] || order.orderStatus}
                </p>
              </div>
              <div className="rounded-2xl bg-white/85 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Payment</p>
                <p className="mt-1 font-semibold text-stone-900">
                  {PAYMENT_LABELS[order.paymentStatus] || order.paymentStatus}
                </p>
              </div>
              <div className="rounded-2xl bg-white/85 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Placed</p>
                <p className="mt-1 font-semibold text-stone-900">
                  {formatLongDate(order.createdAt || order.payment?.submittedAt) || "Recently"}
                </p>
              </div>
            </div>
          </div>

          <div className="surface-card p-6">
            <h2 className="text-2xl font-bold text-stone-900">Items ordered</h2>
            <div className="mt-5 space-y-4">
              {(order.items || []).map((item: any) => (
                <div key={`${order._id}-${item.listingId}`} className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-stone-900">{item.title}</p>
                      <p className="mt-1 text-sm text-stone-600">
                        {item.quantity} {item.unit || "units"} | {item.sellerName}
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-terra-600">{formatKes(item.lineTotal) || "KES 0"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card p-6">
            <h2 className="text-2xl font-bold text-stone-900">Delivery details</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-stone-50 px-4 py-4 text-sm text-stone-700">
                <p>
                  <span className="font-semibold text-stone-900">County:</span> {order.delivery?.county || "Not set"}
                </p>
                {order.delivery?.constituency ? (
                  <p className="mt-2">
                    <span className="font-semibold text-stone-900">Constituency:</span> {order.delivery.constituency}
                  </p>
                ) : null}
                {order.delivery?.ward ? (
                  <p className="mt-2">
                    <span className="font-semibold text-stone-900">Ward:</span> {order.delivery.ward}
                  </p>
                ) : null}
                {order.delivery?.approximateLocation ? (
                  <p className="mt-2">
                    <span className="font-semibold text-stone-900">Approximate location:</span> {order.delivery.approximateLocation}
                  </p>
                ) : null}
                {order.delivery?.estimatedDeliveryDate ? (
                  <p className="mt-2">
                    <span className="font-semibold text-stone-900">Estimated delivery:</span>{" "}
                    {formatLongDate(order.delivery.estimatedDeliveryDate)}
                  </p>
                ) : null}
              </div>
              <div className="soft-panel p-4 text-sm text-stone-700">
                <p className="font-semibold text-stone-900">Payment review note</p>
                <p className="mt-2">
                  Agrisoko verifies the till payment manually before the seller starts delivery.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-card p-6">
            <h2 className="text-2xl font-bold text-stone-900">Financial summary</h2>
            <div className="mt-5 space-y-3 text-sm text-stone-700">
              {financialRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4">
                  <span>{row.label}</span>
                  <span className="font-semibold text-stone-900">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card p-6">
            <h2 className="text-2xl font-bold text-stone-900">Payment details</h2>
            <div className="mt-5 space-y-3 text-sm text-stone-700">
              <p>
                <span className="font-semibold text-stone-900">Payer phone:</span> {order.payment?.payerPhone || "Not available"}
              </p>
              <p>
                <span className="font-semibold text-stone-900">Till number:</span> {order.payment?.tillNumber || "3319295"}
              </p>
              <p>
                <span className="font-semibold text-stone-900">Invoice number:</span> {order.invoice?.invoiceNumber || "Pending"}
              </p>
            </div>
          </div>

          {Array.isArray(order.sellerFulfillment) && order.sellerFulfillment.length > 0 ? (
            <div className="surface-card p-6">
              <h2 className="text-2xl font-bold text-stone-900">Seller progress</h2>
              <div className="mt-5 space-y-3">
                {order.sellerFulfillment.map((entry: any) => (
                  <div key={`${order._id}-${entry.sellerId}`} className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4">
                    <p className="font-semibold text-stone-900">{entry.sellerName}</p>
                    <p className="mt-2 text-sm text-stone-600">
                      {SELLER_STATUS_LABELS[entry.status] || entry.status}
                    </p>
                    {entry.updatedAt ? (
                      <p className="mt-2 text-xs text-stone-500">
                        Updated {formatLongDate(entry.updatedAt)}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
