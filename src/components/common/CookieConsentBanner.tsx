"use client";

import { useEffect, useState } from "react";
import { getCookieConsent, setCookieConsent, enableGoogleAdsTracking } from "@/utils/cookieConsent";

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = getCookieConsent();
    if (consent === "accepted") { enableGoogleAdsTracking(); return; }
    if (consent === "rejected") return;
    setVisible(true);
  }, []);

  if (!visible) return null;

  const handleAccept = () => { setCookieConsent("accepted"); enableGoogleAdsTracking(); setVisible(false); };
  const handleReject = () => { setCookieConsent("rejected"); setVisible(false); };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200 bg-white/95 backdrop-blur-md shadow-[0_-16px_40px_rgba(28,25,23,0.12)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <p className="max-w-3xl text-sm leading-6 text-stone-700">
          We use cookies for analytics and advertising to improve Agrisoko. You can accept or reject non-essential cookies.
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button onClick={handleReject} className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition">Reject</button>
          <button onClick={handleAccept} className="rounded-lg bg-terra-500 px-4 py-2 text-sm font-semibold text-white hover:bg-terra-600 transition">Accept</button>
        </div>
      </div>
    </div>
  );
}
