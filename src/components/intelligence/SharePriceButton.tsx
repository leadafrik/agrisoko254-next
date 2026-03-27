"use client";

import { useState } from "react";
import PriceSubmitModal from "./PriceSubmitModal";

type Props = {
  className?: string;
  children?: React.ReactNode;
  defaultProductKey?: string;
};

export default function SharePriceButton({ className, children, defaultProductKey }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children ?? "Share a price →"}
      </button>
      <PriceSubmitModal
        open={open}
        onClose={() => setOpen(false)}
        defaultProductKey={defaultProductKey}
      />
    </>
  );
}
