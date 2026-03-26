import type { MetadataRoute } from "next";
import { API_BASE_URL } from "@/lib/endpoints";

const BASE = "https://www.agrisoko254.com";

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
  { url: `${BASE}/browse`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
  { url: `${BASE}/browse/produce`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.85 },
  { url: `${BASE}/browse/livestock`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.85 },
  { url: `${BASE}/browse/inputs`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  { url: `${BASE}/browse/services`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  { url: `${BASE}/market-intelligence`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
  { url: `${BASE}/market-intelligence/maize`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.85 },
  { url: `${BASE}/market-intelligence/onions`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.8 },
  { url: `${BASE}/market-intelligence/beef`, lastModified: new Date(), changeFrequency: "daily", priority: 0.75 },
  { url: `${BASE}/market-intelligence/tomatoes`, lastModified: new Date(), changeFrequency: "daily", priority: 0.75 },
  { url: `${BASE}/market-intelligence/potatoes`, lastModified: new Date(), changeFrequency: "daily", priority: 0.75 },
  { url: `${BASE}/market-intelligence/beans`, lastModified: new Date(), changeFrequency: "daily", priority: 0.75 },
  { url: `${BASE}/bulk`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.75 },
  { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${BASE}/learn`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  { url: `${BASE}/learn/insights`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.65 },
  { url: `${BASE}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
];

async function fetchListingIds(): Promise<string[]> {
  try {
    const params = new URLSearchParams({
      status: "approved",
      limit: "500",
      fields: "_id,updatedAt",
    });
    const res = await fetch(`${API_BASE_URL}/unified-listings?${params}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json().catch(() => null);
    const items: any[] = Array.isArray(json?.data) ? json.data
      : Array.isArray(json?.listings) ? json.listings
      : Array.isArray(json) ? json
      : [];
    return items
      .map((item: any) => String(item?._id || item?.id || ""))
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function fetchListingEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const params = new URLSearchParams({ status: "approved", limit: "500" });
    const res = await fetch(`${API_BASE_URL}/unified-listings?${params}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json().catch(() => null);
    const items: any[] = Array.isArray(json?.data) ? json.data
      : Array.isArray(json?.listings) ? json.listings
      : Array.isArray(json) ? json
      : [];
    return items
      .map((item: any) => {
        const id = String(item?._id || item?.id || "");
        if (!id) return null;
        return {
          url: `${BASE}/listings/${id}`,
          lastModified: item?.updatedAt ? new Date(item.updatedAt) : new Date(),
          changeFrequency: "daily" as const,
          priority: 0.7,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
  } catch {
    return [];
  }
}

async function fetchIntelligenceProductKeys(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/market-intelligence/overview`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json().catch(() => null);
    const products: any[] = Array.isArray(json?.products) ? json.products
      : Array.isArray(json) ? json
      : [];
    return products
      .map((p: any) => String(p?.productKey || ""))
      .filter(Boolean);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [listingEntries, liveProductKeys] = await Promise.all([
    fetchListingEntries(),
    fetchIntelligenceProductKeys(),
  ]);

  // Merge live product keys with known fallbacks (deduplicated)
  const knownKeys = ["maize", "onions", "beef", "tomatoes", "potatoes", "beans"];
  const allKeys = Array.from(new Set([...knownKeys, ...liveProductKeys]));
  const dynamicIntelEntries: MetadataRoute.Sitemap = allKeys
    .filter((key) => !knownKeys.includes(key)) // already in STATIC_ROUTES above
    .map((key) => ({
      url: `${BASE}/market-intelligence/${key}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));

  return [...STATIC_ROUTES, ...dynamicIntelEntries, ...listingEntries];
}
