"use client";

import { useState } from "react";
import { adminApiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

export default function AdminBroadcastPage() {
  const [form, setForm] = useState({ subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      await adminApiRequest(API_ENDPOINTS.admin.broadcast, { method: "POST", body: JSON.stringify(form) });
      setStatus("Broadcast sent successfully.");
      setForm({ subject: "", message: "" });
    } catch (err: any) {
      setStatus(err?.message ?? "Failed to send.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Broadcast Email</h1>
      {status && <p className="bg-forest-50 text-forest-700 text-sm rounded-lg px-4 py-3 mb-4">{status}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-stone-700 block mb-1">Subject</label>
          <input type="text" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-terra-400" />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700 block mb-1">Message</label>
          <textarea required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-terra-400" />
        </div>
        <button type="submit" disabled={loading}
          className="bg-stone-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-stone-800 transition-colors disabled:opacity-50">
          {loading ? "Sending..." : "Send to All Users"}
        </button>
      </form>
    </div>
  );
}
