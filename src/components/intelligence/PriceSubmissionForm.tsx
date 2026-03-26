"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  Minus,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Wifi,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  type IntelligenceOverview,
  type IntelligenceSubmissionFeedback,
  TRACKED_INTELLIGENCE_MARKETS,
  TRACKED_INTELLIGENCE_PRODUCTS,
  buildPriceContributionHref,
  buildPriceContributionPrompt,
  formatIntelligenceDate,
  formatKes,
  formatTrendLabel,
  getFallbackIntelligenceOverview,
  getFallbackProductSnapshot,
  normalizeIntelligenceOverview,
  normalizeSubmissionFeedback,
} from "@/lib/market-intelligence";
import InvitePriceButton from "./InvitePriceButton";

type Props = {
  defaults?: {
    product?: string;
    county?: string;
    market?: string;
    unit?: string;
  };
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

const MARKET_REFRESH_INTERVAL_MS = 45000;
const CLOCK_TICK_MS = 30000;
const todayInputValue = new Date().toISOString().slice(0, 10);

const trendIcon = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
} as const;

const normalizeText = (value?: string | null) =>
  String(value || "")
    .trim()
    .toLowerCase();

const formatRefreshLabel = (lastRefreshAt: number, now: number) => {
  const elapsedSeconds = Math.max(0, Math.round((now - lastRefreshAt) / 1000));
  if (elapsedSeconds < 15) return "Updated just now";
  if (elapsedSeconds < 60) return `Updated ${elapsedSeconds}s ago`;
  if (elapsedSeconds < 3600) return `Updated ${Math.floor(elapsedSeconds / 60)}m ago`;
  return `Updated ${Math.floor(elapsedSeconds / 3600)}h ago`;
};

const buildFeedbackCopy = (feedback: IntelligenceSubmissionFeedback) => {
  if (feedback.comparisonLabel === "above") {
    return `Your price is ${Math.abs(feedback.deltaPercentage).toFixed(
      1
    )}% above the current approved average in this market.`;
  }

  if (feedback.comparisonLabel === "below") {
    return `Your price is ${Math.abs(feedback.deltaPercentage).toFixed(
      1
    )}% below the current approved average in this market.`;
  }

  return "Your price sits close to the current approved average in this market.";
};

