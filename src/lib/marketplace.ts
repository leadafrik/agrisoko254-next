export type MarketplaceCategorySlug = "produce" | "livestock" | "inputs" | "services";
export type SellerCategorySlug = "produce" | "livestock" | "inputs" | "service";
type ImageFit = "fill" | "limit" | "scale";

type CloudinaryImageOptions = {
  width?: number;
  height?: number;
  fit?: ImageFit;
  quality?: "auto" | "auto:good" | "auto:best";
};

type CategoryMeta = {
  slug: MarketplaceCategorySlug;
  apiCategory: SellerCategorySlug;
  label: string;
  shortLabel: string;
  description: string;
  examples: string;
  accent: string;
};

export const MARKETPLACE_CATEGORIES: CategoryMeta[] = [
  {
    slug: "produce",
    apiCategory: "produce",
    label: "Produce",
    shortLabel: "Produce",
    description: "Fresh crops and post-harvest stock from growers across Kenya.",
    examples: "Maize, beans, onions, vegetables, fruits",
    accent: "terra",
  },
  {
    slug: "livestock",
    apiCategory: "livestock",
    label: "Livestock",
    shortLabel: "Livestock",
    description: "Trusted animal listings from verified smallholders and traders.",
    examples: "Dairy cattle, goats, sheep, poultry, pigs",
    accent: "forest",
  },
  {
    slug: "inputs",
    apiCategory: "inputs",
    label: "Farm Inputs",
    shortLabel: "Inputs",
    description: "Practical farm supplies for planting, feeding, and field operations.",
    examples: "Seeds, feeds, fertilizer, chemicals, tools",
    accent: "amber",
  },
  {
    slug: "services",
    apiCategory: "service",
    label: "Services",
    shortLabel: "Services",
    description: "Field support and equipment from operators working in real counties.",
    examples: "Tractor hire, spraying, transport, agronomy support",
    accent: "slate",
  },
];

export const CREATE_LISTING_CATEGORY_DETAILS: Record<
  SellerCategorySlug,
  {
    heading: string;
    intro: string;
    placeholderTitle: string;
    placeholderDescription: string;
    quantityLabel: string;
    quantityHint: string;
    unitOptions: string[];
  }
> = {
  produce: {
    heading: "List produce",
    intro: "Post harvest-ready stock with a clear county, quantity, and buyer-ready description.",
    placeholderTitle: "Example: Dry maize in 90kg bags",
    placeholderDescription: "Mention variety, moisture, packaging, harvest timing, and how delivery works.",
    quantityLabel: "Available quantity",
    quantityHint: "Enter the number of bags, crates, or kilograms you have ready now.",
    unitOptions: [
      "kg",
      "90kg bag",   // maize, beans, wheat — standard grain bag
      "50kg bag",   // general produce, onion nets
      "120kg bag",  // Irish potatoes
      "crate",      // tomatoes (~64kg Nairobi crate)
      "bunch",      // kale, spinach, sukuma
      "tonne",      // large wholesale volumes
      "box",        // bananas, avocados
    ],
  },
  livestock: {
    heading: "List livestock",
    intro: "Give buyers enough confidence to contact you without needing a long back-and-forth first.",
    placeholderTitle: "Example: Dairy heifers, in-calf",
    placeholderDescription: "Mention breed, age, health, feeding routine, and whether transport can be arranged.",
    quantityLabel: "Animals available",
    quantityHint: "Enter the count of head, birds, or trays available.",
    unitOptions: [
      "head",              // cattle, goats, sheep, pigs
      "bird",              // broilers, layers sold as whole birds
      "kg live weight",    // poultry or small stock priced per kg
      "tray (30 eggs)",    // egg trays
      "dozen",             // eggs sold retail
    ],
  },
  inputs: {
    heading: "List farm inputs",
    intro: "Show what you stock, where you operate, and the commercial terms farmers need to see quickly.",
    placeholderTitle: "Example: DAP fertilizer, 50kg bags",
    placeholderDescription: "Mention brand, pack size, crop fit, and any minimum order or delivery detail.",
    quantityLabel: "Stock available",
    quantityHint: "Enter the number of bags, litres, or pieces currently in stock.",
    unitOptions: [
      "50kg bag",  // DAP, CAN, UREA, NPK — standard fertilizer bag
      "25kg bag",  // smaller fertilizer or seed packs
      "kg",        // loose seed, lime, supplements
      "litre",     // chemicals, liquid fertilizer
      "500ml",     // small chemical bottles
      "packet",    // seed packets (specific weight on label)
      "piece",     // tools, sprayers, single items
    ],
  },
  service: {
    heading: "List a service",
    intro: "Explain the actual service you deliver, your coverage area, and what a customer can expect.",
    placeholderTitle: "Example: Tractor ploughing in Nakuru",
    placeholderDescription: "Describe the service, response time, pricing basis, and whether operator cost is included.",
    quantityLabel: "Coverage or capacity",
    quantityHint: "Enter acres, jobs, or hours available per day or week.",
    unitOptions: ["acre", "hour", "day", "job", "session"],
  },
};

