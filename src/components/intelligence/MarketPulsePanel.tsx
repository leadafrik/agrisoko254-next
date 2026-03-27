"use client";

import { Sparkles } from "lucide-react";

type Props = {
  title?: string;
  items: string[];
  className?: string;
};

export default function MarketPulsePanel({
  title = "Market pulse",
  items,
  className = "",
}: Props) {
  if (!items.length) return null;

  return (
    <div
      className={`overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-[0_20px_52px_-40px_rgba(120,83,47,0.28)] ${className}`}
    >
      <div className="border-b border-stone-200 bg-[#fcf8f2] px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-terra-100 p-2 text-terra-700">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
              {title}
            </p>
            <p className="mt-1 text-sm text-stone-600">
              Read this first if you want the short version.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-5">
        {items.map((item, index) => (
          <div
            key={item}
            className="flex items-start gap-3 rounded-[22px] border border-stone-200 bg-[#fffdf9] px-4 py-4 text-sm leading-relaxed text-stone-700"
          >
            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-terra-100 text-xs font-bold text-terra-700">
              {index + 1}
            </span>
            <p>{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
