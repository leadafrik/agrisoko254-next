"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, PlusCircle, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  TRACKED_INTELLIGENCE_MARKETS,
  TRACKED_INTELLIGENCE_PRODUCTS,
  normalizeSubmissionFeedback,
  type IntelligenceSubmissionFeedback,
} from "@/lib/market-intelligence";

type Props = {
  open: boolean;
  onClose: () => void;
  defaultProductKey?: string;
};

const COUNTIES = Array.from(
  new Set(TRACKED_INTELLIGENCE_MARKETS.map((m) => m.county))
).sort();

function getDefaultMarket(county: string) {
  return (
    TRACKED_INTELLIGENCE_MARKETS.find((m) => m.county === county)?.marketName ?? ""
  );
}

function getUnit(productKey: string) {
  return (
    TRACKED_INTELLIGENCE_PRODUCTS.find((p) => p.key === productKey)?.defaultUnit ?? "kg"
  );
}

export default function PriceSubmitModal({ open, onClose, defaultProductKey }: Props) {
  const { user } = useAuth();
  const initialProduct =
    TRACKED_INTELLIGENCE_PRODUCTS.find((p) => p.key === defaultProductKey)?.key ??
    TRACKED_INTELLIGENCE_PRODUCTS[0].key;
  const initialCounty = "Nairobi";

  const [productKey, setProductKey] = useState<string>(initialProduct);
  const [county, setCounty] = useState(initialCounty);
  const [marketName, setMarketName] = useState(getDefaultMarket(initialCounty));
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{
    productKey: string;
    productName: string;
    feedback: IntelligenceSubmissionFeedback | null;
  } | null>(null);

  const priceRef = useRef<HTMLInputElement>(null);

  // Sync default product when prop changes while modal is open
  useEffect(() => {
    if (!open) return;
    const key =
      TRACKED_INTELLIGENCE_PRODUCTS.find((p) => p.key === defaultProductKey)?.key ??
      TRACKED_INTELLIGENCE_PRODUCTS[0].key;
    setProductKey(key);
    setSuccess(null);
    setError("");
    setPrice("");
  }, [open, defaultProductKey]);

  // Auto-fill market when county changes
  useEffect(() => {
    setMarketName(getDefaultMarket(county));
  }, [county]);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const selectedProduct =
    TRACKED_INTELLIGENCE_PRODUCTS.find((p) => p.key === productKey) ??
    TRACKED_INTELLIGENCE_PRODUCTS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await apiRequest(API_ENDPOINTS.marketIntelligence.submissions, {
        method: "POST",
        body: JSON.stringify({
          productKey,
          county,
          marketName: marketName.trim() || getDefaultMarket(county),
          unit: getUnit(productKey),
          price: Number(price),
          observationDate: new Date().toISOString().slice(0, 10),
          contributorName: user?.fullName || user?.name || undefined,
          contributorPhone: user?.phone || undefined,
        }),
      });
      setSuccess({
        productKey,
        productName: selectedProduct.name,
        feedback: normalizeSubmissionFeedback(res?.feedback),
      });
      setPrice("");
    } catch (err: any) {
      setError(err?.message || "Could not save right now. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-md rounded-t-[32px] bg-white px-6 pb-8 pt-5 shadow-[0_-24px_80px_-32px_rgba(28,25,23,0.45)] sm:rounded-[32px] sm:pb-7">
        {/* Drag handle (mobile) */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-stone-200 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terra-600">
            Share a price
          </p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {success ? (
          /* ── Success state ─────────────────────────────────────────── */
          <div className="mt-5">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-forest-600 text-white">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h2 className="mt-3 text-xl font-bold text-stone-900">Price received</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
              {success.productName} price for {county} logged. It will appear on the board once reviewed.
            </p>
            {success.feedback ? (
              <div className="mt-4 rounded-[18px] border border-forest-200 bg-forest-50 p-4 text-sm">
                <p className="font-semibold text-stone-900">
                  {success.feedback.reportsToday} price{success.feedback.reportsToday !== 1 ? "s" : ""} logged today
                </p>
                {success.feedback.comparisonLabel !== "near" && (
                  <p className="mt-1 text-stone-600">
                    Your price is {Math.abs(success.feedback.deltaPercentage).toFixed(1)}%{" "}
                    {success.feedback.comparisonLabel} the current average.
                  </p>
                )}
              </div>
            ) : null}
            <div className="mt-5 flex flex-col gap-3">
              <Link
                href={`/market-intelligence/${success.productKey}`}
                className="primary-button w-full justify-center"
                onClick={onClose}
              >
                View {success.productName} board →
              </Link>
              <button
                type="button"
                onClick={() => setSuccess(null)}
                className="secondary-button w-full justify-center"
              >
                Submit another price
              </button>
            </div>
          </div>
        ) : (
          /* ── Form ──────────────────────────────────────────────────── */
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <h2 className="text-xl font-bold text-stone-900">
              What are you seeing in your market today?
            </h2>

            <label className="block">
              <span className="field-label">Commodity</span>
              <select
                value={productKey}
                onChange={(e) => setProductKey(e.target.value)}
                className="field-select"
              >
                {TRACKED_INTELLIGENCE_PRODUCTS.map((p) => (
                  <option key={p.key} value={p.key}>{p.name}</option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="field-label">County</span>
                <select
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  className="field-select"
                >
                  {COUNTIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="field-label">Price (KES)</span>
                <input
                  ref={priceRef}
                  type="number"
                  min="1"
                  step="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="field-input font-bold"
                  placeholder="e.g. 4500"
                  required
                />
              </label>
            </div>

            <label className="block">
              <span className="field-label">Market name</span>
              <input
                value={marketName}
                onChange={(e) => setMarketName(e.target.value)}
                className="field-input"
                placeholder="e.g. Wakulima Market"
                required
              />
            </label>

            <p className="text-xs text-stone-400">
              Unit: <span className="font-semibold text-stone-600">{getUnit(productKey)}</span>
              {" · "}
              <Link
                href={`/market-intelligence/submit?product=${productKey}`}
                className="text-terra-600 hover:underline"
                onClick={onClose}
              >
                Need more options?
              </Link>
            </p>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={saving}
              className="primary-button w-full justify-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              {saving ? "Submitting…" : "Submit price"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
