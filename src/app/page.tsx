import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ListingCard from "@/components/marketplace/ListingCard";
import RequestCard from "@/components/marketplace/RequestCard";
import SectionHeading from "@/components/marketplace/SectionHeading";
import {
  MARKETPLACE_CATEGORIES,
  PLATFORM_NUMBERS,
  PLATFORM_PROMISES,
} from "@/lib/marketplace";
import { serverFetch } from "@/lib/api-server";
import { API_BASE_URL } from "@/lib/endpoints";

export const revalidate = 60;

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

  const liveNumbers = PLATFORM_NUMBERS.map((item, index) =>
    index === 0 && typeof activeListings === "number"
      ? { ...item, value: `${activeListings.toLocaleString()}+`, detail: "Active listings across the marketplace" }
      : item
  );

  return (
    <>
      <Navbar />
      <main className="pb-20">
        <section className="page-shell pt-8 sm:pt-10">
          <div className="hero-panel p-6 sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="section-kicker">Built from the best of the PWA marketplace</p>
                <h1 className="mt-4 text-4xl font-bold text-stone-900 sm:text-5xl lg:text-6xl">
                  Kenya&apos;s agricultural marketplace, rebuilt for a stronger web experience.
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-stone-600">
                  Agrisoko helps farmers, buyers, input suppliers, and service providers trade
                  more directly. Browse verified listings, respond to real demand, and keep the
                  Learn hub close to the marketplace.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/browse" className="primary-button">
                    Browse marketplace
                  </Link>
                  <Link href="/login?mode=signup" className="secondary-button">
                    Create free account
                  </Link>
                </div>
              </div>

              <div className="grid gap-4">
                {liveNumbers.map((item) => (
                  <div key={item.label} className="metric-chip">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                      {item.label}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-stone-900">{item.value}</p>
                    <p className="mt-1 text-sm text-stone-600">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="page-shell mt-14">
          <SectionHeading
            eyebrow="Marketplace categories"
            title="Browse the core flows farmers and buyers actually use"
            description="The Next app keeps the same category structure as the PWA so the marketplace feels familiar, consistent, and easier to scale."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {MARKETPLACE_CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={`/browse/${category.slug}`}
                className="surface-card p-5 transition duration-200 hover:-translate-y-1 hover:border-terra-200"
              >
                <p className="section-kicker">{category.shortLabel}</p>
                <h3 className="mt-4 text-2xl font-bold text-stone-900">{category.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{category.description}</p>
                <p className="mt-4 text-sm font-semibold text-stone-700">{category.examples}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="page-shell mt-16">
          <SectionHeading
            eyebrow="Marketplace pulse"
            title="What is moving right now"
            description="Live demand and active listings keep the homepage grounded in real marketplace activity instead of generic landing-page filler."
          />

          <div className="mt-8 grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-stone-900">Buyer requests</h3>
                <Link href="/request" className="text-sm font-semibold text-terra-600 hover:text-terra-700">
                  View all requests
                </Link>
              </div>
              <div className="grid gap-4">
                {requests.slice(0, 3).map((request: any) => (
                  <RequestCard key={request._id || request.id} request={request} />
                ))}
                {requests.length === 0 ? (
                  <div className="surface-card p-8 text-center text-stone-500">
                    Live buyer requests will appear here as soon as they are posted.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-stone-900">Trending listings</h3>
                <Link href="/browse" className="text-sm font-semibold text-terra-600 hover:text-terra-700">
                  Open marketplace
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {listings.slice(0, 4).map((listing: any) => (
                  <ListingCard key={listing._id || listing.id} listing={listing} compact />
                ))}
                {listings.length === 0 ? (
                  <div className="surface-card p-8 text-center text-stone-500 sm:col-span-2">
                    Active marketplace listings will appear here as inventory comes in.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="page-shell mt-16">
          <SectionHeading
            eyebrow="Why Agrisoko"
            title="A marketplace shaped around trust, direct trade, and clear operations"
            description="The strongest parts of the PWA were its seriousness and clarity. The Next app keeps that same posture rather than turning the product into a generic listing site."
            align="center"
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {PLATFORM_PROMISES.map((item) => (
              <div key={item.title} className="surface-card p-6">
                <h3 className="text-2xl font-bold text-stone-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="page-shell mt-16">
          <div className="soft-panel p-6 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="section-kicker">Learn hub</p>
                <h2 className="mt-4 text-3xl font-bold text-stone-900 sm:text-4xl">
                  Keep the educational side of Agrisoko close to the marketplace.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-600">
                  The Learn hub remains part of the product, not a detached content section.
                  Farmers can move from practical guides into listings, requests, and trade flows
                  without losing context.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link href="/learn" className="primary-button">
                    Explore Learn
                  </Link>
                  <Link href="/browse" className="secondary-button">
                    Go to marketplace
                  </Link>
                </div>
              </div>

              <div className="grid gap-4">
                {posts.slice(0, 3).map((post: any) => (
                  <Link
                    key={post._id || post.slug}
                    href={`/blog/${post.slug}`}
                    className="surface-card p-5 transition hover:-translate-y-1 hover:border-terra-200"
                  >
                    <p className="section-kicker">Agrisoko insight</p>
                    <h3 className="mt-3 text-xl font-bold text-stone-900">{post.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-600">
                      {post.excerpt}
                    </p>
                  </Link>
                ))}
                {posts.length === 0 ? (
                  <div className="surface-card p-6 text-sm text-stone-500">
                    Blog and learn content can be surfaced here once articles are available.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
