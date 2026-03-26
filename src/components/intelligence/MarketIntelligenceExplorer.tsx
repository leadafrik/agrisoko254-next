"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, RefreshCw, Sparkles, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  type IntelligenceOverview,
  type IntelligenceProductSnapshot,
  formatIntelligenceDate,
  formatKes,
  formatTrendLabel,
  normalizeIntelligenceOverview,
} from "@/lib/market-intelligence";

type Props = { initialOverview: IntelligenceOverview };
type Category = "produce" | "livestock" | "inputs";

const REFRESH_MS = 45_000;

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

function PriceBar({ product }: { product: IntelligenceProductSnapshot }) {
  const min = product.weakestMarket?.avgPrice ?? 0;
  const max = product.bestMarket?.avgPrice ?? 0;
  const avg = product.overallAverage;
  const spread = max - min;
  if (!spread) return null;
  const pct = Math.min(100, Math.max(0, ((avg - min) / spread) * 100));
  return (
    <div>
      <div className="relative h-2 rounded-full bg-stone-100">
        <div className="absolute h-full rounded-full bg-gradient-to-r from-amber-200 via-terra-300 to-terra-500" style={{ left: 0, right: 0 }} />
        <div
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-stone-900 shadow"
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-stone-400">
        <span>{formatKes(min)}</span>
        <span>{formatKes(max)}</span>
      </div>
    </div>
  );
}

function AiOneLiner({ product }: { product: IntelligenceProductSnapshot }) {
  const [brief, setBrief] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const lastKey = useRef<string>("");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const key = product.productKey;
    if (key === lastKey.current) return;
    lastKey.current = key;

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setBrief(null);

    if (!product.bestMarket || !product.weakestMarket) return;

    setLoading(true);
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
      .then((data) => {
        if (!ctrl.signal.aborted) setBrief(data?.brief ?? null);
      })
      .catch(() => {})
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });

    return () => ctrl.abort();
  }, [product]);

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

