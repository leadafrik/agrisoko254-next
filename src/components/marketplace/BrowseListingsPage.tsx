import Link from "next/link";
import ListingCard from "@/components/marketplace/ListingCard";
import SectionHeading from "@/components/marketplace/SectionHeading";
import TrendingSection from "@/components/marketplace/TrendingSection";
import { getMarketplaceFeed } from "@/lib/marketplace-feed";
import { MARKETPLACE_CATEGORIES, normalizeBrowseCategory } from "@/lib/marketplace";
import { CheckCircle, Zap, Users } from "lucide-react";

type BrowseListingsPageProps = {
  categorySlug?: string | null;
  searchParams?: Record<string, string | string[] | undefined>;
};

const getFirst = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);

export default async function BrowseListingsPage({
  categorySlug,
  searchParams,
}: BrowseListingsPageProps) {
  const category = normalizeBrowseCategory(categorySlug || undefined);
  const search = getFirst(searchParams?.search) || "";
  const county = getFirst(searchParams?.county) || "";
  const verifiedOnly = getFirst(searchParams?.verified) === "1";
  const minPriceRaw = getFirst(searchParams?.minPrice) || "";
  const maxPriceRaw = getFirst(searchParams?.maxPrice) || "";
  const sort = (getFirst(searchParams?.sort) || "recommended") as any;

  const minPrice = minPriceRaw ? Number(minPriceRaw) : undefined;
  const maxPrice = maxPriceRaw ? Number(maxPriceRaw) : undefined;

  const data = await getMarketplaceFeed({
    category: category?.apiCategory,
    search,
    county,
    verifiedOnly,
    minPrice,
    maxPrice,
    sort,
    limit: 48,
    revalidate: 60,
  });

  const { listings, total, verifiedCount, boostedCount } = data;

  return (
    <div className="page-shell py-10 sm:py-12">
      <section className="hero-panel p-6 sm:p-8">
        <SectionHeading
          eyebrow={category ? `${category.label} listings` : "Marketplace"}
          title={category ? `${category.label} across Kenyan counties` : "Browse listings across the full marketplace"}
          description={
            category
              ? `${category.description} Use county filters and direct listing pages to move quickly from discovery to contact.`
              : "Search active listings, narrow to a county, and focus on verified supply where trust matters most."
          }
          actions={
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/create-listing" className="primary-button">List something</Link>
              <Link href="/request" className="secondary-button">View buyer requests</Link>
            </div>
          }
        />

        {/* Stats bar */}
        {total > 0 && (
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-stone-600">
            <span className="flex items-center gap-1.5 font-semibold text-stone-900">
              <Users className="h-4 w-4 text-terra-600" />
              {total} listing{total === 1 ? "" : "s"}
            </span>
            {verifiedCount > 0 && (
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-forest-600" />
                {verifiedCount} verified
              </span>
            )}
            {boostedCount > 0 && (
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-500" />
                {boostedCount} boosted
              </span>
            )}
            <span className="text-stone-400">Direct contact</span>
          </div>
        )}

        {/* Filter form */}
        <form className="mt-6 space-y-3">
          <div className="grid gap-3 rounded-[28px] border border-stone-200 bg-white p-4 shadow-sm lg:grid-cols-[1.2fr_0.8fr_auto_auto_auto]">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search for maize, dairy cows, fertilizer, tractor hire..."
              className="field-input"
            />
            <input
              type="text"
              name="county"
              defaultValue={county}
              placeholder="Filter by county"
              className="field-input"
            />
            <label className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700">
              <input type="checkbox" name="verified" value="1" defaultChecked={verifiedOnly} />
              Verified only
            </label>
            <select
              name="sort"
              defaultValue={sort}
              className="field-input cursor-pointer"
            >
              <option value="recommended">Top picks</option>
              <option value="newest">Newest first</option>
              <option value="verified">Verified first</option>
              <option value="price_low">Price: low to high</option>
              <option value="price_high">Price: high to low</option>
            </select>
            <button type="submit" className="primary-button w-full">Apply filters</button>
          </div>
          <div className="flex flex-wrap items-center gap-3 px-1">
            <span className="text-xs font-medium text-stone-500">Price range (KES):</span>
            <input
              type="number"
              name="minPrice"
              defaultValue={minPriceRaw}
              placeholder="Min"
              min={0}
              className="w-28 rounded-xl border border-stone-200 px-3 py-2 text-sm focus:border-terra-400 focus:outline-none"
            />
            <span className="text-stone-400">–</span>
            <input
              type="number"
              name="maxPrice"
              defaultValue={maxPriceRaw}
              placeholder="Max"
              min={0}
              className="w-28 rounded-xl border border-stone-200 px-3 py-2 text-sm focus:border-terra-400 focus:outline-none"
            />
          </div>
        </form>
      </section>

      {/* Category tabs */}
      <section className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/browse"
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            !category ? "bg-terra-500 text-white" : "border border-stone-200 bg-white text-stone-700 hover:border-terra-300"
          }`}
        >
          All listings
        </Link>
        {MARKETPLACE_CATEGORIES.map((item) => (
          <Link
            key={item.slug}
            href={`/browse/${item.slug}`}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              category?.slug === item.slug
                ? "bg-terra-500 text-white"
                : "border border-stone-200 bg-white text-stone-700 hover:border-terra-300"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </section>

      {/* Trending (client component — loads independently) */}
      <TrendingSection category={category?.apiCategory} />

      {/* Listings grid */}
      <section className="mt-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <p className="text-sm text-stone-500">
            Showing {listings.length} of {total} listing{total === 1 ? "" : "s"}
            {county ? ` in ${county}` : ""}
            {search ? ` for "${search}"` : ""}
          </p>
          {(search || county || verifiedOnly || minPriceRaw || maxPriceRaw) && (
            <Link
              href={category ? `/browse/${category.slug}` : "/browse"}
              className="text-sm font-semibold text-terra-600 hover:text-terra-700"
            >
              Clear filters
            </Link>
          )}
        </div>

        {listings.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {listings.map((listing: any) => (
              <ListingCard key={listing._id || listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="surface-card p-10 text-center">
            <h2 className="text-2xl font-bold text-stone-900">No listings match those filters</h2>
            <p className="mt-3 text-sm text-stone-600">
              Try a different county, remove the verified filter, or search a broader term.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href={category ? `/browse/${category.slug}` : "/browse"} className="secondary-button">
                Clear filters
              </Link>
              <Link href="/create-listing" className="primary-button">Post the first listing</Link>
            </div>
          </div>
        )}

        {listings.length < total && (
          <p className="mt-6 text-center text-sm text-stone-500">
            Showing {listings.length} of {total} —{" "}
            <span className="font-medium text-terra-600">narrow your search to see more targeted results</span>
          </p>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="mt-12 rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm">
        <p className="text-lg font-semibold text-stone-900">Looking to sell instead?</p>
        <p className="mt-2 text-sm text-stone-600">
          Find buyers actively looking for what you offer. Browse requests from customers across Kenya.
        </p>
        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/request" className="secondary-button">View buy requests</Link>
          <Link href="/create-listing" className="primary-button">Post your products</Link>
        </div>
      </section>
    </div>
  );
}
