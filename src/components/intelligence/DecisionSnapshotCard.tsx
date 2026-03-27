"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock3,
  MapPin,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
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
  const minPrice = Math.min(
    product.weakestMarket?.avgPrice || product.overallAverage,
    product.bestMarket?.avgPrice || product.overallAverage
  );
  const maxPrice = Math.max(
    product.bestMarket?.avgPrice || product.overallAverage,
    product.weakestMarket?.avgPrice || product.overallAverage
  );

  return (
    <div
      className={`overflow-hidden rounded-[30px] border border-stone-200 bg-[radial-gradient(circle_at_top_right,_rgba(190,127,86,0.16),_transparent_38%),linear-gradient(180deg,#fffdf9_0%,#fffaf3_100%)] p-6 shadow-[0_24px_64px_-42px_rgba(120,83,47,0.34)] sm:p-7 ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-terra-600">
            {title || `${product.productName} live`}
          </p>
          <h2 className="mt-3 text-4xl font-bold text-stone-900 sm:text-5xl">
            {formatKes(product.overallAverage)}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Average approved price for {product.unit}.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-semibold text-stone-600">
            {product.approvedMarkets} markets
          </span>
          <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-semibold text-stone-600">
            {product.submissionsCount} reports
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-semibold text-stone-600">
            <Clock3 className="h-3.5 w-3.5" />
            {formatIntelligenceDate(product.lastUpdated || product.generatedAt)}
          </span>
        </div>
      </div>

      {effectiveFocus ? (
        <div className="mt-5 flex items-start gap-3 rounded-[24px] border border-stone-200 bg-white/80 px-4 py-4">
          <div className="rounded-full bg-terra-100 p-2 text-terra-700">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
              Focus market
            </p>
            <p className="mt-1 text-base font-semibold text-stone-900">
              {effectiveFocus.marketName || effectiveFocus.county}
            </p>
            <p className="mt-1 text-sm text-stone-600">
              {effectiveFocus.county} is the active read on the board right now.
            </p>
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[22px] border border-stone-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            Trading range
          </p>
          <p className="mt-2 text-lg font-bold text-stone-900">
            {formatKes(minPrice)} to {formatKes(maxPrice)}
          </p>
          <p className="mt-2 text-sm text-stone-600">Use this to judge the spread before transport.</p>
        </div>

        <div className="rounded-[22px] border border-stone-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            Trend
          </p>
          <div className="mt-2 inline-flex items-center gap-2 text-lg font-bold text-stone-900">
            <TrendIcon className="h-5 w-5 text-terra-600" />
            {formatTrendLabel(product.overallTrendDirection, product.overallTrendPercentage)}
          </div>
          <p className="mt-2 text-sm text-stone-600">Board direction across the current approved signals.</p>
        </div>

        <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 p-4">
          <div className="inline-flex rounded-full bg-white/70 p-2 text-emerald-700">
            <ArrowUpRight className="h-4 w-4" />
          </div>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Sell here
          </p>
          <p className="mt-2 text-lg font-bold text-stone-900">
            {product.bestMarket?.marketName || product.bestMarket?.county || "Waiting for data"}
          </p>
          <p className="mt-1 text-sm text-stone-600">{product.bestMarket?.county || "Kenya"}</p>
          <p className="mt-3 text-xl font-bold text-emerald-700">
            {formatKes(product.bestMarket?.avgPrice || 0)}
          </p>
        </div>

        <div className="rounded-[22px] border border-amber-200 bg-amber-50 p-4">
          <div className="inline-flex rounded-full bg-white/70 p-2 text-amber-700">
            <ArrowDownLeft className="h-4 w-4" />
          </div>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
            Buy here
          </p>
          <p className="mt-2 text-lg font-bold text-stone-900">
            {product.weakestMarket?.marketName || product.weakestMarket?.county || "Waiting for data"}
          </p>
          <p className="mt-1 text-sm text-stone-600">{product.weakestMarket?.county || "Kenya"}</p>
          <p className="mt-3 text-xl font-bold text-amber-700">
            {formatKes(product.weakestMarket?.avgPrice || 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
