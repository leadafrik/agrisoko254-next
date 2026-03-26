"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import CommodityQuickPicker from "@/components/intelligence/CommodityQuickPicker";
import DecisionSnapshotCard from "@/components/intelligence/DecisionSnapshotCard";
import IntelligenceStatusStrip from "@/components/intelligence/IntelligenceStatusStrip";
import MarketBoardTable from "@/components/intelligence/MarketBoardTable";
import MarketPulsePanel from "@/components/intelligence/MarketPulsePanel";
import TradingActionBar from "@/components/intelligence/TradingActionBar";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  type IntelligenceCategory,
  type IntelligenceOverview,
  type IntelligenceProductSnapshot,
  formatKes,
  normalizeIntelligenceOverview,
} from "@/lib/market-intelligence";
import {
  buildProductPulseItems,
  buildScopedProductSnapshot,
} from "@/lib/market-intelligence-presentation";

type Props = { initialOverview: IntelligenceOverview };

const REFRESH_MS = 45_000;

const CATEGORY_LABELS: Record<IntelligenceCategory, string> = {
  produce: "Produce",
  livestock: "Livestock",
  inputs: "Farm inputs",
};

const getBoardRange = (product: IntelligenceProductSnapshot) => {
  const prices = product.markets.map((market) => market.avgPrice).filter((value) => value > 0);
  if (!prices.length) return "No approved range yet";
  return `${formatKes(Math.min(...prices))} to ${formatKes(Math.max(...prices))}`;
};

const getStatusItems = (product: IntelligenceProductSnapshot) => [
  { label: "Market average", value: formatKes(product.overallAverage) },
  { label: "Trading range", value: getBoardRange(product) },
  {
    label: "Best market",
    value: product.bestMarket
      ? `${product.bestMarket.county} ${formatKes(product.bestMarket.avgPrice)}`
      : "Waiting for signals",
  },
  {
    label: "Cheapest market",
    value: product.weakestMarket
      ? `${product.weakestMarket.county} ${formatKes(product.weakestMarket.avgPrice)}`
      : "Waiting for signals",
  },
];

const getTopSignalItems = (overview: IntelligenceOverview, activeProductKey: string) =>
  overview.topSignals
    .filter((signal) => signal.productKey !== activeProductKey)
    .slice(0, 2)
    .map((signal) => signal.summary);

