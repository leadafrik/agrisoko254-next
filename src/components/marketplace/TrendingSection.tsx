"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  getDeliveryScopeLabel,
  getListingPriceLabel,
  getListingTypeLabel,
  getPrimaryImageUrl,
  isListingBoosted,
  isVerifiedProfile,
  normalizeMarketplaceListing,
} from "@/lib/marketplace";
import { Zap, TrendingUp } from "lucide-react";

interface Props {
  category?: string;
}

export default function TrendingSection({ category }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await apiRequest(API_ENDPOINTS.unifiedListings.trending(category, 8), {
          cache: "no-store",
        } as any);
        if (!cancelled) {
          const raw = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
          setItems(raw.map(normalizeMarketplaceListing));
        }
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [category]);

  if (loading) {
    return (
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-terra-600" />
          <p className="text-sm font-semibold text-stone-900">Trending now</p>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-52 flex-shrink-0 rounded-2xl bg-stone-100 h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!items.length) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-4 w-4 text-terra-600" />
        <p className="text-sm font-semibold text-stone-900">Trending now</p>
        <p className="text-xs text-stone-400">Listings buyers are engaging with most</p>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {items.map((item) => {
          const id = item?._id || item?.id;
          const image = getPrimaryImageUrl(item, { width: 400, height: 300, fit: "fill" });
          const title = item?.title || item?.name || "Listing";
          const priceLabel = getListingPriceLabel(item);
          const typeLabel = getListingTypeLabel(item);
          const boosted = isListingBoosted(item);
          const verified = isVerifiedProfile(item?.seller || item?.owner) || item?.isVerified;
          const deliveryLabel = getDeliveryScopeLabel(item);

          return (
            <Link
              key={id}
              href={`/listings/${id}`}
              className="group w-56 flex-shrink-0 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-terra-200 hover:shadow-md"
            >
              <div className="aspect-[4/3] overflow-hidden bg-stone-100">
                {image ? (
                  <img src={image} alt={title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#fffdf8,#f2ece2)] text-xs uppercase tracking-widest text-stone-400">
                    Agrisoko
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {boosted && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                      <Zap className="h-2.5 w-2.5" /> Boosted
                    </span>
                  )}
                  {verified && (
                    <span className="rounded-full border border-forest-200 bg-forest-50 px-2 py-0.5 text-[10px] font-semibold text-forest-700">
                      Verified
                    </span>
                  )}
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-terra-600">{typeLabel}</span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-sm font-semibold text-stone-900 leading-snug">{title}</p>
                <p className="mt-1 text-base font-bold text-stone-900">{priceLabel}</p>
                <p className="mt-0.5 text-[10px] text-stone-500">{deliveryLabel}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
