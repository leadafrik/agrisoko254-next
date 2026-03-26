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
  { url: `${BASE}/legal/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  { url: `${BASE}/legal/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
];

async function fetchListingEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const params = new URLSearchParams({ status: "approved", limit: "500" });
    const response = await fetch(`${API_BASE_URL}/unified-listings?${params}`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return [];

    const payload = await response.json().catch(() => null);
    const items: any[] = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.listings)
        ? payload.listings
        : Array.isArray(payload)
          ? payload
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
    const response = await fetch(`${API_BASE_URL}/market-intelligence/overview`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return [];

    const json = await response.json().catch(() => null);
    const payload = json?.data ?? json;
    const products: any[] = [
      ...(Array.isArray(payload?.produceBoard) ? payload.produceBoard : []),
      ...(Array.isArray(payload?.livestockBoard) ? payload.livestockBoard : []),
      ...(Array.isArray(payload?.fertilizerBoard) ? payload.fertilizerBoard : []),
      ...(Array.isArray(payload?.products) ? payload.products : []),
      ...(Array.isArray(payload) ? payload : []),
    ];

    return products
      .map((product: any) => String(product?.productKey || ""))
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

  const knownKeys = ["maize", "onions", "beef", "tomatoes", "potatoes", "beans"];
  const allKeys = Array.from(new Set([...knownKeys, ...liveProductKeys]));

  const dynamicIntelEntries: MetadataRoute.Sitemap = allKeys
    .filter((key) => !knownKeys.includes(key))
    .map((key) => ({
      url: `${BASE}/market-intelligence/${key}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));

  return [...STATIC_ROUTES, ...dynamicIntelEntries, ...listingEntries];
}
