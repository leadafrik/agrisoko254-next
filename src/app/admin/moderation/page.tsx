"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { adminApiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

interface ModerationListing {
  _id: string;
  listingType: string;
  title?: string;
  description?: string;
  status?: string;
  isVerified?: boolean;
  createdAt?: string;
  location?: { county?: string; constituency?: string };
  price?: number;
  contact?: string;
  owner?: { name?: string; email?: string; phone?: string };
}

export default function AdminModerationPage() {
  const [listings, setListings] = useState<ModerationListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError("");
      const pendingUrl = API_ENDPOINTS.admin.listings.getPending;
      const approvedUrl = API_ENDPOINTS.admin.listings.getApproved;
      const [pending, approved] = await Promise.all([
        adminApiRequest(pendingUrl),
        adminApiRequest(approvedUrl),
      ]);
      const pendingItems = Array.isArray(pending?.data)
        ? pending.data
        : Array.isArray(pending?.listings)
          ? pending.listings
          : [];
      const approvedItems = Array.isArray(approved?.data)
        ? approved.data
        : Array.isArray(approved?.listings)
          ? approved.listings
          : [];
      setListings([
        ...pendingItems,
        ...approvedItems,
      ]);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch listings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this listing? This cannot be undone.")) return;
    try {
      setActionLoading(id);
      await adminApiRequest(API_ENDPOINTS.admin.listings.delete(id), { method: "DELETE" });
      setListings((prev) => prev.filter((item) => item._id !== id));
    } catch (err: any) {
      setError(err?.message || "Failed to delete listing.");
    } finally {
      setActionLoading(null);
    }
  };

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-terra-600">Admin</p>
          <h1 className="mt-1 text-3xl font-bold text-stone-900">Content moderation</h1>
          <p className="mt-1 text-sm text-stone-500">Review every listing and remove violations fast.</p>
        </div>
        <Link href="/admin" className="text-sm font-semibold text-terra-600 hover:text-terra-700">Back to dashboard</Link>
      </div>

      <div className="rounded-2xl border border-stone-100 bg-white p-4 mb-4">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title, seller, email, or contact..." className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm focus:outline-none" />
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="text-sm text-stone-500">Loading listings...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-stone-100 bg-white p-8 text-center text-stone-500">No listings found.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div key={item._id} className="rounded-2xl border border-stone-100 bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-60">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-stone-900">{item.title || "Listing"}</h3>
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 capitalize">{(item.listingType || "").replace("_", " ")}</span>
                    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">{item.status || (item.isVerified ? "active" : "pending")}</span>
                  </div>
                  <div className="text-sm text-stone-600 space-y-1">
                    {item.owner?.name && <p>Seller: {item.owner.name}</p>}
                    {item.owner?.email && <p>Email: {item.owner.email}</p>}
                    {item.contact && <p>Contact: {item.contact}</p>}
                    {item.location?.county && <p>Location: {[item.location.county, item.location.constituency].filter(Boolean).join(", ")}</p>}
                    {item.price && <p>Price: KES {item.price.toLocaleString()}</p>}
                  </div>
                  {item.description && <p className="mt-2 text-sm text-stone-600 line-clamp-2">{item.description}</p>}
                </div>
                <button onClick={() => handleDelete(item._id)} disabled={actionLoading === item._id} className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50">
                  {actionLoading === item._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
