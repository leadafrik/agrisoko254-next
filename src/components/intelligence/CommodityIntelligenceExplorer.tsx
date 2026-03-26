"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, RefreshCw, Sparkles, TrendingDown, TrendingUp, Minus } from "lucide-react";
import MarketBoardTable from "@/components/intelligence/MarketBoardTable";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  type IntelligenceProductHistory,
  type IntelligenceProductSnapshot,
  formatIntelligenceDate,
  formatKes,
  formatTrendLabel,
  normalizeIntelligenceHistory,
  normalizeIntelligenceProduct,
} from "@/lib/market-intelligence";

type Props = {
  initialProduct: IntelligenceProductSnapshot;
  initialHistory: IntelligenceProductHistory;
};

function TrendPill({ direction, percentage }: { direction: string; percentage: number }) {
  if (direction === "up")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
        <TrendingUp className="h-3 w-3" />
        {formatTrendLabel("up", percentage)}
      </span>
    );
  if (direction === "down")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">
        <TrendingDown className="h-3 w-3" />
        {formatTrendLabel("down", percentage)}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-500">
      <Minus className="h-3 w-3" />
      Stable
    </span>
  );
}

function AiOneLiner({ product }: { product: IntelligenceProductSnapshot }) {
  const [brief, setBrief] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const lastKey = { current: "" };

  useEffect(() => {
    const key = product.productKey;
    if (!product.bestMarket || !product.weakestMarket) return;
    setLoading(true);
    setBrief(null);
    const ctrl = new AbortController();
    fetch("/api/market-intelligence/insight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productKey: product.productKey,
        productName: product.productName,
        unit: product.unit,
        overallAverage: product.overallAverage,
        overallTrend: formatTrendLabel(product.overallTrendDirection, product.overallTrendPercentage),
        bestMarket: product.bestMarket.marketName,
        bestCounty: product.bestMarket.county,
        bestPrice: product.bestMarket.avgPrice,
        weakestMarket: product.weakestMarket.marketName,
        weakestCounty: product.weakestMarket.county,
        weakestPrice: product.weakestMarket.avgPrice,
      }),
      signal: ctrl.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (!ctrl.signal.aborted) setBrief(data?.brief ?? null); })
      .catch(() => {})
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });
    return () => ctrl.abort();
  }, [product.productKey]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!loading && !brief) return null;
  return (
    <div className="flex items-start gap-2.5 rounded-[18px] border border-amber-100 bg-amber-50/60 px-4 py-3">
      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
      {loading ? (
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-4/5 animate-pulse rounded bg-amber-100" />
          <div className="h-3 w-3/5 animate-pulse rounded bg-amber-100" />
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-stone-700">{brief}</p>
      )}
    </div>
  );
}

