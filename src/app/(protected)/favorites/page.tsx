"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { getLocationLabel, getPrimaryImageUrl, normalizeMarketplaceListing } from "@/lib/marketplace";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest(API_ENDPOINTS.favorites.list)
      .then((data) => setFavorites(data?.data ?? data?.favorites ?? data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-stone-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-stone-900">Favorites</h1>

      {favorites.length === 0 ? (
        <div className="py-20 text-center text-stone-400">
          <p>No saved listings yet.</p>
          <Link
            href="/browse"
            className="mt-4 inline-block font-medium text-terra-600 hover:underline"
          >
            Browse listings
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((item: any) => {
            const normalized = normalizeMarketplaceListing(item.listing ?? item);
            const listingId = normalized._id || normalized.id;
            const image = getPrimaryImageUrl(normalized, {
              width: 720,
              height: 540,
              fit: "fill",
            });
            const location = getLocationLabel(normalized);

            return (
              <Link
                key={listingId}
                href={`/listings/${listingId}`}
                className="group overflow-hidden rounded-xl border border-stone-100 bg-white transition-all hover:shadow-md"
              >
                <div className="aspect-[4/3] overflow-hidden bg-stone-100">
                  {image ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={image}
                        alt={normalized.title || "Favorite listing"}
                        fill
                        sizes="(min-width: 1024px) 18rem, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs font-semibold text-stone-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h2 className="line-clamp-2 font-semibold text-stone-800 group-hover:text-terra-600">
                    {normalized.title}
                  </h2>
                  {normalized.price ? (
                    <p className="mt-1 font-bold text-stone-900">
                      KES {Number(normalized.price).toLocaleString()}
                    </p>
                  ) : null}
                  {location ? (
                    <p className="mt-1 flex items-center gap-1 text-xs text-stone-400">
                      <MapPin className="h-3.5 w-3.5" />
                      {location}
                    </p>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
