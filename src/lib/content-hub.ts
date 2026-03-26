import { serverFetch } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  SEEDED_MAIZE_SEED_PRICE_SIGNAL,
  SEEDED_MAIZE_SNAPSHOT,
} from "./market-intelligence-seed";

export interface InsightPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  readTimeMinutes: number;
  publishedAt: string | null;
  authorName: string | null;
  featured: boolean;
  tags: string[];
}

const formatKes = (value: number) => `KES ${value.toLocaleString()}`;

const buildMarkdownTable = (
  rows: Array<Record<string, string | number>>,
  columns: string[]
) => {
  const header = `| ${columns.join(" | ")} |`;
  const divider = `| ${columns.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${columns.map((column) => String(row[column] ?? "")).join(" | ")} |`);
  return [header, divider, ...body].join("\n");
};

const maizeMarketRows = SEEDED_MAIZE_SNAPSHOT.markets.map((market) => ({
  Location: `${market.marketName}, ${market.county}`,
  "Observed price": formatKes(market.avgPrice),
  Context: market.notes || "Field quote",
}));

const revisedSeedRows = SEEDED_MAIZE_SEED_PRICE_SIGNAL.revisedSubsidizedPrices.map((item) => ({
  Pack: item.packSize,
  "Revised price": formatKes(item.price),
}));

const previousSeedRows = SEEDED_MAIZE_SEED_PRICE_SIGNAL.reportedPreviousPrices.map((item) => ({
  Pack: item.packSize,
  "Earlier quoted price": formatKes(item.price),
}));

const retainedSeedRows =
  SEEDED_MAIZE_SEED_PRICE_SIGNAL.conflictingRetainedPricesStillCirculating.map((item) => ({
    Pack: item.packSize,
    "Retained-price post": formatKes(item.price),
  }));

const LOCAL_INSIGHT_POSTS: InsightPost[] = [
  {
    id: "local-insight-maize-spread-2026",
    slug: "why-kenyan-maize-still-has-no-single-price",
    title: "Why Kenyan Maize Still Has No Single Price in March 2026",
    excerpt:
      "Starter field signals from March 25-26, 2026 show maize quotes stretching from about KES 2,500 in weaker Nakuru signals to KES 3,800 in stronger premium desks. The deeper lesson is that farmers should compare destination markets, not just local harvest prices.",
    content: `Kenya does not have one maize price right now. The seed data coming into Agrisoko from March 25-26, 2026 makes that plain.

${buildMarkdownTable(maizeMarketRows, ["Location", "Observed price", "Context"])}

## What this starter board is saying

1. Harvest-zone prices are still under pressure. Lower Nakuru and Trans Nzoia quotes are materially weaker than the firmer premium and destination-style desks.
2. Location is doing more work than headline demand. A farmer who only checks the nearest buyer can easily undersell.
3. The wording on the offers matters. "Clean", "dust-free", and delivery readiness keep appearing because quality and convenience still influence the final deal.

## What farmers should do with this

- Treat social quotes as starting signals, not final truth.
- Check today's board before moving maize.
- Compare local farm-gate offers with at least one demand-led market.
- If your stock is clean and dry, list it with that fact stated clearly.

## Where Agrisoko fits

This is exactly why the market-intelligence product matters. It is not enough to know that maize is trading. You need to know **where** it is stronger and where the weaker quotes are coming from.

[Open the maize intelligence board](/market-intelligence/maize)

[List maize on Agrisoko](/create-listing/produce)`,
    coverImage: null,
    readTimeMinutes: 4,
    publishedAt: "2026-03-26T12:30:00.000Z",
    authorName: "Agrisoko Market Desk",
    featured: false,
    tags: ["maize", "market intelligence", "price signals", "kenya"],
  },
  {
    id: "local-insight-seed-prices-2026",
    slug: "kenya-reduced-maize-seed-prices-analysis",
    title: "Kenya's Reduced Maize Seed Prices Matter More Than the Headline",
    excerpt:
      "As of March 25-26, 2026, multiple Kenyan notices and reshared posts pointed to revised subsidized maize seed prices. The bigger story is what that does to planting confidence, input timing, and farmer cash flow.",
    content: `Several March 25-26, 2026 notices pointed to revised subsidized maize seed prices taking effect after a Kenya Seed system update.

${buildMarkdownTable(revisedSeedRows, ["Pack", "Revised price"])}

Many of the same posts implied these were lower than the earlier quoted market figures below.

${buildMarkdownTable(previousSeedRows, ["Pack", "Earlier quoted price"])}

At the same time, older retained-price graphics were still circulating online, which means the information environment is still messy.

${buildMarkdownTable(retainedSeedRows, ["Pack", "Retained-price post"])}

## Why this is actually newsworthy

1. Lower seed prices change the first planting decision. Some farmers delay acreage because cash is tight at the exact point they need seed, fertilizer, and land preparation together.
2. A seed-price cut can pull fertilizer demand forward. If more farmers decide they can plant, nearby agrovets and stockists should expect more bundle buying, not just more seed queries.
3. Conflicting notices create hesitation. If a farmer sees one graphic saying KES 260 and another saying KES 210, trust breaks down at the stockist counter.

## The real question

The real question is not whether the headline sounds good. It is whether the revised price is visible at depots and stockists fast enough to affect acreage this season.

## Practical move this week

- Verify the price physically with your stockist before paying.
- Confirm the exact variety and ecological zone fit before buying on price alone.
- Compare seed, fertilizer, and land-prep cost as one planting bundle.
- Watch for counterfeit or incorrectly labelled packs whenever policy changes create urgency.

${SEEDED_MAIZE_SEED_PRICE_SIGNAL.note}

[Browse farm inputs on Agrisoko](/browse/inputs)

[Open market intelligence](/market-intelligence)`,
    coverImage: null,
    readTimeMinutes: 5,
    publishedAt: "2026-03-26T09:00:00.000Z",
    authorName: "Agrisoko Editorial Desk",
    featured: false,
    tags: ["maize seed", "policy", "input costs", "kenya"],
  },
];