export default function CommodityIntelligenceExplorer({ initialProduct, initialHistory }: Props) {
  const [product, setProduct] = useState(initialProduct);
  const [selectedMarketKey, setSelectedMarketKey] = useState(
    initialProduct.bestMarket?.marketKey || initialProduct.markets[0]?.marketKey || ""
  );
  const [countyFilter, setCountyFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const id = window.setInterval(async () => {
      if (cancelled) return;
      try {
        const res = await fetch(API_ENDPOINTS.marketIntelligence.byProduct(initialProduct.productKey), {
          cache: "no-store", credentials: "include",
        });
        const data = res.ok ? await res.json().catch(() => null) : null;
        if (!cancelled && data) {
          const next = normalizeIntelligenceProduct(data, initialProduct.productKey);
          if (next) setProduct(next);
        }
      } catch {}
    }, 60000);
    return () => { cancelled = true; clearInterval(id); };
  }, [initialProduct.productKey]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(API_ENDPOINTS.marketIntelligence.byProduct(product.productKey), {
        cache: "no-store", credentials: "include",
      });
      const data = res.ok ? await res.json().catch(() => null) : null;
      const next = data ? normalizeIntelligenceProduct(data, product.productKey) : null;
      if (next) setProduct(next);
    } finally { setRefreshing(false); }
  };

  const countyOptions = Array.from(new Set(product.markets.map((m) => m.county))).sort();
  const filteredMarkets =
    countyFilter === "all"
      ? product.markets
      : product.markets.filter((m) => m.county.toLowerCase() === countyFilter.toLowerCase());

  const spread =
    product.bestMarket && product.weakestMarket
      ? product.bestMarket.avgPrice - product.weakestMarket.avgPrice
      : 0;

  return (
    <div className="page-shell py-8 sm:py-10">

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-stone-500">
        <Link href="/market-intelligence" className="hover:text-terra-600">Market intelligence</Link>
        <span className="text-stone-300">/</span>
        <span className="font-medium text-stone-700">{product.productName}</span>
      </nav>

      {/* ── Header card ── */}
      <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_20px_60px_-36px_rgba(120,83,47,0.3)] sm:p-8">
        {/* Top row: name + refresh */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold text-stone-900 sm:text-4xl">{product.productName}</h1>
              <TrendPill direction={product.overallTrendDirection} percentage={product.overallTrendPercentage} />
            </div>
            <p className="mt-1.5 text-sm text-stone-500">
              {product.approvedMarkets} market{product.approvedMarkets !== 1 ? "s" : ""} ·{" "}
              {product.submissionsCount} approved reports ·{" "}
              updated {formatIntelligenceDate(product.lastUpdated)}
              {product.isFallback && " · starter signals"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-500 transition hover:border-terra-200 hover:text-terra-700"
          >
            <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Big average */}
        <div className="mt-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">Board average</p>
          <p className="mt-1 font-mono text-5xl font-bold text-stone-900">
            {product.overallAverage > 0 ? formatKes(product.overallAverage) : "—"}
          </p>
          <p className="mt-0.5 text-xs text-stone-400">/ {product.unit}</p>
        </div>

        {/* AI one-liner */}
        <div className="mt-5">
          <AiOneLiner product={product} />
        </div>

        {/* Best / weakest */}
        {product.bestMarket && product.weakestMarket && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[20px] border border-green-100 bg-green-50/50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-green-700">Best to sell</p>
              <p className="mt-2 font-mono text-xl font-bold text-stone-900">
                {formatKes(product.bestMarket.avgPrice)}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-stone-700">{product.bestMarket.marketName}</p>
              <p className="text-xs text-stone-500">{product.bestMarket.county}</p>
            </div>
            <div className="rounded-[20px] border border-stone-200 bg-stone-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400">Cheapest market</p>
              <p className="mt-2 font-mono text-xl font-bold text-stone-700">
                {formatKes(product.weakestMarket.avgPrice)}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-stone-600">{product.weakestMarket.marketName}</p>
              <p className="text-xs text-stone-500">{product.weakestMarket.county}</p>
            </div>
          </div>
        )}

        {/* Spread line */}
        {spread > 0 && (
          <p className="mt-4 text-sm text-stone-500">
            Market spread: <span className="font-semibold text-stone-700">{formatKes(spread)}</span> between best and cheapest
          </p>
        )}

        {/* Actions */}
        <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-stone-100 pt-4">
          <Link
            href={`/market-intelligence/submit?product=${product.productKey}`}
            className="text-sm font-semibold text-terra-600 hover:text-terra-700"
          >
            Submit a price →
          </Link>
          <Link
            href="/market-intelligence"
            className="inline-flex items-center gap-1 text-sm font-semibold text-stone-500 hover:text-stone-800"
          >
            All products <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* ── Market board ── */}
      <section className="mt-6">
        {/* County filter */}
        {countyOptions.length > 1 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCountyFilter("all")}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                countyFilter === "all"
                  ? "bg-stone-900 text-white"
                  : "border border-stone-200 bg-white text-stone-600 hover:border-stone-300"
              }`}
            >
              All counties
            </button>
            {countyOptions.map((county) => (
              <button
                key={county}
                type="button"
                onClick={() => setCountyFilter(county)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                  countyFilter === county
                    ? "bg-stone-900 text-white"
                    : "border border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                }`}
              >
                {county}
              </button>
            ))}
          </div>
        )}

        <MarketBoardTable
          product={product}
          markets={filteredMarkets.length ? filteredMarkets : product.markets}
          selectedMarketKey={selectedMarketKey}
          onSelectMarket={setSelectedMarketKey}
        />
      </section>

    </div>
  );
}
