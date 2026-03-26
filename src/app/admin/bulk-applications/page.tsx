"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

export default function AdminBulkApplicationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [summary, setSummary] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ page: "1", limit: "100" });
      if (statusFilter) params.set("status", statusFilter);
      if (roleFilter) params.set("role", roleFilter);
      if (search.trim()) params.set("search", search.trim());
      const res = await adminApiRequest(`${API_ENDPOINTS.bulkApplications.admin.list}?${params}`);
      setItems(Array.isArray(res?.data) ? res.data : []);
      setSummary({ pending: res?.summary?.pending || 0, approved: res?.summary?.approved || 0, rejected: res?.summary?.rejected || 0 });
    } catch (err: any) {
      setError(err?.message || "Failed to load bulk applications.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, roleFilter, search]);

  useEffect(() => { loadApplications(); }, [loadApplications]);

  const clearNote = (id: string) =>
    setReviewNotes((prev) => { const next = { ...prev }; delete next[id]; return next; });

  const handleApprove = async (id: string) => {
    const notes = reviewNotes[id]?.trim() || undefined;
    try {
      await adminApiRequest(API_ENDPOINTS.bulkApplications.admin.approve(id), {
        method: "POST",
        body: JSON.stringify({ reviewNotes: notes }),
      });
      clearNote(id);
      await loadApplications();
    } catch (err: any) {
      setError(err?.message || "Failed to approve application.");
    }
  };

  const handleReject = async (id: string) => {
    const notes = reviewNotes[id]?.trim() || "Application requires more details.";
    try {
      await adminApiRequest(API_ENDPOINTS.bulkApplications.admin.reject(id), {
        method: "POST",
        body: JSON.stringify({ reviewNotes: notes }),
      });
      clearNote(id);
      await loadApplications();
    } catch (err: any) {
      setError(err?.message || "Failed to reject application.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
      <div className="rounded-2xl border border-stone-100 bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-terra-600">Admin</p>
        <h1 className="mt-2 text-3xl font-bold text-stone-900">Bulk applications</h1>
        <p className="mt-2 text-sm text-stone-500">Review and approve bulk buyer and seller applications separately from C2C flows.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[["Pending", summary.pending], ["Approved", summary.approved], ["Rejected", summary.rejected]].map(([label, val]) => (
            <div key={String(label)} className="rounded-xl bg-stone-50 px-4 py-3">
              <p className="text-xs uppercase tracking-widest text-stone-500">{label}</p>
              <p className="text-2xl font-semibold text-stone-900">{val}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-stone-100 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:outline-none">
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:outline-none">
            <option value="">All roles</option>
            <option value="buyer">Bulk buyer</option>
            <option value="seller">Bulk seller</option>
          </select>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search org, person, county..." className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:outline-none md:col-span-2" />
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="rounded-2xl border border-stone-100 bg-white overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-stone-500">Loading applications...</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-sm text-stone-500">No applications found for this filter.</div>
        ) : (
          <div className="divide-y divide-stone-100">
            {items.map((item) => (
              <article key={item._id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">{item.role === "buyer" ? "Bulk buyer" : "Bulk seller"}</span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === "approved" ? "bg-emerald-100 text-emerald-700" : item.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{item.status}</span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-stone-900">{item.organizationName}</h3>
                    <p className="text-sm text-stone-600">{item.contactName} — {item.institutionType}</p>
                    <p className="mt-1 text-xs text-stone-500">{item.address?.county || "County not set"}{item.address?.streetAddress ? `, ${item.address.streetAddress}` : ""}</p>
                  </div>
                  <div className="text-sm text-stone-600">
                    <p>{item.phone}</p>
                    <p>{item.email}</p>
                    <p className="mt-1 text-xs text-stone-500">Updated: {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "N/A"}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl bg-stone-50 px-3 py-2 text-xs">
                    <p className="font-semibold uppercase tracking-widest text-stone-500">Products</p>
                    <p className="mt-1 text-stone-700">{item.products?.length ? item.products.join(", ") : "None"}</p>
                  </div>
                  <div className="rounded-xl bg-stone-50 px-3 py-2 text-xs">
                    <p className="font-semibold uppercase tracking-widest text-stone-500">Coverage / frequency</p>
                    <p className="mt-1 text-stone-700">{item.deliveryCoverage || "N/A"} / {item.procurementFrequency || "N/A"}</p>
                  </div>
                  <div className="rounded-xl bg-stone-50 px-3 py-2 text-xs">
                    <p className="font-semibold uppercase tracking-widest text-stone-500">Scale</p>
                    <p className="mt-1 text-stone-700">{item.monthlyVolume || "No monthly volume"}{item.estimatedBudgetPerOrder ? ` | ${item.estimatedBudgetPerOrder}` : ""}</p>
                    {item.role === "seller" && <p className="mt-1 text-stone-500">Years in agriculture: {item.yearsInAgriculture ?? "N/A"}</p>}
                  </div>
                </div>

                {item.notes && <p className="mt-3 text-sm text-stone-600"><span className="font-semibold text-stone-800">Application notes:</span> {item.notes}</p>}
                {item.reviewNotes && <p className="mt-1 text-sm text-stone-600"><span className="font-semibold text-stone-800">Review notes:</span> {item.reviewNotes}</p>}

                <div className="mt-4 space-y-2">
                  <textarea
                    rows={2}
                    value={reviewNotes[item._id] || ""}
                    onChange={(e) => setReviewNotes((prev) => ({ ...prev, [item._id]: e.target.value }))}
                    placeholder="Review notes (optional for approve, recommended for reject)…"
                    className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-700 focus:outline-none focus:border-terra-300"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => handleApprove(item._id)} className="rounded-xl bg-terra-500 px-4 py-2 text-sm font-semibold text-white hover:bg-terra-600">Approve</button>
                    <button onClick={() => handleReject(item._id)} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Reject</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
