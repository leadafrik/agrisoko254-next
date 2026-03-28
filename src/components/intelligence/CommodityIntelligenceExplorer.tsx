"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import CountyPriceChart from "@/components/intelligence/CountyPriceChart";
import DecisionSnapshotCard from "@/components/intelligence/DecisionSnapshotCard";
import IntelligenceStatusStrip from "@/components/intelligence/IntelligenceStatusStrip";
import MarketBoardTable from "@/components/intelligence/MarketBoardTable";
import MarketPulsePanel from "@/components/intelligence/MarketPulsePanel";
import PriceSparkline from "@/components/intelligence/PriceSparkline";
import ShareIntelligenceSnapshotButton from "@/components/intelligence/ShareIntelligenceSnapshotButton";
import PriceSubmitModal from "@/components/intelligence/PriceSubmitModal";
import TradingActionBar from "@/components/intelligence/TradingActionBar";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  type IntelligenceProductHistory,
  type IntelligenceProductSnapshot,
  formatIntelligenceDate,
  formatKes,
  normalizeIntelligenceHistory,
  normalizeIntelligenceProduct,
} from "@/lib/market-intelligence";
import {
  buildProductPulseItems,
  buildScopedProductSnapshot,
} from "@/lib/market-intelligence-presentation";

type Props = {
  initialProduct: IntelligenceProductSnapshot;
  initialHistory: IntelligenceProductHistory;
};

const getRangeLabel = (product: IntelligenceProductSnapshot) => {
  const prices = product.markets.map((market) => market.avgPrice).filter((value) => value > 0);
  if (!prices.length) return "No approved range yet";
  return `${formatKes(Math.min(...prices))} to ${formatKes(Math.max(...prices))}`;
};

