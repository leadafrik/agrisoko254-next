"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  TRACKED_INTELLIGENCE_MARKETS,
  TRACKED_INTELLIGENCE_PRODUCTS,
  formatIntelligenceDate,
  formatKes,
} from "@/lib/market-intelligence";

type Submission = {
  id: string;
  productKey: string;
  productName: string;
  category: "produce" | "inputs";
  county: string;
  marketName: string;
  price: number;
  unit: string;
  observationDate: string | null;
  notes: string;
  sourceType: string;
  sourceLabel: string;
  contributorName: string;
  contributorPhone: string;
  reviewStatus: "pending" | "approved" | "rejected";
  reviewNote: string;
  createdAt: string | null;
};

type Summary = {
  pending: number;
  approved: number;
  rejected: number;
};

const defaultAdminForm = {
  productKey: "maize",
  county: "Nairobi",
  marketName: "Wakulima Market",
  unit: "90kg bag",
  price: "",
  observationDate: new Date().toISOString().slice(0, 10),
  notes: "",
  sourceType: "admin",
  sourceLabel: "Agrisoko market desk",
};

export default function AdminMarketIntelligencePage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [summary, setSummary] = useState<Summary>({ pending: 0, approved: 0, rejected: 0 });
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected">(
    "pending"
  );
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultAdminForm);
  const [saving, setSaving] = useState(false);
  const [seedingBaseline, setSeedingBaseline] = useState<"maize" | "onions" | null>(null);
  const [seedMessage, setSeedMessage] = useState("");

  const selectedProduct =
    TRACKED_INTELLIGENCE_PRODUCTS.find((item) => item.key === form.productKey) ||
    TRACKED_INTELLIGENCE_PRODUCTS[0];

  const fetchSubmissions = useCallback(async (nextStatus = statusFilter) => {
    setLoading(true);
    try {
      const response = await adminApiRequest(
        `${API_ENDPOINTS.marketIntelligence.admin.submissions}?status=${nextStatus}`
      );
      setSubmissions(Array.isArray(response?.data) ? (response.data as Submission[]) : []);
      setSummary(
        (response?.summary || { pending: 0, approved: 0, rejected: 0 }) as Summary
      );
    } catch {
      // Leave stale state in place if the request fails.
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void fetchSubmissions(statusFilter);
  }, [fetchSubmissions, statusFilter]);

  useEffect(() => {
    setForm((current) => {
      if (current.unit === selectedProduct.defaultUnit) return current;
      return { ...current, unit: selectedProduct.defaultUnit };
    });
  }, [selectedProduct.defaultUnit]);

  const handleReview = async (
    submissionId: string,
    reviewStatus: "approved" | "rejected"
  ) => {
    setReviewingId(submissionId);
    try {
      await adminApiRequest(API_ENDPOINTS.marketIntelligence.admin.review(submissionId), {
        method: "PATCH",
        body: JSON.stringify({ reviewStatus }),
      });
      await fetchSubmissions(statusFilter);
    } catch {
      // Ignore inline review failures and leave the row visible.
    } finally {
      setReviewingId(null);
    }
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await adminApiRequest(API_ENDPOINTS.marketIntelligence.admin.submissions, {
        method: "POST",
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          reviewStatus: "approved",
        }),
      });
      setForm(defaultAdminForm);
      await fetchSubmissions(statusFilter);
    } catch {
      // Keep current form state so the admin can correct and retry.
    } finally {
      setSaving(false);
    }
  };

  const handleSeedBaseline = async (commodity: "maize" | "onions") => {
    setSeedingBaseline(commodity);
    setSeedMessage("");
    try {
      const endpoint =
        commodity === "maize"
          ? API_ENDPOINTS.marketIntelligence.admin.seedMaizeBaseline
          : API_ENDPOINTS.marketIntelligence.admin.seedOnionBaseline;
      const response = await adminApiRequest(
        endpoint,
        { method: "POST" }
      );
      setSeedMessage(
        response?.message ||
          `Imported ${response?.data?.imported || 0} ${commodity} baseline entries into the database.`
      );
      await fetchSubmissions(statusFilter);
    } catch (error: any) {
      setSeedMessage(
        error?.message || `Unable to import the ${commodity} baseline right now.`
      );
    } finally {
      setSeedingBaseline(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Market Intelligence</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-500">
            Review crowdsourced price submissions, keep the public board clean, and seed starter
            prices from the Agrisoko market desk when needed.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleSeedBaseline("maize")}
              disabled={Boolean(seedingBaseline)}
              className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 disabled:opacity-60"
            >
              {seedingBaseline === "maize" ? "Importing..." : "Import maize baseline"}
            </button>
            <button
              type="button"
              onClick={() => void handleSeedBaseline("onions")}
              disabled={Boolean(seedingBaseline)}
              className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 disabled:opacity-60"
            >
              {seedingBaseline === "onions" ? "Importing..." : "Import onion baseline"}
            </button>
            {seedMessage ? (
              <p className="self-center text-sm text-stone-500">{seedMessage}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[360px]">
          {[
            { label: "Pending", value: summary.pending },
            { label: "Approved", value: summary.approved },
            { label: "Rejected", value: summary.rejected },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-stone-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                {item.label}
              </p>
              <p className="mt-2 text-3xl font-bold text-stone-900">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
        <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_20px_60px_-40px_rgba(28,25,23,0.22)]">
          <h2 className="text-xl font-bold text-stone-900">Seed an approved price</h2>
          <p className="mt-2 text-sm text-stone-500">
            Use this when the Agrisoko team confirms a market rate directly and wants it live
            immediately.
          </p>

          <form onSubmit={handleCreate} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="mb-1.5 block text-sm font-medium text-stone-700">Product</span>
                <select
                  value={form.productKey}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, productKey: event.target.value }))
                  }
                  className="field-select"
                >
                  {TRACKED_INTELLIGENCE_PRODUCTS.map((product) => (
                    <option key={product.key} value={product.key}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-medium text-stone-700">Unit</span>
                <input
                  value={form.unit}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, unit: event.target.value }))
                  }
                  className="field-input"
                  required
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="mb-1.5 block text-sm font-medium text-stone-700">County</span>
                <select
                  value={form.county}
                  onChange={(event) => {
                    const nextCounty = event.target.value;
                    const preferredMarket = TRACKED_INTELLIGENCE_MARKETS.find(
                      (item) => item.county === nextCounty
                    );
                    setForm((current) => ({
                      ...current,
                      county: nextCounty,
                      marketName: preferredMarket?.marketName || current.marketName,
                    }));
                  }}
                  className="field-select"
                >
                  {Array.from(new Set(TRACKED_INTELLIGENCE_MARKETS.map((item) => item.county))).map(
                    (county) => (
                      <option key={county} value={county}>
                        {county}
                      </option>
                    )
                  )}
                </select>
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-medium text-stone-700">Market name</span>
                <input
                  value={form.marketName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, marketName: event.target.value }))
                  }
                  className="field-input"
                  required
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="mb-1.5 block text-sm font-medium text-stone-700">Price in KES</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.price}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, price: event.target.value }))
                  }
                  className="field-input"
                  required
                />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-medium text-stone-700">
                  Observation date
                </span>
                <input
                  type="date"
                  value={form.observationDate}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, observationDate: event.target.value }))
                  }
                  className="field-input"
                  required
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="mb-1.5 block text-sm font-medium text-stone-700">Source type</span>
                <select
                  value={form.sourceType}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, sourceType: event.target.value }))
                  }
                  className="field-select"
                >
                  <option value="admin">Admin verified</option>
                  <option value="external">External source</option>
                </select>
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-medium text-stone-700">
                  Source label
                </span>
                <input
                  value={form.sourceLabel}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, sourceLabel: event.target.value }))
                  }
                  className="field-input"
                  placeholder="Agrisoko market desk"
                />
              </label>
            </div>

            <label>
              <span className="mb-1.5 block text-sm font-medium text-stone-700">Notes</span>
              <textarea
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({ ...current, notes: event.target.value }))
                }
                className="field-textarea"
                placeholder="Transport shortage, oversupply, premium grade, county harvest pressure..."
              />
            </label>

            <button type="submit" disabled={saving} className="primary-button">
              {saving ? "Saving..." : "Publish approved price"}
            </button>
          </form>
        </section>

        <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_20px_60px_-40px_rgba(28,25,23,0.22)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-stone-900">Submission queue</h2>
              <p className="mt-1 text-sm text-stone-500">
                Moderate field submissions before they influence public pricing.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {(["pending", "approved", "rejected"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    statusFilter === status
                      ? "bg-stone-900 text-white"
                      : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {status[0].toUpperCase()}
                  {status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <p className="text-sm text-stone-500">Loading submissions...</p>
            ) : submissions.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-stone-200 bg-[#fbf8f2] px-4 py-5 text-sm text-stone-500">
                No {statusFilter} market price submissions right now.
              </p>
            ) : (
              submissions.map((submission) => (
                <article
                  key={submission.id}
                  className="rounded-[24px] border border-stone-200 bg-[#fbf8f2] p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-terra-700">
                          {submission.productName}
                        </span>
                        <span className="rounded-full border border-stone-200 px-3 py-1 text-xs font-semibold text-stone-500">
                          {submission.unit}
                        </span>
                        <span className="rounded-full border border-stone-200 px-3 py-1 text-xs font-semibold text-stone-500">
                          {submission.sourceType}
                        </span>
                      </div>

                      <h3 className="mt-3 text-2xl font-bold text-stone-900">
                        {formatKes(submission.price)}
                      </h3>
                      <p className="mt-1 text-sm text-stone-600">
                        {submission.marketName}, {submission.county}
                      </p>
                      <p className="mt-3 text-xs text-stone-500">
                        {submission.contributorName || "Unlabeled contributor"}
                        {submission.contributorPhone ? ` • ${submission.contributorPhone}` : ""}
                        {" • "}
                        Observed {formatIntelligenceDate(submission.observationDate)}
                      </p>
                      {submission.notes ? (
                        <p className="mt-3 text-sm leading-relaxed text-stone-600">
                          {submission.notes}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 flex-col gap-2">
                      {submission.reviewStatus === "pending" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => void handleReview(submission.id, "approved")}
                            disabled={reviewingId === submission.id}
                            className="rounded-xl bg-forest-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-forest-700 disabled:opacity-50"
                          >
                            {reviewingId === submission.id ? "Working..." : "Approve"}
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleReview(submission.id, "rejected")}
                            disabled={reviewingId === submission.id}
                            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-600">
                          {submission.reviewStatus}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