export default function MarketIntelligenceExplorer({ initialOverview }: Props) {
  const [overview, setOverview] = useState(initialOverview);
  const [activeCategory, setActiveCategory] = useState<IntelligenceCategory>("produce");
  const [selectedProductKey, setSelectedProductKey] = useState(
    initialOverview.produceBoard[0]?.productKey ||
      initialOverview.livestockBoard[0]?.productKey ||
      initialOverview.fertilizerBoard[0]?.productKey ||
      ""
  );
  const [selectedMarketKey, setSelectedMarketKey] = useState("");
  const [countyFilter, setCountyFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const boards: Record<IntelligenceCategory, IntelligenceProductSnapshot[]> = {
    produce: overview.produceBoard,
    livestock: overview.livestockBoard ?? [],
    inputs: overview.fertilizerBoard,
  };

  const activeBoard = boards[activeCategory];
  const fallbackProduct =
    activeBoard[0] ||
    overview.produceBoard[0] ||
    overview.livestockBoard[0] ||
    overview.fertilizerBoard[0] ||
    null;
  const baseProduct =
    activeBoard.find((product) => product.productKey === selectedProductKey) || fallbackProduct;

  const countyOptions = Array.from(
    new Set((baseProduct?.markets || []).map((market) => market.county))
  ).sort();

  const filteredMarkets =
    !baseProduct || countyFilter === "all"
      ? baseProduct?.markets || []
      : baseProduct.markets.filter(
          (market) => market.county.toLowerCase() === countyFilter.toLowerCase()
        );

  const scopedProduct =
    baseProduct && filteredMarkets.length
      ? buildScopedProductSnapshot(
          baseProduct,
          filteredMarkets,
          countyFilter === "all" ? undefined : countyFilter
        )
      : baseProduct;

  const focusMarket =
    scopedProduct?.markets.find((market) => market.marketKey === selectedMarketKey) ||
    scopedProduct?.bestMarket ||
    null;

  useEffect(() => {
    if (!activeBoard.length) return;
    const exists = activeBoard.some((product) => product.productKey === selectedProductKey);
    if (!exists) {
      setSelectedProductKey(activeBoard[0].productKey);
      setCountyFilter("all");
    }
  }, [activeBoard, selectedProductKey]);

  useEffect(() => {
    if (!scopedProduct?.markets.length) {
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
        const response = await fetch(API_ENDPOINTS.marketIntelligence.overview, {
          cache: "no-store",
          credentials: "include",
        });
        const payload = response.ok ? await response.json().catch(() => null) : null;
        if (!cancelled && payload) {
          setOverview(normalizeIntelligenceOverview(payload));
        }
      } catch {}
    }, REFRESH_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(API_ENDPOINTS.marketIntelligence.overview, {
        cache: "no-store",
        credentials: "include",
      });
      const payload = response.ok ? await response.json().catch(() => null) : null;
      if (payload) {
        setOverview(normalizeIntelligenceOverview(payload));
      }
    } finally {
      setRefreshing(false);
    }
  };

  const pulseItems = scopedProduct
    ? [...buildProductPulseItems(scopedProduct, focusMarket), ...getTopSignalItems(overview, scopedProduct.productKey)].slice(0, 4)
    : [];

  return (
    <div className="page-shell py-10 sm:py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="section-kicker">Kenya market intelligence</p>
          <h1 className="mt-4 text-4xl font-bold text-stone-900 sm:text-5xl">
            Live prices made useful for farmers.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-stone-600">
            Choose a commodity and see the average price, trading range, best market to sell,
            cheapest market to buy, and a clean board of approved Kenya signals.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleRefresh()}
          className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-600 transition hover:border-terra-200 hover:text-terra-700"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh board
        </button>
      </div>

      <IntelligenceStatusStrip
        className="mt-8"
        items={[
          { label: "Approved reports", value: overview.meta.approvedSubmissions.toLocaleString() },
          { label: "Tracked products", value: overview.meta.trackedProducts.toString() },
          { label: "Tracked markets", value: overview.meta.trackedMarkets.toString() },
          { label: "Coverage", value: "Kenya only" },
        ]}
      />

      <div className="mt-8 inline-flex rounded-full border border-stone-200 bg-stone-50 p-1">
        {(Object.keys(CATEGORY_LABELS) as IntelligenceCategory[]).map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => {
              setActiveCategory(category);
              setCountyFilter("all");
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeCategory === category
                ? "bg-stone-900 text-white shadow-sm"
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            {CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>

      {activeBoard.length ? (
        <>
          <CommodityQuickPicker
            className="mt-6"
            title={`Choose a ${CATEGORY_LABELS[activeCategory].toLowerCase()} signal`}
            description="Start with the commodity you actually need to price today."
            products={activeBoard.map((product) => ({
              key: product.productKey,
              name: product.productName,
              value: formatKes(product.overallAverage),
              helper: product.bestMarket
                ? `Best sell: ${product.bestMarket.county} at ${formatKes(product.bestMarket.avgPrice)}`
                : "Waiting for approved price signals",
            }))}
            selectedKey={baseProduct?.productKey || ""}
            onSelect={(productKey) => {
              setSelectedProductKey(productKey);
              setCountyFilter("all");
            }}
          />

          {scopedProduct ? (
            <>
              <div className="mt-8 grid gap-6 xl:grid-cols-[1.35fr,0.95fr]">
                <DecisionSnapshotCard product={scopedProduct} focusMarket={focusMarket} />
                <div className="space-y-6">
                  <IntelligenceStatusStrip items={getStatusItems(scopedProduct)} />
                  <MarketPulsePanel
                    items={pulseItems}
                    title="What should I do?"
                  />
                </div>
              </div>

              <TradingActionBar
                submitHref={`/market-intelligence/submit?product=${scopedProduct.productKey}`}
                compareHref={`/market-intelligence/${scopedProduct.productKey}`}
                invite={{
                  productKey: scopedProduct.productKey,
                  productName: scopedProduct.productName,
                  county: focusMarket?.county,
                  marketName: focusMarket?.marketName,
                  unit: scopedProduct.unit,
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

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-stone-200 bg-[#faf7f2] px-5 py-4">
                <p className="text-sm text-stone-600">
                  Need deeper detail on {scopedProduct.productName.toLowerCase()}? Open the full
                  commodity board for focused history and comparison.
                </p>
                <Link
                  href={`/market-intelligence/${scopedProduct.productKey}`}
                  className="text-sm font-semibold text-terra-600 hover:text-terra-700"
                >
                  Open {scopedProduct.productName} board
                </Link>
              </div>
            </>
          ) : null}
        </>
      ) : (
        <div className="mt-8 rounded-[28px] border border-dashed border-stone-200 bg-white p-10 text-center text-sm text-stone-500">
          No approved data yet for this category. Start with a clean submission from your market.
        </div>
      )}
    </div>
  );
}
