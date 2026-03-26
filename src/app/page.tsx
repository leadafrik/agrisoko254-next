import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Beef,
  Leaf,
  MessageCircle,
  NotebookText,
  Package,
  Search,
  ShieldCheck,
  Store,
  Wrench,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ListingCard from "@/components/marketplace/ListingCard";
import RequestCard from "@/components/marketplace/RequestCard";
import MarketplaceSupportStrip from "@/components/common/MarketplaceSupportStrip";
import { BottomAuthCTA, HeroAuthCTA } from "@/components/common/HomepageAuthCTA";
import { serverFetch } from "@/lib/api-server";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/endpoints";
import {
  MARKETPLACE_CATEGORIES,
  SUPPORTED_DELIVERY_COUNTIES,
} from "@/lib/marketplace";
import {
  formatIntelligenceDate,
  formatKes,
  formatTrendLabel,
  normalizeIntelligenceOverview,
} from "@/lib/market-intelligence";

export const revalidate = 180;

const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  produce: Leaf,
  livestock: Beef,
  inputs: Package,
  services: Wrench,
};

const trustArchitecture = [
  {
    title: "Verified trust signals",
    copy: "Profiles, verification state, and listing context help serious buyers judge credibility faster.",
    Icon: ShieldCheck,
  },
  {
    title: "Live market intelligence",
    copy: "Price submissions, best-market signals, and fertilizer tracking move Agrisoko beyond static listings.",
    Icon: BarChart3,
  },
  {
    title: "Direct market access",
    copy: "Farmers, traders, buyers, and service providers connect without unnecessary broker layers.",
    Icon: MessageCircle,
  },
];

const valueLanes = [
  {
    title: "Trade supply",
    copy: "Browse active produce, livestock, inputs, and service listings from real counties.",
    href: "/browse",
    cta: "Open marketplace",
    Icon: Store,
  },
  {
    title: "Read demand",
    copy: "See what buyers need right now, from urgent spot demand to repeat bulk sourcing.",
    href: "/request",
    cta: "See buyer requests",
    Icon: Search,
  },
  {
    title: "Use price intelligence",
    copy: "Compare markets, submit rates, and decide where to sell or buy before you move stock.",
    href: "/market-intelligence",
    cta: "Open market intelligence",
    Icon: BarChart3,
  },
];

const founderLetter = [
  "When we started Agrisoko, the problem was already obvious. Farmers were doing the hard work while the information advantage stayed elsewhere.",
  "A grower could harvest maize, tomatoes, onions, or beans and still have no clear sense of what the better market was paying that week. Many sold because they had to, not because the timing was right.",
  "Agrisoko exists to change that. We want verified trade, clearer prices, better timing, and a platform that treats Kenyan agriculture with seriousness.",
];

function formatBlogDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function HomePage() {
  const [countData, listingsData, requestsData, blogData, intelligenceData] = await Promise.all([
    serverFetch<any>(`${API_BASE_URL}/unified-listings/count/active`, { revalidate: 180 }),
    serverFetch<any>(`${API_BASE_URL}/unified-listings/trending?limit=6`, { revalidate: 180 }),
    serverFetch<any>(`${API_BASE_URL}/buyer-requests?limit=3&status=active`, { revalidate: 180 }),
    serverFetch<any>(`${API_BASE_URL}/blog?limit=3`, { revalidate: 300 }),
    serverFetch<any>(API_ENDPOINTS.marketIntelligence.overview, { revalidate: 300 }),
  ]);

  const activeListings = Number(countData?.data?.activeListings || 0);
  const listings = listingsData?.listings ?? listingsData?.data ?? listingsData ?? [];
  const requests = requestsData?.data ?? requestsData?.requests ?? requestsData ?? [];
  const posts = blogData?.posts ?? blogData?.data ?? blogData ?? [];
  const intelligence = normalizeIntelligenceOverview(intelligenceData);
  const featuredSignals = intelligence.topSignals.slice(0, 3);
  const produceBoard = intelligence.produceBoard.slice(0, 4);

  return (
    <>
      <Navbar />
      <main className="pb-0">
        <section className="border-b border-stone-200 bg-[linear-gradient(180deg,#fffdf8_0%,#f7efe4_56%,#faf7f2_100%)]">
          <div className="page-shell py-10 sm:py-14">
            <div className="hero-panel p-6 sm:p-8 lg:p-10">
              <div className="grid gap-8 xl:grid-cols-[1.04fr_0.96fr] xl:items-end">
                <div className="max-w-3xl">
                  <p className="section-kicker">Built in Kenya for agricultural trade</p>
                  <h1 className="mt-4 text-balance text-4xl font-bold leading-[1.02] text-stone-900 sm:text-5xl lg:text-6xl">
                    Kenya&apos;s agricultural marketplace, now strengthened by live market intelligence.
                  </h1>
                  <p className="mt-5 max-w-2xl text-lg leading-relaxed text-stone-600">
                    Agrisoko helps farmers, traders, buyers, agrovets, and service providers trade
                    directly with stronger trust signals, current pricing context, and cleaner paths
                    to action.
                  </p>

                  <HeroAuthCTA />

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href="/market-intelligence"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-terra-600 hover:text-terra-700"
                    >
                      Open today&apos;s market prices
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/b2b"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-stone-900"
                    >
                      Explore bulk workflows
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2 text-sm text-stone-600">
                    <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 font-medium">
                      {activeListings > 0
                        ? `${activeListings.toLocaleString()} active listings`
                        : "Active listings updated frequently"}
                    </span>
                    <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 font-medium">
                      {intelligence.meta.approvedSubmissions.toLocaleString()} approved price reports
                    </span>
                    <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 font-medium">
                      {SUPPORTED_DELIVERY_COUNTIES.length} checkout counties
                    </span>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[30px] bg-stone-900 p-6 text-white shadow-[0_24px_70px_-42px_rgba(28,25,23,0.62)]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                          Today&apos;s price edges
                        </p>
                        <h2 className="mt-3 text-2xl font-bold">Live market intelligence</h2>
                      </div>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                        {formatIntelligenceDate(intelligence.generatedAt)}
                      </span>
                    </div>

                    <div className="mt-5 space-y-3">
                      {featuredSignals.map((signal) => (
                        <Link
                          key={signal.productKey}
                          href={`/market-intelligence/${signal.productKey}`}
                          className="flex items-center justify-between gap-3 rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 transition hover:border-white/20 hover:bg-white/10"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white">{signal.productName}</p>
                            <p className="mt-1 text-xs text-white/65">
                              Best in {signal.bestMarketName}, {signal.bestCounty}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-white">{formatKes(signal.bestPrice)}</p>
                            <p className="mt-1 text-xs text-white/65">
                              {formatTrendLabel(signal.trendDirection, signal.trendPercentage)}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3 text-sm">
                      <span className="text-white/65">
                        {intelligence.isFallback
                          ? "Starter board while live submissions build"
                          : "Built from approved field submissions"}
                      </span>
                      <Link
                        href="/market-intelligence/submit"
                        className="font-semibold text-amber-300 hover:text-amber-200"
                      >
                        Share a price
                      </Link>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="surface-card p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                        Marketplace trust
                      </p>
                      <h3 className="mt-3 text-xl font-bold text-stone-900">
                        Verified profiles, direct chat, reputation signals
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-stone-600">
                        The strongest parts of the PWA remain intact: trust cues, direct contact,
                        and serious trading context.
                      </p>
                    </div>

                    <div className="surface-card p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                        Operational reach
                      </p>
                      <h3 className="mt-3 text-xl font-bold text-stone-900">
                        Demand, intelligence, and listings in one workflow
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-stone-600">
                        Buyers can discover supply, compare sellers, and read price context without
                        jumping between disconnected tools.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="page-shell py-14">
          <div className="mb-8">
            <p className="section-kicker">One serious workflow</p>
            <h2 className="mt-3 text-3xl font-bold text-stone-900 sm:text-4xl">
              Agrisoko now guides users from discovery to decision.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {valueLanes.map(({ title, copy, href, cta, Icon }) => (
              <Link
                key={href}
                href={href}
                className="group surface-card p-6 transition duration-200 hover:-translate-y-1 hover:border-terra-200"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-terra-50 text-terra-700 transition group-hover:bg-terra-100">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-2xl font-bold text-stone-900">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">{copy}</p>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-terra-600">
                  {cta}
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="page-shell border-t border-stone-100 py-14">
          <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="section-kicker">Live marketplace</p>
                  <h2 className="mt-3 text-3xl font-bold text-stone-900">
                    Fresh supply on the market right now
                  </h2>
                </div>
                <Link
                  href="/browse"
                  className="hidden text-sm font-semibold text-terra-600 hover:text-terra-700 md:inline-flex"
                >
                  Browse all listings
                </Link>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {listings.slice(0, 4).map((listing: any) => (
                  <ListingCard key={listing._id || listing.id} listing={listing} compact />
                ))}
                {listings.length === 0 ? (
                  <div className="surface-card p-8 text-center text-stone-500 sm:col-span-2">
                    Active marketplace listings will appear here as sellers post supply.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="surface-card p-6">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-forest-50 text-forest-700">
                    <BarChart3 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                      Market intelligence
                    </p>
                    <h3 className="mt-1 text-2xl font-bold text-stone-900">
                      Where the signal is strongest
                    </h3>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {produceBoard.map((item) => (
                    <Link
                      key={item.productKey}
                      href={`/market-intelligence/${item.productKey}`}
                      className="flex items-start justify-between gap-3 rounded-[22px] border border-stone-200 bg-[#fbf8f2] px-4 py-4 transition hover:border-terra-200"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-stone-900">{item.productName}</p>
                        <p className="mt-1 text-xs text-stone-500">
                          Best in {item.bestMarket?.county}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-terra-600">
                          {formatKes(item.bestMarket?.avgPrice || 0)}
                        </p>
                        <p className="mt-1 text-xs text-stone-500">
                          {formatTrendLabel(
                            item.overallTrendDirection,
                            item.overallTrendPercentage
                          )}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="surface-card p-6">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-terra-50 text-terra-700">
                    <Search className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                      Buyer demand
                    </p>
                    <h3 className="mt-1 text-2xl font-bold text-stone-900">
                      Real demand still drives the marketplace
                    </h3>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {requests.slice(0, 3).map((request: any) => (
                    <RequestCard key={request._id || request.id} request={request} />
                  ))}
                  {requests.length === 0 ? (
                    <div className="rounded-[22px] border border-dashed border-stone-200 bg-[#fbf8f2] p-4 text-sm text-stone-500">
                      New buyer requests will appear here automatically.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="page-shell border-t border-stone-100 py-14">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-kicker">Marketplace categories</p>
              <h2 className="mt-3 text-3xl font-bold text-stone-900">
                The core trade lanes Kenyan agriculture actually uses
              </h2>
            </div>
            <Link
              href="/browse"
              className="text-sm font-semibold text-terra-600 hover:text-terra-700"
            >
              Open marketplace
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {MARKETPLACE_CATEGORIES.map((category) => {
              const Icon = categoryIconMap[category.slug] ?? Leaf;

              return (
                <Link
                  key={category.slug}
                  href={`/browse/${category.slug}`}
                  className="group surface-card p-5 transition duration-200 hover:-translate-y-1 hover:border-terra-200"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-terra-50 text-terra-700 transition group-hover:bg-terra-100">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-xl font-bold text-stone-900">{category.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">
                    {category.description}
                  </p>
                  <p className="mt-3 text-xs font-medium text-stone-400">{category.examples}</p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="page-shell border-t border-stone-100 py-14">
          <div className="mb-8 text-center">
            <p className="section-kicker">Why Agrisoko</p>
            <h2 className="mt-3 text-3xl font-bold text-stone-900 sm:text-4xl">
              A professional trade layer, not just a directory of listings
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-stone-600">
              The platform now feels stronger when trust, direct trade, and price context stay in
              one place. That is the maturity gap we wanted to close from the PWA into Next.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {trustArchitecture.map(({ title, copy, Icon }) => (
              <div key={title} className="surface-card p-6">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-terra-50 text-terra-700">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-2xl font-bold text-stone-900">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="page-shell border-t border-stone-100 py-14">
          <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="surface-card p-6 sm:p-8">
              <p className="section-kicker">A note from Stephen</p>
              <h2 className="mt-4 text-3xl font-bold text-stone-900">
                We are building a more trusted agricultural market, not a prettier interface.
              </h2>
              <div className="mt-5 space-y-4 text-sm leading-relaxed text-stone-600">
                {founderLetter.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <p className="mt-6 text-sm font-semibold text-stone-900">Stephen</p>
            </div>

            <div>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="section-kicker">Learn and insights</p>
                  <h2 className="mt-3 text-3xl font-bold text-stone-900">
                    Editorial thinking still sits close to market action
                  </h2>
                </div>
                <Link
                  href="/learn"
                  className="hidden text-sm font-semibold text-terra-600 hover:text-terra-700 sm:inline-flex"
                >
                  Open learn hub
                </Link>
              </div>

              {posts.length > 0 ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {posts.map((post: any) => (
                    <Link
                      key={post._id || post.slug}
                      href={`/learn/insights/${post.slug}`}
                      className="group surface-card overflow-hidden transition duration-200 hover:-translate-y-1 hover:border-terra-200"
                    >
                      <div className="aspect-[16/10] overflow-hidden bg-stone-100">
                        {post.coverImage ? (
                          <div className="relative h-full w-full">
                            <Image
                              src={post.coverImage}
                              alt={post.title || "Insight"}
                              fill
                              sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                              className="object-cover transition duration-500 group-hover:scale-[1.03]"
                            />
                          </div>
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#f8efe2] to-stone-100">
                            <NotebookText className="h-10 w-10 text-terra-300" />
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex flex-wrap gap-1.5">
                          {(post.tags || []).slice(0, 2).map((tag: string) => (
                            <span
                              key={tag}
                              className="rounded-full bg-terra-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-terra-600"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <h3 className="mt-3 line-clamp-2 text-xl font-bold text-stone-900">
                          {post.title}
                        </h3>
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-stone-600">
                          {post.excerpt}
                        </p>
                        <p className="mt-4 text-xs text-stone-400">
                          {formatBlogDate(post.publishedAt || post.createdAt)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-[26px] border border-stone-200 bg-white p-6 text-sm text-stone-500">
                  Fresh insights from the admin desk will appear here automatically.
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="page-shell pb-14">
          <MarketplaceSupportStrip />
        </div>

        <section className="page-shell py-14">
          <div className="overflow-hidden rounded-[32px] bg-gradient-to-br from-terra-600 via-terra-700 to-[#72281A] p-8 text-white shadow-[0_24px_56px_rgba(114,40,26,0.28)] sm:p-10 md:p-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
                  Ready to start?
                </p>
                <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                  Join the Kenyan agricultural marketplace that now thinks as well as it trades
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-white/75 sm:text-base">
                  Post supply, read demand, compare markets, and build a reputation buyers can trust.
                </p>
              </div>
              <BottomAuthCTA />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
