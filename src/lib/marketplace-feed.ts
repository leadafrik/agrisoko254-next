import { serverFetch } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { normalizeMarketplaceListing, normalizeMarketplaceCategory } from "@/lib/marketplace";

export type MarketplaceSortOption = "recommended" | "newest" | "price_low" | "price_high" | "verified";

type MarketplaceFeedOptions = {
  category?: string | null;
  county?: string;
  search?: string;
  verifiedOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: MarketplaceSortOption;
  limit?: number;
  revalidate?: number;
};

const getArray = (payload: any) => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.listings)) return payload.listings;
  if (Array.isArray(payload?.services)) return payload.services;
  if (Array.isArray(payload)) return payload;
  return [];
};

const buildUrl = (base: string, params: Record<string, string | undefined>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    const normalized = String(value || "").trim();
    if (normalized) searchParams.set(key, normalized);
  });
  const query = searchParams.toString();
  return query ? `${base}?${query}` : base;
};

const normalizeDateValue = (value: any) => {
  const parsed = new Date(value || 0);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const includesTerm = (listing: any, searchTerm: string) => {
  if (!searchTerm) return true;
  const haystack = [
    listing?.title,
    listing?.name,
    listing?.description,
    listing?.location?.county,
    listing?.location?.constituency,
    listing?.location?.ward,
    listing?.location?.approximateLocation,
    ...(Array.isArray(listing?.services) ? listing.services : []),
    ...(Array.isArray(listing?.products) ? listing.products : []),
    ...(Array.isArray(listing?.seeds) ? listing.seeds : []),
    ...(Array.isArray(listing?.fertilizers) ? listing.fertilizers : []),
    ...(Array.isArray(listing?.animalFeeds) ? listing.animalFeeds : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(searchTerm);
};

const matchesCounty = (listing: any, county: string) => {
  if (!county) return true;
  const listingCounty = String(listing?.location?.county || listing?.county || "").trim().toLowerCase();
  return listingCounty.includes(county);
};

const matchesPrice = (listing: any, minPrice?: number, maxPrice?: number) => {
  if (!minPrice && !maxPrice) return true;
  const price = Number(listing?.price || 0);
  if (minPrice && price < minPrice) return false;
  if (maxPrice && price > maxPrice) return false;
  return true;
};

const isVerified = (item: any) => {
  if (item?.verified || item?.isVerified) return true;
  const party = item?.seller || item?.owner || item?.user;
  if (!party) return false;
  return Boolean(
    party?.isVerified ||
    party?.verified ||
    party?.verification?.isVerified ||
    party?.verification?.idVerified
  );
};

const isBoosted = (item: any) =>
  Boolean(item?.monetization?.premiumBadge || item?.boosted || item?.isBoosted);

const sortListings = (listings: any[], sort: MarketplaceSortOption): any[] => {
  switch (sort) {
    case "newest":
      return [...listings].sort((a, b) => normalizeDateValue(b?.createdAt) - normalizeDateValue(a?.createdAt));
    case "price_low":
      return [...listings].sort((a, b) => (Number(a?.price) || 0) - (Number(b?.price) || 0));
    case "price_high":
      return [...listings].sort((a, b) => (Number(b?.price) || 0) - (Number(a?.price) || 0));
    case "verified":
      return [...listings].sort((a, b) => (isVerified(b) ? 1 : 0) - (isVerified(a) ? 1 : 0));
    default:
      // recommended: boosted first, then verified, then by recency
      return [...listings].sort((a, b) => {
        const boostDiff = (isBoosted(b) ? 1 : 0) - (isBoosted(a) ? 1 : 0);
        if (boostDiff !== 0) return boostDiff;
        const verifiedDiff = (isVerified(b) ? 1 : 0) - (isVerified(a) ? 1 : 0);
        if (verifiedDiff !== 0) return verifiedDiff;
        return normalizeDateValue(b?.updatedAt || b?.createdAt) - normalizeDateValue(a?.updatedAt || a?.createdAt);
      });
  }
};

export const getMarketplaceFeed = async ({
  category,
  county = "",
  search = "",
  verifiedOnly = false,
  minPrice,
  maxPrice,
  sort = "recommended",
  limit = 48,
  revalidate = 60,
}: MarketplaceFeedOptions) => {
  const normalizedCategory = String(category || "").trim().toLowerCase();
  const normalizedCounty = county.trim();
  const normalizedSearch = search.trim();
  const searchTerm = normalizedSearch.toLowerCase();

  const shouldIncludeProducts =
    !normalizedCategory ||
    ["produce", "livestock", "inputs", "service", "services"].includes(normalizedCategory);
  const shouldIncludeEquipment = !normalizedCategory || ["service", "services"].includes(normalizedCategory);
  const shouldIncludeProfessional = !normalizedCategory || ["service", "services"].includes(normalizedCategory);
  const shouldIncludeAgrovets = !normalizedCategory || normalizedCategory === "inputs";

  const productCategory =
    normalizedCategory === "services"
      ? "service"
      : ["produce", "livestock", "inputs", "service"].includes(normalizedCategory)
        ? normalizedCategory
        : undefined;

  const [productsData, equipmentData, professionalData, agrovetsData] = await Promise.all([
    shouldIncludeProducts
      ? serverFetch<any>(
          buildUrl(API_ENDPOINTS.products.list, {
            category: productCategory,
            county: normalizedCounty,
            search: normalizedSearch,
          }),
          { revalidate }
        )
      : Promise.resolve(null),
    shouldIncludeEquipment
      ? serverFetch<any>(
          buildUrl(API_ENDPOINTS.services.equipment.list, {
            county: normalizedCounty,
            search: normalizedSearch,
          }),
          { revalidate }
        )
      : Promise.resolve(null),
    shouldIncludeProfessional
      ? serverFetch<any>(
          buildUrl(API_ENDPOINTS.services.professional.list, {
            county: normalizedCounty,
            search: normalizedSearch,
          }),
          { revalidate }
        )
      : Promise.resolve(null),
    shouldIncludeAgrovets
      ? serverFetch<any>(
          buildUrl(API_ENDPOINTS.services.agrovets.list, {
            county: normalizedCounty,
            search: normalizedSearch,
          }),
          { revalidate }
        )
      : Promise.resolve(null),
  ]);

  const all = [
    ...getArray(productsData).map((item: any) =>
      normalizeMarketplaceListing({
        ...item,
        typeLabel: normalizeMarketplaceCategory(item) === "service" ? "Service" : undefined,
      })
    ),
    ...getArray(equipmentData).map((item: any) =>
      normalizeMarketplaceListing({
        ...item,
        category: "service",
        type: "equipment",
        serviceType: "equipment",
        typeLabel: "Equipment Hire",
      })
    ),
    ...getArray(professionalData).map((item: any) =>
      normalizeMarketplaceListing({
        ...item,
        category: "service",
        type: "professional_services",
        serviceType: "professional",
        typeLabel: "Professional Service",
      })
    ),
    ...getArray(agrovetsData).map((item: any) =>
      normalizeMarketplaceListing({
        ...item,
        category: "inputs",
        type: "agrovet",
        serviceType: "agrovet",
        typeLabel: "Agrovet",
      })
    ),
  ]
    .filter((item) => matchesCounty(item, normalizedCounty.toLowerCase()))
    .filter((item) => includesTerm(item, searchTerm))
    .filter((item) => !verifiedOnly || isVerified(item))
    .filter((item) => matchesPrice(item, minPrice, maxPrice));

  const sorted = sortListings(all, sort);

  return {
    listings: sorted.slice(0, limit),
    total: sorted.length,
    verifiedCount: sorted.filter(isVerified).length,
    boostedCount: sorted.filter(isBoosted).length,
  };
};
