"use client";

import { useEffect, useState } from "react";

interface DeliveryOfferModalProps {
  open: boolean;
  title: string;
  description: string;
  submitLabel: string;
  submitting?: boolean;
  initialAmount?: number;
  initialDeliveryDate?: string;
  initialMessage?: string;
  onClose: () => void;
  onSubmit: (payload: { quoteAmount: number; deliveryDate: string; message: string }) => Promise<void> | void;
}

export default function DeliveryOfferModal({ open, title, description, submitLabel, submitting = false, initialAmount, initialDeliveryDate, initialMessage, onClose, onSubmit }: DeliveryOfferModalProps) {
  const [quoteAmount, setQuoteAmount] = useState(initialAmount ? String(initialAmount) : "");
  const [deliveryDate, setDeliveryDate] = useState(initialDeliveryDate || "");
  const [message, setMessage] = useState(initialMessage || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setQuoteAmount(initialAmount ? String(initialAmount) : "");
    setDeliveryDate(initialDeliveryDate || "");
    setMessage(initialMessage || "");
    setError("");
  }, [open, initialAmount, initialDeliveryDate, initialMessage]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(quoteAmount);
    if (!Number.isFinite(amount) || amount <= 0) { setError("Enter a valid quote amount."); return; }
    if (!deliveryDate) { setError("Choose a delivery date."); return; }
    if (!message.trim()) { setError("Add notes so the buyer understands your offer."); return; }
    setError("");
    await onSubmit({ quoteAmount: amount, deliveryDate, message: message.trim() });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/55 px-4 py-6">
      <div className="w-full max-w-2xl rounded-2xl border border-stone-200 bg-white p-6 shadow-xl md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-terra-600">Delivery offer</p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-900">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
          </div>
          <button onClick={onClose} className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50">Close</button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-stone-700">Quote amount</span>
              <input type="number" min={1} value={quoteAmount} onChange={(e) => setQuoteAmount(e.target.value)} placeholder="KES" className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-terra-400" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-stone-700">Delivery date</span>
              <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-terra-400" />
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-stone-700">Notes to the buyer</span>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Explain what you can deliver, quality, timing, and any handling details." rows={5} className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-terra-400" />
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-stone-200 px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50">Cancel</button>
            <button type="submit" disabled={submitting} className="rounded-xl bg-terra-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-terra-600 disabled:opacity-50">
              {submitting ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
