"use client";

import { Clock3, Minus, TrendingDown, TrendingUp } from "lucide-react";
import type {
  IntelligenceMarket,
  IntelligenceProductSnapshot,
} from "@/lib/market-intelligence";
import {
  formatIntelligenceDate,
  formatKes,
  formatTrendLabel,
} from "@/lib/market-intelligence";

type Props = {
  product: IntelligenceProductSnapshot;
  focusMarket?: IntelligenceMarket | null;
  title?: string;
  className?: string;
};

const trendIcon = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
} as const;

export default function DecisionSnapshotCard({
  product,
  focusMarket,
  title,
  className = "",
}: Props) {
  const TrendIcon = trendIcon[product.overallTrendDirection];
  const effectiveFocus = focusMarket || product.bestMarket;

  return (
    <div
      className={`overflow-hidden rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_22px_54px_-34px_rgba(120,83,47,0.28)] ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-terra-600">
            {title || `${product.productName} live`}
          </p>
          <h2 className="mt-2 text-3xl font-bold text-stone-900 sm:text-4xl">
            {formatKes(product.overallAverage)}
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            Average price for {product.unit}
          </p>
        </div>

        <div className="rounded-[22px] border border-stone-200 bg-stone-50 px-4 py-3 text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
            Focus market
          </p>
          <p className="mt-1 text-sm font-semibold text-stone-900">
            {effectiveFocus?.marketName || effectiveFocus?.county || "Live board"}
          </p>
          <p className="mt-1 text-xs text-stone-500">{effectiveFocus?.county || "Kenya"}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[22px] border border-stone-200 bg-[#fbf8f2] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            Range
          </p>
          <p className="mt-2 text-lg font-bold text-stone-900">
            {formatKes(
              Math.min(
                product.weakestMarket?.avgPrice || product.overallAverage,
                product.bestMarket?.avgPrice || product.overallAverage
              )
            )}{" "}
            to{" "}
            {formatKes(
              Math.max(
                product.bestMarket?.avgPrice || product.overallAverage,
                product.weakestMarket?.avgPrice || product.overallAverage
              )
            )}
          </p>
          <p className="mt-2 text-sm text-stone-600">Board spread across active markets</p>
        </div>
        <div className="rounded-[22px] border border-stone-200 bg-[#fbf8f2] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            Trend
          </p>
          <div className="mt-2 inline-flex items-center gap-2 text-lg font-bold text-stone-900">
            <TrendIcon className="h-5 w-5 text-terra-600" />
            {formatTrendLabel(product.overallTrendDirection, product.overallTrendPercentage)}
          </div>
          <p className="mt-2 text-sm text-stone-600">
            {product.submissionsCount} approved reports shaping this signal
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Best market to sell
          </p>
          <p className="mt-2 text-lg font-bold text-stone-900">
            {product.bestMarket?.marketName || product.bestMarket?.county || "N/A"}
          </p>
          <p className="mt-1 text-sm text-stone-600">{product.bestMarket?.county || "Kenya"}</p>
          <p className="mt-3 text-xl font-bold text-emerald-700">
            {formatKes(product.bestMarket?.avgPrice || 0)}
          </p>
        </div>
        <div className="rounded-[22px] border border-amber-200 bg-amber-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
            Best market to buy
          </p>
          <p className="mt-2 text-lg font-bold text-stone-900">
            {product.weakestMarket?.marketName || product.weakestMarket?.county || "N/A"}
          </p>
          <p className="mt-1 text-sm text-stone-600">
            {product.weakestMarket?.county || "Kenya"}
          </p>
          <p className="mt-3 text-xl font-bold text-amber-700">
            {formatKes(product.weakestMarket?.avgPrice || 0)}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-stone-100 pt-4 text-sm text-stone-500">
        <span>{product.approvedMarkets} tracked markets</span>
        <span>{product.submissionsCount} approved reports</span>
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="h-4 w-4" />
          Updated {formatIntelligenceDate(product.lastUpdated || product.generatedAt)}
        </span>
      </div>
    </div>
  );
}
