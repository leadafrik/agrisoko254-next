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
  Wrench,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ListingCard from "@/components/marketplace/ListingCard";
import RequestCard from "@/components/marketplace/RequestCard";
import MarketplaceSupportStrip from "@/components/common/MarketplaceSupportStrip";
import { BottomAuthCTA, HeroAuthCTA } from "@/components/common/HomepageAuthCTA";
import { serverFetch } from "@/lib/api-server";
import { getInsightPosts } from "@/lib/content-hub";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/endpoints";
import {
  MARKETPLACE_CATEGORIES,
  SUPPORTED_DELIVERY_COUNTIES,
} from "@/lib/marketplace";
import {
  formatKes,
  formatTrendLabel,
  normalizeIntelligenceOverview,
} from "@/lib/market-intelligence";
import LivePricePulse from "@/components/intelligence/LivePricePulse";

export const revalidate = 180;

const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  produce: Leaf,
  livestock: Beef,
  inputs: Package,
  services: Wrench,
};

// Full founder letter — matches PWA word-for-word
const founderLetterParagraphs = [
  "When I started Agrisoko, many people told me it would not work.",
  "I grew up watching farmers work incredibly hard — waking before sunrise, tending their land through drought and disease — and then watching brokers take the largest share of the profit at the farm gate. A farmer who grew maize for four months might sell it for KES 28 per kilo. By the time it reached Nairobi, it sold for KES 55. The farmer saw none of that difference. The broker made it all.",
  "I asked myself: what if the farmer could see the buyer directly? What if the buyer could trust the quality of what they were getting? What if we removed the unnecessary steps between the person who grew the food and the person who needed it?",
  "That question became Agrisoko.",
  "We are not just building an app. We are building trust infrastructure for Kenyan agriculture — a place where a smallholder in Meru can reach a buyer in Mombasa, where a fresh produce trader in Limuru can post what she has and be found by restaurants in Nairobi, where a livestock farmer in Kajiado does not have to wait for someone to pass through his road to know what his animals are worth.",
  "Agrisoko is building a future where farmers keep more of what they earn, buyers trade with confidence, and agriculture in Kenya becomes more direct, more trusted, and more connected.",
  "If you believe in that vision, join us. Sign up today. Tell a friend to tell a friend. And together, let us build the future of agriculture in Kenya.",
];

function formatBlogDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
}