export default function PriceSubmissionForm({ defaults, initialOverview }: Props) {
  const { isAuthenticated, user } = useAuth();
  const fallbackOverview = getFallbackIntelligenceOverview();
  const [overview, setOverview] = useState<IntelligenceOverview>(
    initialOverview || fallbackOverview
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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<SubmissionState | null>(null);
  const [lastRefreshAt, setLastRefreshAt] = useState(() => Date.now());
  const [clockNow, setClockNow] = useState(() => Date.now());

  const selectedProduct =
    TRACKED_INTELLIGENCE_PRODUCTS.find((item) => item.key === form.productKey) ||
    TRACKED_INTELLIGENCE_PRODUCTS[0];

  const board = [...overview.produceBoard, ...overview.fertilizerBoard];
  const selectedSnapshot =
    board.find((item) => item.productKey === form.productKey) ||
    getFallbackProductSnapshot(form.productKey);
  const selectedMarketSignal =
    selectedSnapshot?.markets.find(
      (market) =>
        normalizeText(market.county) === normalizeText(form.county) &&
        normalizeText(market.marketName) === normalizeText(form.marketName)
    ) ||
    selectedSnapshot?.bestMarket ||
    null;
  const topSignals = (overview.topSignals.length
    ? overview.topSignals
    : fallbackOverview.topSignals
  ).slice(0, 3);
  const selectedMarketBoard = (selectedSnapshot?.markets.length
    ? selectedSnapshot.markets
    : getFallbackProductSnapshot(form.productKey)?.markets || []
  ).slice(0, 4);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      contributorName: current.contributorName || user?.fullName || user?.name || "",
      contributorPhone: current.contributorPhone || user?.phone || "",
    }));
  }, [user?.fullName, user?.name, user?.phone]);

  useEffect(() => {
    setForm((current) => {
      if (current.unit === selectedProduct.defaultUnit) return current;
      if (defaults?.unit) return current;
      return { ...current, unit: selectedProduct.defaultUnit };
    });
  }, [defaults?.unit, selectedProduct.defaultUnit]);

  useEffect(() => {
    let cancelled = false;

    const refreshOverview = async (showSpinner: boolean) => {
      if (showSpinner) setRefreshing(true);

      try {
        const response = await fetch(API_ENDPOINTS.marketIntelligence.overview, {
          cache: "no-store",
          credentials: "include",
        });
        if (!response.ok) return;

        const payload = await response.json().catch(() => null);
        if (cancelled || !payload) return;

        setOverview(normalizeIntelligenceOverview(payload));
        setLastRefreshAt(Date.now());
      } catch {
        // Keep the last working board on screen.
      } finally {
        if (!cancelled && showSpinner) setRefreshing(false);
      }
    };

    void refreshOverview(false);
    const refreshInterval = window.setInterval(() => void refreshOverview(false), MARKET_REFRESH_INTERVAL_MS);
    const clockInterval = window.setInterval(() => setClockNow(Date.now()), CLOCK_TICK_MS);

    return () => {
      cancelled = true;
      window.clearInterval(refreshInterval);
      window.clearInterval(clockInterval);
    };
  }, []);

  const prompt = buildPriceContributionPrompt({
    productName: selectedProduct.name,
    county: form.county,
    marketName: form.marketName,
  });

  const handleManualRefresh = async () => {
    setRefreshing(true);

    try {
      const response = await fetch(API_ENDPOINTS.marketIntelligence.overview, {
        cache: "no-store",
        credentials: "include",
      });
      if (!response.ok) return;

      const payload = await response.json().catch(() => null);
      if (!payload) return;

      setOverview(normalizeIntelligenceOverview(payload));
      setLastRefreshAt(Date.now());
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
      setForm((current) => ({
        ...current,
        price: "",
        notes: "",
      }));
      await handleManualRefresh();
    } catch (submissionError: any) {
      setError(
        submissionError?.message ||
          "We could not save this price report right now. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr]">
      <section className="space-y-5">
        <div className="hero-panel p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
            <span className="inline-flex items-center gap-2 rounded-full border border-forest-200 bg-forest-50 px-3 py-1.5 text-forest-700">
              <Wifi className="h-3.5 w-3.5" />
              Live market board
            </span>
            <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1.5">
              {formatRefreshLabel(lastRefreshAt, clockNow)}
            </span>
            <button
              type="button"
              onClick={() => void handleManualRefresh()}
              className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 text-stone-600 transition hover:border-terra-200 hover:text-terra-700"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          <div className="mt-5 max-w-3xl">
            <p className="section-kicker">Participate in the market</p>
            <h1 className="mt-4 text-3xl font-bold text-stone-900 sm:text-4xl">
              Check the board. Submit the price you are seeing. Help sharpen today&apos;s signal.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-stone-600">
              Agrisoko turns clean field reports into live pricing signals, best-market clues, and
              practical trade decisions across Kenya.
            </p>
          </div>

          <div className="mt-7 grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
            <div className="rounded-[28px] border border-stone-200 bg-white/80 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                    Market pulse
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-stone-900">What is moving now</h2>
                </div>
                {refreshing ? (
                  <LoaderCircle className="h-4 w-4 animate-spin text-terra-600" />
                ) : null}
              </div>

              <div className="mt-5 space-y-3">
                {topSignals.map((signal) => {
                  const TrendIcon = trendIcon[signal.trendDirection];

                  return (
                    <div
                      key={signal.productKey}
                      className="rounded-[22px] border border-stone-200 bg-[#fbf8f2] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terra-600">
                            {signal.productName}
                          </p>
                          <h3 className="mt-2 text-lg font-bold text-stone-900">
                            {signal.bestCounty}
                          </h3>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-semibold text-stone-700">
                          <TrendIcon className="h-3.5 w-3.5" />
                          {formatTrendLabel(signal.trendDirection, signal.trendPercentage)}
                        </span>
                      </div>
                      <p className="mt-3 text-sm font-semibold text-stone-800">
                        {formatKes(signal.bestPrice)} at {signal.bestMarketName}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-stone-600">
                        {signal.summary}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="overflow-hidden rounded-[28px] bg-stone-900 p-5 text-white shadow-[0_22px_64px_-42px_rgba(28,25,23,0.7)]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                  Selected commodity
                </span>
                <span className="rounded-full border border-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                  {selectedSnapshot?.unit || selectedProduct.defaultUnit}
                </span>
              </div>

              <h2 className="mt-4 text-3xl font-bold">{selectedProduct.name}</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/75">
                {selectedSnapshot?.insight ||
                  `Agrisoko is watching ${selectedProduct.name.toLowerCase()} prices across county markets.`}
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
                    Current average
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    {formatKes(selectedSnapshot?.overallAverage || 0)}
                  </p>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
                    Markets tracked
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    {selectedSnapshot?.approvedMarkets || 0}
                  </p>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
                    Approved reports
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    {selectedSnapshot?.submissionsCount || 0}
                  </p>
                </div>
              </div>

              {selectedMarketSignal ? (
                <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                    Current signal for your selected market
                  </p>
                  <div className="mt-3 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold">
                        {selectedMarketSignal.marketName}, {selectedMarketSignal.county}
                      </h3>
                      <p className="mt-2 text-sm text-white/70">
                        {selectedMarketSignal.submissionsCount} approved reports / Last field update{" "}
                        {formatIntelligenceDate(selectedMarketSignal.lastUpdated)}
                      </p>
                    </div>
                    <p className="text-2xl font-bold">{formatKes(selectedMarketSignal.avgPrice)}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {overview.isFallback ? (
            <p className="mt-4 text-sm text-stone-500">
              The board is still using Agrisoko starter data in some markets. Fresh approved
              reports will replace those references automatically.
            </p>
          ) : null}
        </div>

        <div className="surface-card p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-kicker">Live board for {selectedProduct.name}</p>
              <h2 className="mt-3 text-3xl font-bold text-stone-900">
                Compare markets before you report
              </h2>
            </div>
            <Link
              href={`/market-intelligence/${selectedProduct.key}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-terra-600 hover:text-terra-700"
            >
              Open full {selectedProduct.name} board
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {selectedMarketBoard.map((market) => {
              const TrendIcon = trendIcon[market.trendDirection];
              const isSelectedMarket =
                normalizeText(market.county) === normalizeText(form.county) &&
                normalizeText(market.marketName) === normalizeText(form.marketName);

              return (
                <div
                  key={market.marketKey}
                  className={`rounded-[24px] border p-4 transition ${
                    isSelectedMarket
                      ? "border-terra-300 bg-terra-50 shadow-[0_18px_42px_-34px_rgba(169,78,44,0.35)]"
                      : "border-stone-200 bg-[#fbf8f2]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                        {market.marketName}
                      </p>
                      <h3 className="mt-2 text-lg font-bold text-stone-900">{market.county}</h3>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-700">
                      <TrendIcon className="h-3.5 w-3.5" />
                      {formatTrendLabel(market.trendDirection, market.trendPercentage)}
                    </span>
                  </div>

                  <p className="mt-4 text-2xl font-bold text-terra-600">
                    {formatKes(market.avgPrice)}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-stone-500">
                    {market.submissionsCount} approved reports / Updated{" "}
                    {formatIntelligenceDate(market.lastUpdated)}
                  </p>
                  {isSelectedMarket ? (
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-terra-700">
                      Your selected market
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
        <section className="surface-card p-6 sm:p-8">
          <p className="section-kicker">Submit a price</p>
          <h2 className="mt-4 text-3xl font-bold text-stone-900">Answer one clean question</h2>

          <div className="mt-5 rounded-[26px] border border-stone-200 bg-[#f8f3eb] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Contribution prompt
            </p>
            <p className="mt-2 text-xl font-bold text-stone-900">{prompt}</p>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              Report what you are seeing today. Keep the price and market clean. Use notes only if
              quality, oversupply, or transport is affecting the signal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="field-label">Product</span>
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
                <span className="field-label">County</span>
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
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="field-label">Market name</span>
                <input
                  value={form.marketName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, marketName: event.target.value }))
                  }
                  className="field-input"
                  placeholder="Wakulima Market"
                  required
                />
              </label>

              <label>
                <span className="field-label">Unit</span>
                <input
                  value={form.unit}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, unit: event.target.value }))
                  }
                  className="field-input"
                  placeholder="90kg bag"
                  required
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="field-label">Observed price in KES</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.price}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, price: event.target.value }))
                  }
                  className="field-input"
                  placeholder="4500"
                  required
                />
              </label>

              <label>
                <span className="field-label">Observation date</span>
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

            <label>
              <span className="field-label">Why is the market moving? Optional note</span>
              <textarea
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({ ...current, notes: event.target.value }))
                }
                className="field-textarea"
                placeholder="Oversupply, transport pressure, premium grade stock, buyer shortage..."
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="field-label">
                  {isAuthenticated ? "Your name" : "Your name or business"}
                </span>
                <input
                  value={form.contributorName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, contributorName: event.target.value }))
                  }
                  className="field-input"
                  placeholder="Your name"
                  required={!isAuthenticated && !form.contributorPhone}
                />
              </label>

              <label>
                <span className="field-label">Phone for verification</span>
                <input
                  value={form.contributorPhone}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, contributorPhone: event.target.value }))
                  }
                  className="field-input"
                  placeholder="+254712345678"
                />
              </label>
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="flex flex-col gap-3">
              <button type="submit" disabled={saving} className="primary-button">
                {saving ? "Submitting..." : "Submit price report"}
              </button>
              <Link
                href={buildPriceContributionHref({
                  productKey: form.productKey,
                  county: form.county,
                  marketName: form.marketName,
                  unit: form.unit,
                })}
                className="secondary-button"
              >
                Reset with this link
              </Link>
            </div>
          </form>
        </section>

        {success ? (
          <div className="rounded-[28px] border border-forest-200 bg-forest-50 p-6 shadow-[0_20px_50px_-36px_rgba(39,174,96,0.3)]">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-forest-600 text-white">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-stone-900">Price report received</h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-700">
              Your report is now in review for {success.marketName}, {success.county}.
            </p>

            {success.feedback ? (
              <div className="mt-5 space-y-3">
                <div className="rounded-[22px] border border-forest-200 bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest-700">
                    Contribution impact
                  </p>
                  <p className="mt-2 text-lg font-bold text-stone-900">
                    {success.feedback.reportsToday} reports logged for this market today
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">
                    Current approved average: {formatKes(success.feedback.currentAverage)} per{" "}
                    {success.unit}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">
                    {buildFeedbackCopy(success.feedback)}
                  </p>
                  <p className="mt-2 text-xs text-stone-500">
                    {success.feedback.approvedReportsInWindow} approved reports are shaping the live
                    board for this market right now.
                  </p>
                </div>
              </div>
            ) : null}

            <div className="mt-5 flex flex-col gap-3">
              <Link
                href={`/market-intelligence/${success.productKey}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-forest-700 hover:text-forest-800"
              >
                View {success.productName} intelligence
                <ArrowRight className="h-4 w-4" />
              </Link>
              <InvitePriceButton
                productKey={success.productKey}
                productName={success.productName}
                county={success.county}
                marketName={success.marketName}
                unit={success.unit}
              />
            </div>
          </div>
        ) : null}

        <div className="surface-panel p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Invite others
          </p>
          <h2 className="mt-3 text-2xl font-bold text-stone-900">
            Spread one practical pricing question through your network.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">{prompt}</p>

          <div className="mt-5">
            <InvitePriceButton
              productKey={form.productKey}
              productName={selectedProduct.name}
              county={form.county}
              marketName={form.marketName}
              unit={form.unit}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}
