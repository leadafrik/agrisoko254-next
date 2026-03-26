"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

const PRODUCT_CATEGORIES = ["produce", "livestock", "inputs", "service"] as const;
const CATEGORY_COLORS: Record<string, string> = {
  produce: "bg-orange-50 text-orange-700 border-orange-200",
  livestock: "bg-rose-50 text-rose-700 border-rose-200",
  inputs: "bg-sky-50 text-sky-700 border-sky-200",
  service: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function AdminListingManagementPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "active">("pending");
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", price: "", category: "" });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const loadListings = async (tab: "pending" | "active") => {
    try {
      setLoading(true);
      setError("");
      const url = tab === "pending" ? API_ENDPOINTS.admin.listings.getPending : `${API_ENDPOINTS.admin.listings.getPending.replace("/pending", "/approved")}`;
      const res = await apiRequest(url);
      const data = res?.data || res?.listings || [];
      setListings(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load listings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadListings(activeTab); }, [activeTab]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return listings;
    return listings.filter((item) =>
      (item.title || "").toLowerCase().includes(needle) ||
      (item.contact || "").toLowerCase().includes(needle) ||
      (item.owner?.name || "").toLowerCase().includes(needle) ||
      (item.owner?.email || "").toLowerCase().includes(needle)
    );
  }, [listings, query]);

  const handleVerify = async (id: string, status: "approved" | "rejected") => {
    const notes = status === "approved" ? "Approved by admin" : window.prompt("Reason for rejection?") || "Rejected by admin";
    try {
      setActionLoading(id);
      await apiRequest(API_ENDPOINTS.admin.listings.verify(id), {
        method: "PUT",
        body: JSON.stringify({ status, notes }),
      });
      await loadListings(activeTab);
    } catch (err: any) {
      setError(err?.message || "Failed to update listing.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this listing? This cannot be undone.")) return;
    try {
      setActionLoading(id);
      await apiRequest(API_ENDPOINTS.admin.listings.delete(id), { method: "DELETE" });
      setListings((prev) => prev.filter((item) => item._id !== id));
    } catch (err: any) {
      setError(err?.message || "Failed to delete listing.");
    } finally {
      setActionLoading(null);
    }
  };

  const openEdit = (item: any) => {
    setEditTarget(item);
    setEditForm({ title: item.title || "", description: item.description || "", price: item.price !== undefined ? String(item.price) : "", category: item.category || "" });
    setEditError("");
  };

  const handleEditSave = async () => {
    if (!editTarget) return;
    setEditSaving(true);
    setEditError("");
    try {
      const body: Record<string, any> = {};
      if (editForm.title.trim()) body.title = editForm.title.trim();
      if (editForm.description.trim()) body.description = editForm.description.trim();
      if (editForm.price !== "") body.price = Number(editForm.price);
      if (editForm.category) body.category = editForm.category;
      await apiRequest(`${API_ENDPOINTS.admin.listings.getPending.replace("/pending", "")}/${editTarget._id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      setListings((prev) => prev.map((item) => item._id === editTarget._id ? { ...item, ...body } : item));
      setEditTarget(null);
    } catch (err: any) {
      setEditError(err?.message || "Failed to save changes.");
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-terra-600">Listing Management</p>
          <h1 className="mt-2 text-3xl font-bold text-stone-900">Manage listings</h1>
          <p className="mt-2 text-sm text-stone-500">Review new listings, approve or reject, and remove violations.</p>
        </div>
        <Link href="/admin" className="text-sm font-semibold text-terra-600 hover:text-terra-700">Back to dashboard</Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {(["pending", "active"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === tab ? "bg-terra-500 text-white" : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"}`}>
            {tab === "pending" ? "Pending approval" : "Active listings"}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-stone-100 bg-white p-4">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title, seller, email, or contact..." className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm focus:outline-none" />
      </div>

      {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="mt-8 text-sm text-stone-500">Loading listings...</div>
      ) : filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-stone-100 bg-white p-8 text-center text-stone-500">No listings found.</div>
      ) : (
        <div className="mt-6 space-y-4">
          {filtered.map((item) => (
            <div key={item._id} className="rounded-2xl border border-stone-100 bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-60">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-stone-900">{item.title || "Listing"}</h3>
                    {item.listingType && <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold capitalize">{item.listingType.replace("_", " ")}</span>}
                    {item.category && <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${CATEGORY_COLORS[item.category] || "bg-stone-100 text-stone-700 border-stone-200"}`}>{item.category}</span>}
                  </div>
                  <p className="mt-2 text-sm text-stone-600 line-clamp-2">{item.description || "No description provided."}</p>
                  <div className="mt-3 text-sm text-stone-600 space-y-1">
                    {item.owner?.name && <p>Seller: {item.owner.name}</p>}
                    {item.owner?.email && <p>Email: {item.owner.email}</p>}
                    {item.contact && <p>Contact: {item.contact}</p>}
                    {item.location?.county && <p>Location: {[item.location.county, item.location.constituency].filter(Boolean).join(", ")}</p>}
                    {item.price && <p>Price: KES {item.price.toLocaleString()}</p>}
                  </div>
                </div>
                <div className="flex flex-col gap-2 min-w-44">
                  {activeTab === "pending" && (
                    <>
                      <button onClick={() => handleVerify(item._id, "approved")} disabled={actionLoading === item._id} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">Approve</button>
                      <button onClick={() => handleVerify(item._id, "rejected")} disabled={actionLoading === item._id} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50">Reject</button>
                    </>
                  )}
                  {item.listingType === "product" && (
                    <button onClick={() => openEdit(item)} disabled={actionLoading === item._id} className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50">Edit</button>
                  )}
                  <button onClick={() => handleDelete(item._id)} disabled={actionLoading === item._id} className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-stone-900">Edit listing</h2>
            <p className="mt-1 text-sm text-stone-500">Only product listings can be edited. Changes take effect immediately.</p>
            {editError && <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{editError}</div>}
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Category</label>
                <select value={editForm.category} onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm">
                  <option value="">— select category —</option>
                  {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Title</label>
                <input value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Description</label>
                <textarea rows={4} value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Price (KES)</label>
                <input type="number" min={0} value={editForm.price} onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setEditTarget(null)} disabled={editSaving} className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50">Cancel</button>
              <button onClick={handleEditSave} disabled={editSaving} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{editSaving ? "Saving…" : "Save changes"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
