"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { kenyaCounties } from "@/data/kenyaCounties";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

type Props = {
  requestId: string;
  requestTitle: string;
  requestCategory: string;
  requestQuantity?: string | number;
  requestUnit?: string;
  requestBudget?: { min?: number; max?: number };
  requestLocation?: string;
};

type FormState = {
  pricePerUnit: string;
  quantityAvailable: string;
  unit: string;
  county: string;
  canDeliver: "yes" | "no" | "negotiate";
  deliveryDate: string;
  message: string;
  contactPhone: string;
};

const DELIVER_OPTIONS: Array<{
  value: FormState["canDeliver"];
  label: string;
  hint: string;
}> = [
  { value: "yes", label: "Yes, I can deliver", hint: "I can bring stock to the buyer" },
  { value: "no", label: "Collection only", hint: "Buyer collects from my location" },
  { value: "negotiate", label: "Open to discuss", hint: "Depends on quantity and distance" },
];

function formatDeliveryChoice(choice: FormState["canDeliver"]) {
  if (choice === "yes") return "Seller can deliver";
  if (choice === "no") return "Buyer collection only";
  return "Delivery terms open for discussion";
}

export default function RespondToRequestForm({
  requestId,
  requestTitle,
  requestCategory,
  requestQuantity,
  requestUnit,
  requestBudget,
  requestLocation,
}: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const countyOptions = useMemo(() => kenyaCounties.map((county) => county.name), []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState<FormState>({
    pricePerUnit: "",
    quantityAvailable: String(requestQuantity ?? ""),
    unit: requestUnit ?? "kg",
    county: user?.county ?? "",
    canDeliver: "negotiate",
    deliveryDate: "",
    message: "",
    contactPhone: user?.phone ?? "",
  });

  const setField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const totalValue =
    form.pricePerUnit && form.quantityAvailable
      ? Number(form.pricePerUnit) * Number(form.quantityAvailable)
      : null;

  const withinBudget =
    totalValue !== null && requestBudget
      ? requestBudget.max
        ? totalValue <= requestBudget.max
        : requestBudget.min
        ? totalValue >= requestBudget.min
        : true
      : null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.pricePerUnit.trim()) {
      setError("Add the price you are offering per unit.");
      return;
    }
    if (!form.quantityAvailable.trim()) {
      setError("Add the quantity you can supply.");
      return;
    }
    if (!form.county.trim()) {
      setError("Select your supply county.");
      return;
    }
    if (!form.deliveryDate.trim()) {
      setError("Add the earliest delivery date you can meet.");
      return;
    }
    if (!form.message.trim()) {
      setError("Add a message to the buyer.");
      return;
    }
    if (!form.contactPhone.trim()) {
      setError("Add a contact phone number.");
      return;
    }

    const quoteAmount = Number(form.pricePerUnit) * Number(form.quantityAvailable);
    if (!Number.isFinite(quoteAmount) || quoteAmount <= 0) {
      setError("Enter a valid price and quantity.");
      return;
    }

    setLoading(true);
    setError("");

    const unitLabel = form.unit.trim() || "unit";
    const structuredMessage = [
      `Offer price: KES ${Number(form.pricePerUnit).toLocaleString()} per ${unitLabel}`,
      `Quantity available: ${Number(form.quantityAvailable).toLocaleString()} ${unitLabel}`,
      `Supply county: ${form.county.trim()}`,
      `Delivery: ${formatDeliveryChoice(form.canDeliver)}`,
      `Contact phone: ${form.contactPhone.trim()}`,
      "",
      form.message.trim(),
    ].join("\n");

    try {
      await apiRequest(API_ENDPOINTS.buyerRequests.deliveryOffer(requestId), {
        method: "POST",
        body: JSON.stringify({
          quoteAmount,
          deliveryDate: form.deliveryDate,
          message: structuredMessage,
        }),
      });

      setSuccess("Your offer has been sent to the buyer.");
      setTimeout(() => router.push("/request"), 1200);
    } catch (err: any) {
      setError(err?.message ?? "Unable to send your response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell py-10 sm:py-12">
      <nav className="mb-6 flex items-center gap-1 text-sm text-stone-500">
        <Link href="/request" className="hover:text-terra-600">
          Buy Requests
        </Link>
        <span>/</span>
        <Link href={`/request/${requestId}`} className="max-w-[200px] truncate hover:text-terra-600">
          {requestTitle}
        </Link>
        <span>/</span>
        <span className="text-stone-800">Respond</span>
      </nav>

      <div className="grid gap-8 xl:grid-cols-[1fr_0.86fr]">
        <form onSubmit={handleSubmit} className="surface-card p-6 sm:p-8">
          <p className="section-kicker">Seller response</p>
          <h1 className="mt-3 text-3xl font-bold text-stone-900">Respond to this request</h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-500">
            Give the buyer enough to make a quick decision: price, quantity, where the stock is, and whether you can deliver.
          </p>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-5 rounded-2xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm font-medium text-forest-800">
              {success}
            </div>
          )}

          <div className="mt-8 grid gap-6">
            <div className="grid gap-5 sm:grid-cols-4">
              <div>
                <label className="field-label">Price per unit (KES)</label>
                <input
                  type="number"
                  min="1"
                  value={form.pricePerUnit}
                  onChange={(event) => setField("pricePerUnit", event.target.value)}
                  placeholder="e.g. 3200"
                  className="field-input"
                  required
                />
              </div>
              <div>
                <label className="field-label">Quantity you can supply</label>
                <input
                  type="number"
                  min="1"
                  value={form.quantityAvailable}
                  onChange={(event) => setField("quantityAvailable", event.target.value)}
                  className="field-input"
                  required
                />
              </div>
              <div>
                <label className="field-label">Unit</label>
                <input
                  type="text"
                  value={form.unit}
                  onChange={(event) => setField("unit", event.target.value)}
                  placeholder="bags, kg, crates"
                  className="field-input"
                  required
                />
              </div>
              <div>
                <label className="field-label">Earliest delivery date</label>
                <input
                  type="date"
                  value={form.deliveryDate}
                  onChange={(event) => setField("deliveryDate", event.target.value)}
                  className="field-input"
                  required
                />
              </div>
            </div>

            <div>
              <label className="field-label">Delivery</label>
              <div className="grid gap-3 sm:grid-cols-3">
                {DELIVER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setField("canDeliver", option.value)}
                    className={`rounded-[24px] border px-5 py-4 text-left transition ${
                      form.canDeliver === option.value
                        ? "border-terra-300 bg-terra-50"
                        : "border-stone-200 bg-stone-50 hover:border-terra-200"
                    }`}
                  >
                    <p className="font-semibold text-stone-900">{option.label}</p>
                    <p className="mt-1 text-xs text-stone-500">{option.hint}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="field-label">Your supply county</label>
              <select
                value={form.county}
                onChange={(event) => setField("county", event.target.value)}
                className="field-select"
                required
              >
                <option value="">Select county</option>
                {countyOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label">Message to buyer</label>
              <textarea
                value={form.message}
                onChange={(event) => setField("message", event.target.value)}
                placeholder="Describe your stock: variety, quality, moisture level, packaging, timing, and anything else that helps the buyer decide quickly."
                className="field-textarea"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="field-label">Your contact phone</label>
              <input
                type="text"
                value={form.contactPhone}
                onChange={(event) => setField("contactPhone", event.target.value)}
                placeholder="07..."
                className="field-input"
                required
              />
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-stone-100 pt-4">
              <Link href={`/request/${requestId}`} className="secondary-button">
                Cancel
              </Link>
              <button type="submit" disabled={loading} className="primary-button">
                {loading ? "Sending offer..." : "Send offer to buyer"}
              </button>
            </div>
          </div>
        </form>

        <aside className="space-y-5">
          <div className="surface-card p-6">
            <p className="section-kicker">{requestCategory}</p>
            <h2 className="mt-3 text-2xl font-bold text-stone-900">{requestTitle}</h2>

            <div className="mt-5 grid gap-3">
              {(requestQuantity || requestUnit) && (
                <div className="rounded-2xl bg-stone-50 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">They need</p>
                  <p className="mt-1 font-semibold text-stone-900">
                    {requestQuantity} {requestUnit}
                  </p>
                </div>
              )}

              {requestBudget && (requestBudget.min || requestBudget.max) && (
                <div className="rounded-2xl bg-stone-50 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Budget</p>
                  <p className="mt-1 font-semibold text-stone-900">
                    {requestBudget.min && requestBudget.max
                      ? `KES ${requestBudget.min.toLocaleString()} - ${requestBudget.max.toLocaleString()}`
                      : requestBudget.max
                      ? `Up to KES ${requestBudget.max.toLocaleString()}`
                      : `From KES ${requestBudget.min?.toLocaleString()}`}
                  </p>
                </div>
              )}

              {requestLocation && (
                <div className="rounded-2xl bg-stone-50 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Delivery to</p>
                  <p className="mt-1 font-semibold text-stone-900">{requestLocation}</p>
                </div>
              )}
            </div>
          </div>

          {(form.pricePerUnit || form.quantityAvailable) && (
            <div className="soft-panel p-6">
              <p className="section-kicker">Your offer</p>
              <p className="mt-3 text-3xl font-bold text-stone-900">
                {form.pricePerUnit
                  ? `KES ${Number(form.pricePerUnit).toLocaleString()} / ${form.unit || "unit"}`
                  : "-"}
              </p>
              {totalValue !== null && (
                <p className="mt-1 text-sm text-stone-500">
                  Total: KES {totalValue.toLocaleString()} for {form.quantityAvailable} {form.unit}
                </p>
              )}
              {withinBudget !== null && (
                <p className={`mt-2 text-sm font-semibold ${withinBudget ? "text-forest-700" : "text-amber-700"}`}>
                  {withinBudget ? "Within buyer budget" : "Above buyer budget - explain the value clearly"}
                </p>
              )}
            </div>
          )}

          <div className="surface-card p-6">
            <h3 className="font-semibold text-stone-800">What makes a good response?</h3>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-stone-600">
              <li>State variety, grade, or quality - buyers cannot see your stock</li>
              <li>Be honest about quantity - overpromising kills trust</li>
              <li>Mention if transport or packaging is included in your price</li>
              <li>Respond quickly - buyers contact the first clear offer</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
