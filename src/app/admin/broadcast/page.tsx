"use client";

import { useState } from "react";
import { adminApiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

type Step = "compose" | "confirm" | "done";

export default function AdminBroadcastPage() {
  const [step, setStep] = useState<Step>("compose");
  const [form, setForm] = useState({ subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    setLoading(true);
    setError("");
    try {
      await adminApiRequest(API_ENDPOINTS.admin.broadcast, {
        method: "POST",
        body: JSON.stringify(form),
      });
      setStep("done");
    } catch (err: any) {
      setError(err?.message ?? "Failed to send broadcast.");
      setStep("confirm");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setForm({ subject: "", message: "" });
    setError("");
    setStep("compose");
  };

  if (step === "done") {
    return (
      <div className="max-w-xl">
        <h1 className="text-2xl font-bold text-stone-900 mb-6">Broadcast Email</h1>
        <div className="rounded-2xl border border-forest-200 bg-forest-50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-forest-100">
            <svg className="h-6 w-6 text-forest-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-forest-800">Broadcast sent</p>
          <p className="mt-1 text-sm text-forest-600">Your message has been queued for all users.</p>
          <div className="mt-6 rounded-xl border border-forest-200 bg-white px-4 py-3 text-left text-sm text-stone-700">
            <p className="font-semibold text-stone-900">{form.subject}</p>
            <p className="mt-1 whitespace-pre-line text-stone-500">{form.message}</p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded-xl bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            Send another
          </button>
        </div>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="max-w-xl">
        <h1 className="text-2xl font-bold text-stone-900 mb-6">Broadcast Email</h1>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 mb-4">
          <p className="text-sm font-semibold text-amber-800">Review before sending</p>
          <p className="mt-1 text-xs text-amber-700">This will send an email to all registered users. This action cannot be undone.</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">Subject</p>
            <p className="mt-1 text-sm font-semibold text-stone-900">{form.subject}</p>
          </div>
          <div className="border-t border-stone-100 pt-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">Message</p>
            <p className="mt-1 whitespace-pre-line text-sm text-stone-700">{form.message}</p>
          </div>
        </div>
        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => setStep("compose")}
            disabled={loading}
            className="flex-1 rounded-xl border border-stone-200 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 disabled:opacity-50"
          >
            Edit message
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={loading}
            className="flex-1 rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-50"
          >
            {loading ? "Sending…" : "Confirm — send to all users"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-stone-900 mb-2">Broadcast Email</h1>
      <p className="mb-6 text-sm text-stone-500">Compose a message to send to all registered users.</p>
      <form
        onSubmit={(e) => { e.preventDefault(); setStep("confirm"); }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Subject</label>
          <input
            type="text"
            required
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="e.g. New features on Agrisoko"
            className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:border-terra-400 focus:ring-2 focus:ring-terra-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Message</label>
          <textarea
            required
            rows={8}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Write your message here…"
            className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:border-terra-400 focus:ring-2 focus:ring-terra-100"
          />
        </div>
        <button
          type="submit"
          disabled={!form.subject.trim() || !form.message.trim()}
          className="w-full rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-50"
        >
          Preview &amp; send
        </button>
      </form>
    </div>
  );
}