export const PLATFORM_NUMBERS = [
  { label: "Core trade lanes", value: "4", detail: "Produce, livestock, inputs, and service supply in one place" },
  { label: "Managed counties", value: "4", detail: "Checkout support is live in selected counties today" },
  { label: "Buyer workflows", value: "B2B", detail: "Bulk requests, direct messaging, and trust-first trading paths" },
];

export const PLATFORM_PROMISES = [
  {
    title: "Verified trust signals",
    description: "Profiles, seller status, and category context help buyers judge seriousness quickly.",
  },
  {
    title: "Direct market access",
    description: "Agrisoko reduces broker dependency by helping farmers and buyers connect directly.",
  },
  {
    title: "Operational clarity",
    description: "County coverage, checkout rules, and bulk workflows are stated plainly instead of hidden.",
  },
];

export const BULK_USE_CASES = [
  "Schools and hospitals sourcing produce on repeat schedules",
  "Restaurants and processors comparing supplier offers",
  "Distributors coordinating county-level fulfillment",
  "Approved sellers responding to institutional demand",
];

export const ABOUT_FAQS = [
  {
    question: "What does Agrisoko cover?",
    answer:
      "Agrisoko focuses on produce, livestock, farm inputs, services, buyer requests, and bulk trade workflows for Kenya.",
  },
  {
    question: "Do users need verification before joining?",
    answer:
      "No. Account creation is open. Verification remains optional, but it improves trust and visibility.",
  },
  {
    question: "How does checkout work today?",
    answer:
      "Marketplace checkout is managed through manual payment verification using the Agrisoko till and supported delivery counties.",
  },
  {
    question: "Who is the platform for?",
    answer:
      "Smallholders, traders, input suppliers, service providers, institutional buyers, and serious B2B operators.",
  },
];

export const SUPPORTED_DELIVERY_COUNTIES = ["Kiambu", "Nairobi", "Kakamega", "Narok"];
export const CHECKOUT_TILL_NUMBER = "3319295";
export const CHECKOUT_MERCHANT_NAME = "Purity Valary Akong'ai";

export const normalizeBrowseCategory = (value?: string | null) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return null;
  return (
    MARKETPLACE_CATEGORIES.find(
      (category) => category.slug === normalized || category.apiCategory === normalized
    ) || null
  );
};

export const getCategoryByApi = (value?: string | null) => {
  const normalized = String(value || "").trim().toLowerCase();
  return (
    MARKETPLACE_CATEGORIES.find((category) => category.apiCategory === normalized) ||
    MARKETPLACE_CATEGORIES.find((category) => category.slug === normalized) ||
    null
  );
};

export const formatKes = (value?: number | string | null) => {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return `KES ${amount.toLocaleString()}`;
};

