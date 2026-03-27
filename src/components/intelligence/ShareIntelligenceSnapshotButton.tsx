"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import {
  formatKes,
  formatTrendLabel,
  type TrendDirection,
} from "@/lib/market-intelligence";

type Props = {
  productKey: string;
  productName: string;
  avgPrice?: number;
  bestPrice?: number;
  bestCounty?: string;
  bestMarketName?: string;
  unit?: string;
  trendDirection?: TrendDirection;
  trendPercentage?: number;
  label?: string;
  className?: string;
};

export default function ShareIntelligenceSnapshotButton({
  productKey,
  productName,
  avgPrice,
  bestPrice,
  bestCounty,
  bestMarketName,
  unit,
  trendDirection = "stable",
  trendPercentage = 0,
  label = "Share live snapshot",
  className,
}: Props) {
  const [feedback, setFeedback] = useState("");

  const handleShare = async () => {
    if (typeof window === "undefined") return;

    const url = new URL(`/market-intelligence/${productKey}`, window.location.origin).toString();
    const details = [
      `Live ${productName} snapshot on Agrisoko.`,
      avgPrice ? `Board average: ${formatKes(avgPrice)}${unit ? ` / ${unit}` : ""}.` : null,
      bestMarketName && bestCounty && bestPrice
        ? `Best sell: ${bestMarketName}, ${bestCounty} at ${formatKes(bestPrice)}.`
        : null,
      `${formatTrendLabel(trendDirection, trendPercentage)}.`,
      "Open the live board to see the latest market intelligence.",
    ]
      .filter(Boolean)
      .join(" ");

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${productName} live market snapshot`,
          text: details,
          url,
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${details} ${url}`);
        setFeedback("Snapshot link copied");
        window.setTimeout(() => setFeedback(""), 2200);
      }
    } catch {
      // Ignore cancelled share actions.
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleShare()}
      className={
        className ||
        "inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-terra-200 hover:text-terra-700"
      }
    >
      <Share2 className="h-4 w-4" />
      {feedback || label}
    </button>
  );
}
