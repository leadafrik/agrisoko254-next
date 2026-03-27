"use client";

import Link from "next/link";
import { ArrowRightLeft, PlusCircle } from "lucide-react";
import InvitePriceButton from "@/components/intelligence/InvitePriceButton";

type Props = {
  submitHref: string;
  submitLabel?: string;
  compareHref: string;
  compareLabel?: string;
  invite?: {
    productKey: string;
    productName: string;
    county?: string;
    marketName?: string;
    unit?: string;
  };
  className?: string;
};

export default function TradingActionBar({
  submitHref,
  submitLabel = "Submit price",
  compareHref,
  compareLabel = "Compare markets",
  invite,
  className = "",
}: Props) {
  return (
    <div
      className={`sticky bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-20 rounded-[26px] border border-stone-200 bg-white/94 p-3 shadow-[0_22px_55px_-34px_rgba(28,25,23,0.35)] backdrop-blur md:static md:border-0 md:bg-transparent md:p-0 md:shadow-none ${className}`}
    >
      <div className="grid gap-3 md:grid-cols-3">
        <Link href={submitHref} className="primary-button w-full justify-center gap-2">
          <PlusCircle className="h-4 w-4" />
          {submitLabel}
        </Link>
        {invite ? (
          <InvitePriceButton
            productKey={invite.productKey}
            productName={invite.productName}
            county={invite.county}
            marketName={invite.marketName}
            unit={invite.unit}
            className="secondary-button w-full justify-center"
          />
        ) : (
          <div />
        )}
        <Link href={compareHref} className="secondary-button w-full justify-center gap-2">
          <ArrowRightLeft className="h-4 w-4" />
          {compareLabel}
        </Link>
      </div>
    </div>
  );
}
