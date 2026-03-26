"use client";

import Link from "next/link";
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
      className={`sticky bottom-4 z-20 mt-8 rounded-[24px] border border-stone-200 bg-white/90 p-3 shadow-[0_22px_55px_-34px_rgba(28,25,23,0.4)] backdrop-blur md:static md:bg-white ${className}`}
    >
      <div className="grid gap-3 md:grid-cols-3">
        <Link href={submitHref} className="primary-button w-full justify-center">
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
        <Link href={compareHref} className="secondary-button w-full justify-center">
          {compareLabel}
        </Link>
      </div>
    </div>
  );
}
