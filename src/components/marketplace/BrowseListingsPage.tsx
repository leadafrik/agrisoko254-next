import Link from "next/link";
import ListingCard from "@/components/marketplace/ListingCard";
import SectionHeading from "@/components/marketplace/SectionHeading";
import { serverFetch } from "@/lib/api-server";
import { API_BASE_URL } from "@/lib/endpoints";
import { MARKETPLACE_CATEGORIES, normalizeBrowseCategory } from "@/lib/marketplace";

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

  const params = new URLSearchParams({
    limit: "16",
    sort: "-createdAt",
  });

  if (category) params.set("category", category.apiCategory);
  if (search) params.set("search", search);
  if (county) params.set("county", county);
  if (verifiedOnly) params.set("verifiedOnly", "true");

  const data = await serverFetch<any>(`${API_BASE_URL}/unified-listings?${params.toString()}`, {
    revalidate: 60,
  });

  const listings = Array.isArray(data?.data) ? data.data : Array.isArray(data?.listings) ? data.listings : Array.isArray(data) ? data : [];

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
              <Link href="/create-listing" className="primary-button">
                List something
              </Link>
              <Link href="/request" className="secondary-button">
                View buyer requests
              </Link>
            </div>
          }
        />

        <form className="mt-8 grid gap-3 rounded-[28px] border border-stone-200 bg-white p-4 shadow-sm lg:grid-cols-[1.2fr_0.8fr_auto_auto]">
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
          <button type="submit" className="primary-button w-full">
            Apply filters
          </button>
        </form>
      </section>

      <section className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/browse"
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            !category ? "bg-terra-500 text-white" : "border border-stone-200 bg-white text-stone-700"
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
                : "border border-stone-200 bg-white text-stone-700"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </section>

      <section className="mt-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-stone-500">
              {listings.length} listing{listings.length === 1 ? "" : "s"} shown
              {county ? ` in ${county}` : ""}
              {search ? ` for "${search}"` : ""}
            </p>
          </div>
          {category ? (
            <Link href="/browse" className="text-sm font-semibold text-terra-600 hover:text-terra-700">
              Reset category
            </Link>
          ) : null}
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
              <Link href="/create-listing" className="primary-button">
                Post the first listing
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
