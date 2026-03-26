"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useState } from "react";
import {
  ArrowRight,
  CircleDot,
  FlaskConical,
  MapPinned,
  Megaphone,
  Minus,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import InvitePriceButton from "@/components/intelligence/InvitePriceButton";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  type IntelligenceOverview,
  formatIntelligenceDate,
  formatKes,
  formatTrendLabel,
  getFallbackIntelligenceOverview,
  normalizeIntelligenceOverview,
} from "@/lib/market-intelligence";

type Props = {
  initialOverview: IntelligenceOverview;
};

const trendIcon = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
} as const;

const REFRESH_INTERVAL_MS = 60000;

export default function MarketIntelligenceExplorer({ initialOverview }: Props) {
  const fallbackOverview = getFallbackIntelligenceOverview();
  const [overview, setOverview] = useState<IntelligenceOverview>(initialOverview);
  const [activeCategory, setActiveCategory] = useState<"produce" | "inputs">("produce");
  const [countyFilter, setCountyFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"opportunity" | "trend" | "activity">("opportunity");
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    let cancelled = false;

    const refreshOverview = async (showSpinner = false) => {
      if (showSpinner) setRefreshing(true);
      try {
        const response = await fetch(API_ENDPOINTS.marketIntelligence.overview, {
          cache: "no-store",
          credentials: "include",
        });
        if (!response.ok) return;
        const payload = await response.json().catch(() => null);
        if (!payload || cancelled) return;
        setOverview(normalizeIntelligenceOverview(payload));
      } finally {
        if (!cancelled && showSpinner) setRefreshing(false);
      }
    };

    const interval = window.setInterval(() => void refreshOverview(false), REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const categoryBoard =
    activeCategory === "produce"
      ? overview.produceBoard.length
        ? overview.produceBoard
        : fallbackOverview.produceBoard
      : overview.fertilizerBoard.length
        ? overview.fertilizerBoard
        : fallbackOverview.fertilizerBoard;

  const countyOptions = Array.from(
    new Set(
      categoryBoard.flatMap((item) => [
        item.bestMarket?.county || "",
        ...item.markets.map((market) => market.county),
      ]).filter(Boolean)
    )
  ).sort();

  const needle = deferredQuery.trim().toLowerCase();
  let filteredBoard = categoryBoard.filter((item) => {
    const matchesQuery =
      !needle ||
      item.productName.toLowerCase().includes(needle) ||
      item.markets.some(
        (market) =>
          market.marketName.toLowerCase().includes(needle) ||
          market.county.toLowerCase().includes(needle)
      );

    const matchesCounty =
      countyFilter === "all" ||
      item.markets.some((market) => market.county.toLowerCase() === countyFilter.toLowerCase());

    return matchesQuery && matchesCounty;
  });

  filteredBoard = filteredBoard.slice().sort((left, right) => {
    if (sortBy === "trend") {
      return Math.abs(right.overallTrendPercentage) - Math.abs(left.overallTrendPercentage);
    }
    if (sortBy === "activity") {
      return right.submissionsCount - left.submissionsCount;
    }

    const leftSpread = (left.bestMarket?.avgPrice || 0) - (left.weakestMarket?.avgPrice || 0);
    const rightSpread = (right.bestMarket?.avgPrice || 0) - (right.weakestMarket?.avgPrice || 0);
    return rightSpread - leftSpread;
  });

  const heroBoard = overview.produceBoard.length ? overview.produceBoard : fallbackOverview.produceBoard;
  const highlightedCountyCards =
    countyFilter === "all"
      ? heroBoard.slice(0, 4)
      : heroBoard.filter((item) =>
          item.markets.some((market) => market.county.toLowerCase() === countyFilter.toLowerCase())
        );
  const recentContributions = overview.recentContributions.length
    ? overview.recentContributions
    : fallbackOverview.recentContributions;

  const handleRefresh = async () => {
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
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="page-shell py-10 sm:py-12">
      <section className="hero-panel p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="section-kicker">Market intelligence</p>
            <h1 className="mt-4 text-4xl font-bold text-stone-900 sm:text-5xl">
              What should you do with your crops today?
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-stone-600">
              Live county price signals, best-market clues, and input watchlists built from
              reviewed market reports.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/market-intelligence/submit" className="primary-button">
                Submit today&apos;s price
              </Link>
              <Link href="/browse" className="secondary-button">
                Browse marketplace
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-sm text-stone-600">
              <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 font-medium">
                {overview.meta.approvedSubmissions || 0} approved reports in the current board
              </span>
              <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 font-medium">
                {overview.meta.trackedMarkets || 0} tracked county markets
              </span>
              <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 font-medium">
                Updated {formatIntelligenceDate(overview.generatedAt)}
              </span>
            </div>

            {overview.isFallback ? (
              <p className="mt-4 max-w-2xl text-sm text-stone-500">
                You are seeing the Agrisoko starter board while live verified submissions build up.
                New approved reports will automatically replace these reference signals.
              </p>
            ) : null}
          </div>

          <div className="surface-card p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Best markets right now
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
            <div className="mt-4 space-y-3">
              {heroBoard.slice(0, 3).map((item) => (
                <div
                  key={item.productKey}
                  className="rounded-[22px] border border-stone-200 bg-[#fbf8f2] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terra-600">
                        {item.productName}
                      </p>
                      <h2 className="mt-2 text-xl font-bold text-stone-900">
                        {item.bestMarket?.county}
                      </h2>
                    </div>
                    <span className="rounded-full bg-forest-100 px-3 py-1 text-xs font-semibold text-forest-700">
                      {formatKes(item.bestMarket?.avgPrice || 0)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600">{item.insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="section-kicker">Interactive board</p>
            <h2 className="mt-3 text-3xl font-bold text-stone-900">
              Filter, compare, and sort market signals live
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="inline-flex rounded-full border border-stone-200 bg-white p-1">
              {([
                ["produce", "Produce"],
                ["inputs", "Inputs"],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setActiveCategory(value)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeCategory === value
                      ? "bg-stone-900 text-white"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search commodity or market"
              className="field-input min-w-[220px]"
            />
            <select
              value={countyFilter}
              onChange={(event) => setCountyFilter(event.target.value)}
              className="field-select min-w-[180px]"
            >
              <option value="all">All counties</option>
              {countyOptions.map((county) => (
                <option key={county} value={county}>
                  {county}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value as "opportunity" | "trend" | "activity")
              }
              className="field-select min-w-[180px]"
            >
              <option value="opportunity">Sort by opportunity gap</option>
              <option value="trend">Sort by strongest trend</option>
              <option value="activity">Sort by report activity</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-sm text-stone-500">
          <span className="rounded-full border border-stone-200 bg-white px-3 py-1.5">
            {filteredBoard.length} commodities visible
          </span>
          <span className="rounded-full border border-stone-200 bg-white px-3 py-1.5">
            {activeCategory === "produce" ? "Produce board" : "Input watchlist"}
          </span>
          {countyFilter !== "all" ? (
            <span className="rounded-full border border-terra-200 bg-terra-50 px-3 py-1.5 text-terra-700">
              Focus county: {countyFilter}
            </span>
          ) : null}
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {filteredBoard.map((item) => {
            const TrendIcon = trendIcon[item.overallTrendDirection];
            const focusedMarket =
              countyFilter === "all"
                ? item.bestMarket
                : item.markets.find(
                    (market) => market.county.toLowerCase() === countyFilter.toLowerCase()
                  ) || item.bestMarket;
            const spread = (item.bestMarket?.avgPrice || 0) - (item.weakestMarket?.avgPrice || 0);

            return (
              <article key={item.productKey} className="surface-card p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
                  <div className="max-w-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-terra-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-terra-700">
                        {item.productName}
                      </span>
                      <span className="rounded-full border border-stone-200 px-3 py-1 text-xs font-semibold text-stone-500">
                        {item.unit}
                      </span>
                    </div>
                    <h3 className="mt-3 text-2xl font-bold text-stone-900">
                      {focusedMarket?.county} is the live focus signal
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-stone-600">{item.insight}</p>

                    <div className="mt-5 flex flex-wrap gap-2 text-sm">
                      <span className="rounded-full border border-stone-200 px-3 py-1.5 font-semibold text-stone-700">
                        {formatKes(focusedMarket?.avgPrice || 0)} focus price
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-stone-200 px-3 py-1.5 font-semibold text-stone-700">
                        <TrendIcon className="h-3.5 w-3.5" />
                        {formatTrendLabel(item.overallTrendDirection, item.overallTrendPercentage)}
                      </span>
                      <span className="rounded-full border border-stone-200 px-3 py-1.5 font-semibold text-stone-700">
                        {formatKes(spread)} market spread
                      </span>
                      <span className="rounded-full border border-stone-200 px-3 py-1.5 font-semibold text-stone-700">
                        {item.submissionsCount} approved reports
                      </span>
                    </div>
                  </div>

                  <div className="flex w-full max-w-sm flex-col gap-3">
                    <Link
                      href={`/market-intelligence/${item.productKey}`}
                      className="primary-button w-full"
                    >
                      Open {item.productName} board
                    </Link>
                    <InvitePriceButton
                      productKey={item.productKey}
                      productName={item.productName}
                      county={focusedMarket?.county}
                      marketName={focusedMarket?.marketName}
                      unit={item.unit}
                    />
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {item.markets
                    .filter(
                      (market) =>
                        countyFilter === "all" ||
                        market.county.toLowerCase() === countyFilter.toLowerCase()
                    )
                    .slice(0, 4)
                    .map((market) => (
                      <div
                        key={market.marketKey}
                        className="rounded-[22px] border border-stone-200 bg-[#fbf8f2] p-4"
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                          {market.marketName}
                        </p>
                        <h4 className="mt-2 text-lg font-bold text-stone-900">{market.county}</h4>
                        <p className="mt-3 text-xl font-bold text-terra-600">
                          {formatKes(market.avgPrice)}
                        </p>
                        <p className="mt-2 text-xs font-medium text-stone-500">
                          {formatTrendLabel(market.trendDirection, market.trendPercentage)}
                        </p>
                        <p className="mt-2 text-xs text-stone-500">
                          {market.submissionsCount} reports / Updated{" "}
                          {formatIntelligenceDate(market.lastUpdated)}
                        </p>
                      </div>
                    ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-14 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="surface-card p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f3ea] text-forest-700">
              <MapPinned className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                County view
              </p>
              <h2 className="mt-1 text-2xl font-bold text-stone-900">
                {countyFilter === "all"
                  ? "Price matters. Location changes the decision."
                  : `How ${countyFilter} compares right now.`}
              </h2>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {highlightedCountyCards.slice(0, 4).map((item) => {
              const countyMatch =
                countyFilter === "all"
                  ? item.bestMarket
                  : item.markets.find(
                      (market) => market.county.toLowerCase() === countyFilter.toLowerCase()
                    ) || item.bestMarket;
              return (
                <div
                  key={item.productKey}
                  className="rounded-[22px] border border-stone-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-stone-900">{item.productName}</p>
                      <p className="mt-1 text-sm text-stone-500">
                        {countyMatch?.marketName}, {countyMatch?.county}
                      </p>
                    </div>
                    <span className="rounded-full bg-forest-100 px-3 py-1 text-xs font-semibold text-forest-700">
                      {formatKes(countyMatch?.avgPrice || 0)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="surface-card p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff2dd] text-amber-700">
              <FlaskConical className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Fertilizer monitor
              </p>
              <h2 className="mt-1 text-2xl font-bold text-stone-900">
                Watch input costs with the same discipline as crop prices.
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {(overview.fertilizerBoard.length ? overview.fertilizerBoard : fallbackOverview.fertilizerBoard).map((item) => (
              <div
                key={item.productKey}
                className="rounded-[22px] border border-stone-200 bg-[#fbf8f2] p-4"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                  {item.unit}
                </p>
                <h3 className="mt-2 text-xl font-bold text-stone-900">{item.productName}</h3>
                <p className="mt-3 text-2xl font-bold text-terra-600">
                  {formatKes(item.bestMarket?.avgPrice || 0)}
                </p>
                <p className="mt-2 text-sm text-stone-600">
                  Highest observed in {item.bestMarket?.county}
                </p>
                <p className="mt-2 text-xs text-stone-500">{item.insight}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-14 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="surface-panel p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            How this stays clean
          </p>
          <div className="mt-5 space-y-4">
            {[
              {
                title: "Field reports first",
                copy: "Farmers, traders, agrovets, and the Agrisoko team submit prices by product, market, and unit.",
              },
              {
                title: "Reviewed before publishing",
                copy: "Submissions do not hit the public board automatically. They are reviewed first.",
              },
              {
                title: "Averages over single quotes",
                copy: "The board compares multiple reports so one noisy quote does not distort the signal.",
              },
            ].map((item, index) => (
              <div key={item.title} className="rounded-[22px] border border-stone-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-terra-500 text-xs font-bold text-white">
                    0{index + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-stone-900">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-stone-600">{item.copy}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-terra-50 text-terra-700">
              <Megaphone className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Latest approved contributions
              </p>
              <h2 className="mt-1 text-2xl font-bold text-stone-900">
                Invite more market answers
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {recentContributions.slice(0, 4).map((entry) => (
              <div
                key={entry.id}
                className="rounded-[22px] border border-stone-200 bg-[#fbf8f2] p-4"
              >
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                  <CircleDot className="h-3.5 w-3.5 text-forest-600" />
                  {entry.productName}
                </div>
                <h3 className="mt-3 text-xl font-bold text-stone-900">
                  {formatKes(entry.price)}
                </h3>
                <p className="mt-1 text-sm text-stone-600">
                  {entry.marketName}, {entry.county}
                </p>
                <p className="mt-3 text-xs text-stone-500">
                  Submitted by {entry.contributorName} / {formatIntelligenceDate(entry.observationDate)}
                </p>
                <div className="mt-4">
                  <InvitePriceButton
                    productKey={entry.productKey}
                    productName={entry.productName}
                    county={entry.county}
                    marketName={entry.marketName}
                    unit={entry.unit}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 transition hover:border-terra-200 hover:text-terra-700"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-14 overflow-hidden rounded-[32px] bg-gradient-to-br from-stone-900 via-stone-800 to-[#4b2b1f] p-8 text-white shadow-[0_26px_72px_-44px_rgba(28,25,23,0.55)] sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
              Help build the board
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Invite your buyers, farmers, and agrovets into one cleaner pricing loop.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/75 sm:text-base">
              The best intelligence board in Kenya will be built one credible market report at a
              time. Start with one product, one market, and one clean contribution link.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <Link
              href="/market-intelligence/submit"
              className="secondary-button border-white/20 bg-white text-stone-900 hover:bg-stone-100"
            >
              Submit today&apos;s price
            </Link>
            <Link
              href="/market-intelligence/maize"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Open maize board
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
