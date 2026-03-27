"use client";

import { MapPin, Minus, TrendingDown, TrendingUp } from "lucide-react";
import type {
  IntelligenceMarket,
  IntelligenceProductSnapshot,
} from "@/lib/market-intelligence";
import { formatKes } from "@/lib/market-intelligence";

type Props = {
  product: IntelligenceProductSnapshot;
  markets: IntelligenceMarket[];
  selectedMarketKey?: string;
  onSelectMarket?: (marketKey: string) => void;
  className?: string;
};

const trendIcon = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
} as const;

const getSignalMeta = (product: IntelligenceProductSnapshot, market: IntelligenceMarket) => {
  if (market.marketKey === product.bestMarket?.marketKey) {
    return {
      label: "SELL",
      helper: "Best market",
      cls: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (market.marketKey === product.weakestMarket?.marketKey) {
    return {
      label: "BUY",
      helper: "Best buy",
      cls: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  if (product.overallAverage > 0 && market.avgPrice >= product.overallAverage * 1.05) {
    return {
      label: "SELL",
      helper: "Above avg",
      cls: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (product.overallAverage > 0 && market.avgPrice <= product.overallAverage * 0.95) {
    return {
      label: "BUY",
      helper: "Below avg",
      cls: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "AVG",
    helper: "Neutral",
    cls: "border-stone-200 bg-stone-50 text-stone-700",
  };
};

export default function MarketBoardTable({
  product,
  markets,
  selectedMarketKey,
  onSelectMarket,
  className = "",
}: Props) {
  return (
    <div
      className={`overflow-hidden rounded-[30px] border border-stone-200 bg-white shadow-[0_22px_54px_-40px_rgba(120,83,47,0.28)] ${className}`}
    >
      <div className="border-b border-stone-200 bg-[#fcf8f2] px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
              Market board
            </p>
            <h2 className="mt-2 text-2xl font-bold text-stone-900">
              Live prices for {product.productName.toLowerCase()}
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Tap a row to focus on that market. {markets.length} active market
              {markets.length === 1 ? "" : "s"} in {product.unit}.
            </p>
          </div>
          <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-semibold text-stone-600">
            Avg {formatKes(product.overallAverage)}
          </span>
        </div>
      </div>

      <div className="hidden grid-cols-[1.7fr_0.9fr_0.8fr_0.9fr] gap-4 border-b border-stone-100 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400 md:grid">
        <span>Market</span>
        <span className="text-right">Price</span>
        <span className="text-right">Trend</span>
        <span className="text-right">Signal</span>
      </div>

      <div>
        {markets.map((market) => {
          const TrendIcon = trendIcon[market.trendDirection];
          const signal = getSignalMeta(product, market);
          const interactive = typeof onSelectMarket === "function";
          const selected = selectedMarketKey === market.marketKey;
          const deltaPrefix =
            market.trendDirection === "up" ? "+" : market.trendDirection === "down" ? "-" : "";

          const rowClass = `w-full border-b border-stone-100 px-5 py-4 text-left last:border-0 transition ${
            interactive ? "hover:bg-stone-50" : ""
          } ${selected ? "bg-terra-50/70 ring-1 ring-inset ring-terra-200" : "bg-white"}`;

          const content = (
            <>
              <div className="hidden md:grid md:grid-cols-[1.7fr_0.9fr_0.8fr_0.9fr] md:items-center md:gap-4">
                <div>
                  <p className="text-sm font-semibold text-stone-900">{market.marketName}</p>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-stone-500">
                    <MapPin className="h-3.5 w-3.5 text-stone-400" />
                    {market.county}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-stone-900">{formatKes(market.avgPrice)}</p>
                </div>
                <div className="text-right">
                  <p className="inline-flex items-center justify-end gap-1 text-sm font-semibold text-stone-700">
                    <TrendIcon className="h-4 w-4 text-terra-600" />
                    {market.trendDirection === "stable"
                      ? "Stable"
                      : `${deltaPrefix}${Math.abs(market.trendPercentage).toFixed(1)}%`}
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-flex flex-col items-end gap-1">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${signal.cls}`}
                    >
                      {signal.label}
                    </span>
                    <span className="text-[11px] text-stone-400">{signal.helper}</span>
                  </div>
                </div>
              </div>

              <div className="md:hidden">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-stone-900">{market.marketName}</p>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-stone-500">
                      <MapPin className="h-3.5 w-3.5 text-stone-400" />
                      {market.county}
                    </p>
                  </div>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${signal.cls}`}
                  >
                    {signal.label}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 rounded-[20px] bg-stone-50 p-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                      Price
                    </p>
                    <p className="mt-1 text-sm font-bold text-stone-900">
                      {formatKes(market.avgPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                      Trend
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-stone-900">
                      <TrendIcon className="h-4 w-4 text-terra-600" />
                      {market.trendDirection === "stable"
                        ? "Stable"
                        : `${deltaPrefix}${Math.abs(market.trendPercentage).toFixed(1)}%`}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                      Signal
                    </p>
                    <p className="mt-1 text-sm font-semibold text-stone-900">{signal.helper}</p>
                  </div>
                </div>
              </div>
            </>
          );

          if (interactive) {
            return (
              <button
                key={market.marketKey}
                type="button"
                onClick={() => onSelectMarket(market.marketKey)}
                className={rowClass}
              >
                {content}
              </button>
            );
          }

          return (
            <div key={market.marketKey} className={rowClass}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
