"use client";
import { MapPin, Minus, TrendingDown, TrendingUp } from "lucide-react";
import type {
  IntelligenceMarket,
  IntelligenceProductSnapshot,
} from "@/lib/market-intelligence";
import { formatKes, getUnitKgFactor } from "@/lib/market-intelligence";

type Props = {
  product: IntelligenceProductSnapshot;
  markets: IntelligenceMarket[];
  selectedMarketKey?: string;
  onSelectMarket?: (marketKey: string) => void;
  priceMode?: "unit" | "kg";
  onPriceModeChange?: (mode: "unit" | "kg") => void;
  className?: string;
};

const trendIcon = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
} as const;

const getSignalMeta = (product: IntelligenceProductSnapshot, market: IntelligenceMarket) => {
  if (market.marketKey === product.bestMarket?.marketKey) {
    return { label: "SELL", helper: "Best market", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" };
  }
  if (market.marketKey === product.weakestMarket?.marketKey) {
    return { label: "BUY", helper: "Best buy", cls: "border-amber-200 bg-amber-50 text-amber-700" };
  }
  if (product.overallAverage > 0 && market.avgPrice >= product.overallAverage * 1.05) {
    return { label: "SELL", helper: "Above avg", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" };
  }
  if (product.overallAverage > 0 && market.avgPrice <= product.overallAverage * 0.95) {
    return { label: "BUY", helper: "Below avg", cls: "border-amber-200 bg-amber-50 text-amber-700" };
  }
  return { label: "AVG", helper: "Neutral", cls: "border-stone-200 bg-stone-50 text-stone-700" };
};

/**
 * Mini horizontal bar showing this market's price relative to the board average.
 * Green if above, amber if below, stone if at avg.
 */
function RelativeBar({ market, avg }: { market: IntelligenceMarket; avg: number }) {
  if (!avg || !market.avgPrice) return null;
  const delta = ((market.avgPrice - avg) / avg) * 100;
  const absDelta = Math.abs(delta);
  // Scale: ±20% = full bar. Clamp to 100%.
  const pct = Math.min(100, (absDelta / 20) * 100);
  const isAbove = delta >= 0;
  const barCls = isAbove ? "bg-emerald-400" : "bg-amber-400";
  const sign = isAbove ? "+" : "-";

  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-stone-100 overflow-hidden">
        <div className={`h-full rounded-full ${barCls}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-[10px] font-semibold ${isAbove ? "text-emerald-600" : "text-amber-600"}`}>
        {sign}{absDelta.toFixed(1)}%
      </span>
    </div>
  );
}

export default function MarketBoardTable({
  product,
  markets,
  selectedMarketKey,
  onSelectMarket,
  priceMode = "unit",
  onPriceModeChange,
  className = "",
}: Props) {
  const kgFactor = getUnitKgFactor(product.unit);
  const canToggle = kgFactor > 1;
  const inKg = priceMode === "kg" && canToggle;

  const displayPrice = (p: number) =>
    inKg && kgFactor > 0 ? Math.round(p / kgFactor) : p;

  const unitLabel = inKg ? "kg" : product.unit;

  return (
    <div
      className={`overflow-hidden rounded-[30px] border border-stone-200 bg-white shadow-[0_22px_54px_-40px_rgba(120,83,47,0.28)] ${className}`}
    >
      {/* Table header */}
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
              Tap a row to focus on that market.{" "}
              {markets.length} active market{markets.length === 1 ? "" : "s"} · per {unitLabel}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-semibold text-stone-600">
              Avg {formatKes(displayPrice(product.overallAverage))}
            </span>

            {/* Unit toggle */}
            {canToggle && (
              <div className="inline-flex rounded-full border border-stone-200 bg-white p-0.5">
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
      </div>

      {/* Column headers — desktop */}
      <div className="hidden grid-cols-[1.7fr_1fr_0.75fr_0.85fr] gap-4 border-b border-stone-100 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400 md:grid">
        <span>Market</span>
        <span className="text-right">Price · vs avg</span>
        <span className="text-right">Trend</span>
        <span className="text-right">Signal</span>
      </div>

      <div>
        {markets.map((market) => {
          const TrendIcon = trendIcon[market.trendDirection];
          const signal = getSignalMeta(product, market);
          const interactive = typeof onSelectMarket === "function";
          const selected = selectedMarketKey === market.marketKey;
          const deltaPrefix = market.trendDirection === "up" ? "+" : market.trendDirection === "down" ? "-" : "";

          const mainPrice = displayPrice(market.avgPrice);
          const secondaryPrice = canToggle
            ? inKg
              ? market.avgPrice    // show per-unit when displaying per-kg
              : Math.round(market.avgPrice / kgFactor) // show per-kg when displaying per-unit
            : null;
          const secondaryUnit = inKg ? product.unit : "kg";

          const rowClass = `w-full border-b border-stone-100 px-5 py-4 text-left last:border-0 transition ${
            interactive ? "hover:bg-stone-50 cursor-pointer" : ""
          } ${selected ? "bg-terra-50/70 ring-1 ring-inset ring-terra-200" : "bg-white"}`;

          const content = (
            <>
              {/* ── Desktop layout ── */}
              <div className="hidden md:grid md:grid-cols-[1.7fr_1fr_0.75fr_0.85fr] md:items-start md:gap-4">
                {/* Market name */}
                <div>
                  <p className="text-sm font-semibold text-stone-900">{market.marketName}</p>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-stone-500">
                    <MapPin className="h-3.5 w-3.5 text-stone-400" />
                    {market.county}
                  </p>
                </div>

                {/* Price + relative bar */}
                <div className="text-right">
                  <p className="text-lg font-bold text-stone-900">{formatKes(mainPrice)}</p>
                  {secondaryPrice !== null && (
                    <p className="mt-0.5 text-[11px] text-stone-400">
                      {formatKes(secondaryPrice)} / {secondaryUnit}
                    </p>
                  )}
                  <RelativeBar market={market} avg={product.overallAverage} />
                </div>

                {/* Trend */}
                <div className="text-right pt-1">
                  <p className="inline-flex items-center justify-end gap-1 text-sm font-semibold text-stone-700">
                    <TrendIcon className="h-4 w-4 text-terra-600" />
                    {market.trendDirection === "stable"
                      ? "Stable"
                      : `${deltaPrefix}${Math.abs(market.trendPercentage).toFixed(1)}%`}
                  </p>
                </div>

                {/* Signal */}
                <div className="text-right pt-1">
                  <div className="inline-flex flex-col items-end gap-1">
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${signal.cls}`}>
                      {signal.label}
                    </span>
                    <span className="text-[11px] text-stone-400">{signal.helper}</span>
                  </div>
                </div>
              </div>

              {/* ── Mobile layout ── */}
              <div className="md:hidden">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-stone-900">{market.marketName}</p>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-stone-500">
                      <MapPin className="h-3.5 w-3.5 text-stone-400" />
                      {market.county}
                    </p>
                  </div>
                  <span className={`inline-flex shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${signal.cls}`}>
                    {signal.label}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 rounded-[20px] bg-stone-50 p-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                      Price
                    </p>
                    <p className="mt-1 text-sm font-bold text-stone-900">{formatKes(mainPrice)}</p>
                    {secondaryPrice !== null && (
                      <p className="text-[10px] text-stone-400">
                        {formatKes(secondaryPrice)} / {secondaryUnit}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
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
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                      vs Avg
                    </p>
                    <RelativeBar market={market} avg={product.overallAverage} />
                  </div>
                </div>
              </div>
            </>
          );

          return interactive ? (
            <button
              key={market.marketKey}
              type="button"
              onClick={() => onSelectMarket(market.marketKey)}
              className={rowClass}
            >
              {content}
            </button>
          ) : (
            <div key={market.marketKey} className={rowClass}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