function ProductIntel({
  product,
  onRefresh,
  refreshing,
}: {
  product: IntelligenceProductSnapshot;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const spread =
    product.bestMarket && product.weakestMarket
      ? product.bestMarket.avgPrice - product.weakestMarket.avgPrice
      : 0;
  const spreadPct =
    product.overallAverage > 0 ? ((spread / product.overallAverage) * 100).toFixed(0) : null;

  return (
    <div className="space-y-5">
      {/* Headline row */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-3xl font-bold text-stone-900">{product.productName}</h2>
            <TrendPill direction={product.overallTrendDirection} percentage={product.overallTrendPercentage} />
          </div>
          <p className="mt-1 text-sm text-stone-500">
            {product.unit} · {product.approvedMarkets} market{product.approvedMarkets !== 1 ? "s" : ""} ·{" "}
            {product.submissionsCount} approved reports
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-500 transition hover:border-terra-200 hover:text-terra-700"
        >
          <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Average price */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">Board average</p>
        <p className="mt-1 font-mono text-5xl font-bold text-stone-900">
          {product.overallAverage > 0 ? formatKes(product.overallAverage) : "—"}
        </p>
        <p className="mt-0.5 text-xs text-stone-400">/ {product.unit}</p>
      </div>

      {/* AI one-liner */}
      <AiOneLiner product={product} />

      {/* Best / weakest */}
      {product.bestMarket && product.weakestMarket && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[20px] border border-green-100 bg-green-50/50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-green-600">Best market to sell</p>
            <p className="mt-1.5 font-mono text-xl font-bold text-stone-900">
              {formatKes(product.bestMarket.avgPrice)}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-stone-700">
              {product.bestMarket.marketName}
            </p>
            <p className="text-xs text-stone-500">{product.bestMarket.county}</p>
            {product.bestMarket.trendDirection !== "stable" && (
              <TrendPill direction={product.bestMarket.trendDirection} percentage={product.bestMarket.trendPercentage} />
            )}
          </div>
          <div className="rounded-[20px] border border-stone-200 bg-stone-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400">Weakest market</p>
            <p className="mt-1.5 font-mono text-xl font-bold text-stone-700">
              {formatKes(product.weakestMarket.avgPrice)}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-stone-600">
              {product.weakestMarket.marketName}
            </p>
            <p className="text-xs text-stone-500">{product.weakestMarket.county}</p>
          </div>
        </div>
      )}

      {/* Price bar */}
      {product.bestMarket && product.weakestMarket && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-400">
              Market spread
            </p>
            {spreadPct && Number(spreadPct) > 0 && (
              <span className="text-[11px] font-semibold text-stone-500">
                {spreadPct}% range
              </span>
            )}
          </div>
          <PriceBar product={product} />
        </div>
      )}

      {/* Updated + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
        <p className="text-xs text-stone-400">
          Updated {formatIntelligenceDate(product.lastUpdated)}
          {product.isFallback && " · starter signals"}
        </p>
        <div className="flex items-center gap-3">
          <Link
            href={`/market-intelligence/submit?product=${product.productKey}`}
            className="text-xs font-semibold text-terra-600 hover:text-terra-700"
          >
            Submit a price
          </Link>
          <Link
            href={`/market-intelligence/${product.productKey}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-stone-900"
          >
            Full board <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function MarketIntelligenceExplorer({ initialOverview }: Props) {
  const [overview, setOverview] = useState(initialOverview);
  const [activeCategory, setActiveCategory] = useState<Category>("produce");
  const [selectedKey, setSelectedKey] = useState(
    initialOverview.produceBoard[0]?.productKey ?? ""
  );
  const [refreshing, setRefreshing] = useState(false);

  // Auto-refresh
  useEffect(() => {
    let cancelled = false;
    const id = window.setInterval(async () => {
      if (cancelled) return;
      try {
        const res = await fetch(API_ENDPOINTS.marketIntelligence.overview, { cache: "no-store", credentials: "include" });
        const data = res.ok ? await res.json().catch(() => null) : null;
        if (!cancelled && data) setOverview(normalizeIntelligenceOverview(data));
      } catch {}
    }, REFRESH_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(API_ENDPOINTS.marketIntelligence.overview, { cache: "no-store", credentials: "include" });
      const data = res.ok ? await res.json().catch(() => null) : null;
      if (data) setOverview(normalizeIntelligenceOverview(data));
    } finally { setRefreshing(false); }
  };

  const boards: Record<Category, IntelligenceProductSnapshot[]> = {
    produce: overview.produceBoard,
    livestock: overview.livestockBoard ?? [],
    inputs: overview.fertilizerBoard,
  };

  const categoryLabels: Record<Category, string> = {
    produce: "Produce",
    livestock: "Livestock",
    inputs: "Inputs",
  };

  const board = boards[activeCategory];

  const selectedProduct = board.find((p) => p.productKey === selectedKey) ?? board[0] ?? null;

  const switchCategory = (cat: Category) => {
    setActiveCategory(cat);
    setSelectedKey(boards[cat][0]?.productKey ?? "");
  };

  const totalReports = overview.meta.approvedSubmissions;
  const totalProducts =
    overview.produceBoard.length +
    (overview.livestockBoard?.length ?? 0) +
    overview.fertilizerBoard.length;

  return (
    <div className="page-shell py-10 sm:py-12">

      {/* ── Compact header ── */}
      <div className="mb-8">
        <p className="section-kicker">Kenya market intelligence</p>
        <h1 className="mt-3 text-3xl font-bold text-stone-900 sm:text-4xl">
          Pick a commodity. Get the signal.
        </h1>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            totalReports > 0 && `${totalReports.toLocaleString()} approved reports`,
            totalProducts > 0 && `${totalProducts} products tracked`,
            overview.meta.trackedMarkets > 0 && `${overview.meta.trackedMarkets} markets`,
          ].filter(Boolean).map((label) => (
            <span key={String(label)} className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-600">
              {String(label)}
            </span>
          ))}
        </div>
      </div>

      {/* ── Category tabs ── */}
      <div className="inline-flex rounded-full border border-stone-200 bg-stone-50 p-1 mb-5">
        {(["produce", "livestock", "inputs"] as Category[]).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => switchCategory(cat)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeCategory === cat
                ? "bg-stone-900 text-white shadow-sm"
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            {categoryLabels[cat]}
            {boards[cat].length > 0 && (
              <span className={`ml-1.5 text-[10px] font-bold ${activeCategory === cat ? "text-white/60" : "text-stone-400"}`}>
                {boards[cat].length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Product toggle row ── */}
      {board.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {board.map((product) => (
            <button
              key={product.productKey}
              type="button"
              onClick={() => setSelectedKey(product.productKey)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                selectedKey === product.productKey
                  ? "border-terra-400 bg-terra-500 text-white shadow-sm"
                  : "border-stone-200 bg-white text-stone-600 hover:border-terra-200 hover:text-terra-700"
              }`}
            >
              {product.productName}
              {product.overallAverage > 0 && (
                <span className={`ml-1.5 text-[11px] ${selectedKey === product.productKey ? "text-white/70" : "text-stone-400"}`}>
                  {formatKes(product.overallAverage)}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Selected product intelligence ── */}
      {selectedProduct ? (
        <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_20px_60px_-36px_rgba(120,83,47,0.4)] sm:p-8">
          <ProductIntel
            product={selectedProduct}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />
        </div>
      ) : (
        <div className="rounded-[28px] border border-dashed border-stone-200 bg-white p-10 text-center text-sm text-stone-400">
          No data yet for this category.{" "}
          <Link href="/market-intelligence/submit" className="font-semibold text-terra-600 hover:text-terra-700">
            Submit the first price.
          </Link>
        </div>
      )}

      {/* ── Bottom strip ── */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-stone-100 bg-[#faf7f2] px-5 py-4">
        <p className="text-sm text-stone-600">
          This board is built from reviewed field submissions.{" "}
          <span className="font-semibold text-stone-800">Your price helps every farmer in your county.</span>
        </p>
        <Link href="/market-intelligence/submit" className="shrink-0 text-sm font-semibold text-terra-600 hover:text-terra-700">
          Submit today&apos;s price →
        </Link>
      </div>

    </div>
  );
}
