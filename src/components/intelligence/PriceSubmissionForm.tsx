"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  type IntelligenceOverview,
  type IntelligenceSubmissionFeedback,
  TRACKED_INTELLIGENCE_MARKETS,
  TRACKED_INTELLIGENCE_PRODUCTS,
  formatKes,
  getFallbackIntelligenceOverview,
  getFallbackProductSnapshot,
  normalizeIntelligenceOverview,
  normalizeSubmissionFeedback,
} from "@/lib/market-intelligence";
import InvitePriceButton from "./InvitePriceButton";

type Props = {
  defaults?: { product?: string; county?: string; market?: string; unit?: string };
  initialOverview?: IntelligenceOverview;
};

type SubmissionState = {
  productKey: string;
  productName: string;
  county: string;
  marketName: string;
  unit: string;
  feedback: IntelligenceSubmissionFeedback | null;
};

const todayInputValue = new Date().toISOString().slice(0, 10);

const normalizeText = (value?: string | null) =>
  String(value || "").trim().toLowerCase();

const buildFeedbackCopy = (feedback: IntelligenceSubmissionFeedback) => {
  if (feedback.comparisonLabel === "above")
    return `Your price is ${Math.abs(feedback.deltaPercentage).toFixed(1)}% above the current approved average.`;
  if (feedback.comparisonLabel === "below")
    return `Your price is ${Math.abs(feedback.deltaPercentage).toFixed(1)}% below the current approved average.`;
  return "Your price sits close to the current approved average.";
};

