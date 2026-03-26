"use client";

import { MessageCircle, X } from "lucide-react";
import { useState } from "react";

const WHATSAPP_URL = "https://chat.whatsapp.com/HzCaV5YVz86CjwajiOHR5i";

export default function WhatsAppFloatingButton() {
  const [showPrompt, setShowPrompt] = useState(false);

  return (
    <>
      {showPrompt && (
        <div className="fixed bottom-24 right-4 z-50 w-72 rounded-2xl border border-stone-200 bg-white p-4 shadow-xl">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-stone-900">Join the Agrisoko community</p>
              <p className="mt-1 text-xs text-stone-600">Connect with farmers, buyers, and traders across Kenya on WhatsApp.</p>
            </div>
            <button onClick={() => setShowPrompt(false)} className="shrink-0 text-stone-400 hover:text-stone-600">
              <X size={16} />
            </button>
          </div>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setShowPrompt(false)}
            className="mt-3 block w-full rounded-xl bg-[#25D366] py-2.5 text-center text-sm font-semibold text-white hover:bg-[#1ebe5d] transition"
          >
            Join WhatsApp group
          </a>
        </div>
      )}
      <button
        onClick={() => setShowPrompt((v) => !v)}
        className="fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:bg-[#1ebe5d] hover:scale-105 active:scale-95"
        aria-label="WhatsApp community"
      >
        <MessageCircle size={26} />
      </button>
    </>
  );
}
