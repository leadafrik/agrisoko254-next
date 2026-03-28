"use client";

import { useId } from "react";
import { formatKes } from "@/lib/market-intelligence";

export type SparkPoint = { date: string; price: number };

type Props = {
  points: SparkPoint[];
  height?: number;
  unit?: string;
  /** Show the first/last date labels beneath the chart */
  showDateLabels?: boolean;
  className?: string;
};

/**
 * Pure-SVG responsive sparkline. No external chart library.
 * Uses cubic-bezier smoothing between data points.
 * Colour adapts to whether the latest price is above or below the first.
 */
export default function PriceSparkline({
  points,
  height = 120,
  unit,
  showDateLabels = true,
  className = "",
}: Props) {
  const uid = useId();
  const fillId = `spark-fill-${uid}`;

  const valid = points.filter((p) => p.price > 0);
  if (valid.length < 2) return null;

  const prices = valid.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  // ViewBox coordinate space — wide so labels are sharp regardless of pixel width
  const VW = 1000;
  const VH = height;
  const padX = 12;
  const padY = 14;
  const innerW = VW - padX * 2;
  const innerH = VH - padY * 2;

  const toX = (i: number) => padX + (i / (valid.length - 1)) * innerW;
  const toY = (p: number) => padY + innerH - ((p - min) / range) * innerH;

  // Cubic bezier smooth path
  const pts = valid.map((p, i) => ({ x: toX(i), y: toY(p.price), ...p }));
  const linePath = pts
    .map((pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      const prev = pts[i - 1];
      const cpx = (pt.x - prev.x) * 0.42;
      return `C ${prev.x + cpx} ${prev.y} ${pt.x - cpx} ${pt.y} ${pt.x} ${pt.y}`;
    })
    .join(" ");

  const areaPath = [
    `M ${pts[0].x} ${VH}`,
    pts
      .map((pt, i) => {
        if (i === 0) return `L ${pt.x} ${pt.y}`;
        const prev = pts[i - 1];
        const cpx = (pt.x - prev.x) * 0.42;
        return `C ${prev.x + cpx} ${prev.y} ${pt.x - cpx} ${pt.y} ${pt.x} ${pt.y}`;
      })
      .join(" "),
    `L ${pts[pts.length - 1].x} ${VH} Z`,
  ].join(" ");

  const isUp = prices[prices.length - 1] >= prices[0];
  const stroke = isUp ? "#10b981" : "#f59e0b"; // emerald-500 / amber-500

  // Average reference line
  const avgY = toY((min + max) / 2);
  const lastPt = pts[pts.length - 1];
  const lastPrice = prices[prices.length - 1];

  // Rough date labels — just show the raw date string trimmed to month/day
  const fmt = (d: string) => {
    const parts = d.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
    return d;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path d={areaPath} fill={`url(#${fillId})`} />

        {/* Mid reference dashes */}
        <line
          x1={padX}
          y1={avgY}
          x2={VW - padX}
          y2={avgY}
          stroke="#d6d3d1"
          strokeWidth="1.5"
          strokeDasharray="8 5"
        />

        {/* Price line */}
        <path
          d={linePath}
          fill="none"
          stroke={stroke}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* End-point dot */}
        <circle cx={lastPt.x} cy={lastPt.y} r="6" fill="white" stroke={stroke} strokeWidth="3" />
      </svg>

      {showDateLabels && (
        <div className="flex items-center justify-between text-[11px] text-stone-500">
          <span>{fmt(valid[0].date)}</span>
          <span className={`font-semibold ${isUp ? "text-emerald-600" : "text-amber-600"}`}>
            {formatKes(lastPrice)}
            {unit ? <span className="ml-0.5 font-normal text-stone-400"> / {unit}</span> : null}
          </span>
          <span>{fmt(valid[valid.length - 1].date)}</span>
        </div>
      )}
    </div>
  );
}
