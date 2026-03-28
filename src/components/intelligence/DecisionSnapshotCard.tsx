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
import PriceRangeMeter from "@/components/intelligence/PriceRangeMeter";
import type {
  IntelligenceMarket,
  IntelligenceProductSnapshot,
} from "@/lib/market-intelligence";
import {
  formatIntelligenceDate,
  formatKes,
  formatTrendLabel,
  getUnitKgFactor,
} from "@/lib/market-intelligence";

type Props = {
  product: IntelligenceProductSnapshot;
  focusMarket?: IntelligenceMarket | null;
  title?: string;
  priceMode?: "unit" | "kg";
  onPriceModeChange?: (mode: "unit" | "kg") => void;
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
  priceMode = "unit",
  onPriceModeChange,
  className = "",
}: Props) {
  const TrendIcon = trendIcon[product.overallTrendDirection];
  const effectiveFocus = focusMarket || product.bestMarket;

  const kgFactor = getUnitKgFactor(product.unit);
  const canToggle = kgFactor > 1;

  const inKg = priceMode === "kg" && canToggle;
  const unitLabel = inKg ? "kg" : product.unit;
  const displayPrice = (p: number) => (inKg && kgFactor > 0 ? Math.round(p / kgFactor) : p);

  const avgDisplay = displayPrice(product.overallAverage);
  const bestDisplay = displayPrice(product.bestMarket?.avgPrice || 0);
  const weakDisplay = displayPrice(product.weakestMarket?.avgPrice || 0);

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
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-terra-600">
            {title || `${product.productName} live`}
          </p>

          {/* Main price */}
          <div className="mt-3 flex flex-wrap items-baseline gap-3">
            <h2 className="text-4xl font-bold text-stone-900 sm:text-5xl">
              {formatKes(avgDisplay)}
            </h2>
            {/* Secondary per-kg price — shown when in unit mode and factor exists */}
            {canToggle && !inKg && (
              <span className="text-base font-semibold text-stone-400">
                ≈ {formatKes(Math.round(product.overallAverage / kgFactor))} / kg
              </span>
            )}
            {/* Secondary per-unit price — shown when in kg mode */}
            {canToggle && inKg && (
              <span className="text-base font-semibold text-stone-400">
                ≈ {formatKes(product.overallAverage)} / {product.unit}
              </span>
            )}
          </div>

          <p className="mt-1.5 text-sm text-stone-500">
            Average across {product.approvedMarkets} market{product.approvedMarkets === 1 ? "" : "s"}
            {" · "}per {unitLabel}
          </p>
        </div>

        {/* Badge cluster + unit toggle */}
        <div className="flex flex-wrap items-start gap-2">
          <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-semibold text-stone-600">
            {product.submissionsCount} reports
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-semibold text-stone-600">
            <Clock3 className="h-3.5 w-3.5" />
            {formatIntelligenceDate(product.lastUpdated || product.generatedAt)}
          </span>

          {/* Unit toggle — only when meaningful conversion exists */}
          {canToggle && (
            <div className="inline-flex rounded-full border border-stone-200 bg-white p-0.5 shadow-sm">
              <button
                type="button"
                onClick={() => onPriceModeChange?.("unit")}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                  !inKg ? "bg-stone-900 text-white" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                / {product.unit}
              </button>
              <button
                type="button"
                onClick={() => onPriceModeChange?.("kg")}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                  inKg ? "bg-stone-900 text-white" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                / kg
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Focus market row */}
      {effectiveFocus ? (
        <div className="mt-5 flex items-start gap-3 rounded-[24px] border border-stone-200 bg-white/80 px-4 py-4">
          <div className="rounded-full bg-terra-100 p-2 text-terra-700">
            <MapPin className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
              Focus market
            </p>
            <p className="mt-1 truncate text-base font-semibold text-stone-900">
              {effectiveFocus.marketName || effectiveFocus.county}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-stone-600">
              <span>{effectiveFocus.county}</span>
              {effectiveFocus.avgPrice > 0 && (
                <>
                  <span className="text-stone-300">·</span>
                  <span className="font-semibold text-stone-900">
                    {formatKes(displayPrice(effectiveFocus.avgPrice))}
                  </span>
                  {canToggle && !inKg && (
                    <span className="text-stone-400">
                      ≈ {formatKes(Math.round(effectiveFocus.avgPrice / kgFactor))} / kg
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Range meter — full width */}
      {minPrice > 0 && maxPrice > minPrice && (
        <PriceRangeMeter
          className="mt-5"
          min={displayPrice(minPrice)}
          max={displayPrice(maxPrice)}
          avg={avgDisplay}
          unit={unitLabel}
        />
      )}

      {/* Four metric cards */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[22px] border border-stone-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            Spread
          </p>
          <p className="mt-2 text-lg font-bold text-stone-900">
            {formatKes(displayPrice(minPrice))}
            <span className="mx-1 text-stone-300">→</span>
            {formatKes(displayPrice(maxPrice))}
          </p>
          <p className="mt-2 text-xs text-stone-500">Range across all tracked markets</p>
        </div>

        <div className="rounded-[22px] border border-stone-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            Trend
          </p>
          <div className="mt-2 inline-flex items-center gap-2 text-lg font-bold text-stone-900">
            <TrendIcon className="h-5 w-5 text-terra-600" />
            {formatTrendLabel(product.overallTrendDirection, product.overallTrendPercentage)}
          </div>
          <p className="mt-2 text-xs text-stone-500">Direction across latest reports</p>
        </div>

        <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 p-4">
          <div className="inline-flex rounded-full bg-white/70 p-2 text-emerald-700">
            <ArrowUpRight className="h-4 w-4" />
          </div>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Sell here
          </p>
          <p className="mt-2 text-base font-bold text-stone-900">
            {product.bestMarket?.marketName || product.bestMarket?.county || "Waiting"}
          </p>
          <p className="text-xs text-stone-500">{product.bestMarket?.county || "Kenya"}</p>
          <p className="mt-2 text-xl font-bold text-emerald-700">{formatKes(bestDisplay)}</p>
          {canToggle && !inKg && bestDisplay > 0 && (
            <p className="text-xs text-emerald-600/70">
              ≈ {formatKes(Math.round((product.bestMarket?.avgPrice || 0) / kgFactor))} / kg
            </p>
          )}
        </div>

        <div className="rounded-[22px] border border-amber-200 bg-amber-50 p-4">
          <div className="inline-flex rounded-full bg-white/70 p-2 text-amber-700">
            <ArrowDownLeft className="h-4 w-4" />
          </div>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
            Buy here
          </p>
          <p className="mt-2 text-base font-bold text-stone-900">
            {product.weakestMarket?.marketName || product.weakestMarket?.county || "Waiting"}
          </p>
          <p className="text-xs text-stone-500">{product.weakestMarket?.county || "Kenya"}</p>
          <p className="mt-2 text-xl font-bold text-amber-700">{formatKes(weakDisplay)}</p>
          {canToggle && !inKg && weakDisplay > 0 && (
            <p className="text-xs text-amber-600/70">
              ≈ {formatKes(Math.round((product.weakestMarket?.avgPrice || 0) / kgFactor))} / kg
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
