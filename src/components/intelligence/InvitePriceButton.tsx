"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import {
  buildPriceContributionHref,
  buildPriceContributionPrompt,
} from "@/lib/market-intelligence";

type Props = {
  productKey: string;
  productName: string;
  county?: string;
  marketName?: string;
  unit?: string;
  className?: string;
};

export default function InvitePriceButton({
  productKey,
  productName,
  county,
  marketName,
  unit,
  className,
}: Props) {
  const [copied, setCopied] = useState(false);

  const handleInvite = async () => {
    const href = buildPriceContributionHref({ productKey, county, marketName, unit });
    const prompt = buildPriceContributionPrompt({ productName, county, marketName });

    if (typeof window === "undefined") return;

    const absoluteUrl = new URL(href, window.location.origin).toString();
    const shareText = `${prompt} Share today's price on Agrisoko: ${absoluteUrl}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Share ${productName} price`,
          text: prompt,
          url: absoluteUrl,
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2200);
      }
    } catch {
      // Ignore cancelled share actions.
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleInvite()}
      className={
        className ||
        "inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-terra-200 hover:text-terra-700"
      }
    >
      <Share2 className="h-4 w-4" />
      {copied ? "Invite link copied" : "Invite others to price this"}
    </button>
  );
}
