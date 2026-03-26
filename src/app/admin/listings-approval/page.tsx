"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { adminApiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

type PendingListing = {
  _id: string;
  listingType?: string;
  category?: string;
  title?: string;
  description?: string;
  price?: number;
  status?: string;
  createdAt?: string;
  images?: string[];
  owner?: { name?: string; fullName?: string; email?: string; phone?: string };
  location?: { county?: string; constituency?: string; ward?: string; approximateLocation?: string };
};

const getOwnerLabel = (owner?: { name?: string; fullName?: string; email?: string; phone?: string }) =>
  owner?.name || owner?.fullName || owner?.email || owner?.phone || "Unknown seller";

export default function AdminListingsApprovalPage() {
  const [listings, setListings] = useState<PendingListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [workingId, setWorkingId] = useState("");

  const fetchListings = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await adminApiRequest(API_ENDPOINTS.admin.listings.getPending);
      setListings(Array.isArray(response?.data) ? response.data : []);
    } catch (loadError: any) {
      setError(loadError?.message || "Unable to load pending listings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchListings();
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return listings;
    return listings.filter((item) =>
      [item.title, item.category, getOwnerLabel(item.owner), item.owner?.email, item.location?.county]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    );
  }, [listings, query]);

  const reviewListing = async (id: string, status: "approved" | "rejected") => {
    setWorkingId(id);
    setError("");

    try {
      const notes =
        status === "approved"
          ? "Approved by admin"
          : window.prompt("Reason for rejection") || "Rejected by admin";
      await adminApiRequest(API_ENDPOINTS.admin.listings.verify(id), {
        method: "PUT",
        body: JSON.stringify({ status, notes }),
      });
      await fetchListings();
    } catch (reviewError: any) {
      setError(reviewError?.message || "Unable to update the listing.");
    } finally {
      setWorkingId("");
    }
  };

  return (
    <div className="ui-page-shell">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="ui-hero-panel p-6 md:p-8">
          <p className="ui-section-kicker">Approval queue</p>
          <h1 className="mt-4 text-4xl font-bold text-stone-900">Pending marketplace listings</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-stone-600">
            Clear new listings quickly, keep standards high, and send only serious inventory live.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="ui-card p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Pending listings</p><p className="mt-2 text-2xl font-bold text-stone-900">{listings.length}</p></div>
            <div className="ui-card p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Filtered results</p><p className="mt-2 text-2xl font-bold text-stone-900">{filtered.length}</p></div>
            <div className="ui-card p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Categories</p><p className="mt-2 text-2xl font-bold text-stone-900">{new Set(listings.map((item) => item.category).filter(Boolean)).size}</p></div>
          </div>
        </section>

        <div className="ui-card p-5">
          <label>
            <span className="ui-label">Search queue</span>
            <input className="ui-input" placeholder="Title, seller, county, or category" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
        </div>

        {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        {loading ? (
          <div className="ui-card p-6 text-sm text-stone-500">Loading pending listings...</div>
        ) : filtered.length === 0 ? (
          <div className="ui-card p-8 text-center text-stone-500">No pending listings match the current search.</div>
        ) : (
          <div className="space-y-4">
            {filtered.map((listing) => (
              <div key={listing._id} className="ui-card p-5">
                <div className="flex flex-col gap-4 lg:flex-row">
                  {listing.images?.[0] ? (
                    <div className="relative h-28 w-full overflow-hidden rounded-2xl border border-stone-200 lg:h-28 lg:w-36">
                      <Image src={listing.images[0]} alt={listing.title || "Listing"} fill sizes="144px" className="object-cover" />
                    </div>
                  ) : null}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold text-stone-900">{listing.title || "Listing"}</h2>
                      {listing.listingType ? <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">{listing.listingType.replace(/_/g, " ")}</span> : null}
                      {listing.category ? <span className="rounded-full bg-terra-50 px-3 py-1 text-xs font-semibold text-terra-700">{listing.category}</span> : null}
                    </div>
                    <p className="mt-2 text-sm text-stone-600 line-clamp-3">{listing.description || "No description provided."}</p>
                    <div className="mt-4 grid gap-2 text-sm text-stone-600 md:grid-cols-2 xl:grid-cols-3">
                      <p><span className="font-semibold text-stone-900">Seller:</span> {getOwnerLabel(listing.owner)}</p>
                      <p><span className="font-semibold text-stone-900">Contact:</span> {listing.owner?.phone || listing.owner?.email || "-"}</p>
                      <p><span className="font-semibold text-stone-900">Price:</span> {typeof listing.price === "number" ? `KES ${listing.price.toLocaleString()}` : "Negotiable"}</p>
                      <p><span className="font-semibold text-stone-900">County:</span> {listing.location?.county || "-"}</p>
                      <p><span className="font-semibold text-stone-900">Constituency:</span> {listing.location?.constituency || "-"}</p>
                      <p><span className="font-semibold text-stone-900">Submitted:</span> {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString("en-KE") : "Recently"}</p>
                    </div>
                  </div>

                  <div className="flex min-w-[170px] flex-col gap-2">
                    <button type="button" disabled={workingId === listing._id} onClick={() => void reviewListing(listing._id, "approved")} className="ui-btn-primary px-4 py-2.5">Approve</button>
                    <button type="button" disabled={workingId === listing._id} onClick={() => void reviewListing(listing._id, "rejected")} className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60">Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
