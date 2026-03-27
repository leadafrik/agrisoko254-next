const DEFAULT_CONTENT_COVER = "/images/content/learn-cover.png";
const ARCHIVE = "/images/content/archive";

const ARCHIVE_POOL = [
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

const CATEGORY_DEFAULTS: Record<string, string> = {
  crops: `${ARCHIVE}/img_5119.png`,
  inputs: `${ARCHIVE}/img_5123.png`,
  livestock: `${ARCHIVE}/img_7414_still.png`,
  poultry: `${ARCHIVE}/img_7692_still.png`,
  services: `${ARCHIVE}/img_5122.png`,
  "market-prices": `${ARCHIVE}/img_7532_still.png`,
};

const LEARN_SLUG_OVERRIDES: Record<string, string> = {
  "growing-tomatoes-kenya": `${ARCHIVE}/img_7412_still.png`,
  "how-to-sell-maize-in-kenya": `${ARCHIVE}/img_7411_still.png`,
  "fertilizer-guide-kenya": `${ARCHIVE}/img_7413_still.png`,
  "dairy-cattle-farming-kenya": `${ARCHIVE}/img_7414_still.png`,
  "maize-prices-kenya-2025": `${ARCHIVE}/img_7532_still.png`,
  "how-to-raise-broilers-in-kenya": `${ARCHIVE}/img_7692_still.png`,
  "layer-chicken-farming-kenya": `${ARCHIVE}/img_7107.png`,
  "tractor-hire-kenya": `${ARCHIVE}/img_5122.png`,
};

const INSIGHT_SLUG_OVERRIDES: Record<string, string> = {
  "why-kenyan-maize-still-has-no-single-price": `${ARCHIVE}/img_5120.png`,
  "kenya-reduced-maize-seed-prices-analysis": `${ARCHIVE}/img_5154.png`,
  "kenya-onion-price-spread-nairobi-versus-source": `${ARCHIVE}/img_5155.png`,
};

const slugToPoolImage = (slug: string) => {
  if (!ARCHIVE_POOL.length || !slug) return DEFAULT_CONTENT_COVER;

  let hash = 0;
  for (let index = 0; index < slug.length; index += 1) {
    hash = (hash * 31 + slug.charCodeAt(index)) >>> 0;
  }

  return ARCHIVE_POOL[hash % ARCHIVE_POOL.length] || DEFAULT_CONTENT_COVER;
};

export const getDefaultContentCover = () => DEFAULT_CONTENT_COVER;

export const resolveLearnCoverImage = (
  category: string,
  slug: string,
  existing?: string | null
) =>
  existing ||
  LEARN_SLUG_OVERRIDES[slug] ||
  slugToPoolImage(slug) ||
  CATEGORY_DEFAULTS[category] ||
  DEFAULT_CONTENT_COVER;

export const resolveInsightCoverImage = (
  slug: string,
  existing?: string | null
) => existing || INSIGHT_SLUG_OVERRIDES[slug] || slugToPoolImage(slug) || DEFAULT_CONTENT_COVER;