const sortInsights = (posts: InsightPost[]) =>
  posts.sort(
    (left, right) =>
      new Date(right.publishedAt || 0).getTime() - new Date(left.publishedAt || 0).getTime()
  );

const mergeInsightPosts = (remotePosts: InsightPost[]) => {
  const merged = new Map<string, InsightPost>();

  for (const post of LOCAL_INSIGHT_POSTS) {
    merged.set(post.slug, post);
  }

  for (const post of remotePosts) {
    merged.set(post.slug, post);
  }

  return sortInsights(Array.from(merged.values()));
};

const normalizeInsightPost = (post: any): InsightPost | null => {
  if (!post?.slug || !post?.title) return null;

  return {
    id: String(post._id ?? post.id ?? post.slug),
    slug: String(post.slug),
    title: String(post.title),
    excerpt: String(post.excerpt ?? ""),
    content: String(post.content ?? ""),
    coverImage: typeof post.coverImage === "string" ? post.coverImage : null,
    readTimeMinutes:
      typeof post.readTimeMinutes === "number" && Number.isFinite(post.readTimeMinutes)
        ? post.readTimeMinutes
        : 5,
    publishedAt: typeof post.publishedAt === "string" ? post.publishedAt : null,
    authorName: typeof post.authorName === "string" ? post.authorName : null,
    featured: Boolean(post.featured),
    tags: Array.isArray(post.tags)
      ? post.tags.filter((tag: unknown): tag is string => typeof tag === "string")
      : [],
  };
};

export const getInsightPosts = async (limit = 24): Promise<InsightPost[]> => {
  const data = await serverFetch<any>(`${API_ENDPOINTS.blog.list}?limit=${limit}`, { revalidate: 3600 });
  const posts = Array.isArray(data?.data) ? data.data : Array.isArray(data?.posts) ? data.posts : Array.isArray(data) ? data : [];

  return mergeInsightPosts(
    posts
      .map(normalizeInsightPost)
      .filter((post: InsightPost | null): post is InsightPost => Boolean(post))
  ).slice(0, limit);
};

export const getInsightPost = async (slug: string): Promise<InsightPost | null> => {
  const data = await serverFetch<any>(API_ENDPOINTS.blog.bySlug(slug), { revalidate: 3600 });
  const post = normalizeInsightPost(data?.data ?? data?.post ?? data);

  if (post) return post;
  return LOCAL_INSIGHT_POSTS.find((item) => item.slug === slug) ?? null;
};
