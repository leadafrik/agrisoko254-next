import { serverFetch } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { normalizeMarketplaceListing, normalizeMarketplaceCategory } from "@/lib/marketplace";

type MarketplaceFeedOptions = {
  category?: string | null;
  county?: string;
  search?: string;
  verifiedOnly?: boolean;
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
    if (normalized) {
      searchParams.set(key, normalized);
    }
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

export const getMarketplaceFeed = async ({
  category,
  county = "",
  search = "",
  verifiedOnly = false,
  limit = 16,
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

  const listings = [
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
    .filter((item) => {
      if (verifiedOnly) {
        return Boolean(item?.verified || item?.isVerified || item?.seller?.isVerified || item?.owner?.isVerified);
      }
      return true;
    })
    .sort((a, b) => normalizeDateValue(b?.updatedAt || b?.createdAt) - normalizeDateValue(a?.updatedAt || a?.createdAt));

  return {
    listings: listings.slice(0, limit),
    total: listings.length,
  };
};
