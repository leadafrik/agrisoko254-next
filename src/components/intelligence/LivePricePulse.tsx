"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PulseItem = {
  productKey: string;
  productName: string;
  unit: string;
  avgPrice: number;
  highPrice: number;
  lowPrice: number;
  bestCounty: string;
  trendDirection: "up" | "down" | "stable";
};

function fmt(n: number) {
  if (!n) return "—";
  return `KES ${n.toLocaleString()}`;
}

export default function LivePricePulse({ items }: { items: PulseItem[] }) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % items.length);
        setVisible(true);
      }, 320);
    }, 4200);
    return () => clearInterval(timer);
  }, [items.length]);

  if (!items.length) return null;

  const item = items[idx];
  const range = item.highPrice && item.lowPrice ? item.highPrice - item.lowPrice : 0;

  return (
    <div className="border-t border-stone-200 bg-[#faf7f2]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 py-2.5 sm:gap-6">

          {/* Live dot */}
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">
              Live
            </span>
          </div>

          {/* Divider */}
          <div className="h-5 w-px shrink-0 bg-stone-200" />

          {/* Cycling price data */}
          <Link
            href={`/market-intelligence/${item.productKey}`}
            className="flex min-w-0 flex-1 items-center gap-4 sm:gap-6"
            style={{
              opacity: visible ? 1 : 0,
              transition: "opacity 0.28s ease",
            }}
          >
            {/* Product name */}
            <span className="shrink-0 text-xs font-bold text-stone-600 sm:text-sm">
              {item.productName}
            </span>

            {/* Average */}
            <div className="flex shrink-0 items-baseline gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">
                Avg
              </span>
              <span className="font-mono text-sm font-bold text-terra-600 sm:text-base">
                {fmt(item.avgPrice)}
              </span>
              {item.unit && (
                <span className="text-[10px] text-stone-400">/{item.unit}</span>
              )}
            </div>

            {/* High */}
            <div className="hidden items-baseline gap-1 sm:flex">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">
                H
              </span>
              <span className="font-mono text-xs font-semibold text-green-600">
                {fmt(item.highPrice)}
              </span>
            </div>

            {/* Low */}
            <div className="hidden items-baseline gap-1 sm:flex">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">
                L
              </span>
              <span className="font-mono text-xs font-semibold text-red-500">
                {fmt(item.lowPrice)}
              </span>
            </div>

            {/* Range */}
            {range > 0 && (
              <div className="hidden items-baseline gap-1 lg:flex">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">
                  Range
                </span>
                <span className="font-mono text-xs font-semibold text-stone-500">
                  {fmt(range)}
                </span>
              </div>
            )}

            {/* County */}
            {item.bestCounty && (
              <span className="hidden truncate text-[11px] text-stone-400 xl:block">
                Best: {item.bestCounty}
              </span>
            )}

            {/* Trend arrow */}
            <span
              className={`shrink-0 text-sm font-bold ${
                item.trendDirection === "up"
                  ? "text-green-500"
                  : item.trendDirection === "down"
                    ? "text-red-500"
                    : "text-stone-300"
              }`}
            >
              {item.trendDirection === "up" ? "↑" : item.trendDirection === "down" ? "↓" : "—"}
            </span>
          </Link>

          {/* Dots indicator */}
          {items.length > 1 && (
            <div className="flex shrink-0 items-center gap-1">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setVisible(false); setTimeout(() => { setIdx(i); setVisible(true); }, 320); }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === idx ? "w-4 bg-terra-500" : "w-1.5 bg-stone-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
