"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

export default function PostBuyRequestPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", description: "", category: "", quantity: "", budget: "", location: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiRequest(API_ENDPOINTS.buyerRequests.create, { method: "POST", body: JSON.stringify(form) });
      router.push("/request");
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold font-display text-stone-900 mb-2">Post a Buy Request</h1>
      <p className="text-stone-500 mb-8">Tell sellers what you need and they will contact you.</p>

      {error && <p className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { name: "title", label: "What do you need?", placeholder: "e.g. 10 bags of maize" },
          { name: "quantity", label: "Quantity", placeholder: "e.g. 10 bags, 500kg" },
          { name: "budget", label: "Budget (KES)", placeholder: "e.g. 50000" },
          { name: "location", label: "Delivery location", placeholder: "e.g. Nakuru town" },
        ].map((f) => (
          <div key={f.name}>
            <label className="text-sm font-medium text-stone-700 block mb-1">{f.label}</label>
            <input type="text" value={(form as any)[f.name]} placeholder={f.placeholder}
              onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
              className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-terra-400" />
          </div>
        ))}
        <div>
          <label className="text-sm font-medium text-stone-700 block mb-1">Category</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-terra-400">
            <option value="">Select category</option>
            {["Produce", "Livestock", "Inputs", "Services"].map((c) => (
              <option key={c} value={c.toLowerCase()}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700 block mb-1">Additional details</label>
          <textarea value={form.description} rows={3}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-terra-400"
            placeholder="Any specific requirements..." />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-terra-500 text-white py-3 rounded-lg font-semibold hover:bg-terra-600 transition-colors disabled:opacity-50">
          {loading ? "Posting..." : "Post Request"}
        </button>
      </form>
    </div>
  );
}