export default function PriceSubmissionForm({ defaults, initialOverview }: Props) {
  const { isAuthenticated, user } = useAuth();
  const [overview, setOverview] = useState<IntelligenceOverview>(
    initialOverview || getFallbackIntelligenceOverview()
  );
  const [form, setForm] = useState({
    productKey: defaults?.product || "maize",
    county: defaults?.county || "Nairobi",
    marketName: defaults?.market || "Wakulima Market",
    unit: defaults?.unit || "90kg bag",
    price: "",
    observationDate: todayInputValue,
    notes: "",
    contributorName: user?.fullName || user?.name || "",
    contributorPhone: user?.phone || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<SubmissionState | null>(null);

  const selectedProduct =
    TRACKED_INTELLIGENCE_PRODUCTS.find((p) => p.key === form.productKey) ||
    TRACKED_INTELLIGENCE_PRODUCTS[0];

  const board = [...overview.produceBoard, ...overview.fertilizerBoard];
  const selectedSnapshot =
    board.find((p) => p.productKey === form.productKey) ||
    getFallbackProductSnapshot(form.productKey) ||
    getFallbackProductSnapshot("maize")!;

  // Sync user details into form
  useEffect(() => {
    setForm((c) => ({
      ...c,
      contributorName: c.contributorName || user?.fullName || user?.name || "",
      contributorPhone: c.contributorPhone || user?.phone || "",
    }));
  }, [user?.fullName, user?.name, user?.phone]);

  // Sync unit when product changes
  useEffect(() => {
    if (defaults?.unit) return;
    setForm((c) =>
      c.unit === selectedProduct.defaultUnit ? c : { ...c, unit: selectedProduct.defaultUnit }
    );
  }, [defaults?.unit, selectedProduct.defaultUnit]);

  // Auto-pick best market when county doesn't match
  useEffect(() => {
    if (!selectedSnapshot.markets.length) return;
    const hasMatch = selectedSnapshot.markets.some(
      (m) =>
        normalizeText(m.county) === normalizeText(form.county) &&
        normalizeText(m.marketName) === normalizeText(form.marketName)
    );
    if (hasMatch) return;
    const next = selectedSnapshot.bestMarket || selectedSnapshot.markets[0];
    if (!next) return;
    setForm((c) => {
      if (
        normalizeText(c.county) === normalizeText(next.county) &&
        normalizeText(c.marketName) === normalizeText(next.marketName)
      ) return c;
      return { ...c, county: next.county, marketName: next.marketName };
    });
  }, [form.county, form.marketName, selectedSnapshot]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await apiRequest(API_ENDPOINTS.marketIntelligence.submissions, {
        method: "POST",
        body: JSON.stringify({
          productKey: form.productKey,
          county: form.county,
          marketName: form.marketName,
          unit: form.unit,
          price: Number(form.price),
          observationDate: form.observationDate,
          notes: form.notes,
          contributorName: form.contributorName,
          contributorPhone: form.contributorPhone,
        }),
      });
      setSuccess({
        productKey: form.productKey,
        productName: selectedProduct.name,
        county: form.county,
        marketName: form.marketName,
        unit: form.unit,
        feedback: normalizeSubmissionFeedback(response?.feedback),
      });
      setForm((c) => ({ ...c, price: "", notes: "" }));

      // Quietly refresh overview in background
      fetch(API_ENDPOINTS.marketIntelligence.overview, { cache: "no-store", credentials: "include" })
        .then((r) => r.ok ? r.json() : null)
        .then((data) => { if (data) setOverview(normalizeIntelligenceOverview(data)); })
        .catch(() => {});
    } catch (err: any) {
      setError(err?.message || "Could not save right now. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const countyList = Array.from(new Set(TRACKED_INTELLIGENCE_MARKETS.map((m) => m.county))).sort();

  // Success screen
  if (success) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="rounded-[28px] border border-forest-200 bg-forest-50 p-8 shadow-[0_20px_50px_-36px_rgba(39,174,96,0.3)]">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-600 text-white">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-stone-900">Price report received</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Your report for {success.marketName}, {success.county} is in review. Approved reports
            update the live board automatically.
          </p>

          {success.feedback && (
            <div className="mt-5 rounded-[22px] border border-forest-200 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest-700">
                Impact
              </p>
              <p className="mt-2 text-sm font-semibold text-stone-900">
                {success.feedback.reportsToday} report{success.feedback.reportsToday !== 1 ? "s" : ""} logged today
              </p>
              <p className="mt-1 text-sm text-stone-600">{buildFeedbackCopy(success.feedback)}</p>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3">
            <Link
              href={`/market-intelligence/${success.productKey}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-forest-700 hover:text-forest-800"
            >
              View {success.productName} board <ArrowRight className="h-4 w-4" />
            </Link>
            <InvitePriceButton
              productKey={success.productKey}
              productName={success.productName}
              county={success.county}
              marketName={success.marketName}
              unit={success.unit}
            />
            <button
              type="button"
              onClick={() => setSuccess(null)}
              className="text-sm font-semibold text-stone-500 hover:text-stone-800"
            >
              Submit another price
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <p className="section-kicker">Submit a price</p>
        <h1 className="mt-3 text-3xl font-bold text-stone-900 sm:text-4xl">
          What did {selectedProduct.name.toLowerCase()} sell for today?
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          One clean observation helps every farmer in your county. Takes 30 seconds.
        </p>
      </div>

      {/* Commodity pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TRACKED_INTELLIGENCE_PRODUCTS.filter((p) => p.category === "produce").map((p) => {
          const snap = board.find((b) => b.productKey === p.key);
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => setForm((c) => ({ ...c, productKey: p.key }))}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                form.productKey === p.key
                  ? "border-terra-400 bg-terra-500 text-white shadow-sm"
                  : "border-stone-200 bg-white text-stone-600 hover:border-terra-200 hover:text-terra-700"
              }`}
            >
              {p.name}
              {snap && snap.overallAverage > 0 && (
                <span className={`ml-1.5 text-[11px] ${form.productKey === p.key ? "text-white/70" : "text-stone-400"}`}>
                  avg {formatKes(snap.overallAverage)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Compact context chip */}
      {selectedSnapshot.bestMarket && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-[20px] border border-stone-200 bg-[#faf7f2] px-4 py-3 text-sm">
          <span className="font-semibold text-stone-700">{selectedProduct.name}</span>
          <span className="text-stone-400">·</span>
          <span className="text-stone-600">
            Board avg <span className="font-bold text-stone-900">{formatKes(selectedSnapshot.overallAverage)}</span>
          </span>
          <span className="text-stone-400">·</span>
          <span className="text-stone-600">
            Best: <span className="font-bold text-green-700">{formatKes(selectedSnapshot.bestMarket.avgPrice)}</span> in {selectedSnapshot.bestMarket.county}
          </span>
        </div>
      )}

      {/* Form */}
      <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_20px_60px_-36px_rgba(120,83,47,0.3)] sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Product + County */}
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="field-label">Product</span>
              <select
                value={form.productKey}
                onChange={(e) => setForm((c) => ({ ...c, productKey: e.target.value }))}
                className="field-select"
              >
                {TRACKED_INTELLIGENCE_PRODUCTS.map((p) => (
                  <option key={p.key} value={p.key}>{p.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="field-label">County</span>
              <select
                value={form.county}
                onChange={(e) => {
                  const nextCounty = e.target.value;
                  const preferred = TRACKED_INTELLIGENCE_MARKETS.find((m) => m.county === nextCounty);
                  setForm((c) => ({
                    ...c,
                    county: nextCounty,
                    marketName: preferred?.marketName || c.marketName,
                  }));
                }}
                className="field-select"
              >
                {countyList.map((county) => (
                  <option key={county} value={county}>{county}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Market + Unit */}
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="field-label">Market name</span>
              <input
                value={form.marketName}
                onChange={(e) => setForm((c) => ({ ...c, marketName: e.target.value }))}
                className="field-input"
                placeholder="Wakulima Market"
                required
              />
            </label>
            <label>
              <span className="field-label">Unit</span>
              <input
                value={form.unit}
                onChange={(e) => setForm((c) => ({ ...c, unit: e.target.value }))}
                className="field-input"
                placeholder="90kg bag"
                required
              />
            </label>
          </div>

          {/* Price + Date */}
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="field-label">Price (KES)</span>
              <input
                type="number"
                min="1"
                step="1"
                value={form.price}
                onChange={(e) => setForm((c) => ({ ...c, price: e.target.value }))}
                className="field-input text-lg font-bold"
                placeholder="e.g. 4500"
                required
              />
            </label>
            <label>
              <span className="field-label">Observed on</span>
              <input
                type="date"
                value={form.observationDate}
                onChange={(e) => setForm((c) => ({ ...c, observationDate: e.target.value }))}
                className="field-input"
                required
              />
            </label>
          </div>

          {/* Optional notes */}
          <label>
            <span className="field-label">Notes — optional</span>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((c) => ({ ...c, notes: e.target.value }))}
              className="field-textarea min-h-[80px]"
              placeholder="Oversupply, transport pressure, premium grade, buyer shortage…"
            />
          </label>

          {/* Name + Phone */}
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="field-label">Your name</span>
              <input
                value={form.contributorName}
                onChange={(e) => setForm((c) => ({ ...c, contributorName: e.target.value }))}
                className="field-input"
                placeholder="Your name"
                required={!isAuthenticated && !form.contributorPhone}
              />
            </label>
            <label>
              <span className="field-label">Phone for verification</span>
              <input
                value={form.contributorPhone}
                onChange={(e) => setForm((c) => ({ ...c, contributorPhone: e.target.value }))}
                className="field-input"
                placeholder="+254712345678"
              />
            </label>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="primary-button w-full"
          >
            {saving ? "Submitting…" : "Submit price report"}
          </button>
        </form>
      </div>

      {/* Bottom strip */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-stone-500">
        <span>
          Board avg for {selectedProduct.name}:{" "}
          <span className="font-semibold text-stone-700">
            {formatKes(selectedSnapshot.overallAverage)} / {selectedSnapshot.unit}
          </span>
        </span>
        <Link
          href={`/market-intelligence/${form.productKey}`}
          className="font-semibold text-terra-600 hover:text-terra-700"
        >
          View full board →
        </Link>
      </div>
    </div>
  );
}
