"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest(API_ENDPOINTS.favorites.list)
      .then((d) => setFavorites(d?.favorites ?? d ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen text-stone-400">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold font-display text-stone-900 mb-6">Favorites</h1>

      {favorites.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <p>No saved listings yet.</p>
          <Link href="/browse" className="mt-4 inline-block text-terra-600 font-medium hover:underline">Browse listings</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {favorites.map((item: any) => {
            const listing = item.listing ?? item;
            return (
              <Link key={listing._id} href={`/listings/${listing._id}`}
                className="bg-white rounded-xl border border-stone-100 overflow-hidden hover:shadow-md transition-all group">
                {listing.images?.[0] && (
                  <div className="aspect-[4/3] overflow-hidden bg-stone-100">
                    <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-stone-800 line-clamp-2 group-hover:text-terra-600">{listing.title}</h3>
                  {listing.price && <p className="font-bold text-stone-900 mt-1">KES {listing.price.toLocaleString()}</p>}
                  {listing.location && <p className="text-xs text-stone-400 mt-1">📍 {listing.location}</p>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
