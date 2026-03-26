"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

export default function PostBuyRequestPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    productType: "",
    quantity: "",
    unit: "",
    budget: "",
    county: "",
    urgency: "medium",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await apiRequest(API_ENDPOINTS.buyerRequests.create, {
        method: "POST",
        body: JSON.stringify({
          marketType: "standard",
          title: form.title,
          description: form.description,
          category: form.category,
          productType: form.productType || undefined,
          quantity: form.quantity ? Number(form.quantity) : undefined,
          unit: form.unit || undefined,
          urgency: form.urgency,
          budget: form.budget
            ? {
                min: Number(form.budget),
                max: Number(form.budget),
                currency: "KES",
              }
            : undefined,
          location: {
            county: form.county,
          },
        }),
      });
      router.push("/request");
    } catch (submitError: any) {
      setError(submitError?.message || "Unable to post the buyer request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell py-10 sm:py-12">
      <section className="hero-panel p-6 sm:p-8">
        <p className="section-kicker">Buyer request</p>
        <h1 className="mt-4 text-4xl font-bold text-stone-900">Post a clear demand signal</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600">
          Tell suppliers exactly what you need, where you need it, and how urgent the demand is.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="surface-card mt-8 p-6 sm:p-8">
        {error ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-5">
          <div>
            <label className="field-label">Request title</label>
            <input
              type="text"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Example: Need dry maize in 90kg bags"
              className="field-input"
              required
            />
          </div>

          <div>
            <label className="field-label">Description</label>
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Describe quality, packaging, timing, and any delivery constraints."
              className="field-textarea"
              required
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="field-label">Category</label>
              <select
                value={form.category}
                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                className="field-select"
                required
              >
                <option value="">Select category</option>
                <option value="produce">Produce</option>
                <option value="livestock">Livestock</option>
                <option value="inputs">Inputs</option>
                <option value="service">Services</option>
              </select>
            </div>
            <div>
              <label className="field-label">County</label>
              <input
                type="text"
                value={form.county}
                onChange={(event) => setForm((current) => ({ ...current, county: event.target.value }))}
                placeholder="Example: Nairobi"
                className="field-input"
                required
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="field-label">Product type</label>
              <input
                type="text"
                value={form.productType}
                onChange={(event) => setForm((current) => ({ ...current, productType: event.target.value }))}
                placeholder="Optional detail"
                className="field-input"
              />
            </div>
            <div>
              <label className="field-label">Quantity</label>
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))}
                placeholder="Optional"
                className="field-input"
              />
            </div>
            <div>
              <label className="field-label">Unit</label>
              <input
                type="text"
                value={form.unit}
                onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))}
                placeholder="kg, bags, crates..."
                className="field-input"
              />
            </div>
            <div>
              <label className="field-label">Budget in KES</label>
              <input
                type="number"
                min="1"
                value={form.budget}
                onChange={(event) => setForm((current) => ({ ...current, budget: event.target.value }))}
                placeholder="Optional"
                className="field-input"
              />
            </div>
          </div>

          <div>
            <label className="field-label">Urgency</label>
            <select
              value={form.urgency}
              onChange={(event) => setForm((current) => ({ ...current, urgency: event.target.value }))}
              className="field-select"
            >
              <option value="high">Urgent</option>
              <option value="medium">Within a week</option>
              <option value="low">Can wait</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="primary-button w-full">
            {loading ? "Posting request..." : "Post buyer request"}
          </button>
        </div>
      </form>
    </div>
  );
}
