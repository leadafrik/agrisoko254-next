"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { adminApiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

export default function AdminListingsApprovalPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    adminApiRequest(API_ENDPOINTS.admin.listings.getPending)
      .then((d) => setListings(d?.listings ?? d ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const action = async (id: string, status: "active" | "rejected") => {
    await adminApiRequest(API_ENDPOINTS.admin.listings.verify(id), { method: "PUT", body: JSON.stringify({ status }) });
    fetch();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Listings Approval</h1>
      {loading ? <p className="text-stone-400">Loading...</p> : listings.length === 0 ? (
        <p className="text-stone-400">No pending listings.</p>
      ) : (
        <div className="space-y-4">
          {listings.map((l: any) => (
            <div key={l._id} className="bg-white rounded-xl border border-stone-100 p-5 flex items-start gap-4">
              {l.images?.[0] ? (
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                  <Image src={l.images[0]} alt="" fill sizes="80px" className="object-cover" />
                </div>
              ) : null}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-stone-800">{l.title}</p>
                <p className="text-xs text-stone-500 mt-0.5">{l.category} · {l.location}</p>
                {l.price && <p className="text-sm font-bold text-stone-900 mt-1">KES {l.price.toLocaleString()}</p>}
                {l.description && <p className="text-sm text-stone-400 mt-1 line-clamp-2">{l.description}</p>}
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button onClick={() => action(l._id, "active")}
                  className="bg-forest-500 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-forest-600">Approve</button>
                <button onClick={() => action(l._id, "rejected")}
                  className="bg-red-50 text-red-600 border border-red-200 px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-100">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
