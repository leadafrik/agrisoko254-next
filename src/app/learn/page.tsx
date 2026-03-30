import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { getAllCategories, getArticlesByCategory, getFeaturedArticles, CATEGORY_META } from "@/lib/mdx";
import { getInsightPosts } from "@/lib/content-hub";
import { buildSocialImageMetadata } from "@/lib/content-images";

export const revalidate = 3600;

const pageTitle = "Agrisoko Learn Hub";
const pageDescription =
  "Practical farming guides, market insights, and Agrisoko editorial updates for Kenyan farmers, buyers, and agri-business teams.";

export function generateMetadata(): Metadata {
  const shareImage = getFeaturedArticles(1)[0]?.coverImage;
  const socialImages = buildSocialImageMetadata(shareImage, pageTitle);

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: [
      "farming guides kenya",
      "agriculture learn kenya",
      "how to sell maize kenya",
      "fertilizer guide kenya",
      "agrisoko learn",
      "market insights kenya",
    ],
    alternates: { canonical: "https://agrisoko254.com/learn" },
    openGraph: {
      type: "website",
      url: "https://agrisoko254.com/learn",
      title: pageTitle,
      description:
        "Practical farming guides, market insights, and trade-readiness content for Kenyan agriculture.",
      images: socialImages.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: socialImages.twitter,
    },
  };
}