export default function CommodityIntelligenceExplorer({
  initialProduct,
  initialHistory,
}: Props) {
  const [product, setProduct] = useState(initialProduct);
  const [history, setHistory] = useState(initialHistory);
  const [recentHistory, setRecentHistory] = useState<IntelligenceProductHistory | null>(null);
  const [countyFilter, setCountyFilter] = useState("all");
  const [selectedMarketKey, setSelectedMarketKey] = useState(
    initialProduct.bestMarket?.marketKey || initialProduct.markets[0]?.marketKey || ""
  );
  const [priceMode, setPriceMode] = useState<"unit" | "kg">("unit");
  const [refreshing, setRefreshing] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);

  const countyOptions = Array.from(new Set(product.markets.map((market) => market.county))).sort();

  const filteredMarkets =
    countyFilter === "all"
      ? product.markets
      : product.markets.filter(
          (market) => market.county.toLowerCase() === countyFilter.toLowerCase()
        );

  const scopedProduct =
    filteredMarkets.length > 0
      ? buildScopedProductSnapshot(
          product,
          filteredMarkets,
          countyFilter === "all" ? undefined : countyFilter
        )
      : product;

  const focusMarket =
    scopedProduct.markets.find((market) => market.marketKey === selectedMarketKey) ||
    scopedProduct.bestMarket ||
    null;

  useEffect(() => {
    if (!scopedProduct.markets.length) {
      setSelectedMarketKey("");
      return;
    }

    const exists = scopedProduct.markets.some((market) => market.marketKey === selectedMarketKey);
    if (!exists) {
      setSelectedMarketKey(scopedProduct.bestMarket?.marketKey || scopedProduct.markets[0].marketKey);
    }
  }, [scopedProduct, selectedMarketKey]);

  useEffect(() => {
    let cancelled = false;

    const fetchFresh = async () => {
      try {
        const [productResponse, historyResponse, recentResponse] = await Promise.all([
          fetch(API_ENDPOINTS.marketIntelligence.byProduct(initialProduct.productKey), {
            cache: "no-store", credentials: "include",
          }),
          fetch(API_ENDPOINTS.marketIntelligence.history(initialProduct.productKey), {
            cache: "no-store", credentials: "include",
          }),
          fetch(API_ENDPOINTS.marketIntelligence.recentHistory(initialProduct.productKey), {
            cache: "no-store", credentials: "include",
          }),
        ]);

        const productPayload = productResponse.ok ? await productResponse.json().catch(() => null) : null;
        const historyPayload = historyResponse.ok ? await historyResponse.json().catch(() => null) : null;
        const recentPayload = recentResponse.ok ? await recentResponse.json().catch(() => null) : null;

        if (!cancelled && productPayload) {
          const nextProduct = normalizeIntelligenceProduct(productPayload, initialProduct.productKey);
          if (nextProduct) setProduct(nextProduct);
        }
        if (!cancelled && historyPayload) {
          const nextHistory = normalizeIntelligenceHistory(historyPayload, initialProduct.productKey);
          if (nextHistory) setHistory(nextHistory);
        }
        if (!cancelled && recentPayload) {
          const nextRecent = normalizeIntelligenceHistory(recentPayload, initialProduct.productKey);
          if (nextRecent) setRecentHistory(nextRecent);
        }
      } catch {}
    };

    // Fetch immediately on mount, then poll every 60s
    fetchFresh();
    const timer = window.setInterval(fetchFresh, 60_000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [initialProduct.productKey]);

  const handleRefresh = async () => {
    setRefreshing(true);
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

      const productPayload = productResponse.ok ? await productResponse.json().catch(() => null) : null;
      const historyPayload = historyResponse.ok ? await historyResponse.json().catch(() => null) : null;

      if (productPayload) {
        const nextProduct = normalizeIntelligenceProduct(productPayload, initialProduct.productKey);
        if (nextProduct) setProduct(nextProduct);
      }

      if (historyPayload) {
        const nextHistory = normalizeIntelligenceHistory(historyPayload, initialProduct.productKey);
        if (nextHistory) setHistory(nextHistory);
      }
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="page-shell py-8 sm:py-10">
      <nav className="mb-6 flex items-center gap-2 text-sm text-stone-500">
        <Link href="/market-intelligence" className="hover:text-terra-600">
          Market intelligence
        </Link>
        <span className="text-stone-300">/</span>
        <span className="font-medium text-stone-700">{product.productName}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="section-kicker">{product.category} board</p>
          <h1 className="mt-4 text-4xl font-bold text-stone-900 sm:text-5xl">
            {product.productName} decision board
          </h1>
          <p className="mt-4 text-base leading-relaxed text-stone-600">
            Use this board to compare current Kenya prices, see where the strongest and weakest
            markets are, and decide where to sell or buy before you move stock.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ShareIntelligenceSnapshotButton
            productKey={product.productKey}
            productName={product.productName}
            avgPrice={scopedProduct.overallAverage}
            bestPrice={focusMarket?.avgPrice || scopedProduct.bestMarket?.avgPrice}
            bestCounty={focusMarket?.county || scopedProduct.bestMarket?.county}
            bestMarketName={focusMarket?.marketName || scopedProduct.bestMarket?.marketName}
            unit={product.unit}
            trendDirection={scopedProduct.overallTrendDirection}
            trendPercentage={scopedProduct.overallTrendPercentage}
            label="Share snapshot"
            className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-600 transition hover:border-terra-200 hover:text-terra-700"
          />
          <button
            type="button"
            onClick={() => void handleRefresh()}
            className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-600 transition hover:border-terra-200 hover:text-terra-700"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh board
          </button>
        </div>
      </div>

      <IntelligenceStatusStrip
        className="mt-8"
        items={[
          { label: "Board average", value: formatKes(scopedProduct.overallAverage) },
          { label: "Trading range", value: getRangeLabel(scopedProduct) },
          { label: "Reports", value: scopedProduct.submissionsCount.toLocaleString() },
          {
            label: "Updated",
            value: formatIntelligenceDate(scopedProduct.lastUpdated || scopedProduct.generatedAt),
          },
        ]}
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.35fr,0.95fr]">
        <DecisionSnapshotCard
          product={scopedProduct}
          focusMarket={focusMarket}
          priceMode={priceMode}
          onPriceModeChange={setPriceMode}
        />
        <MarketPulsePanel
          items={buildProductPulseItems(scopedProduct, focusMarket)}
          title="Farmer takeaway"
        />
      </div>

      <TradingActionBar
        submitHref={`/market-intelligence/submit?product=${product.productKey}`}
        onSubmitClick={() => setSubmitOpen(true)}
        compareHref="/market-intelligence"
        compareLabel="All commodities"
        invite={{
          productKey: product.productKey,
          productName: product.productName,
          county: focusMarket?.county,
          marketName: focusMarket?.marketName,
          unit: product.unit,
        }}
      />
      <PriceSubmitModal
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        defaultProductKey={product.productKey}
      />

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setCountyFilter("all")}
          className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
            countyFilter === "all"
              ? "border-stone-900 bg-stone-900 text-white"
              : "border-stone-200 bg-white text-stone-600 hover:border-terra-200 hover:text-terra-700"
          }`}
        >
          All markets
        </button>
        {countyOptions.map((county) => (
          <button
            key={county}
            type="button"
            onClick={() => setCountyFilter(county)}
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
              countyFilter === county
                ? "border-terra-500 bg-terra-500 text-white"
                : "border-stone-200 bg-white text-stone-600 hover:border-terra-200 hover:text-terra-700"
            }`}
          >
            {county}
          </button>
        ))}
      </div>

      <MarketBoardTable
        className="mt-6"
        product={scopedProduct}
        markets={scopedProduct.markets}
        selectedMarketKey={focusMarket?.marketKey}
        onSelectMarket={setSelectedMarketKey}
        priceMode={priceMode}
        onPriceModeChange={setPriceMode}
      />

      {/* ── Visual history section ─────────────────────────────────────── */}
      <div className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_1fr]">

        {/* Daily price trend sparkline */}
        <div className="overflow-hidden rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_20px_55px_-36px_rgba(120,83,47,0.22)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
            Price trend
          </p>
          <h2 className="mt-2 text-xl font-bold text-stone-900">
            Daily movement — {product.productName}
          </h2>

          {history.dailyAverageSeries.length >= 2 ? (
            <PriceSparkline
              className="mt-5"
              points={history.dailyAverageSeries.map((row) => ({
                date: row.date || "",
                price: row.averagePrice,
              }))}
              height={140}
              unit={product.unit}
            />
          ) : (
            <p className="mt-5 text-sm text-stone-400">
              Not enough daily data yet. More points appear as reports come in.
            </p>
          )}

          {/* Summary row */}
          {history.dailyAverageSeries.length >= 2 && (
            <div className="mt-4 grid grid-cols-3 gap-3 rounded-[20px] bg-[#fbf8f2] p-3">
              {[
                {
                  label: "Earliest",
                  value: formatKes(history.dailyAverageSeries[0]?.averagePrice),
                },
                {
                  label: "Latest",
                  value: formatKes(
                    history.dailyAverageSeries[history.dailyAverageSeries.length - 1]?.averagePrice
                  ),
                },
                {
                  label: "Data points",
                  value: history.dailyAverageSeries.length.toString(),
                },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-sm font-bold text-stone-900">{stat.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* County price comparison — uses last 90 days so prices match current market */}
        <div className="overflow-hidden rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_20px_55px_-36px_rgba(120,83,47,0.22)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
            County comparison
          </p>
          <h2 className="mt-2 text-xl font-bold text-stone-900">
            Price by county <span className="text-sm font-normal text-stone-400">· last 90 days</span>
          </h2>

          {(recentHistory ?? history).countyAverages.length > 0 ? (
            <CountyPriceChart
              className="mt-5"
              bars={(recentHistory ?? history).countyAverages.map((row) => ({
                county: row.county || "Unknown",
                price: row.averagePrice,
                submissionsCount: row.submissionsCount,
              }))}
              unit={product.unit}
              avgPrice={scopedProduct.overallAverage}
            />
          ) : (
            <p className="mt-5 text-sm text-stone-400">
              County breakdown will appear once enough reports have been approved.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