export const formatShortDate = (value?: string | Date | null) => {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatLongDate = (value?: string | Date | null) => {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const getLocationLabel = (value: any) => {
  const location = value?.location || value || {};
  const parts = [
    location.ward,
    location.constituency,
    location.county,
    location.region,
    location.approximateLocation,
  ].filter(Boolean);
  if (parts.length > 0) return parts.join(", ");
  if (typeof value?.location === "string") return value.location;
  return null;
};

const DEFAULT_IMAGE_QUALITY: CloudinaryImageOptions["quality"] = "auto:good";

export const getOptimizedImageUrl = (
  url?: string | null,
  options: CloudinaryImageOptions = {}
): string => {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }

  const { width, height, fit = "limit", quality = DEFAULT_IMAGE_QUALITY } = options;
  const transforms = ["f_auto", `q_${quality}`, "dpr_auto"];

  if (fit === "fill" && width && height) {
    transforms.push("c_fill", "g_auto", `w_${width}`, `h_${height}`);
  } else {
    transforms.push("c_limit");
    if (width) transforms.push(`w_${width}`);
    if (height) transforms.push(`h_${height}`);
  }

  return url.replace("/image/upload/", `/image/upload/${transforms.join(",")}/`);
};

const extractImageUrl = (item: any): string => {
  if (!item) return "";
  if (typeof item === "string") return item.trim();
  // image objects: { url, secure_url, publicUrl, src, ... }
  const url = item?.url || item?.secure_url || item?.publicUrl || item?.src || "";
  return String(url).trim();
};

export const getListingImageUrls = (listing: any) => {
  const rawImages = [
    ...(Array.isArray(listing?.images) ? listing.images : []),
    ...(Array.isArray(listing?.photos) ? listing.photos : []),
    ...(typeof listing?.image === "string" ? [listing.image] : []),
    ...(listing?.image && typeof listing.image === "object" ? [listing.image] : []),
    ...(typeof listing?.coverImage === "string" ? [listing.coverImage] : []),
  ]
    .map(extractImageUrl)
    .filter((url) => Boolean(url) && !url.includes("[object"));

  return Array.from(new Set(rawImages));
};

export const getPrimaryImageUrl = (
  listing: any,
  options?: CloudinaryImageOptions
) => {
  const [image] = getListingImageUrls(listing);
  if (!image) return null;
  return getOptimizedImageUrl(image, options);
};

export const normalizeMarketplaceCategory = (listing: any): SellerCategorySlug => {
  const category = String(listing?.category || "").trim().toLowerCase();
  const type = String(listing?.type || listing?.serviceType || "").trim().toLowerCase();

  if (category === "livestock" || category === "inputs" || category === "service") {
    return category;
  }
  if (type === "equipment" || type === "professional_services" || type === "professional") {
    return "service";
  }
  if (type === "agrovet") {
    return "inputs";
  }
  return "produce";
};

export const getListingTypeLabel = (listing: any) => {
  const explicit = String(listing?.marketLabel || listing?.typeLabel || "").trim();
  if (explicit) return explicit;

  const type = String(listing?.type || listing?.serviceType || "").trim().toLowerCase();
  if (type === "equipment") return "Equipment Hire";
  if (type === "professional_services" || type === "professional") {
    return "Professional Service";
  }
  if (type === "agrovet") return "Agrovet";

  return getCategoryByApi(normalizeMarketplaceCategory(listing))?.shortLabel || "Listing";
};

export const getListingPriceLabel = (listing: any) => {
  // Try all common price field names
  const priceValue =
    listing?.price ||
    listing?.pricePerUnit ||
    listing?.unitPrice ||
    listing?.askingPrice ||
    listing?.sellingPrice ||
    listing?.basePrice;
  const numeric = formatKes(priceValue);
  if (numeric) return numeric;

  const pricing = String(listing?.pricing || listing?.priceLabel || "").trim();
  if (pricing) return pricing;

  if (String(listing?.type || "").toLowerCase() === "agrovet") {
    return "Call for pricing";
  }

  return "Contact for price";
};

export const normalizeMarketplaceListing = (listing: any) => {
  const normalizedCategory = normalizeMarketplaceCategory(listing);
  const images = getListingImageUrls(listing);
  const seller = listing?.seller || listing?.owner || listing?.user;

  return {
    ...listing,
    category: normalizedCategory,
    images,
    seller,
    owner: listing?.owner || seller,
    priceLabel: getListingPriceLabel(listing),
    marketLabel: getListingTypeLabel({ ...listing, category: normalizedCategory }),
  };
};

export const getInitials = (value?: string | null) => {
  const parts = String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (!parts.length) return "A";
  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
};

export const isVerifiedProfile = (user: any) =>
  Boolean(
    user?.verification?.isVerified ||
      user?.verification?.idVerified ||
      user?.isVerified ||
      user?.verified
  );

export const getUserDisplayName = (user: any) =>
  user?.fullName || user?.name || user?.sellerName || "Agrisoko seller";

export const getBudgetLabel = (budget: any) => {
  if (!budget) return null;
  if (typeof budget === "number") return formatKes(budget);
  const min = typeof budget?.min === "number" ? budget.min : Number(budget?.min);
  const max = typeof budget?.max === "number" ? budget.max : Number(budget?.max);
  const currency = String(budget?.currency || "KES");
  const hasMin = Number.isFinite(min);
  const hasMax = Number.isFinite(max);
  if (hasMin && hasMax) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
  if (hasMin) return `From ${currency} ${min.toLocaleString()}`;
  if (hasMax) return `Up to ${currency} ${max.toLocaleString()}`;
  return null;
};

export const getQuantityLabel = (request: any) => {
  const quantity = request?.quantity;
  if (!quantity && quantity !== 0) return null;
  const unit = String(request?.unit || "").trim();
  if (typeof quantity === "number") {
    return unit ? `${quantity.toLocaleString()} ${unit}` : quantity.toLocaleString();
  }
  if (typeof quantity === "string") {
    return unit && !quantity.includes(unit) ? `${quantity} ${unit}` : quantity;
  }
  return null;
};

export const isListingBoosted = (listing: any) =>
  Boolean(listing?.monetization?.premiumBadge || listing?.boosted || listing?.isBoosted);

export const getDeliveryScopeLabel = (listing: any): string => {
  const scope = String(listing?.deliveryScope || "").trim();
  if (scope === "countrywide") return "Countrywide delivery";
  if (scope === "within_county") return "Within county only";
  if (scope === "local") return "Local delivery";
  return "Ask seller about delivery";
};

export const getListingEngagement = (listing: any) => ({
  views: Number(listing?.viewCount || listing?.views || 0),
  saves: Number(listing?.saveCount || listing?.saves || 0),
  reachOuts: Number(listing?.reachOutCount || listing?.reachOuts || listing?.inquiries || 0),
});

export const formatLastActive = (value?: string | Date | null): string | null => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.max(0, Math.floor(diffMs / 60000));
  if (diffMins < 60) return `Active ${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Active ${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Active ${diffDays}d ago`;
  return `Active ${date.toLocaleDateString()}`;
};
