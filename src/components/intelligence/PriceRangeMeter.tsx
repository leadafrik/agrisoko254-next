"use client";

import { formatKes } from "@/lib/market-intelligence";

type Props = {
  min: number;
  max: number;
  avg: number;
  unit: string;
  className?: string;
};

/**
 * Horizontal gradient range bar showing low → high with a marker at the average.
 * Amber on the cheap end, emerald on the premium end.
 */
export default function PriceRangeMeter({ min, max, avg, unit, className = "" }: Props) {
  if (!min || !max || max <= min) return null;

  const range = max - min;
  // Clamp to 2–98% so the marker never disappears at the edges
  const avgPct = Math.max(2, Math.min(98, ((avg - min) / range) * 100));
  const spread = Math.round(((max - min) / avg) * 100);

  return (
    <div className={className}>
      <div className="mb-2.5 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-400">
          Trading range · {unit}
        </p>
        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-500">
          {spread}% spread
        </span>
      </div>

      {/* Track */}
      <div className="relative h-3 rounded-full">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-300 via-stone-200 to-emerald-400" />
        {/* Average marker */}
        <div
          className="absolute top-1/2 z-10 h-5 w-2 -translate-y-1/2 rounded-full bg-stone-900 ring-2 ring-white shadow-md"
          style={{ left: `${avgPct}%`, transform: "translate(-50%, -50%)" }}
        />
      </div>

      {/* Labels */}
      <div className="mt-2 flex items-center justify-between text-[11px]">
        <span className="font-medium text-amber-700">{formatKes(min)}</span>
        <span className="font-bold text-stone-800">avg {formatKes(avg)}</span>
        <span className="font-medium text-emerald-700">{formatKes(max)}</span>
      </div>
    </div>
  );
}
