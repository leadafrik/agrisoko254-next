const ARCHIVE = "/images/content/archive";

const PREFERRED_POOL = [
  `${ARCHIVE}/img_1304.png`,
  `${ARCHIVE}/img_1305.png`,
  `${ARCHIVE}/img_1306.png`,
  `${ARCHIVE}/img_1308.png`,
  `${ARCHIVE}/img_1309.png`,
  `${ARCHIVE}/img_1310.png`,
  `${ARCHIVE}/img_1311.png`,
  `${ARCHIVE}/img_1312.png`,
  `${ARCHIVE}/img_1314.png`,
  `${ARCHIVE}/img_1315.png`,
  `${ARCHIVE}/img_1316.png`,
  `${ARCHIVE}/img_1317.png`,
  `${ARCHIVE}/img_1318.png`,
  `${ARCHIVE}/img_1319.png`,
  `${ARCHIVE}/img_1345.png`,
  `${ARCHIVE}/img_1346.png`,
  `${ARCHIVE}/img_0222.png`,
  `${ARCHIVE}/img_1247.png`,
  `${ARCHIVE}/img_1251.png`,
  `${ARCHIVE}/img_2507.png`,
  `${ARCHIVE}/img_4309.png`,
  `${ARCHIVE}/img_4318.png`,
  `${ARCHIVE}/img_4782.png`,
  `${ARCHIVE}/img_5145.png`,
  `${ARCHIVE}/img_5195.png`,
  `${ARCHIVE}/img_5745.png`,
  `${ARCHIVE}/img_6117.png`,
  `${ARCHIVE}/img_6118.png`,
  `${ARCHIVE}/img_6459.png`,
  `${ARCHIVE}/img_7328.png`,
  `${ARCHIVE}/img_7625.png`,
  `${ARCHIVE}/img_7629.png`,
];

const SECONDARY_POOL = [
  `${ARCHIVE}/img_5119.png`,
  `${ARCHIVE}/img_5120.png`,
  `${ARCHIVE}/img_5122.png`,
  `${ARCHIVE}/img_5123.png`,
  `${ARCHIVE}/img_5154.png`,
  `${ARCHIVE}/img_5155.png`,
  `${ARCHIVE}/img_7107.png`,
  `${ARCHIVE}/img_7411.png`,
  `${ARCHIVE}/img_7411_still.png`,
  `${ARCHIVE}/img_7412.png`,
  `${ARCHIVE}/img_7412_still.png`,
  `${ARCHIVE}/img_7413.png`,
  `${ARCHIVE}/img_7413_still.png`,
  `${ARCHIVE}/img_7414.png`,
  `${ARCHIVE}/img_7414_still.png`,
  `${ARCHIVE}/img_7532.png`,
  `${ARCHIVE}/img_7532_still.png`,
  `${ARCHIVE}/img_7692.png`,
  `${ARCHIVE}/img_7692_still.png`,
];

const ARCHIVE_POOL = [...PREFERRED_POOL, ...SECONDARY_POOL];

const CATEGORY_DEFAULTS: Record<string, string> = {
  crops: `${ARCHIVE}/img_6117.png`,
  inputs: `${ARCHIVE}/img_1251.png`,
  livestock: `${ARCHIVE}/img_6118.png`,
  poultry: `${ARCHIVE}/img_4309.png`,
  services: `${ARCHIVE}/img_4782.png`,
  "market-prices": `${ARCHIVE}/img_0222.png`,
};

const LEARN_SLUG_OVERRIDES: Record<string, string> = {
  "growing-tomatoes-kenya": `${ARCHIVE}/img_5145.png`,
  "how-to-sell-maize-in-kenya": `${ARCHIVE}/img_6117.png`,
  "fertilizer-guide-kenya": `${ARCHIVE}/img_1251.png`,
  "dairy-cattle-farming-kenya": `${ARCHIVE}/img_6118.png`,
  "maize-prices-kenya-2025": `${ARCHIVE}/img_0222.png`,
  "how-to-raise-broilers-in-kenya": `${ARCHIVE}/img_4309.png`,
  "layer-chicken-farming-kenya": `${ARCHIVE}/img_4318.png`,
  "tractor-hire-kenya": `${ARCHIVE}/img_4782.png`,
};

const INSIGHT_SLUG_OVERRIDES: Record<string, string> = {
  "why-kenyan-maize-still-has-no-single-price": `${ARCHIVE}/img_1308.png`,
  "kenya-reduced-maize-seed-prices-analysis": `${ARCHIVE}/img_1310.png`,
  "kenya-onion-price-spread-nairobi-versus-source": `${ARCHIVE}/img_1316.png`,
};

const isLocalSharedContentImage = (value?: string | null) =>
  Boolean(value && value.startsWith("/images/content/"));

const normalizeLocalContentImage = (value?: string | null) =>
  isLocalSharedContentImage(value) ? value : null;

const slugToPoolImage = (slug: string) => {
  if (!ARCHIVE_POOL.length || !slug) return PREFERRED_POOL[0];

  let hash = 0;
  for (let index = 0; index < slug.length; index += 1) {
    hash = (hash * 31 + slug.charCodeAt(index)) >>> 0;
  }

  return ARCHIVE_POOL[hash % ARCHIVE_POOL.length] || PREFERRED_POOL[0];
};

export const getDefaultContentCover = () => PREFERRED_POOL[0];

export const getAbsoluteContentImageUrl = (value?: string | null) => {
  const resolved = value || getDefaultContentCover();
  return resolved.startsWith("http") ? resolved : `https://www.agrisoko254.com${resolved}`;
};

export const buildSocialImageMetadata = (
  value?: string | null,
  alt = "Agrisoko content image"
) => {
  const absoluteUrl = getAbsoluteContentImageUrl(value);

  return {
    openGraph: [{ url: absoluteUrl, width: 1200, height: 630, alt }],
    twitter: [absoluteUrl],
  };
};

export const resolveLearnCoverImage = (
  category: string,
  slug: string,
  existing?: string | null
) =>
  normalizeLocalContentImage(existing) ||
  LEARN_SLUG_OVERRIDES[slug] ||
  CATEGORY_DEFAULTS[category] ||
  slugToPoolImage(slug);

export const resolveInsightCoverImage = (
  slug: string,
  existing?: string | null
) =>
  normalizeLocalContentImage(existing) ||
  INSIGHT_SLUG_OVERRIDES[slug] ||
  slugToPoolImage(slug);
