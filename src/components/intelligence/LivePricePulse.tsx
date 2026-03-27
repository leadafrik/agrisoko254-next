"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ShareIntelligenceSnapshotButton from "@/components/intelligence/ShareIntelligenceSnapshotButton";
import { formatTrendLabel } from "@/lib/market-intelligence";

type PulseItem = {
  productKey: string;
  productName: string;
  unit: string;
  avgPrice: number;
  highPrice: number;
  lowPrice: number;
  bestPrice?: number;
  bestCounty: string;
  bestMarketName?: string;
  trendDirection: "up" | "down" | "stable";
  trendPercentage?: number;
};

function fmt(n: number) {
  if (!n) return "-";
  return `KES ${n.toLocaleString()}`;
}

export default function LivePricePulse({ items }: { items: PulseItem[] }) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (idx >= items.length) {
      setIdx(0);
    }
  }, [idx, items.length]);

  useEffect(() => {
    if (items.length <= 1) return;

    let transitionTimer: ReturnType<typeof setTimeout> | undefined;
    const timer = setInterval(() => {
      setVisible(false);
      transitionTimer = setTimeout(() => {
        setIdx((i) => (i + 1) % items.length);
        setVisible(true);
      }, 320);
    }, 4200);

    return () => {
      clearInterval(timer);
      if (transitionTimer !== undefined) clearTimeout(transitionTimer);
    };
  }, [items.length]);

  if (!items.length) return null;

  const item = items[idx];
  const range = item.highPrice && item.lowPrice ? item.highPrice - item.lowPrice : 0;
  const bestPrice = item.bestPrice || item.highPrice || item.avgPrice;
  const trendLabel = formatTrendLabel(item.trendDirection, item.trendPercentage || 0);
  const bestMarketLabel =
    item.bestMarketName && item.bestCounty
      ? `${item.bestMarketName}, ${item.bestCounty}`
      : item.bestCounty || item.bestMarketName || "Kenya";

  const selectItem = (nextIdx: number) => {
    setVisible(false);
    setTimeout(() => {
      setIdx(nextIdx);
      setVisible(true);
    }, 320);
  };

  return (
    <div className="border-t border-stone-200 bg-[#faf7f2]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-3 sm:hidden">
          <div className="overflow-hidden rounded-[26px] border border-stone-200 bg-white shadow-[0_22px_60px_-42px_rgba(120,83,47,0.4)]">
            <div className="flex items-center justify-between gap-3 border-b border-stone-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-50" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
                    Live market pulse
                  </p>
                  <p className="text-sm font-semibold text-stone-900">Today&apos;s strongest signal</p>
                </div>
              </div>

              {items.length > 1 ? (
                <div className="flex shrink-0 items-center gap-1">
                  {items.map((entry, i) => (
                    <button
                      key={entry.productKey}
                      type="button"
                      onClick={() => selectItem(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === idx ? "w-4 bg-terra-500" : "w-1.5 bg-stone-300"
                      }`}
                      aria-label={`Show ${entry.productName}`}
                    />
                  ))}
                </div>
              ) : null}
            </div>

            <div
              className="px-4 py-4"
              style={{
                opacity: visible ? 1 : 0,
                transition: "opacity 0.28s ease",
              }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-2xl font-bold text-stone-900">{item.productName}</p>
                  <p className="mt-1 text-sm text-stone-500">{bestMarketLabel}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    item.trendDirection === "up"
                      ? "bg-emerald-50 text-emerald-700"
                      : item.trendDirection === "down"
                        ? "bg-rose-50 text-rose-700"
                        : "bg-stone-100 text-stone-600"
                  }`}
                >
                  {trendLabel}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-[20px] border border-stone-200 bg-[#fbf8f2] p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                    Board average
                  </p>
                  <p className="mt-2 font-mono text-lg font-bold text-terra-600">
                    {fmt(item.avgPrice)}
                  </p>
                  {item.unit ? <p className="mt-1 text-xs text-stone-400">per {item.unit}</p> : null}
                </div>
                <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                    Best sell
                  </p>
                  <p className="mt-2 font-mono text-lg font-bold text-emerald-700">
                    {fmt(bestPrice)}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">{bestMarketLabel}</p>
                </div>
              </div>

              {range > 0 ? (
                <p className="mt-3 text-xs text-stone-500">
                  Range across tracked markets: {fmt(item.lowPrice)} to {fmt(item.highPrice)}.
                </p>
              ) : null}

              <div className="mt-4 grid gap-2">
                <Link
                  href={`/market-intelligence/${item.productKey}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
                >
                  Open live board
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <ShareIntelligenceSnapshotButton
                  productKey={item.productKey}
                  productName={item.productName}
                  avgPrice={item.avgPrice}
                  bestPrice={bestPrice}
                  bestCounty={item.bestCounty}
                  bestMarketName={item.bestMarketName}
                  unit={item.unit}
                  trendDirection={item.trendDirection}
                  trendPercentage={item.trendPercentage}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-terra-200 hover:text-terra-700"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-4 py-2.5 sm:flex sm:gap-6">
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">
              Live
            </span>
          </div>

          <div className="h-5 w-px shrink-0 bg-stone-200" />

          <Link
            href={`/market-intelligence/${item.productKey}`}
            className="flex min-w-0 flex-1 items-center gap-4 sm:gap-6"
            style={{
              opacity: visible ? 1 : 0,
              transition: "opacity 0.28s ease",
            }}
          >
            <span className="shrink-0 text-xs font-bold text-stone-600 sm:text-sm">
              {item.productName}
            </span>

            <div className="flex shrink-0 items-baseline gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">
                Avg
              </span>
              <span className="font-mono text-sm font-bold text-terra-600 sm:text-base">
                {fmt(item.avgPrice)}
              </span>
              {item.unit ? <span className="text-[10px] text-stone-400">/{item.unit}</span> : null}
            </div>

            <div className="hidden items-baseline gap-1 sm:flex">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">
                H
              </span>
              <span className="font-mono text-xs font-semibold text-green-600">
                {fmt(item.highPrice)}
              </span>
            </div>

            <div className="hidden items-baseline gap-1 sm:flex">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">
                L
              </span>
              <span className="font-mono text-xs font-semibold text-red-500">
                {fmt(item.lowPrice)}
              </span>
            </div>

            {range > 0 ? (
              <div className="hidden items-baseline gap-1 lg:flex">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">
                  Range
                </span>
                <span className="font-mono text-xs font-semibold text-stone-500">
                  {fmt(range)}
                </span>
              </div>
            ) : null}

            {item.bestCounty ? (
              <span className="hidden truncate text-[11px] text-stone-400 xl:block">
                Best: {bestMarketLabel}
              </span>
            ) : null}

            <span
              className={`shrink-0 text-sm font-bold ${
                item.trendDirection === "up"
                  ? "text-green-500"
                  : item.trendDirection === "down"
                    ? "text-red-500"
                    : "text-stone-300"
              }`}
            >
              {item.trendDirection === "up" ? "↑" : item.trendDirection === "down" ? "↓" : "-"}
            </span>
          </Link>

          {items.length > 1 ? (
            <div className="flex shrink-0 items-center gap-1">
              {items.map((entry, i) => (
                <button
                  key={entry.productKey}
                  type="button"
                  onClick={() => selectItem(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === idx ? "w-4 bg-terra-500" : "w-1.5 bg-stone-300"
                  }`}
                  aria-label={`Show ${entry.productName}`}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