const formatInsightDate = (value: string | null) => {
  if (!value) return "Recent update";

  return new Date(value).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default async function LearnIndexPage() {
  const featuredGuides = getFeaturedArticles(4);
  const categories = getAllCategories();
  const insights = await getInsightPosts(6);
  const featuredInsight = insights.find((post) => post.featured) ?? insights[0] ?? null;
  const latestInsights = insights
    .filter((post) => post.slug !== featuredInsight?.slug)
    .slice(0, 3);

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Agrisoko Learn Hub",
    description:
      "Practical farming guides, market insights, and trade-readiness content for Kenyan farmers and buyers.",
    url: "https://agrisoko254.com/learn",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: featuredGuides.slice(0, 4).map((guide, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://agrisoko254.com/learn/${guide.category}/${guide.slug}`,
        name: guide.title,
      })),
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd data={collectionSchema} />
      <section className="overflow-hidden rounded-[34px] border border-stone-200 bg-[linear-gradient(135deg,#f8f1e7_0%,#ffffff_55%,#edf5ee_100%)] p-7 shadow-[0_24px_90px_-60px_rgba(88,64,39,0.55)] sm:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terra-600">
          Learn hub
        </p>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <h1 className="max-w-3xl text-4xl font-bold text-stone-900 sm:text-5xl">
              Guides and insights now live in one professional knowledge hub.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-stone-600">
              Agrisoko now treats practical learning and editorial market updates as one flow.
              Farmers can move from evergreen how-to guides into fresh insights, demand signals,
              and marketplace action without switching sections.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/learn/insights" className="primary-button">
                Read latest insights
              </Link>
              <Link href="/browse" className="secondary-button">
                Go to marketplace
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <Link
              href="/learn/crops"
              className="rounded-[24px] border border-white/80 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                Evergreen guides
              </p>
              <h2 className="mt-2 text-xl font-bold text-stone-900">Crop, livestock, input, and service playbooks</h2>
            </Link>
            <Link
              href="/learn/insights"
              className="rounded-[24px] border border-white/80 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                Market insights
              </p>
              <h2 className="mt-2 text-xl font-bold text-stone-900">Editorial analysis, updates, and field commentary</h2>
            </Link>
            <Link
              href="/market-intelligence"
              className="rounded-[24px] border border-white/80 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                Decision support
              </p>
              <h2 className="mt-2 text-xl font-bold text-stone-900">Pricing context and trade-readiness for Kenyan markets</h2>
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <Link
          href="/market-intelligence"
          className="rounded-[24px] border border-stone-200 bg-white p-5 transition hover:-translate-y-1 hover:border-terra-200"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-terra-600">
            Start here
          </p>
          <h2 className="mt-2 text-xl font-bold text-stone-900">Check today&apos;s prices</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Move from static guides into live maize, onion, fertilizer, and livestock signals.
          </p>
        </Link>
        <Link
          href="/browse"
          className="rounded-[24px] border border-stone-200 bg-white p-5 transition hover:-translate-y-1 hover:border-forest-200"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-forest-700">
            Marketplace
          </p>
          <h2 className="mt-2 text-xl font-bold text-stone-900">Browse live listings</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Go from learning into direct supply across produce, livestock, inputs, and services.
          </p>
        </Link>
        <Link
          href="/request"
          className="rounded-[24px] border border-stone-200 bg-white p-5 transition hover:-translate-y-1 hover:border-stone-300"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            Demand
          </p>
          <h2 className="mt-2 text-xl font-bold text-stone-900">See what buyers need</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Use buyer requests to spot demand before you plant, harvest, transport, or quote.
          </p>
        </Link>
      </section>

      {featuredInsight ? (
        <section className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terra-600">
                Featured insight
              </p>
              <h2 className="mt-3 text-3xl font-bold text-stone-900">Fresh thinking from the editorial side of Agrisoko</h2>
            </div>
            <Link href="/learn/insights" className="hidden text-sm font-semibold text-terra-600 hover:text-terra-700 sm:inline">
              View all insights
            </Link>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <Link
              href={`/learn/insights/${featuredInsight.slug}`}
              className="overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-[0_24px_70px_-54px_rgba(72,52,33,0.4)] transition hover:-translate-y-1"
            >
              {featuredInsight.coverImage ? (
                <div className="relative aspect-[16/9] overflow-hidden bg-stone-100">
                  <Image
                    src={featuredInsight.coverImage}
                    alt={featuredInsight.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 55vw, 100vw"
                  />
                </div>
              ) : null}
              <div className="p-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terra-600">
                  Lead story
                </p>
                <h3 className="mt-3 text-3xl font-bold text-stone-900">{featuredInsight.title}</h3>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-600">
                  {featuredInsight.excerpt || "Editorial insight from Agrisoko."}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-stone-500">
                  <span>{featuredInsight.readTimeMinutes} min read</span>
                  <span>{formatInsightDate(featuredInsight.publishedAt)}</span>
                  {featuredInsight.authorName ? <span>{featuredInsight.authorName}</span> : null}
                </div>
              </div>
            </Link>

            <div className="grid gap-4">
              {latestInsights.map((post) => (
                <Link
                  key={post.id}
                  href={`/learn/insights/${post.slug}`}
                  className="overflow-hidden rounded-[24px] border border-stone-200 bg-white transition hover:-translate-y-1 hover:border-terra-200"
                >
                  {post.coverImage ? (
                    <div className="relative aspect-[16/9] overflow-hidden bg-stone-100">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 28vw, 100vw"
                      />
                    </div>
                  ) : null}
                  <div className="p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                      Insight
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-stone-900">{post.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-600">
                      {post.excerpt || "Agrisoko editorial update."}
                    </p>
                    <p className="mt-3 text-sm text-stone-500">
                      {post.readTimeMinutes} min read
                    </p>
                  </div>
                </Link>
              ))}

              {latestInsights.length === 0 ? (
                <div className="rounded-[24px] border border-stone-200 bg-white p-5 text-sm text-stone-500">
                  Editorial insights will appear here as soon as new posts are published from the admin side.
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {featuredGuides.length > 0 ? (
        <section className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-forest-700">
                Featured guides
              </p>
              <h2 className="mt-3 text-3xl font-bold text-stone-900">Practical reference content built for Kenyan conditions</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {featuredGuides.map((guide) => (
              <Link
                key={`${guide.category}/${guide.slug}`}
                href={`/learn/${guide.category}/${guide.slug}`}
                className="overflow-hidden rounded-[24px] border border-stone-200 bg-white transition hover:-translate-y-1 hover:border-forest-200"
              >
                {guide.coverImage ? (
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                    <Image
                      src={guide.coverImage}
                      alt={guide.title}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1280px) 20vw, (min-width: 640px) 45vw, 100vw"
                    />
                  </div>
                ) : null}
                <div className="p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-forest-700">
                    {CATEGORY_META[guide.category]?.label ?? guide.category}
                  </p>
                  <h3 className="mt-3 text-xl font-bold text-stone-900">{guide.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-stone-600">
                    {guide.description}
                  </p>
                  <p className="mt-4 text-sm text-stone-500">{guide.readTimeMinutes} min read</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
              Browse by topic
            </p>
            <h2 className="mt-3 text-3xl font-bold text-stone-900">
              Explore practical guides by topic
            </h2>
          </div>
        </div>

        <div className="mt-8 space-y-8">
          {categories.map((category) => {
            const meta = CATEGORY_META[category];
            const guides = getArticlesByCategory(category).slice(0, 4);

            if (!guides.length) return null;

            return (
              <section key={category}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-stone-900">
                      {meta?.label ?? category}
                    </p>
                    <p className="mt-1 text-sm text-stone-500">{meta?.description}</p>
                  </div>
                  <Link href={`/learn/${category}`} className="text-sm font-semibold text-forest-700 hover:text-forest-800">
                    Open topic
                  </Link>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {guides.map((guide) => (
                    <Link
                      key={guide.slug}
                      href={`/learn/${category}/${guide.slug}`}
                      className="overflow-hidden rounded-[22px] border border-stone-200 bg-white transition hover:-translate-y-1 hover:border-forest-200"
                    >
                      {guide.coverImage ? (
                        <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                          <Image
                            src={guide.coverImage}
                            alt={guide.title}
                            fill
                            className="object-cover"
                            sizes="(min-width: 1280px) 20vw, (min-width: 640px) 45vw, 100vw"
                          />
                        </div>
                      ) : null}
                      <div className="p-4">
                        <h3 className="text-base font-bold text-stone-900">{guide.title}</h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-600">
                          {guide.description}
                        </p>
                        <p className="mt-3 text-sm text-stone-500">{guide.readTimeMinutes} min read</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>
    </div>
  );
}