export default async function HomePage() {
  const [countData, listingsData, requestsData, posts, intelligenceData] = await Promise.all([
    serverFetch<any>(`${API_BASE_URL}/unified-listings/count/active`, { revalidate: 180 }),
    serverFetch<any>(`${API_BASE_URL}/unified-listings/trending?limit=6`, { revalidate: 180 }),
    serverFetch<any>(`${API_BASE_URL}/buyer-requests?limit=3&status=active`, { revalidate: 180 }),
    getInsightPosts(3),
    serverFetch<any>(API_ENDPOINTS.marketIntelligence.overview, { revalidate: 300 }),
  ]);

  const activeListings = Number(countData?.data?.activeListings || 0);
  const listings = listingsData?.listings ?? listingsData?.data ?? listingsData ?? [];
  const requests = requestsData?.data ?? requestsData?.requests ?? requestsData ?? [];
  const intelligence = normalizeIntelligenceOverview(intelligenceData);
  const featuredSignals = intelligence.topSignals.slice(0, 4);
  const produceBoard = intelligence.produceBoard.slice(0, 6);

  // All boards combined — produce + inputs + livestock — for the live pulse strip
  const allPulseBoards = [
    ...intelligence.produceBoard,
    ...intelligence.fertilizerBoard,
    ...(intelligence.livestockBoard ?? []),
  ];

  const pulseItems = allPulseBoards.map((item) => {
    const markets = item.markets ?? [];
    const prices = markets.map((m: any) => m.avgPrice).filter(Boolean);
    const high = prices.length ? Math.max(...prices) : item.overallAverage;
    const low = prices.length ? Math.min(...prices) : item.overallAverage;
    return {
      productKey: item.productKey,
      productName: item.productName,
      unit: item.unit ?? "kg",
      avgPrice: item.overallAverage,
      highPrice: high,
      lowPrice: low,
      bestCounty: item.bestMarket?.county ?? "",
      trendDirection: item.overallTrendDirection ?? "stable",
    };
  });

  return (
    <>
      <Navbar />
      <main>

        {/* ━━━━━━━━━━━━━━━━ LIVE PRICE STRIP — just below navbar ━━━━━━━━━━━━ */}
        {pulseItems.length > 0 && <LivePricePulse items={pulseItems} />}

        {/* ━━━━━━━━━━━━━━━━━━ HERO — warm, agricultural ━━━━━━━━━━━━━━━━━━ */}
        <section className="border-b border-stone-200 bg-[linear-gradient(180deg,#fffdf8_0%,#f7efe4_56%,#faf7f2_100%)]">
          <div className="page-shell py-10 sm:py-14">
            <div className="hero-panel p-6 sm:p-8 lg:p-10">
              <div className="grid gap-8 xl:grid-cols-[1.04fr_0.96fr] xl:items-start">

                {/* Left — copy */}
                <div className="max-w-3xl">
                  {/* Live status pill */}
                  <div className="inline-flex items-center gap-2 rounded-full border border-terra-200 bg-terra-50 px-3.5 py-1.5 text-xs font-semibold text-terra-700">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-terra-400 opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-terra-500" />
                    </span>
                    {activeListings > 0
                      ? `${activeListings.toLocaleString()} listings live right now`
                      : "Listings updated daily"}
                  </div>

                  <h1 className="mt-5 text-balance text-4xl font-bold leading-[1.02] text-stone-900 sm:text-5xl lg:text-6xl">
                    Most Kenyan farmers sell without knowing what the{" "}
                    <span className="text-terra-600">market paid yesterday.</span>
                  </h1>

                  <p className="mt-5 max-w-2xl text-lg leading-relaxed text-stone-600">
                    Agrisoko gives you live prices from real field submissions, verified listings
                    from known sellers, and direct paths to buyers — so you decide when and where
                    to sell.
                  </p>

                  <div className="mt-7">
                    <HeroAuthCTA />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-4">
                    <Link
                      href="/market-intelligence"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-terra-600 hover:text-terra-700"
                    >
                      See today&apos;s market prices <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/b2b"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-500 hover:text-stone-800"
                    >
                      Bulk workflows <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  {/* Stats chips */}
                  <div className="mt-6 flex flex-wrap gap-2 text-sm text-stone-600">
                    <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 font-medium">
                      {activeListings > 0
                        ? `${activeListings.toLocaleString()} active listings`
                        : "Active listings updated frequently"}
                    </span>
                    {intelligence.meta.approvedSubmissions > 0 && (
                      <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 font-medium">
                        {intelligence.meta.approvedSubmissions.toLocaleString()} approved price reports
                      </span>
                    )}
                    <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 font-medium">
                      {SUPPORTED_DELIVERY_COUNTIES.length} checkout counties
                    </span>
                  </div>
                </div>

                {/* Right — price intelligence card */}
                <div className="rounded-[28px] bg-gradient-to-b from-[#1e1106] to-[#170e04] p-6 text-white shadow-[0_28px_80px_-28px_rgba(20,12,4,0.65)] ring-1 ring-[#4a2e0a]/40">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#c4a060]/70">
                        Today&apos;s price edges
                      </p>
                      <h2 className="mt-1.5 text-xl font-bold text-white">Live market intelligence</h2>
                    </div>
                    <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-green-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-green-400">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                      Live
                    </span>
                  </div>

                  <style>{`
                    @keyframes signal-in {
                      0%   { opacity: 0; transform: translateY(6px); }
                      100% { opacity: 1; transform: translateY(0); }
                    }
                    .signal-row {
                      animation: signal-in 0.42s cubic-bezier(0.22,1,0.36,1) both;
                    }
                  `}</style>

                  <div className="mt-4 space-y-1.5">
                    {featuredSignals.length > 0 ? (
                      featuredSignals.map((signal, i) => (
                        <Link
                          key={signal.productKey}
                          href={`/market-intelligence/${signal.productKey}`}
                          className="signal-row flex items-center justify-between gap-3 rounded-[18px] border border-[#4a2e0a]/40 bg-[#2a1508]/50 px-4 py-3 transition-colors hover:border-[#7a4e1a]/50 hover:bg-[#2a1508]/70"
                          style={{ animationDelay: `${i * 90}ms` }}
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white/90">{signal.productName}</p>
                            <p className="mt-0.5 truncate text-[11px] text-[#c4a060]/60">
                              {signal.bestMarketName} · {signal.bestCounty}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="font-mono text-base font-bold text-amber-300">
                              {formatKes(signal.bestPrice)}
                            </p>
                            <p
                              className={`mt-0.5 text-[11px] font-semibold ${
                                signal.trendDirection === "up"
                                  ? "text-green-400"
                                  : signal.trendDirection === "down"
                                    ? "text-red-400"
                                    : "text-white/30"
                              }`}
                            >
                              {formatTrendLabel(signal.trendDirection, signal.trendPercentage)}
                            </p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="rounded-[18px] border border-[#4a2e0a]/30 bg-[#2a1508]/40 px-4 py-5 text-center text-sm text-white/30">
                        Price data grows as field contributors submit reports.
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#4a2e0a]/30 pt-4 text-xs">
                    <span className="text-white/35">
                      {intelligence.isFallback
                        ? "Starter board while live submissions build"
                        : "Built from approved field submissions"}
                    </span>
                    <Link
                      href="/market-intelligence/submit"
                      className="font-semibold text-amber-400 transition hover:text-amber-300"
                    >
                      Share a price →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* ━━━━━━━━━━━━━━━━━━ LIVE MARKETPLACE ━━━━━━━━━━━━━━━━━━ */}
        <section className="border-b border-stone-100 py-16">
          <div className="page-shell">
            <div className="grid gap-10 xl:grid-cols-[1.2fr_0.8fr]">

              {/* Listings */}
              <div>
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="section-kicker">Live supply</p>
                    <h2 className="mt-2 text-3xl font-bold text-stone-900 sm:text-4xl">
                      Fresh produce on the market
                    </h2>
                  </div>
                  <Link
                    href="/browse"
                    className="hidden shrink-0 text-sm font-semibold text-terra-600 hover:text-terra-700 md:inline-flex"
                  >
                    Browse all →
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {listings.slice(0, 4).map((listing: any) => (
                    <ListingCard key={listing._id || listing.id} listing={listing} compact />
                  ))}
                  {listings.length === 0 && (
                    <div className="surface-card p-8 text-center text-sm text-stone-500 sm:col-span-2">
                      Active listings will appear here as sellers post supply.
                    </div>
                  )}
                </div>
                <Link
                  href="/browse"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-terra-600 hover:text-terra-700 md:hidden"
                >
                  Browse all listings <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Sidebar: price board + demand */}
              <div className="space-y-4">
                {/* Price board */}
                <div className="overflow-hidden rounded-[26px] border border-stone-200 bg-white shadow-[0_20px_60px_-36px_rgba(120,83,47,0.35)]">
                  <div className="flex items-center gap-3 border-b border-stone-100 px-5 py-4">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-forest-50 text-forest-700">
                      <BarChart3 className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
                        Price intelligence
                      </p>
                      <h3 className="text-sm font-bold text-stone-900">
                        Where the signal is strongest
                      </h3>
                    </div>
                  </div>
                  {produceBoard.length > 0 ? (
                    <div className="divide-y divide-stone-100">
                      {produceBoard.slice(0, 5).map((item) => (
                        <Link
                          key={item.productKey}
                          href={`/market-intelligence/${item.productKey}`}
                          className="flex items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-stone-50"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-stone-900">{item.productName}</p>
                            {item.bestMarket?.county && (
                              <p className="text-[11px] text-stone-400">{item.bestMarket.county}</p>
                            )}
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <p className="font-mono text-sm font-bold text-terra-600">
                              {item.bestMarket?.avgPrice ? formatKes(item.bestMarket.avgPrice) : "—"}
                            </p>
                            <span
                              className={`text-xs font-bold ${
                                item.overallTrendDirection === "up"
                                  ? "text-green-600"
                                  : item.overallTrendDirection === "down"
                                    ? "text-red-500"
                                    : "text-stone-300"
                              }`}
                            >
                              {item.overallTrendDirection === "up"
                                ? "↑"
                                : item.overallTrendDirection === "down"
                                  ? "↓"
                                  : "—"}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="px-5 py-5 text-sm text-stone-400">
                      Price data grows as contributors submit field reports.
                    </div>
                  )}
                  <div className="border-t border-stone-100 px-5 py-3">
                    <Link
                      href="/market-intelligence"
                      className="text-xs font-semibold text-terra-600 hover:text-terra-700"
                    >
                      Open full market board →
                    </Link>
                  </div>
                </div>

                {/* Buyer demand */}
                <div className="overflow-hidden rounded-[26px] border border-stone-200 bg-white shadow-[0_20px_60px_-36px_rgba(120,83,47,0.35)]">
                  <div className="flex items-center gap-3 border-b border-stone-100 px-5 py-4">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-terra-50 text-terra-700">
                      <Search className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
                        Active demand
                      </p>
                      <h3 className="text-sm font-bold text-stone-900">What buyers need now</h3>
                    </div>
                  </div>
                  {requests.length > 0 ? (
                    <div className="divide-y divide-stone-100">
                      {requests.slice(0, 3).map((request: any) => (
                        <div key={request._id || request.id} className="px-5 py-3.5">
                          <RequestCard request={request} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-5 py-5 text-sm text-stone-400">
                      Active buyer requests will appear here.
                    </div>
                  )}
                  <div className="border-t border-stone-100 px-5 py-3">
                    <Link
                      href="/request"
                      className="text-xs font-semibold text-terra-600 hover:text-terra-700"
                    >
                      View all buyer requests →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━ CATEGORIES ━━━━━━━━━━━━━━━━━━ */}
        <section className="border-b border-stone-100 py-16">
          <div className="page-shell">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="section-kicker">Trade lanes</p>
                <h2 className="mt-2 text-3xl font-bold text-stone-900 sm:text-4xl">
                  The categories Kenya actually trades
                </h2>
              </div>
              <Link
                href="/browse"
                className="text-sm font-semibold text-terra-600 hover:text-terra-700"
              >
                Open marketplace →
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {MARKETPLACE_CATEGORIES.map((category) => {
                const Icon = categoryIconMap[category.slug] ?? Leaf;
                return (
                  <Link
                    key={category.slug}
                    href={`/browse/${category.slug}`}
                    className="group surface-card p-6 transition duration-200 hover:-translate-y-1 hover:border-terra-200 hover:shadow-lg"
                  >
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-terra-50 text-terra-700 transition group-hover:bg-terra-100">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-xl font-bold text-stone-900">{category.label}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-stone-600">
                      {category.description}
                    </p>
                    <p className="mt-3 text-xs text-stone-400">{category.examples}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━ WHY AGRISOKO ━━━━━━━━━━━━━━━━━━ */}
        <section className="border-b border-stone-100 py-16">
          <div className="page-shell">
            <div className="mb-10 text-center">
              <p className="section-kicker">Why Agrisoko</p>
              <h2 className="mt-3 text-3xl font-bold text-stone-900 sm:text-4xl">
                A professional trade layer, not just a listings directory
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-stone-600">
                The information advantage in Kenyan agricultural markets has been held by
                intermediaries for too long. That changes here.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  Icon: ShieldCheck,
                  title: "Verified trust signals",
                  copy: "ID-verified sellers, profile verification, and listing context help serious buyers judge credibility before they pick up the phone.",
                },
                {
                  Icon: BarChart3,
                  title: "Live market intelligence",
                  copy: "Price submissions, best-market signals, and trend direction from field contributors — not stale averages from three months ago.",
                },
                {
                  Icon: MessageCircle,
                  title: "Direct market access",
                  copy: "Farmers, traders, buyers, agrovets, and service providers connect without the broker layer eating into every margin.",
                },
              ].map(({ Icon, title, copy }) => (
                <div key={title} className="surface-card p-6">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-terra-50 text-terra-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-xl font-bold text-stone-900">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━ FOUNDER LETTER — matches PWA ━━━━━━━━━━━━━━━━━━ */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
          <div className="max-w-4xl">
            <p className="section-kicker">A note from Stephen</p>
          </div>
          <div className="relative mt-6 max-w-4xl rotate-[-0.9deg] rounded-[2rem] border border-[#bfd0b8] bg-[#e6f0e0] px-5 py-6 text-slate-900 shadow-[0_8px_16px_rgba(92,122,99,0.08)] sm:px-7 sm:py-7">
            <div className="absolute left-1/2 top-0 h-10 w-24 -translate-x-1/2 -translate-y-1/2 rotate-[2deg] rounded-b-2xl bg-[#f1f6ee]" />
            <p className="home-handwritten text-[1.85rem] font-semibold leading-none text-[#38503b] sm:text-[2.1rem]">
              Why we started Agrisoko
            </p>
            <div className="home-handwritten mt-4 space-y-3 text-[1.28rem] leading-[1.22] text-slate-900 sm:text-[1.46rem]">
              {founderLetterParagraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
            <p className="home-handwritten mt-5 text-[1.5rem] font-semibold text-[#38503b] sm:text-[1.72rem]">
              Stephen
            </p>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━ INSIGHTS ━━━━━━━━━━━━━━━━━━ */}
        {posts.length > 0 && (
          <section className="border-t border-stone-100 py-16">
            <div className="page-shell">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <p className="section-kicker">Learn &amp; insights</p>
                  <h2 className="mt-2 text-3xl font-bold text-stone-900">
                    Editorial close to market action
                  </h2>
                </div>
                <Link
                  href="/learn"
                  className="hidden shrink-0 text-sm font-semibold text-terra-600 hover:text-terra-700 sm:inline-flex"
                >
                  Open learn hub →
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {posts.map((post: any) => (
                  <Link
                    key={post._id || post.slug}
                    href={`/learn/insights/${post.slug}`}
                    className="group surface-card overflow-hidden transition duration-200 hover:-translate-y-1 hover:border-terra-200 hover:shadow-md"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-stone-100">
                      {post.coverImage ? (
                        <div className="relative h-full w-full">
                          <Image
                            src={post.coverImage}
                            alt={post.title || "Insight"}
                            fill
                            sizes="(min-width: 1280px) 24vw, (min-width: 640px) 45vw, 100vw"
                            className="object-cover transition duration-500 group-hover:scale-[1.04]"
                          />
                        </div>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#f8efe2] to-stone-100">
                          <NotebookText className="h-8 w-8 text-terra-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      {(post.tags || []).length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {(post.tags as string[]).slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-terra-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-terra-600"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <h3 className="mt-2.5 line-clamp-2 text-base font-bold text-stone-900">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-stone-500">
                          {post.excerpt}
                        </p>
                      )}
                      <p className="mt-3 text-[11px] text-stone-400">
                        {formatBlogDate(post.publishedAt || post.createdAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="page-shell py-10">
          <MarketplaceSupportStrip />
        </div>

        {/* ━━━━━━━━━━━━━━━━━━ BOTTOM CTA ━━━━━━━━━━━━━━━━━━ */}
        <section className="page-shell pb-16">
          <div className="overflow-hidden rounded-[32px] bg-gradient-to-br from-terra-600 via-terra-700 to-[#72281A] p-8 shadow-[0_28px_70px_rgba(114,40,26,0.32)] sm:p-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="max-w-2xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/50">
                  Ready to start?
                </p>
                <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                  Join the Kenyan agricultural marketplace
                  <br className="hidden sm:block" /> that thinks as well as it trades
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-white/65 sm:text-base">
                  Post supply. Read demand. Compare markets. Build a reputation buyers can trust.
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
