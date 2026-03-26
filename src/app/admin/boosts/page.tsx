"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

const BOOST_PRICE_KES = 500;
const BOOST_TILL_NUMBER = "3319295";

const fmtDt = (v?: string) => (v ? new Date(v).toLocaleString() : "-");

const getStatusTone = (status: string) => {
  if (status === "approved") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "rejected") return "border-red-200 bg-red-50 text-red-700";
  if (status === "refunded") return "border-sky-200 bg-sky-50 text-sky-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
};

export default function AdminBoostsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [workingId, setWorkingId] = useState("");
  const [stats, setStats] = useState({ total: 0, submitted: 0, approved: 0 });

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());
      const res = await apiRequest(`${API_ENDPOINTS.boosts.admin.list}?${params}`);
      setItems(Array.isArray(res?.data) ? res.data : []);
      setStats(res?.stats || { total: 0, submitted: 0, approved: 0 });
    } catch (err: any) {
      setError(err?.message || "Unable to load boost requests.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const highlighted = useMemo(() => items.find((i) => i.status === "submitted") || items[0], [items]);

  const handleReview = async (boostId: string, action: "approve" | "reject" | "refund") => {
    setWorkingId(boostId);
    setError("");
    try {
      const note = window.prompt("Admin note (optional):") || undefined;
      await apiRequest(API_ENDPOINTS.boosts.admin.review(boostId), {
        method: "POST",
        body: JSON.stringify({ action, adminNote: note }),
      });
      await loadItems();
    } catch (err: any) {
      setError(err?.message || "Unable to update boost request.");
    } finally {
      setWorkingId("");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
      <div className="rounded-2xl border border-stone-100 bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-terra-600">Admin boost review</p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="mt-1 text-3xl font-bold text-stone-900">Listing boost requests</h1>
            <p className="mt-2 max-w-3xl text-sm text-stone-500">Review manual boost payments of KES {BOOST_PRICE_KES}, confirm the payer phone against till {BOOST_TILL_NUMBER}, then activate the boost.</p>
          </div>
          <button type="button" onClick={loadItems} className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50">Refresh queue</button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {[["Total", stats.total, "text-stone-900"], ["Pending review", stats.submitted, "text-amber-700"], ["Approved", stats.approved, "text-emerald-700"]].map(([label, val, cls]) => (
          <div key={String(label)} className="rounded-2xl border border-stone-100 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</p>
            <p className={`mt-2 text-2xl font-bold ${cls}`}>{val}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-stone-100 bg-white p-5">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr_auto]">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Search</label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:outline-none" placeholder="Listing title, county, or payer phone" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:outline-none">
              <option value="">All statuses</option>
              <option value="submitted">Pending review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div className="flex items-end">
            <button type="button" onClick={loadItems} className="w-full rounded-xl bg-terra-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-terra-600">Apply filters</button>
          </div>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {highlighted && (
        <div className="rounded-2xl border border-terra-100 bg-terra-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-terra-600">Current focus</p>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-lg font-semibold text-stone-900">{highlighted.listingTitle}</p>
              <p className="mt-1 text-sm text-stone-700">Payer {highlighted.payerPhone} | submitted {fmtDt(highlighted.submittedAt)}</p>
            </div>
            <Link href={`/listings/${highlighted.listingId}`} className="rounded-xl bg-terra-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-terra-600">Open listing</Link>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-stone-100 bg-white p-6 text-sm text-stone-500">Loading boost requests...</div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-stone-100 bg-white p-6 text-sm text-stone-500">No boost requests match the current filters.</div>
        ) : (
          items.map((item) => {
            const busy = workingId === item._id;
            const owner = item.ownerId && typeof item.ownerId === "object" ? item.ownerId : {};
            const canApprove = item.status === "submitted";
            const canRefund = item.status === "approved";
            return (
              <div key={item._id} className="rounded-2xl border border-stone-100 bg-white p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-stone-900">{item.listingTitle}</p>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusTone(item.status)}`}>{item.status === "submitted" ? "Pending review" : item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                      <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-stone-700">{item.listingType}</span>
                    </div>
                    <div className="grid gap-2 text-sm text-stone-600 md:grid-cols-2 xl:grid-cols-3">
                      <p><span className="font-semibold text-stone-900">Owner:</span> {owner.fullName || owner.name || "-"}</p>
                      <p><span className="font-semibold text-stone-900">Owner email:</span> {owner.email || "-"}</p>
                      <p><span className="font-semibold text-stone-900">Owner phone:</span> {owner.phone || "-"}</p>
                      <p><span className="font-semibold text-stone-900">County:</span> {item.listingCounty || "-"}</p>
                      <p><span className="font-semibold text-stone-900">Payer phone:</span> {item.payerPhone}</p>
                      <p><span className="font-semibold text-stone-900">Till:</span> {item.tillNumber}</p>
                      <p><span className="font-semibold text-stone-900">Amount:</span> KES {(item.amount || 0).toLocaleString()}</p>
                      <p><span className="font-semibold text-stone-900">Submitted:</span> {fmtDt(item.submittedAt)}</p>
                      <p><span className="font-semibold text-stone-900">Reviewed:</span> {fmtDt(item.reviewedAt)}</p>
                    </div>
                    {item.adminNote && <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700"><span className="font-semibold">Admin note:</span> {item.adminNote}</div>}
                  </div>
                  <div className="w-full xl:w-[360px] space-y-3">
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
                      <span className="text-sm text-stone-600">Boost fee</span>
                      <span className="text-lg font-semibold text-terra-600">KES {(item.amount || 0).toLocaleString()}</span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <button type="button" disabled={!canApprove || busy} onClick={() => handleReview(item._id, "approve")} className="rounded-xl bg-terra-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-terra-600 disabled:opacity-60">Approve boost</button>
                      <button type="button" disabled={!canApprove || busy} onClick={() => handleReview(item._id, "reject")} className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60">Reject</button>
                      <button type="button" disabled={!canRefund || busy} onClick={() => handleReview(item._id, "refund")} className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-700 hover:bg-sky-100 disabled:opacity-60">Refund</button>
                      <Link href={`/listings/${item.listingId}`} className="rounded-xl border border-stone-200 px-4 py-2.5 text-center text-sm font-semibold text-stone-700 hover:bg-stone-50">Open listing</Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
