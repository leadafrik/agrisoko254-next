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

type Props = {
  initialOverview: IntelligenceOverview;
};

type Category = "produce" | "livestock" | "inputs";

const REFRESH_INTERVAL_MS = 45_000;

const categoryConfig: Record<Category, { label: string; accent: string; badgeBg: string; badgeText: string }> = {
  produce: {
    label: "Produce",
    accent: "text-terra-700",
    badgeBg: "bg-terra-50 border-terra-200",
    badgeText: "text-terra-700",
  },
  livestock: {
    label: "Livestock",
    accent: "text-amber-700",
    badgeBg: "bg-amber-50 border-amber-200",
    badgeText: "text-amber-700",
  },
  inputs: {
    label: "Inputs",
    accent: "text-forest-700",
    badgeBg: "bg-forest-50 border-forest-200",
    badgeText: "text-forest-700",
  },
};

function TrendBadge({ direction, percentage }: { direction: string; percentage: number }) {
  if (direction === "up") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-bold text-green-700">
        <TrendingUp className="h-3 w-3" />
        {formatTrendLabel("up", percentage)}
      </span>
    );
  }
  if (direction === "down") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600">
        <TrendingDown className="h-3 w-3" />
        {formatTrendLabel("down", percentage)}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-500">
      <Minus className="h-3 w-3" />
      Stable
    </span>
  );
}

function DealSignal({ product }: { product: IntelligenceProductSnapshot }) {
  const best = product.bestMarket?.avgPrice ?? 0;
  const avg = product.overallAverage;
  if (!avg) return null;
  const pct = ((best - avg) / avg) * 100;
  if (pct >= 6)
    return (
      <span className="rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
        Sell
      </span>
    );
  if (pct <= -6)
    return (
      <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
        Buy
      </span>
    );
  return (
    <span className="rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-stone-500">
      Watch
    </span>
  );
}

