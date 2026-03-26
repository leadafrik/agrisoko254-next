"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  MapPinned,
  MessageSquareShare,
  Minus,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import InvitePriceButton from "@/components/intelligence/InvitePriceButton";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  type IntelligenceHistoryAverageRow,
  type IntelligenceProductHistory,
  type IntelligenceProductSnapshot,
  buildPriceContributionHref,
  formatIntelligenceDate,
  formatKes,
  formatTrendLabel,
  getDealSignal,
  getFallbackProductHistory,
  getFallbackProductSnapshot,
  normalizeIntelligenceHistory,
  normalizeIntelligenceProduct,
} from "@/lib/market-intelligence";

type Props = {
  initialProduct: IntelligenceProductSnapshot;
  initialHistory: IntelligenceProductHistory;
};

const trendIcon = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
} as const;

const REFRESH_INTERVAL_MS = 60000;

export default function CommodityIntelligenceExplorer({
  initialProduct,
  initialHistory,
}: Props) {
  const [product, setProduct] = useState<IntelligenceProductSnapshot>(initialProduct);
  const [history, setHistory] = useState<IntelligenceProductHistory>(initialHistory);
  const [selectedCounty, setSelectedCounty] = useState("all");
  const [marketSort, setMarketSort] = useState<"highest" | "lowest" | "activity" | "trend">(
    "highest"
  );
  const [historyView, setHistoryView] = useState<"daily" | "county" | "market">("daily");
  const [selectedMarketKey, setSelectedMarketKey] = useState(
    initialProduct.bestMarket?.marketKey || initialProduct.markets[0]?.marketKey || ""
  );
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const refreshProduct = async (showSpinner = false) => {
      if (showSpinner) setRefreshing(true);
      try {
        const [productResponse, historyResponse] = await Promise.all([
          fetch(API_ENDPOINTS.marketIntelligence.byProduct(initialProduct.productKey), {
            cache: "no-store",
            credentials: "include",
          }),
          fetch(API_ENDPOINTS.marketIntelligence.history(initialProduct.productKey), {
            cache: "no-store",
            credentials: "include",
          }),
        ]);

        const nextProductPayload = productResponse.ok
          ? await productResponse.json().catch(() => null)
          : null;
        const nextHistoryPayload = historyResponse.ok
          ? await historyResponse.json().catch(() => null)
          : null;

        if (cancelled) return;

        const nextProduct =
          normalizeIntelligenceProduct(nextProductPayload, initialProduct.productKey) ||
          getFallbackProductSnapshot(initialProduct.productKey);
        const nextHistory =
          normalizeIntelligenceHistory(nextHistoryPayload, initialProduct.productKey) ||
          getFallbackProductHistory(initialProduct.productKey);

        if (nextProduct) setProduct(nextProduct);
        if (nextHistory) setHistory(nextHistory);
      } finally {
        if (!cancelled && showSpinner) setRefreshing(false);
      }
    };

    const interval = window.setInterval(() => void refreshProduct(false), REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [initialProduct.productKey]);

  const countyOptions = Array.from(new Set(product.markets.map((market) => market.county))).sort();

  let filteredMarkets = product.markets.filter(
    (market) =>
      selectedCounty === "all" || market.county.toLowerCase() === selectedCounty.toLowerCase()
  );

  filteredMarkets = filteredMarkets.slice().sort((left, right) => {
    if (marketSort === "lowest") return left.avgPrice - right.avgPrice;
    if (marketSort === "activity") return right.submissionsCount - left.submissionsCount;
    if (marketSort === "trend") {
      return Math.abs(right.trendPercentage) - Math.abs(left.trendPercentage);
    }
    return right.avgPrice - left.avgPrice;
  });

  const selectedMarket =
    filteredMarkets.find((market) => market.marketKey === selectedMarketKey) ||
    filteredMarkets[0] ||
    product.bestMarket ||
    null;

  useEffect(() => {
    if (!selectedMarket && product.bestMarket) {
      setSelectedMarketKey(product.bestMarket.marketKey);
      return;
    }
    if (selectedMarket && selectedMarket.marketKey !== selectedMarketKey) {
      setSelectedMarketKey(selectedMarket.marketKey);
    }
  }, [product.bestMarket, selectedMarket, selectedMarketKey]);

  const historyRows: IntelligenceHistoryAverageRow[] =
    historyView === "county"
      ? history.countyAverages
      : historyView === "market"
        ? history.marketAverages
        : history.dailyAverageSeries;

  const filteredHistoryRows =
    historyView === "daily" || selectedCounty === "all"
      ? historyRows
      : historyRows.filter(
          (row) => row.county && row.county.toLowerCase() === selectedCounty.toLowerCase()
        );

  const chartMax = Math.max(...filteredHistoryRows.map((row) => row.averagePrice), 1);
  const TrendIcon = trendIcon[product.overallTrendDirection];
  const selectedGap =
    selectedMarket && product.overallAverage > 0
      ? Number((((selectedMarket.avgPrice - product.overallAverage) / product.overallAverage) * 100).toFixed(1))
      : 0;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const [productResponse, historyResponse] = await Promise.all([
        fetch(API_ENDPOINTS.marketIntelligence.byProduct(product.productKey), {
          cache: "no-store",
          credentials: "include",
        }),
        fetch(API_ENDPOINTS.marketIntelligence.history(product.productKey), {
          cache: "no-store",
          credentials: "include",
        }),
      ]);

      const nextProductPayload = productResponse.ok
        ? await productResponse.json().catch(() => null)
        : null;
      const nextHistoryPayload = historyResponse.ok
        ? await historyResponse.json().catch(() => null)
        : null;

      const nextProduct =
        normalizeIntelligenceProduct(nextProductPayload, product.productKey) ||
        getFallbackProductSnapshot(product.productKey);
      const nextHistory =
        normalizeIntelligenceHistory(nextHistoryPayload, product.productKey) ||
        getFallbackProductHistory(product.productKey);

      if (nextProduct) setProduct(nextProduct);
      if (nextHistory) setHistory(nextHistory);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="page-shell py-10 sm:py-12">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-stone-500">
        <Link href="/market-intelligence" className="hover:text-terra-600">
          Market intelligence
        </Link>
        <span className="text-stone-300">/</span>
        <span className="font-medium text-stone-700">{product.productName}</span>
      </nav>

      <section className="hero-panel p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="section-kicker">{product.productName}</p>
            <h1 className="mt-4 text-4xl font-bold text-stone-900 sm:text-5xl">
              {selectedMarket?.county || product.bestMarket?.county} is the live focus market.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-stone-600">{product.insight}</p>

            <div className="mt-6 flex flex-wrap gap-2 text-sm text-stone-600">
              <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 font-medium">
                {product.unit}
              </span>
              <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 font-medium">
                {product.submissionsCount} approved reports
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 font-medium">
                <TrendIcon className="h-3.5 w-3.5" />
                {formatTrendLabel(product.overallTrendDirection, product.overallTrendPercentage)}
              </span>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href={buildPriceContributionHref({
                  productKey: product.productKey,
                  county: selectedMarket?.county || product.bestMarket?.county,
                  marketName: selectedMarket?.marketName || product.bestMarket?.marketName,
                  unit: product.unit,
                })}
                className="primary-button"
              >
                Submit today&apos;s {product.productName.toLowerCase()} price
              </Link>
              <InvitePriceButton
                productKey={product.productKey}
                productName={product.productName}
                county={selectedMarket?.county || product.bestMarket?.county}
                marketName={selectedMarket?.marketName || product.bestMarket?.marketName}
                unit={product.unit}
              />
            </div>
          </div>

          <div className="surface-card p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Interactive controls
              </p>
              <button
                type="button"
                onClick={() => void handleRefresh()}
                className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 transition hover:border-terra-200 hover:text-terra-700"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label>
                <span className="field-label">County focus</span>
                <select
                  value={selectedCounty}
                  onChange={(event) => setSelectedCounty(event.target.value)}
                  className="field-select"
                >
                  <option value="all">All counties</option>
                  {countyOptions.map((county) => (
                    <option key={county} value={county}>
                      {county}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="field-label">Market sort</span>
                <select
                  value={marketSort}
                  onChange={(event) =>
                    setMarketSort(
                      event.target.value as "highest" | "lowest" | "activity" | "trend"
                    )
                  }
                  className="field-select"
                >
                  <option value="highest">Highest price first</option>
                  <option value="lowest">Lowest price first</option>
                  <option value="activity">Most active first</option>
                  <option value="trend">Strongest trend first</option>
                </select>
              </label>
            </div>

            <div className="mt-5 rounded-[22px] border border-stone-200 bg-[#fbf8f2] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                Selected market signal
              </p>
              <h2 className="mt-2 text-2xl font-bold text-stone-900">
                {selectedMarket?.marketName || product.bestMarket?.marketName}
              </h2>
              <p className="mt-2 text-sm text-stone-600">
                {selectedMarket?.county || product.bestMarket?.county}
              </p>
              <p className="mt-3 text-2xl font-bold text-terra-600">
                {formatKes(selectedMarket?.avgPrice || 0)}
              </p>
              <p className="mt-2 text-sm text-stone-600">
                {selectedGap >= 0 ? "+" : ""}
                {selectedGap}% versus overall average of {formatKes(product.overallAverage)}
              </p>
              <p className="mt-2 text-xs text-stone-500">
                Updated {formatIntelligenceDate(selectedMarket?.lastUpdated)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-kicker">Live compare</p>
            <h2 className="mt-3 text-3xl font-bold text-stone-900">
              Click a market to compare it against the board
            </h2>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredMarkets.map((market) => (
            <button
              key={market.marketKey}
              type="button"
              onClick={() => setSelectedMarketKey(market.marketKey)}
              className={`surface-card p-6 text-left transition ${
                selectedMarket?.marketKey === market.marketKey
                  ? "border-terra-300 bg-terra-50 shadow-[0_18px_44px_-36px_rgba(169,78,44,0.35)]"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                    {market.marketName}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-stone-900">{market.county}</h3>
                </div>
                <span className="rounded-full bg-terra-50 px-3 py-1 text-xs font-semibold text-terra-700">
                  {getDealSignal(product, market)}
                </span>
              </div>

              <p className="mt-4 text-3xl font-bold text-terra-600">{formatKes(market.avgPrice)}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-stone-500">
                <span className="rounded-full border border-stone-200 px-3 py-1">
                  {formatTrendLabel(market.trendDirection, market.trendPercentage)}
                </span>
                <span className="rounded-full border border-stone-200 px-3 py-1">
                  {market.submissionsCount} reports
                </span>
              </div>

              <div className="mt-5 rounded-[22px] border border-stone-200 bg-[#fbf8f2] p-4 text-sm text-stone-600">
                <p className="flex items-start gap-2">
                  <MapPinned className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                  Updated {formatIntelligenceDate(market.lastUpdated)}
                </p>
                <p className="mt-2">
                  Trading range: {formatKes(market.minPrice)} to {formatKes(market.maxPrice)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-14 grid gap-6 lg:grid-cols-[1fr_0.92fr]">
        <div className="surface-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-terra-50 text-terra-700">
                <BarChart3 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  Historical averages
                </p>
                <h2 className="mt-1 text-2xl font-bold text-stone-900">
                  Switch between daily, county, and market averages
                </h2>
              </div>
            </div>
            <div className="inline-flex rounded-full border border-stone-200 bg-white p-1">
              {([
                ["daily", "Daily"],
                ["county", "County"],
                ["market", "Market"],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setHistoryView(value)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    historyView === value
                      ? "bg-stone-900 text-white"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {filteredHistoryRows.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-stone-200 bg-[#fbf8f2] px-4 py-5 text-sm text-stone-500">
                No historical averages available for this filter yet.
              </div>
            ) : (
              filteredHistoryRows.slice(historyView === "daily" ? -10 : 0).map((row, index) => (
                <div key={`${row.date || row.marketName || row.county}-${index}`}>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-stone-900">
                        {row.date || row.marketName || row.county}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        {row.marketName && row.county ? `${row.marketName}, ${row.county}` : row.county || "Average series"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-terra-600">{formatKes(row.averagePrice)}</p>
                      <p className="text-xs text-stone-500">{row.submissionsCount} reports</p>
                    </div>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-stone-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-terra-500 to-forest-600"
                      style={{ width: `${Math.max(12, (row.averagePrice / chartMax) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-panel p-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-terra-50 text-terra-700">
                <MessageSquareShare className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  What to do next
                </p>
                <h2 className="mt-1 text-2xl font-bold text-stone-900">
                  Use the board as a decision tool, not just a price table.
                </h2>
              </div>
            </div>

            <div className="mt-5 space-y-4 text-sm leading-relaxed text-stone-600">
              <p>
                If you are selling, compare the strongest market against your transport cost and
                stock quality.
              </p>
              <p>
                If you are buying, switch to the lowest-price view and watch where oversupply is
                creating opportunity.
              </p>
              <p>
                The history tabs help you separate one noisy quote from a cleaner average signal.
              </p>
            </div>
          </div>

          <div className="surface-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Recent approved reports
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {(product.recentContributions || []).slice(0, 6).map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => {
                    const matchingMarket = product.markets.find(
                      (market) =>
                        market.marketName === entry.marketName && market.county === entry.county
                    );
                    if (matchingMarket) setSelectedMarketKey(matchingMarket.marketKey);
                  }}
                  className="rounded-[22px] border border-stone-200 bg-[#fbf8f2] p-4 text-left transition hover:border-terra-200"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                    {entry.marketName}
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-stone-900">
                    {formatKes(entry.price)}
                  </h3>
                  <p className="mt-1 text-sm text-stone-600">{entry.county}</p>
                  <p className="mt-3 text-xs text-stone-500">
                    {entry.contributorName} / {formatIntelligenceDate(entry.observationDate)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-14 flex justify-between gap-4 rounded-[30px] border border-stone-200 bg-white p-6">
        <div>
          <p className="text-sm font-semibold text-stone-900">
            Want to strengthen this {product.productName.toLowerCase()} signal?
          </p>
          <p className="mt-1 text-sm text-stone-500">
            Share one clean contribution link with your network and keep the board fresh.
          </p>
        </div>
        <Link
          href="/market-intelligence"
          className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-terra-600 hover:text-terra-700"
        >
          Back to intelligence hub
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
