"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  CHECKOUT_MERCHANT_NAME,
  CHECKOUT_TILL_NUMBER,
  SUPPORTED_DELIVERY_COUNTIES,
  formatKes,
} from "@/lib/marketplace";

const DELIVERY_FEE = 350;
const PLATFORM_FEE = 30;

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    contactPhone: user?.phone || "",
    payerPhoneSource: user?.phone ? "account" : "different",
    payerPhone: user?.phone || "",
    county: "",
    constituency: "",
    ward: "",
    approximateLocation: "",
    notes: "",
  });
  const [error, setError] = useState("");

  const total = subtotal + DELIVERY_FEE + PLATFORM_FEE;

  const summary = useMemo(
    () => [
      { label: "Subtotal", value: formatKes(subtotal) || "KES 0" },
      { label: "Delivery fee", value: formatKes(DELIVERY_FEE) || "KES 350" },
      { label: "Agrisoko fee", value: formatKes(PLATFORM_FEE) || "KES 30" },
      { label: "Total", value: formatKes(total) || "KES 0" },
    ],
    [subtotal, total]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      const response = await apiRequest(API_ENDPOINTS.orders.checkout, {
        method: "POST",
        body: JSON.stringify({
          items: items.map((item) => ({
            listingId: item.listingId,
            quantity: item.quantity,
          })),
          contactPhone: form.contactPhone,
          payerPhoneSource: form.payerPhoneSource,
          payerPhone: form.payerPhoneSource === "different" ? form.payerPhone : undefined,
          customerNote: form.notes,
          delivery: {
            county: form.county,
            constituency: form.constituency,
            ward: form.ward,
            approximateLocation: form.approximateLocation,
            notes: form.notes,
          },
        }),
      });

      const orderId = response?.data?._id || response?._id;
      if (!orderId) {
        throw new Error("Checkout succeeded but the order ID was missing from the response.");
      }

      clearCart();
      startTransition(() => {
        router.push(`/orders/${orderId}`);
      });
    } catch (checkoutError: any) {
      setError(checkoutError?.message || "Unable to submit checkout right now.");
    }
  };

  if (items.length === 0) {
    return (
      <div className="page-shell py-10 sm:py-12">
        <div className="surface-card p-10 text-center">
          <h1 className="text-3xl font-bold text-stone-900">Your cart is empty</h1>
          <p className="mt-3 text-sm text-stone-600">
            Add priced listings to your cart before starting managed checkout.
          </p>
          <Link href="/browse" className="primary-button mt-6">
            Browse listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell py-10 sm:py-12">
      <div className="mb-6">
        <p className="section-kicker">Managed checkout</p>
        <h1 className="mt-4 text-4xl font-bold text-stone-900">Confirm delivery and payment details</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600">
          Checkout on Agrisoko uses manual payment verification. Pay the till, submit the payer
          phone, and the order moves into review before fulfillment.
        </p>
      </div>

      <section className="grid gap-8 xl:grid-cols-[1fr_0.8fr]">
        <form onSubmit={handleSubmit} className="surface-card p-6 sm:p-8">
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          <div className="grid gap-5">
            <div>
              <label className="field-label">Contact phone</label>
              <input
                type="text"
                value={form.contactPhone}
                onChange={(event) => setForm((current) => ({ ...current, contactPhone: event.target.value }))}
                className="field-input"
                placeholder="07..."
                required
              />
            </div>

            <div>
              <label className="field-label">M-Pesa payer phone source</label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700">
                  <input
                    type="radio"
                    name="payerPhoneSource"
                    value="account"
                    checked={form.payerPhoneSource === "account"}
                    onChange={(event) => setForm((current) => ({ ...current, payerPhoneSource: event.target.value }))}
                    className="mr-2"
                  />
                  Use saved account phone
                </label>
                <label className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700">
                  <input
                    type="radio"
                    name="payerPhoneSource"
                    value="different"
                    checked={form.payerPhoneSource === "different"}
                    onChange={(event) => setForm((current) => ({ ...current, payerPhoneSource: event.target.value }))}
                    className="mr-2"
                  />
                  Use a different M-Pesa phone
                </label>
              </div>
            </div>

            {form.payerPhoneSource === "different" ? (
              <div>
                <label className="field-label">M-Pesa payer phone</label>
                <input
                  type="text"
                  value={form.payerPhone}
                  onChange={(event) => setForm((current) => ({ ...current, payerPhone: event.target.value }))}
                  className="field-input"
                  placeholder="07..."
                  required
                />
              </div>
            ) : null}

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="field-label">Delivery county</label>
                <select
                  value={form.county}
                  onChange={(event) => setForm((current) => ({ ...current, county: event.target.value }))}
                  className="field-select"
                  required
                >
                  <option value="">Choose county</option>
                  {SUPPORTED_DELIVERY_COUNTIES.map((county) => (
                    <option key={county} value={county}>
                      {county}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Constituency</label>
                <input
                  type="text"
                  value={form.constituency}
                  onChange={(event) => setForm((current) => ({ ...current, constituency: event.target.value }))}
                  className="field-input"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="field-label">Ward</label>
                <input
                  type="text"
                  value={form.ward}
                  onChange={(event) => setForm((current) => ({ ...current, ward: event.target.value }))}
                  className="field-input"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="field-label">Approximate location</label>
                <input
                  type="text"
                  value={form.approximateLocation}
                  onChange={(event) => setForm((current) => ({ ...current, approximateLocation: event.target.value }))}
                  className="field-input"
                  placeholder="Trading centre, stage, landmark"
                />
              </div>
            </div>

            <div>
              <label className="field-label">Delivery notes</label>
              <textarea
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                className="field-textarea"
                placeholder="Anything the seller or admin should know about delivery or contact."
              />
            </div>

            <button type="submit" disabled={isPending} className="primary-button w-full">
              {isPending ? "Submitting order..." : "Submit checkout"}
            </button>
          </div>
        </form>

        <aside className="space-y-6">
          <div className="surface-card p-6">
            <p className="section-kicker">Pay before submit</p>
            <h2 className="mt-4 text-2xl font-bold text-stone-900">Agrisoko till details</h2>
            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl bg-stone-50 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Till number</p>
                <p className="mt-1 text-xl font-bold text-stone-900">{CHECKOUT_TILL_NUMBER}</p>
              </div>
              <div className="rounded-2xl bg-stone-50 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Merchant</p>
                <p className="mt-1 text-base font-semibold text-stone-900">{CHECKOUT_MERCHANT_NAME}</p>
              </div>
            </div>
          </div>

          <div className="soft-panel p-6">
            <h2 className="text-2xl font-bold text-stone-900">Order summary</h2>
            <div className="mt-5 space-y-3 text-sm text-stone-700">
              {summary.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4">
                  <span>{row.label}</span>
                  <span className="font-semibold text-stone-900">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card p-6">
            <h2 className="text-2xl font-bold text-stone-900">Items in this checkout</h2>
            <div className="mt-5 space-y-3">
              {items.map((item) => (
                <div key={item.listingId} className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                  <p className="font-semibold text-stone-900">{item.title}</p>
                  <p className="mt-1 text-sm text-stone-600">
                    {item.quantity} {item.unit || "units"} | {formatKes(item.price) || "Price on request"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