function PriceRangeBar({ product }: { product: IntelligenceProductSnapshot }) {
  const min = product.weakestMarket?.avgPrice ?? 0;
  const max = product.bestMarket?.avgPrice ?? 0;
  const avg = product.overallAverage;
  const spread = max - min;
  if (!spread || !avg) return null;
  const avgPct = Math.min(100, Math.max(0, ((avg - min) / spread) * 100));
  return (
    <div className="mt-3">
      <div className="relative h-1.5 rounded-full bg-stone-100">
        <div
          className="absolute h-full rounded-full bg-gradient-to-r from-amber-300 via-terra-400 to-terra-600"
          style={{ left: 0, right: 0 }}
        />
        <div
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-stone-900 shadow-sm"
          style={{ left: `${avgPct}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-stone-400">
        <span>{formatKes(min)}</span>
        <span className="font-medium text-stone-500">avg {formatKes(avg)}</span>
        <span>{formatKes(max)}</span>
      </div>
    </div>
  );
}

function CommodityCard({ product, category }: { product: IntelligenceProductSnapshot; category: Category }) {
  const cfg = categoryConfig[category];
  return (
    <Link
      href={`/market-intelligence/${product.productKey}`}
      className="group flex flex-col rounded-[26px] border border-stone-200 bg-white p-5 shadow-[0_16px_50px_-28px_rgba(120,83,47,0.35)] transition duration-200 hover:-translate-y-1 hover:border-terra-200 hover:shadow-[0_22px_60px_-24px_rgba(120,83,47,0.45)]"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${cfg.badgeBg} ${cfg.badgeText}`}>
            {cfg.label}
          </span>
          <h3 className="mt-2 text-lg font-bold text-stone-900 group-hover:text-terra-700 transition">
            {product.productName}
          </h3>
        </div>
        <DealSignal product={product} />
      </div>

      {/* Price */}
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="font-mono text-2xl font-bold text-stone-900">
          {product.overallAverage > 0 ? formatKes(product.overallAverage) : "—"}
        </span>
        <span className="text-xs text-stone-400">/ {product.unit}</span>
      </div>

      <div className="mt-1.5">
        <TrendBadge direction={product.overallTrendDirection} percentage={product.overallTrendPercentage} />
      </div>

      {/* Price range bar */}
      {product.markets.length > 1 && <PriceRangeBar product={product} />}

      {/* Best market */}
      {product.bestMarket && (
        <div className="mt-3 rounded-[14px] border border-stone-100 bg-stone-50 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
            Best market
          </p>
          <div className="mt-0.5 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-stone-700 truncate">
              {product.bestMarket.marketName} · {product.bestMarket.county}
            </p>
            <span className="shrink-0 font-mono text-xs font-bold text-terra-600">
              {formatKes(product.bestMarket.avgPrice)}
            </span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-stone-100 pt-3">
        <span className="text-xs text-stone-400">
          {product.approvedMarkets} market{product.approvedMarkets !== 1 ? "s" : ""} · {product.submissionsCount} reports
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-terra-600 transition group-hover:gap-1.5">
          Deep dive <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}

function AiMarketBrief({ category, products }: { category: Category; products: IntelligenceProductSnapshot[] }) {
  const [brief, setBrief] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (loaded || products.length === 0) return;
    let cancelled = false;

    const fetchBrief = async () => {
      setLoading(true);
      abortRef.current = new AbortController();
      try {
        const payload = products.map((p) => ({
          name: p.productName,
          price: p.overallAverage,
          unit: p.unit,
          trend: formatTrendLabel(p.overallTrendDirection, p.overallTrendPercentage),
          bestMarket: p.bestMarket?.marketName ?? "",
          bestCounty: p.bestMarket?.county ?? "",
          bestPrice: p.bestMarket?.avgPrice ?? 0,
        }));

        const res = await fetch("/api/market-intelligence/insight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category, products: payload }),
          signal: abortRef.current.signal,
        });

        const data = res.ok ? await res.json().catch(() => null) : null;
        if (!cancelled) {
          setBrief(data?.brief ?? null);
          setLoaded(true);
        }
      } catch {
        // Graceful degradation — no brief shown
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchBrief();
    return () => {
      cancelled = true;
      abortRef.current?.abort();
    };
  }, [category, products, loaded]);

  if (!loading && !brief) return null;

  return (
    <div className="rounded-[24px] border border-amber-200 bg-gradient-to-br from-amber-50 to-[#fffdf8] p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-100">
          <Sparkles className="h-3.5 w-3.5 text-amber-600" />
        </span>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">
          AI Market Brief
        </p>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-3.5 w-3/4 animate-pulse rounded bg-amber-100" />
          <div className="h-3.5 w-full animate-pulse rounded bg-amber-100" />
          <div className="h-3.5 w-5/6 animate-pulse rounded bg-amber-100" />
        </div>
      ) : (
        <div className="space-y-2.5 text-sm leading-relaxed text-stone-700">
          {brief?.split("\n\n").filter(Boolean).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MarketIntelligenceExplorer({ initialOverview }: Props) {
  const [overview, setOverview] = useState<IntelligenceOverview>(initialOverview);
  const [activeCategory, setActiveCategory] = useState<Category>("produce");
  const [refreshing, setRefreshing] = useState(false);

  // Auto-refresh
  useEffect(() => {
    let cancelled = false;
    const interval = window.setInterval(async () => {
      if (cancelled) return;
      try {
        const res = await fetch(API_ENDPOINTS.marketIntelligence.overview, {
          cache: "no-store",
          credentials: "include",
        });
        const payload = res.ok ? await res.json().catch(() => null) : null;
        if (!cancelled && payload) setOverview(normalizeIntelligenceOverview(payload));
      } catch {
        // silent
      }
    }, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(API_ENDPOINTS.marketIntelligence.overview, {
        cache: "no-store",
        credentials: "include",
      });
      const payload = res.ok ? await res.json().catch(() => null) : null;
      if (payload) setOverview(normalizeIntelligenceOverview(payload));
    } finally {
      setRefreshing(false);
    }
  };

  const boardByCategory: Record<Category, IntelligenceProductSnapshot[]> = {
    produce: overview.produceBoard,
    livestock: overview.livestockBoard ?? [],
    inputs: overview.fertilizerBoard,
  };

  const board = boardByCategory[activeCategory];

  // Across-board stats
  const totalReports = overview.meta.approvedSubmissions;
  const totalProducts = overview.produceBoard.length + (overview.livestockBoard?.length ?? 0) + overview.fertilizerBoard.length;

  const tabs: { key: Category; label: string; count: number }[] = [
    { key: "produce", label: "Produce", count: overview.produceBoard.length },
    { key: "livestock", label: "Livestock", count: overview.livestockBoard?.length ?? 0 },
    { key: "inputs", label: "Inputs", count: overview.fertilizerBoard.length },
  ];

  return (
    <div className="page-shell py-10 sm:py-12">

      {/* ── Page header ── */}
      <section className="hero-panel p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
          <div>
            <p className="section-kicker">Kenya market intelligence</p>
            <h1 className="mt-4 text-4xl font-bold text-stone-900 sm:text-5xl">
              Check the board, spot the spread,{" "}
              <span className="text-terra-600">then act with confidence.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-stone-600">
              Live price signals across produce, livestock, and farm inputs — built from reviewed
              field submissions across Kenya.
            </p>
          </div>

          {/* Status + refresh */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-2">
            {[
              { label: "Approved reports", value: totalReports > 0 ? totalReports.toLocaleString() : "—" },
              { label: "Products tracked", value: totalProducts > 0 ? String(totalProducts) : "—" },
              { label: "Markets tracked", value: overview.meta.trackedMarkets > 0 ? String(overview.meta.trackedMarkets) : "—" },
              { label: "Last updated", value: formatIntelligenceDate(overview.generatedAt) },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-[18px] border border-stone-200 bg-white p-3 text-center">
                <p className="text-lg font-bold text-stone-900">{value}</p>
                <p className="mt-0.5 text-[11px] text-stone-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Top signals strip ── */}
      {overview.topSignals.length > 0 && (
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400">
              Top signals today
            </p>
            <button
              type="button"
              onClick={() => void handleRefresh()}
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 transition hover:border-terra-200 hover:text-terra-700"
            >
              <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {overview.topSignals.slice(0, 4).map((signal) => (
              <Link
                key={signal.productKey}
                href={`/market-intelligence/${signal.productKey}`}
                className="group rounded-[22px] border border-stone-200 bg-white p-4 transition hover:border-terra-200 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400">
                    {signal.productName}
                  </p>
                  <TrendBadge direction={signal.trendDirection} percentage={signal.trendPercentage} />
                </div>
                <p className="mt-1.5 font-mono text-xl font-bold text-stone-900">
                  {formatKes(signal.bestPrice)}
                </p>
                <p className="mt-0.5 text-xs text-stone-500 truncate">
                  {signal.bestMarketName} · {signal.bestCounty}
                </p>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-stone-500">
                  {signal.summary}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Category tabs ── */}
      <section className="mt-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex rounded-full border border-stone-200 bg-stone-50 p-1">
            {tabs.map(({ key, label, count }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveCategory(key)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeCategory === key
                    ? "bg-stone-900 text-white shadow-sm"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                {label}
                {count > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      activeCategory === key
                        ? "bg-white/20 text-white"
                        : "bg-stone-200 text-stone-600"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <Link
            href="/market-intelligence/submit"
            className="inline-flex items-center gap-2 rounded-full border border-terra-200 bg-terra-50 px-4 py-2 text-xs font-semibold text-terra-700 transition hover:bg-terra-100"
          >
            Submit a price →
          </Link>
        </div>

        {/* AI market brief */}
        {board.length > 0 && (
          <div className="mb-6">
            <AiMarketBrief key={activeCategory} category={activeCategory} products={board} />
          </div>
        )}

        {/* Commodity card grid */}
        {board.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {board.map((product) => (
              <CommodityCard key={product.productKey} product={product} category={activeCategory} />
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-stone-200 bg-white p-10 text-center">
            <p className="text-sm text-stone-500">
              No {categoryConfig[activeCategory].label.toLowerCase()} intelligence available yet.{" "}
              <Link href="/market-intelligence/submit" className="font-semibold text-terra-600 hover:text-terra-700">
                Submit the first price report.
              </Link>
            </p>
          </div>
        )}
      </section>

      {/* ── Recent contributions ── */}
      {overview.recentContributions.length > 0 && (
        <section className="mt-10">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400">
            Recent approved reports
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {overview.recentContributions.slice(0, 4).map((entry) => (
              <div
                key={entry.id}
                className="rounded-[20px] border border-stone-200 bg-white p-4"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-400">
                  {entry.productName}
                </p>
                <p className="mt-1 font-mono text-xl font-bold text-stone-900">
                  {formatKes(entry.price)}
                </p>
                <p className="mt-0.5 text-xs text-stone-600">
                  {entry.marketName} · {entry.county}
                </p>
                <p className="mt-2 text-[11px] text-stone-400">
                  {entry.contributorName} · {formatIntelligenceDate(entry.observationDate)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Bottom CTA ── */}
      <section className="mt-10 rounded-[28px] border border-stone-200 bg-gradient-to-br from-[#fffdf8] to-[#f7efe4] p-6 sm:p-8">
        <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">
              Keep the board strong
            </p>
            <h2 className="mt-2 text-2xl font-bold text-stone-900">
              Your price report improves the signal for every farmer in your county.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              One clean, honest price — market, county, and commodity — is all it takes.
            </p>
          </div>
          <Link href="/market-intelligence/submit" className="primary-button shrink-0">
            Submit today&apos;s price
          </Link>
        </div>
      </section>

    </div>
  );
}
