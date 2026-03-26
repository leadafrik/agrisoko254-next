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

export const revalidate = 180;

const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  produce: Leaf,
  livestock: Beef,
  inputs: Package,
  services: Wrench,
};

const founderLetter = [
  "When we started Agrisoko, the problem was already obvious. Farmers were doing the hard work while the information advantage stayed elsewhere.",
  "A grower could harvest maize, tomatoes, onions, or beans and still have no clear sense of what the better market was paying that week. Many sold because they had to, not because the timing was right.",
  "Agrisoko exists to change that. We want verified trade, clearer prices, better timing, and a platform that treats Kenyan agriculture with seriousness.",
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

  // Duplicate for seamless CSS marquee (2× → animate to -50%)
  const tickerItems = produceBoard.length > 0 ? [...produceBoard, ...produceBoard] : [];

  return (
    <>
      <Navbar />
      <main>

        {/* ━━━━━━━━━━━━━━━━━━ HERO ━━━━━━━━━━━━━━━━━━ */}
        <section
          style={{
            background:
              "radial-gradient(ellipse at 65% 0%, rgba(34,80,15,0.4) 0%, transparent 52%), radial-gradient(ellipse at 5% 100%, rgba(100,40,10,0.3) 0%, transparent 48%), linear-gradient(160deg, #0e1a08 0%, #1a120a 48%, #0d0b07 100%)",
          }}
          className="relative overflow-hidden border-b border-white/8 pb-0 pt-20 sm:pt-24 lg:pt-28"
        >
          <div className="page-shell pb-16 sm:pb-20">
            <div className="grid gap-12 lg:grid-cols-[1fr_440px] lg:items-start">

              {/* ── Left: copy ── */}
              <div className="max-w-2xl">
                {/* Live status pill */}
                <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3.5 py-1.5 text-xs font-semibold text-white/70">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                  </span>
                  {activeListings > 0
                    ? `${activeListings.toLocaleString()} listings live right now`
                    : "Listings updated daily"}
                </div>

                <h1 className="mt-7 text-[clamp(2.4rem,5.5vw,4rem)] font-bold leading-[1.02] tracking-tight text-white">
                  Most Kenyan farmers sell without knowing what the&nbsp;
                  <span className="text-amber-300">market paid yesterday.</span>
                </h1>

                <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/60">
                  Agrisoko gives you live prices from real field submissions, verified listings from
                  known sellers, and direct paths to buyers — so you decide when and where to sell.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <HeroAuthCTA />
                </div>

                <div className="mt-5 flex flex-wrap gap-5">
                  <Link
                    href="/market-intelligence"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-300/80 transition hover:text-amber-300"
                  >
                    See today&apos;s prices <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href="/b2b"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/35 transition hover:text-white/65"
                  >
                    Bulk workflows <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* Stats */}
                <div className="mt-10 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
                  <div>
                    <p className="text-4xl font-bold text-white sm:text-5xl">
                      {activeListings > 0 ? activeListings.toLocaleString() : "—"}
                    </p>
                    <p className="mt-1.5 text-xs font-medium text-white/40">Active listings</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-white sm:text-5xl">
                      {intelligence.meta.approvedSubmissions > 0
                        ? intelligence.meta.approvedSubmissions.toLocaleString()
                        : "—"}
                    </p>
                    <p className="mt-1.5 text-xs font-medium text-white/40">Price reports</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-white sm:text-5xl">
                      {SUPPORTED_DELIVERY_COUNTIES.length}
                    </p>
                    <p className="mt-1.5 text-xs font-medium text-white/40">Counties</p>
                  </div>
                </div>
              </div>

              {/* ── Right: live price card ── */}
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 lg:sticky lg:top-24">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
                      Market intelligence
                    </p>
                    <h2 className="mt-1 text-base font-bold text-white">Live price edges</h2>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full bg-green-500/12 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-green-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                    Live
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {featuredSignals.length > 0 ? (
                    featuredSignals.map((signal) => (
                      <Link
                        key={signal.productKey}
                        href={`/market-intelligence/${signal.productKey}`}
                        className="flex items-center justify-between gap-3 rounded-[18px] border border-white/8 bg-white/4 px-4 py-3.5 transition hover:border-white/15 hover:bg-white/8"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white">{signal.productName}</p>
                          <p className="mt-0.5 truncate text-[11px] text-white/40">
                            {signal.bestMarketName} · {signal.bestCounty}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-mono text-sm font-bold text-amber-300">
                            {formatKes(signal.bestPrice)}
                          </p>
                          <p
                            className={`mt-0.5 text-[11px] font-medium ${
                              signal.trendDirection === "up"
                                ? "text-green-400"
                                : signal.trendDirection === "down"
                                  ? "text-red-400"
                                  : "text-white/35"
                            }`}
                          >
                            {formatTrendLabel(signal.trendDirection, signal.trendPercentage)}
                          </p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-[18px] border border-white/8 bg-white/4 px-4 py-6 text-center text-sm text-white/35">
                      Price data grows as field contributors submit reports.
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-4">
                  <p className="text-[11px] text-white/30">Field-sourced submissions</p>
                  <Link
                    href="/market-intelligence/submit"
                    className="text-xs font-semibold text-amber-300/70 transition hover:text-amber-300"
                  >
                    Share a price →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ── Scrolling price ticker ── */}
          {tickerItems.length > 0 && (
            <div className="overflow-hidden border-t border-white/8 bg-white/4 py-3">
              <style>{`
                @keyframes agrisoko-ticker {
                  0%   { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
                .agrisoko-ticker {
                  animation: agrisoko-ticker 50s linear infinite;
                  will-change: transform;
                }
                .agrisoko-ticker:hover { animation-play-state: paused; }
              `}</style>
              <div className="agrisoko-ticker flex items-center whitespace-nowrap">
                {tickerItems.map((item, i) => (
                  <Link
                    key={`${item.productKey}-${i}`}
                    href={`/market-intelligence/${item.productKey}`}
                    className="inline-flex items-center gap-2 px-7 text-xs transition hover:opacity-100"
                  >
                    <span className="font-semibold text-white/65">{item.productName}</span>
                    <span className="font-mono font-bold text-amber-300/90">
                      {item.bestMarket?.avgPrice ? formatKes(item.bestMarket.avgPrice) : "—"}
                    </span>
                    <span
                      className={`font-bold ${
                        item.overallTrendDirection === "up"
                          ? "text-green-400"
                          : item.overallTrendDirection === "down"
                            ? "text-red-400"
                            : "text-white/25"
                      }`}
                    >
                      {item.overallTrendDirection === "up"
                        ? "↑"
                        : item.overallTrendDirection === "down"
                          ? "↓"
                          : "—"}
                    </span>
                    <span className="ml-3 text-white/15">·</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
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

              {/* Right sidebar: market board + demand */}
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
                          <div className="flex shrink-0 items-center gap-2.5">
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

        {/* ━━━━━━━━━━━━━━━━━━ WHY AGRISOKO (dark) ━━━━━━━━━━━━━━━━━━ */}
        <section
          style={{
            background:
              "linear-gradient(160deg, #0e1a08 0%, #1a120a 60%, #0d0b07 100%)",
          }}
          className="py-20 sm:py-24"
        >
          <div className="page-shell">
            <div className="mb-12 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">
                Why Agrisoko
              </p>
              <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                A professional trade layer,
                <br className="hidden sm:block" /> not just a listings directory
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/50">
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
                  accent: "text-amber-300",
                  iconBg: "bg-amber-300/10",
                },
                {
                  Icon: BarChart3,
                  title: "Live market intelligence",
                  copy: "Price submissions, best-market signals, and trend direction from field contributors — not stale averages from three months ago.",
                  accent: "text-green-400",
                  iconBg: "bg-green-400/10",
                },
                {
                  Icon: MessageCircle,
                  title: "Direct market access",
                  copy: "Farmers, traders, buyers, agrovets, and service providers connect without the broker layer eating into every margin.",
                  accent: "text-sky-400",
                  iconBg: "bg-sky-400/10",
                },
              ].map(({ Icon, title, copy, accent, iconBg }) => (
                <div
                  key={title}
                  className="rounded-[24px] border border-white/8 bg-white/4 p-6"
                >
                  <span
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${iconBg} ${accent}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className={`mt-4 text-xl font-bold ${accent}`}>{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/50">{copy}</p>
                </div>
              ))}
            </div>

            {/* Real stats in dark section */}
            {(activeListings > 0 ||
              intelligence.meta.approvedSubmissions > 0) && (
              <div className="mt-10 grid grid-cols-3 gap-6 border-t border-white/8 pt-10">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white sm:text-4xl">
                    {activeListings > 0 ? activeListings.toLocaleString() : "—"}
                  </p>
                  <p className="mt-2 text-xs text-white/35">Active listings</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white sm:text-4xl">
                    {intelligence.meta.approvedSubmissions > 0
                      ? intelligence.meta.approvedSubmissions.toLocaleString()
                      : "—"}
                  </p>
                  <p className="mt-2 text-xs text-white/35">Approved price reports</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white sm:text-4xl">
                    {SUPPORTED_DELIVERY_COUNTIES.length}
                  </p>
                  <p className="mt-2 text-xs text-white/35">Counties with checkout</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━ FOUNDER + INSIGHTS ━━━━━━━━━━━━━━━━━━ */}
        <section className="border-b border-stone-100 py-16">
          <div className="page-shell">
            <div className="grid gap-10 xl:grid-cols-[0.95fr_1.05fr]">

              {/* Founder letter */}
              <div className="surface-card p-7 sm:p-9">
                <p className="section-kicker">A note from Stephen</p>
                <h2 className="mt-4 text-3xl font-bold text-stone-900">
                  We are building a trusted market,
                  <br className="hidden sm:block" /> not a prettier interface.
                </h2>
                <div className="mt-5 space-y-4 text-sm leading-relaxed text-stone-600">
                  {founderLetter.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                  ))}
                </div>
                <p className="mt-6 text-sm font-bold text-stone-900">Stephen</p>
                <Link
                  href="/about"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-terra-600 hover:text-terra-700"
                >
                  About Agrisoko <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Insights */}
              <div>
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
                {posts.length > 0 ? (
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
                ) : (
                  <div className="rounded-[24px] border border-stone-200 bg-white p-6 text-sm text-stone-500">
                    Editorial insights from the admin desk will appear here automatically.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

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
