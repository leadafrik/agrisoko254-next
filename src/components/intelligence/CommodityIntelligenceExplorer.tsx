"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import DecisionSnapshotCard from "@/components/intelligence/DecisionSnapshotCard";
import IntelligenceStatusStrip from "@/components/intelligence/IntelligenceStatusStrip";
import MarketBoardTable from "@/components/intelligence/MarketBoardTable";
import MarketPulsePanel from "@/components/intelligence/MarketPulsePanel";
import ShareIntelligenceSnapshotButton from "@/components/intelligence/ShareIntelligenceSnapshotButton";
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

type HistoryMode = "market" | "county" | "daily";

const getRangeLabel = (product: IntelligenceProductSnapshot) => {
  const prices = product.markets.map((market) => market.avgPrice).filter((value) => value > 0);
  if (!prices.length) return "No approved range yet";
  return `${formatKes(Math.min(...prices))} to ${formatKes(Math.max(...prices))}`;
};

const getHistoryRows = (history: IntelligenceProductHistory, mode: HistoryMode) => {
  if (mode === "county") {
    return history.countyAverages.map((row) => ({
      key: `${row.county}-${row.lastUpdated}`,
      label: row.county || "County",
      value: formatKes(row.averagePrice),
      helper: `${row.submissionsCount} reports`,
    }));
  }

  if (mode === "daily") {
    return history.dailyAverageSeries.map((row) => ({
      key: `${row.date}-${row.lastUpdated}`,
      label: row.date || "Latest day",
      value: formatKes(row.averagePrice),
      helper: `${row.submissionsCount} reports`,
    }));
  }

  return history.marketAverages.map((row) => ({
    key: `${row.marketName}-${row.county}-${row.lastUpdated}`,
    label: row.marketName || "Market",
    value: formatKes(row.averagePrice),
    helper: row.county || "Kenya",
  }));
};

export default function CommodityIntelligenceExplorer({
  initialProduct,
  initialHistory,
}: Props) {
  const [product, setProduct] = useState(initialProduct);
  const [history, setHistory] = useState(initialHistory);
  const [countyFilter, setCountyFilter] = useState("all");
  const [selectedMarketKey, setSelectedMarketKey] = useState(
    initialProduct.bestMarket?.marketKey || initialProduct.markets[0]?.marketKey || ""
  );
  const [historyMode, setHistoryMode] = useState<HistoryMode>("market");
  const [refreshing, setRefreshing] = useState(false);

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

  const historyRows = getHistoryRows(history, historyMode).slice(0, 8);

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
    const timer = window.setInterval(async () => {
      if (cancelled) return;
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

        if (!cancelled && productPayload) {
          const nextProduct = normalizeIntelligenceProduct(productPayload, initialProduct.productKey);
          if (nextProduct) setProduct(nextProduct);
        }

        if (!cancelled && historyPayload) {
          const nextHistory = normalizeIntelligenceHistory(historyPayload, initialProduct.productKey);
          if (nextHistory) setHistory(nextHistory);
        }
      } catch {}
    }, 60_000);

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
        <DecisionSnapshotCard product={scopedProduct} focusMarket={focusMarket} />
        <MarketPulsePanel
          items={buildProductPulseItems(scopedProduct, focusMarket)}
          title="Farmer takeaway"
        />
      </div>

      <TradingActionBar
        submitHref={`/market-intelligence/submit?product=${product.productKey}`}
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
      />

      <div className="mt-8 rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_20px_55px_-36px_rgba(120,83,47,0.28)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
              Historical averages
            </p>
            <h2 className="mt-2 text-2xl font-bold text-stone-900">
              Compare the cleaner historical view
            </h2>
          </div>

          <div className="inline-flex rounded-full border border-stone-200 bg-stone-50 p-1">
            {(["market", "county", "daily"] as HistoryMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setHistoryMode(mode)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  historyMode === mode
                    ? "bg-stone-900 text-white"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                {mode === "market" ? "By market" : mode === "county" ? "By county" : "Daily"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {historyRows.map((row) => (
            <div key={row.key} className="rounded-[20px] border border-stone-200 bg-[#fbf8f2] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                {row.label}
              </p>
              <p className="mt-2 text-xl font-bold text-stone-900">{row.value}</p>
              <p className="mt-2 text-sm text-stone-600">{row.helper}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
