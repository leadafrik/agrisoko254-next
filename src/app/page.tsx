import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Beef,
  Clock3,
  Leaf,
  MapPin,
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
import { HeroAuthCTA, BottomAuthCTA } from "@/components/common/HomepageAuthCTA";
import { serverFetch } from "@/lib/api-server";
import { API_BASE_URL } from "@/lib/endpoints";
import {
  MARKETPLACE_CATEGORIES,
  PLATFORM_PROMISES,
  SUPPORTED_DELIVERY_COUNTIES,
} from "@/lib/marketplace";

export const revalidate = 60;

const founderLetter = [
  "When I started Agrisoko, many people told me it would not work.",
  "I grew up watching farmers work incredibly hard — waking before sunrise, tending their land through drought and disease — and then watching brokers take the largest share of the profit at the farm gate. A farmer who grew maize for four months might sell it for KES 28 per kilo. By the time it reached Nairobi, it sold for KES 55. The farmer saw none of that difference.",
  "I asked myself: what if the farmer could see the buyer directly? What if the buyer could trust the quality? What if we removed the unnecessary steps between the person who grew the food and the person who needed it?",
  "That question became Agrisoko — trust infrastructure for Kenyan agriculture. A place where a smallholder in Meru can reach a buyer in Mombasa. Where a fresh produce trader in Limuru can post what she has and be found by restaurants in Nairobi.",
  "Join us. Sign up today. Tell a friend to tell a friend. And together, let us build the future of agriculture in Kenya.",
];

const startSteps = [
  { step: "01", title: "Create account", copy: "Open your account in minutes — no fee to join." },
  { step: "02", title: "Verify when ready", copy: "Trust signals help serious buyers move faster." },
  { step: "03", title: "List or browse", copy: "Post supply, find demand, and close direct deals." },
];

const trustHighlights = [
  { title: "Verified profiles", copy: "ID and selfie verification reduces fraud risk.", Icon: ShieldCheck },
  { title: "Direct buyer chat", copy: "Negotiate directly without broker layers.", Icon: MessageCircle },
  { title: "Reputation built in", copy: "Verification and listing activity help buyers decide faster.", Icon: BadgeCheck },
];

const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  produce: Leaf,
  livestock: Beef,
  inputs: Package,
  services: Wrench,
};

function formatBlogDate(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
}

