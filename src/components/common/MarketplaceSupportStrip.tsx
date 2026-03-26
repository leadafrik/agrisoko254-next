"use client";

import { Download, Mail, MessageCircle } from "lucide-react";

const WHATSAPP_URL = "https://chat.whatsapp.com/HzCaV5YVz86CjwajiOHR5i";
const SUPPORT_EMAIL = "info@leadafrik.com";

interface Props {
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function MarketplaceSupportStrip({
  title = "Need help?",
  subtitle = "Support is available on WhatsApp, by email, and through the Agrisoko app.",
  className = "",
}: Props) {
  return (
    <div className={`rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm ${className}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-stone-900">{title}</p>
          <p className="mt-1 text-sm text-stone-600">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-terra-300 hover:bg-terra-50">
            <MessageCircle className="h-4 w-4 text-terra-600" /> WhatsApp
          </a>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-terra-300 hover:bg-terra-50">
            <Mail className="h-4 w-4 text-terra-600" /> Email support
          </a>
          <a href="https://play.google.com/store/apps/details?id=com.agrisoko.app" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-terra-300 hover:bg-terra-50">
            <Download className="h-4 w-4 text-terra-600" /> Install app
          </a>
        </div>
      </div>
    </div>
  );
}
