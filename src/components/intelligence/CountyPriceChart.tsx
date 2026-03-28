"use client";

import { formatKes } from "@/lib/market-intelligence";

export type CountyBar = {
  county: string;
  price: number;
  submissionsCount: number;
};

type Props = {
  bars: CountyBar[];
  unit: string;
  avgPrice?: number;
  className?: string;
};

/**
 * Horizontal bar chart comparing county averages.
 * Sorted highest → lowest. Highest county = emerald, lowest = amber, rest = terra.
 */
export default function CountyPriceChart({ bars, unit, avgPrice, className = "" }: Props) {
  if (!bars.length) return null;

  const sorted = [...bars]
    .filter((b) => b.price > 0)
    .sort((a, b) => b.price - a.price);
  if (!sorted.length) return null;

  const maxPrice = sorted[0].price;
  const topCounty = sorted[0].county;
  const lowCounty = sorted[sorted.length - 1].county;

  return (
    <div className={className}>
      <div className="space-y-2.5">
        {sorted.map((bar) => {
          const pct = maxPrice > 0 ? Math.max(6, (bar.price / maxPrice) * 100) : 6;
          const isTop = bar.county === topCounty;
          const isLow = bar.county === lowCounty && sorted.length > 1;

          const barCls = isTop
            ? "bg-emerald-500"
            : isLow
              ? "bg-amber-400"
              : "bg-terra-500";

          return (
            <div key={bar.county} className="flex items-center gap-3">
              {/* County label */}
              <span className="w-[86px] shrink-0 text-right text-xs font-medium text-stone-600 truncate">
                {bar.county}
              </span>

              {/* Bar */}
              <div className="relative flex-1 h-8 overflow-hidden rounded-xl bg-stone-100">
                <div
                  className={`h-full rounded-xl transition-all duration-700 ${barCls}`}
                  style={{ width: `${pct}%` }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-stone-800 drop-shadow-[0_0_4px_white]">
                  {formatKes(bar.price)}
                </span>
              </div>

              {/* Report count */}
              <span className="w-8 shrink-0 text-right text-[10px] text-stone-400">
                {bar.submissionsCount}r
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] text-stone-400">
        County averages · {unit}
        {avgPrice && avgPrice > 0 ? ` · Board avg ${formatKes(avgPrice)}` : ""}
      </p>
    </div>
  );
}
