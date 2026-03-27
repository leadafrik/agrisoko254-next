"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BarChart3, RefreshCw, ShieldCheck, Shapes, Sprout } from "lucide-react";
import CommodityQuickPicker from "@/components/intelligence/CommodityQuickPicker";
import DecisionSnapshotCard from "@/components/intelligence/DecisionSnapshotCard";
import IntelligenceStatusStrip from "@/components/intelligence/IntelligenceStatusStrip";
import MarketBoardTable from "@/components/intelligence/MarketBoardTable";
import MarketPulsePanel from "@/components/intelligence/MarketPulsePanel";
import ShareIntelligenceSnapshotButton from "@/components/intelligence/ShareIntelligenceSnapshotButton";
import SharePricePrompt from "@/components/intelligence/SharePricePrompt";
import PriceSubmitModal from "@/components/intelligence/PriceSubmitModal";
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

const CATEGORY_META: Record<
  IntelligenceCategory,
  { label: string; icon: typeof Sprout }
> = {
  produce: { label: "Produce", icon: Sprout },
  livestock: { label: "Livestock", icon: Shapes },
  inputs: { label: "Farm inputs", icon: BarChart3 },
};

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
  const [submitOpen, setSubmitOpen] = useState(false);

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
      } catch {
        // Ignore intermittent polling failures.
      }
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
    ? [
        ...buildProductPulseItems(scopedProduct, focusMarket),
        ...getTopSignalItems(overview, scopedProduct.productKey),
      ].slice(0, 4)
    : [];

  return (
    <div className="page-shell py-10 sm:py-12">
      <section className="overflow-hidden rounded-[34px] border border-stone-200 bg-[radial-gradient(circle_at_top_right,_rgba(190,127,86,0.18),_transparent_32%),linear-gradient(180deg,#fffdf8_0%,#fff8ef_100%)] p-6 shadow-[0_24px_64px_-42px_rgba(120,83,47,0.28)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-3xl">
            <p className="section-kicker">Kenya market intelligence</p>
            <h1 className="mt-4 text-4xl font-bold text-stone-900 sm:text-5xl">
              See where to sell, buy, and wait today.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-stone-600">
              Pick a commodity, read the average, check the best selling market, then scan the
              board. The page is built to answer one question quickly: what should I do with my
              crop right now?
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {scopedProduct ? (
              <ShareIntelligenceSnapshotButton
                productKey={scopedProduct.productKey}
                productName={scopedProduct.productName}
                avgPrice={scopedProduct.overallAverage}
                bestPrice={focusMarket?.avgPrice || scopedProduct.bestMarket?.avgPrice}
                bestCounty={focusMarket?.county || scopedProduct.bestMarket?.county}
                bestMarketName={focusMarket?.marketName || scopedProduct.bestMarket?.marketName}
                unit={scopedProduct.unit}
                trendDirection={scopedProduct.overallTrendDirection}
                trendPercentage={scopedProduct.overallTrendPercentage}
                label="Share snapshot"
                className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-600 transition hover:border-terra-200 hover:text-terra-700"
              />
            ) : null}
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

        <div className="mt-6 flex flex-wrap gap-2">
          {(Object.keys(CATEGORY_META) as IntelligenceCategory[]).map((category) => {
            const Icon = CATEGORY_META[category].icon;

            return (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setActiveCategory(category);
                  setCountyFilter("all");
                }}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeCategory === category
                    ? "bg-stone-900 text-white shadow-sm"
                    : "border border-stone-200 bg-white text-stone-600 hover:border-terra-200 hover:text-terra-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                {CATEGORY_META[category].label}
              </button>
            );
          })}
        </div>

        <IntelligenceStatusStrip
          className="mt-6"
          items={[
            { label: "Approved reports", value: overview.meta.approvedSubmissions.toLocaleString() },
            { label: "Tracked products", value: overview.meta.trackedProducts.toString() },
            { label: "Tracked markets", value: overview.meta.trackedMarkets.toString() },
            { label: "Coverage", value: "Kenya only" },
          ]}
        />
      </section>

      {activeBoard.length ? (
        <>
          <CommodityQuickPicker
            className="mt-8"
            title="Pick a commodity"
            description="Start with what you need to price right now. The best market callout updates as soon as you switch."
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
              <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.42fr)_380px]">
                <DecisionSnapshotCard product={scopedProduct} focusMarket={focusMarket} />

                <div className="space-y-6">
                  <MarketPulsePanel items={pulseItems} title="What should I do?" />
                  <TradingActionBar
                    className="md:rounded-[28px] md:border md:border-stone-200 md:bg-white md:p-4 md:shadow-[0_20px_48px_-40px_rgba(120,83,47,0.28)]"
                    submitHref={`/market-intelligence/submit?product=${scopedProduct.productKey}`}
                    onSubmitClick={() => setSubmitOpen(true)}
                    compareHref={`/market-intelligence/${scopedProduct.productKey}`}
                    invite={{
                      productKey: scopedProduct.productKey,
                      productName: scopedProduct.productName,
                      county: focusMarket?.county,
                      marketName: focusMarket?.marketName,
                      unit: scopedProduct.unit,
                    }}
                  />
                  <PriceSubmitModal
                    open={submitOpen}
                    onClose={() => setSubmitOpen(false)}
                    defaultProductKey={scopedProduct.productKey}
                  />
                  <div className="rounded-[28px] border border-stone-200 bg-[#fcf8f2] p-5 text-sm leading-relaxed text-stone-600">
                    <div className="flex items-center gap-2 text-stone-900">
                      <ShieldCheck className="h-4 w-4 text-forest-600" />
                      <p className="font-semibold">Approved Kenya-only signals</p>
                    </div>
                    <p className="mt-2">
                      This board only uses Kenya data and approved reports. Use it as a decision
                      screen, then open the full commodity board if you want deeper historical comparison.
                    </p>
                  </div>
                </div>
              </div>

              <section className="mt-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                      Filter the board
                    </p>
                    <p className="mt-1 text-sm text-stone-600">
                      Narrow the market board to one county if you want a faster comparison.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
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
                </div>

                <MarketBoardTable
                  className="mt-4"
                  product={scopedProduct}
                  markets={scopedProduct.markets}
                  selectedMarketKey={focusMarket?.marketKey}
                  onSelectMarket={setSelectedMarketKey}
                />

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[26px] border border-stone-200 bg-[#faf7f2] px-5 py-4">
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
              </section>
            </>
          ) : null}
        </>
      ) : (
        <div className="mt-8 rounded-[28px] border border-dashed border-stone-200 bg-white p-10 text-center text-sm text-stone-500">
          No approved data yet for this category. Start with a clean submission from your market.
        </div>
      )}

      {scopedProduct ? (
        <SharePricePrompt
          productKey={scopedProduct.productKey}
          productName={scopedProduct.productName}
        />
      ) : null}
    </div>
  );
}