export default async function HomePage() {
  const [countData, listingsData, requestsData, blogData] = await Promise.all([
    serverFetch<any>(`${API_BASE_URL}/unified-listings/count/active`, { revalidate: 60 }),
    serverFetch<any>(`${API_BASE_URL}/unified-listings/trending?limit=6`, { revalidate: 60 }),
    serverFetch<any>(`${API_BASE_URL}/buyer-requests?limit=3&status=active`, { revalidate: 60 }),
    serverFetch<any>(`${API_BASE_URL}/blog?limit=3`, { revalidate: 300 }),
  ]);

  const activeListings = countData?.data?.activeListings;
  const listings = listingsData?.listings ?? listingsData?.data ?? listingsData ?? [];
  const requests = requestsData?.data ?? requestsData?.requests ?? requestsData ?? [];
  const posts = blogData?.posts ?? blogData?.data ?? blogData ?? [];

  // Category counts: derive from trending feed so numbers are accurate
  const allApiCategories = MARKETPLACE_CATEGORIES.map((c) => c.apiCategory);
  const categoryHits: Record<string, number> = Object.fromEntries(allApiCategories.map((k) => [k, 0]));
  (Array.isArray(listings) ? listings : []).forEach((l: any) => {
    const cat = String(l?.category || "").toLowerCase();
    if (cat in categoryHits) categoryHits[cat]++;
  });
  const categoryCounts = MARKETPLACE_CATEGORIES.map((c) => ({
    ...c,
    count: null as number | null, // don't show counts — API doesn't support per-category count filter
  }));

  return (
    <>
      <Navbar />
      <main className="pb-0">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-stone-200 bg-gradient-to-b from-[#FAF7F2] via-[#F9F4EE] to-white">
          <div className="pointer-events-none absolute -top-16 left-[10%] h-80 w-80 rounded-full bg-[#F3C9BE]/50 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-8 h-96 w-96 rounded-full bg-[#FFF0C8]/50 blur-3xl" />

          <div className="page-shell relative py-10 sm:py-14">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">

              {/* Left */}
              <div className="max-w-3xl">
                <p className="section-kicker">Built in Kenya for agricultural trade</p>
                <h1 className="mt-4 text-4xl font-bold leading-[1.05] text-stone-900 sm:text-5xl lg:text-6xl">
                  Find verified produce and suppliers across Kenya without middlemen.
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-stone-600">
                  Browse trusted listings, compare sellers, and close direct deals faster. Agrisoko keeps live supply, buyer demand, and practical market guidance in one serious marketplace.
                </p>

                <HeroAuthCTA />

                {/* Stat chips */}
                <div className="mt-5 flex flex-wrap gap-2 text-sm text-stone-600">
                  <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 font-medium">
                    Listings are free right now
                  </span>
                  <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 font-medium">
                    {typeof activeListings === "number"
                      ? `${activeListings.toLocaleString()} listings live`
                      : "Live listings updated regularly"}
                  </span>
                  <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 font-medium">
                    {SUPPORTED_DELIVERY_COUNTIES.length} checkout counties
                  </span>
                </div>

                {/* Category pills */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {categoryCounts.map((cat) => {
                    const Icon = categoryIconMap[cat.slug] ?? Leaf;
                    return (
                      <Link
                        key={cat.slug}
                        href={`/browse/${cat.slug}`}
                        className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/90 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-terra-200 hover:bg-terra-50/60 hover:text-terra-700"
                      >
                        <Icon className="h-3.5 w-3.5 text-terra-600" />
                        {cat.shortLabel}
                        {typeof cat.count === "number" && (
                          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-500">
                            {cat.count}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Right — 3-step card */}
              <div className="surface-card p-6 lg:mt-4">
                <p className="section-kicker">Start in minutes</p>
                <h2 className="mt-3 text-2xl font-bold text-stone-900">List fast, browse immediately</h2>

                <div className="mt-6 space-y-5">
                  {startSteps.map((s) => (
                    <div key={s.step} className="flex items-start gap-4 border-b border-stone-100 pb-5 last:border-b-0 last:pb-0">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-terra-500 text-sm font-bold text-white">
                        {s.step}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-stone-900">{s.title}</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-stone-500">{s.copy}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/request"
                  className="mt-6 flex w-full items-center justify-between rounded-xl border border-stone-200 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-terra-200 hover:bg-terra-50/60 hover:text-terra-700"
                >
                  See buyer demand
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Live Market Pulse ──────────────────────────────────────── */}
        <section className="page-shell py-14">
          <div className="grid gap-8 xl:grid-cols-[1.45fr_0.55fr]">

            {/* Listings column */}
            <div>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="section-kicker">Live listings</p>
                  <h2 className="mt-2 text-3xl font-bold text-stone-900">Fresh supply on the market</h2>
                </div>
                <Link href="/browse" className="hidden text-sm font-semibold text-terra-600 hover:text-terra-700 md:inline-flex items-center gap-1">
                  Browse all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {listings.slice(0, 4).map((listing: any) => (
                  <ListingCard key={listing._id || listing.id} listing={listing} compact />
                ))}
                {listings.length === 0 && (
                  <div className="surface-card p-8 text-center text-stone-500 sm:col-span-2">
                    Active marketplace listings will appear here as inventory comes in.
                  </div>
                )}
              </div>

              <Link href="/browse" className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-stone-200 py-3 text-sm font-semibold text-stone-700 transition hover:border-terra-200 hover:bg-terra-50/60 md:hidden">
                Browse all listings <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Demand + trust sidebar */}
            <div className="surface-card p-6">
              <p className="section-kicker">Live demand</p>
              <h3 className="mt-2 text-2xl font-bold text-stone-900">What buyers need right now</h3>

              <ul className="mt-5 space-y-3">
                {requests.slice(0, 3).map((req: any) => (
                  <li key={req._id || req.id} className="flex items-start gap-3 border-b border-stone-100 pb-3 last:border-b-0 last:pb-0">
                    <Search className="mt-0.5 h-4 w-4 shrink-0 text-terra-500" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-stone-900 line-clamp-2">
                        {req?.title || "Buyer demand"}
                      </p>
                      <p className="mt-0.5 text-xs text-stone-500">
                        {[req?.location?.county || req?.county, req?.budget?.max ? `KES ${req.budget.max.toLocaleString()}` : null].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </li>
                ))}
                {requests.length === 0 && (
                  <li className="text-sm text-stone-500">Buyer demand signals will appear here.</li>
                )}
              </ul>

              <div className="mt-6 space-y-4 border-t border-stone-100 pt-6">
                {trustHighlights.map(({ title, copy, Icon }) => (
                  <div key={title} className="flex items-start gap-3">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-terra-50 text-terra-600">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-stone-900">{title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-stone-500">{copy}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/request" className="mt-6 flex w-full items-center justify-between rounded-xl bg-terra-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-terra-600">
                View buy requests
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Categories ───────────────────────────────────────────────── */}
        <section className="page-shell border-t border-stone-100 py-14">
          <div className="mb-8">
            <p className="section-kicker">Marketplace categories</p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-3xl font-bold text-stone-900">Trade lanes buyers and sellers actually use</h2>
              <Link href="/browse" className="text-sm font-semibold text-terra-600 hover:text-terra-700 shrink-0">
                Open marketplace
              </Link>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {MARKETPLACE_CATEGORIES.map((cat) => {
              const Icon = categoryIconMap[cat.slug] ?? Leaf;
              const count = categoryCounts.find((c) => c.slug === cat.slug)?.count;
              return (
                <Link
                  key={cat.slug}
                  href={`/browse/${cat.slug}`}
                  className="group surface-card p-5 transition duration-200 hover:-translate-y-1 hover:border-terra-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-terra-50 text-terra-600 transition group-hover:bg-terra-100">
                      <Icon className="h-5 w-5" />
                    </span>
                    {typeof count === "number" && (
                      <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-500">
                        {count} live
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-stone-900 transition group-hover:text-terra-700">{cat.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-500">{cat.description}</p>
                  <p className="mt-3 text-xs font-medium text-stone-400">{cat.examples}</p>
                  <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-terra-600 transition group-hover:gap-2">
                    Browse <ArrowRight className="h-3.5 w-3.5 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── Why Agrisoko ─────────────────────────────────────────────── */}
        <section className="page-shell border-t border-stone-100 py-14">
          <div className="mb-8 text-center">
            <p className="section-kicker">Why Agrisoko</p>
            <h2 className="mt-2 text-3xl font-bold text-stone-900 sm:text-4xl">
              A marketplace shaped around trust, direct trade, and operational clarity
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-stone-500">
              Serious agricultural trade needs clearer trust signals, shorter paths to contact, and language that respects how buyers and sellers actually work.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {PLATFORM_PROMISES.map((item, i) => (
              <div key={item.title} className="surface-card p-6">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-terra-50 text-terra-600 text-sm font-bold">
                  0{i + 1}
                </span>
                <h3 className="mt-4 text-xl font-bold text-stone-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-500">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Learn hub / Blog ──────────────────────────────────────────── */}
        <section className="page-shell border-t border-stone-100 py-14">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-kicker">Agrisoko insights</p>
              <h2 className="mt-2 text-3xl font-bold text-stone-900">Market notes and practical guidance</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-500">
                Demand signals, trust guidance, founder updates, and practical field-level notes that help buyers and sellers trade better.
              </p>
            </div>
            <Link href="/learn" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-terra-600 hover:text-terra-700">
              View all insights <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {posts.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((post: any) => (
                <Link
                  key={post._id || post.slug}
                  href={`/learn/insights/${post.slug}`}
                  className="group surface-card overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:border-terra-200 hover:shadow-md"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-stone-100">
                    {post.coverImage ? (
                      <div className="relative h-full w-full">
                        <Image
                          src={post.coverImage}
                          alt={post.title || "Insight"}
                          fill
                          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                          className="object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      </div>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FDF5F3] via-[#FAF7F2] to-stone-100">
                        <NotebookText className="h-10 w-10 text-terra-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    {Array.isArray(post.tags) && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {post.tags.slice(0, 2).map((tag: string) => (
                          <span key={tag} className="rounded-full bg-terra-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-terra-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <h3 className="line-clamp-2 text-xl font-bold text-stone-900 transition group-hover:text-terra-700">
                      {post.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-500">{post.excerpt}</p>
                    <div className="mt-4 flex items-center justify-between gap-3 text-xs text-stone-400">
                      <span>{formatBlogDate(post.publishedAt || post.createdAt)}</span>
                      {post.readTimeMinutes ? (
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-3.5 w-3.5" />
                          {post.readTimeMinutes} min
                        </span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="surface-card p-8 text-center text-sm text-stone-500">
              The first article published from the admin panel will appear here automatically.
            </div>
          )}
        </section>

        {/* ── Buyer Requests ────────────────────────────────────────────── */}
        <section className="page-shell border-t border-stone-100 py-14">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="section-kicker">Active demand</p>
              <h2 className="mt-2 text-3xl font-bold text-stone-900">Open buyer requests</h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-500">
                Real buyers posting what they need. If you have supply, respond directly.
              </p>
            </div>
            <Link href="/request" className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-terra-600 hover:text-terra-700 sm:inline-flex">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {requests.slice(0, 3).map((req: any) => (
              <RequestCard key={req._id || req.id} request={req} />
            ))}
            {requests.length === 0 && (
              <div className="surface-card p-8 text-center text-stone-500 md:col-span-2 xl:col-span-3">
                Live buyer requests will appear here as soon as they are posted.
              </div>
            )}
          </div>
          <Link href="/request" className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-stone-200 py-3 text-sm font-semibold text-stone-700 transition hover:border-terra-200 hover:bg-terra-50/60 sm:hidden">
            View all requests <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {/* ── Support strip ────────────────────────────────────────────── */}
        <div className="page-shell pb-14">
          <MarketplaceSupportStrip />
        </div>

        {/* ── Founder letter ───────────────────────────────────────────── */}
        <section className="page-shell border-t border-stone-100 py-14">
          <div className="max-w-3xl">
            <p className="section-kicker">A note from Stephen</p>
          </div>
          <div className="relative mt-6 max-w-3xl rotate-[-0.7deg] rounded-[2rem] border border-[#bfd0b8] bg-[#e6f0e0] px-6 py-7 text-slate-900 shadow-[0_8px_24px_rgba(92,122,99,0.12)] sm:px-8 sm:py-8">
            <div className="absolute left-1/2 top-0 h-9 w-20 -translate-x-1/2 -translate-y-1/2 rotate-[2deg] rounded-b-2xl bg-[#f1f6ee] shadow-sm" />
            <p style={{ fontFamily: "cursive" }} className="text-[1.75rem] font-semibold leading-none text-[#38503b] sm:text-[2rem]">
              Why we started Agrisoko
            </p>
            <div style={{ fontFamily: "cursive" }} className="mt-5 space-y-4 text-[1.18rem] leading-[1.3] text-slate-800 sm:text-[1.35rem]">
              {founderLetter.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
            <p style={{ fontFamily: "cursive" }} className="mt-6 text-[1.4rem] font-semibold text-[#38503b] sm:text-[1.6rem]">
              Stephen
            </p>
          </div>
        </section>

        {/* ── Bottom CTA ───────────────────────────────────────────────── */}
        <section className="page-shell py-14">
          <div className="overflow-hidden rounded-[32px] bg-gradient-to-br from-terra-600 via-terra-700 to-[#72281A] p-8 text-white shadow-[0_24px_56px_rgba(114,40,26,0.28)] sm:p-10 md:p-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">Ready to start?</p>
                <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                  Join the agricultural marketplace Kenya deserves
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-white/75 sm:text-base">
                  Farmers should earn more. Buyers should find reliable produce. Agriculture should work with more trust, more visibility, and less broker leakage.
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
