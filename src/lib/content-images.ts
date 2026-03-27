const DEFAULT_CONTENT_COVER = "/images/content/learn-cover.png";
const ARCHIVE = "/images/content/archive";

const CATEGORY_DEFAULTS: Record<string, string> = {
  crops: `${ARCHIVE}/img_5119.png`,
  inputs: `${ARCHIVE}/img_5123.png`,
  livestock: `${ARCHIVE}/img_5120.png`,
  poultry: `${ARCHIVE}/img_7107.png`,
  services: `${ARCHIVE}/img_5122.png`,
  "market-prices": `${ARCHIVE}/img_5154.png`,
};

const LEARN_SLUG_OVERRIDES: Record<string, string> = {
  "growing-tomatoes-kenya": `${ARCHIVE}/img_7412.png`,
  "how-to-sell-maize-in-kenya": `${ARCHIVE}/img_7411.png`,
  "fertilizer-guide-kenya": `${ARCHIVE}/img_7413.png`,
  "dairy-cattle-farming-kenya": `${ARCHIVE}/img_7414.png`,
  "maize-prices-kenya-2025": `${ARCHIVE}/img_7532.png`,
  "how-to-raise-broilers-in-kenya": `${ARCHIVE}/img_7692.png`,
  "layer-chicken-farming-kenya": `${ARCHIVE}/img_7107.png`,
  "tractor-hire-kenya": `${ARCHIVE}/img_5122.png`,
};

const INSIGHT_SLUG_OVERRIDES: Record<string, string> = {
  "why-kenyan-maize-still-has-no-single-price": `${ARCHIVE}/img_5120.png`,
  "kenya-reduced-maize-seed-prices-analysis": `${ARCHIVE}/img_5154.png`,
  "kenya-onion-price-spread-nairobi-versus-source": `${ARCHIVE}/img_5155.png`,
};

export const getDefaultContentCover = () => DEFAULT_CONTENT_COVER;

export const resolveLearnCoverImage = (
  category: string,
  slug: string,
  existing?: string | null
) => existing || LEARN_SLUG_OVERRIDES[slug] || CATEGORY_DEFAULTS[category] || DEFAULT_CONTENT_COVER;

export const resolveInsightCoverImage = (
  slug: string,
  existing?: string | null
) => existing || INSIGHT_SLUG_OVERRIDES[slug] || DEFAULT_CONTENT_COVER;
