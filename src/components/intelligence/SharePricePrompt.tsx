"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BellRing, X } from "lucide-react";

type Props = {
  productKey: string;
  productName: string;
};

const DISMISS_KEY = "agrisoko_market_price_prompt_dismissed_at";
const DISMISS_WINDOW_MS = 12 * 60 * 60 * 1000;

export default function SharePricePrompt({ productKey, productName }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY) || 0);
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_WINDOW_MS) {
      return;
    }

    const timer = window.setTimeout(() => setOpen(true), 1800);
    return () => clearTimeout(timer);
  }, [productKey]);

  const handleDismiss = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-x-4 bottom-5 z-30 md:inset-auto md:right-6 md:bottom-6 md:w-[380px]">
      <div className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-[0_26px_64px_-34px_rgba(28,25,23,0.35)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-terra-100 p-2 text-terra-700">
              <BellRing className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-900">
                Can you share today&apos;s {productName.toLowerCase()} price?
              </p>
              <p className="mt-1 text-sm leading-relaxed text-stone-600">
                One clean report helps make the board more useful for other farmers and buyers.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-full p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
            aria-label="Close share price prompt"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/market-intelligence/submit?product=${productKey}`}
            className="primary-button w-full justify-center"
          >
            Share a price
          </Link>
          <button
            type="button"
            onClick={handleDismiss}
            className="secondary-button w-full justify-center"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
