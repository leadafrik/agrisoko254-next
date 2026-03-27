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
  bestMarketName?: string;
  trendDirection: "up" | "down" | "stable";
};

function fmt(n: number) {
  if (!n) return "-";
  return `KES ${n.toLocaleString()}`;
}

function TrendIcon({ dir }: { dir: "up" | "down" | "stable" }) {
  if (dir === "up") return <span className="font-bold text-green-500">↑</span>;
  if (dir === "down") return <span className="font-bold text-red-500">↓</span>;
  return <span className="text-stone-300">—</span>;
}

// ─── Mobile: horizontal scroll chips ────────────────────────────────────────

function MobileChips({ items }: { items: PulseItem[] }) {
  return (
    <div className="flex items-center gap-2.5 overflow-x-auto py-2.5 pl-4 pr-4 scrollbar-hide sm:hidden"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {/* Live badge */}
      <div className="flex shrink-0 items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-50" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400 whitespace-nowrap">
          Live
        </span>
      </div>

      <div className="h-5 w-px shrink-0 bg-stone-200" />

      {items.map((item) => (
        <Link
          key={item.productKey}
          href={`/market-intelligence/${item.productKey}`}
          className="flex shrink-0 flex-col rounded-2xl border border-stone-200 bg-white px-3 py-2 active:bg-stone-50"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-stone-600 whitespace-nowrap">
              {item.productName}
            </span>
            <TrendIcon dir={item.trendDirection} />
          </div>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="font-mono text-sm font-bold text-terra-600">
              {fmt(item.avgPrice)}
            </span>
            {item.unit ? (
              <span className="text-[10px] text-stone-400">/{item.unit}</span>
            ) : null}
          </div>
          {item.highPrice && item.lowPrice ? (
            <div className="mt-0.5 flex items-center gap-1.5 text-[10px]">
              <span className="text-green-600 font-medium">{fmt(item.highPrice)}</span>
              <span className="text-stone-300">·</span>
              <span className="text-red-500 font-medium">{fmt(item.lowPrice)}</span>
            </div>
          ) : null}
        </Link>
      ))}
    </div>
  );
}

// ─── Desktop: rotating ticker ────────────────────────────────────────────────

function DesktopTicker({ items }: { items: PulseItem[] }) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (idx >= items.length) setIdx(0);
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

  const selectItem = (nextIdx: number) => {
    setVisible(false);
    setTimeout(() => { setIdx(nextIdx); setVisible(true); }, 320);
  };

  const item = items[idx];
  const range = item.highPrice && item.lowPrice ? item.highPrice - item.lowPrice : 0;
  const bestMarketLabel =
    item.bestMarketName && item.bestCounty
      ? `${item.bestMarketName}, ${item.bestCounty}`
      : item.bestCounty || item.bestMarketName || "";

  return (
    <div className="hidden sm:block">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 py-2.5 sm:gap-6">
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
            className="flex min-w-0 flex-1 items-center gap-3 overflow-x-auto sm:gap-6"
            style={{ opacity: visible ? 1 : 0, transition: "opacity 0.28s ease" }}
          >
            <span className="shrink-0 text-xs font-bold text-stone-600 sm:text-sm">
              {item.productName}
            </span>

            <div className="flex shrink-0 items-baseline gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">Avg</span>
              <span className="font-mono text-sm font-bold text-terra-600 sm:text-base">
                {fmt(item.avgPrice)}
              </span>
              {item.unit ? <span className="text-[10px] text-stone-400">/{item.unit}</span> : null}
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">H</span>
              <span className="font-mono text-xs font-semibold text-green-600">{fmt(item.highPrice)}</span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">L</span>
              <span className="font-mono text-xs font-semibold text-red-500">{fmt(item.lowPrice)}</span>
            </div>

            {range > 0 ? (
              <div className="hidden items-baseline gap-1 lg:flex">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">Range</span>
                <span className="font-mono text-xs font-semibold text-stone-500">{fmt(range)}</span>
              </div>
            ) : null}

            {bestMarketLabel ? (
              <span className="hidden truncate text-[11px] text-stone-400 xl:block">
                Best: {bestMarketLabel}
              </span>
            ) : null}

            <TrendIcon dir={item.trendDirection} />
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

// ─── Root ────────────────────────────────────────────────────────────────────

export default function LivePricePulse({ items }: { items: PulseItem[] }) {
  if (!items.length) return null;
  return (
    <div className="border-t border-stone-200 bg-[#faf7f2]">
      <MobileChips items={items} />
      <DesktopTicker items={items} />
    </div>
  );
}
