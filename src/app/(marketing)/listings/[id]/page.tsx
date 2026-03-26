import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ListingActionPanel from "@/components/marketplace/ListingActionPanel";
import ListingCard from "@/components/marketplace/ListingCard";
import { serverFetch } from "@/lib/api-server";
import { API_BASE_URL } from "@/lib/endpoints";
import {
  formatKes,
  getCategoryByApi,
  getInitials,
  getLocationLabel,
  getUserDisplayName,
  isVerifiedProfile,
} from "@/lib/marketplace";

interface Props {
  params: { id: string };
}

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await serverFetch<any>(`${API_BASE_URL}/unified-listings/${params.id}`, { revalidate: 60 });
  const listing = data?.data ?? data;
  if (!listing) return {};
  return {
    title: listing.title || listing.name || "Marketplace listing",
    description: listing.description || "View listing details on Agrisoko.",
    openGraph: {
      title: listing.title || listing.name,
      description: listing.description || "View listing details on Agrisoko.",
      images: listing.images?.[0] ? [listing.images[0]] : [],
    },
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const data = await serverFetch<any>(`${API_BASE_URL}/unified-listings/${params.id}`, { revalidate: 60 });
  const listing = data?.data ?? data;

  if (!listing) notFound();

  const category = getCategoryByApi(listing?.category);
  const location = getLocationLabel(listing);
  const seller = listing?.seller || listing?.owner || listing?.user;
  const sellerName = getUserDisplayName(seller);
  const verified = isVerifiedProfile(seller) || listing?.verified || listing?.isVerified;
  const relatedData = await serverFetch<any>(
    `${API_BASE_URL}/unified-listings/trending?category=${category?.apiCategory || "produce"}&limit=4`,
    { revalidate: 60 }
  );
  const related = (relatedData?.listings ?? relatedData?.data ?? relatedData ?? []).filter(
    (item: any) => String(item?._id || item?.id) !== String(listing?._id || listing?.id)
  );

  return (
    <div className="page-shell py-10 sm:py-12">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-stone-500">
        <Link href="/browse" className="hover:text-terra-600">
          Browse
        </Link>
        <span>/</span>
        {category ? (
          <>
            <Link href={`/browse/${category.slug}`} className="hover:text-terra-600">
              {category.label}
            </Link>
            <span>/</span>
          </>
        ) : null}
        <span className="truncate text-stone-900">{listing?.title || listing?.name}</span>
      </nav>

      <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="surface-card overflow-hidden">
            <div className="aspect-[16/10] bg-stone-100">
              {listing?.images?.[0] ? (
                <img src={listing.images[0]} alt={listing.title || listing.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(160,69,46,0.14),_transparent_55%),linear-gradient(135deg,#fffdf8,#f2ece2)] text-sm font-semibold uppercase tracking-[0.2em] text-stone-400">
                  Agrisoko
                </div>
              )}
            </div>
            {listing?.images?.length > 1 ? (
              <div className="grid grid-cols-4 gap-3 p-4">
                {listing.images.slice(1, 5).map((image: string, index: number) => (
                  <div key={`${image}-${index}`} className="aspect-[4/3] overflow-hidden rounded-2xl bg-stone-100">
                    <img src={image} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="surface-card p-6">
            <div className="flex flex-wrap items-center gap-3">
              <p className="section-kicker">{category?.label || "Marketplace listing"}</p>
              {verified ? (
                <span className="rounded-full border border-forest-200 bg-forest-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-forest-700">
                  Verified seller cues
                </span>
              ) : null}
            </div>
            <h1 className="mt-4 text-4xl font-bold text-stone-900">{listing?.title || listing?.name}</h1>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-stone-50 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Location</p>
                <p className="mt-1 font-semibold text-stone-900">{location || "Kenya"}</p>
              </div>
              <div className="rounded-2xl bg-stone-50 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Price</p>
                <p className="mt-1 font-semibold text-stone-900">{formatKes(listing?.price) || "Negotiable"}</p>
              </div>
              <div className="rounded-2xl bg-stone-50 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Availability</p>
                <p className="mt-1 font-semibold text-stone-900">
                  {listing?.quantity ? `${listing.quantity} ${listing?.unit || ""}`.trim() : "Contact seller"}
                </p>
              </div>
            </div>

            {listing?.description ? (
              <div className="mt-6">
                <h2 className="text-2xl font-bold text-stone-900">Description</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-stone-600">
                  {listing.description}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-6">
          <ListingActionPanel listing={listing} />

          <div className="surface-card p-6">
            <p className="section-kicker">Seller profile</p>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-terra-100 text-base font-semibold text-terra-700">
                {getInitials(sellerName)}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-2xl font-bold text-stone-900">{sellerName}</h2>
                <p className="truncate text-sm text-stone-500">
                  {verified ? "Verified trust cues visible" : "Marketplace seller"}
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              <Link href={`/sellers/${seller?._id || listing?.userId}`} className="secondary-button w-full">
                View seller profile
              </Link>
            </div>
          </div>

          <div className="soft-panel p-6">
            <h2 className="text-2xl font-bold text-stone-900">Why this page matters</h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              The detail page keeps the strongest PWA behavior: category clarity, seller context,
              marketplace trust cues, and a direct path into message or checkout flows.
            </p>
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="mt-16">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-3xl font-bold text-stone-900">Related listings</h2>
            {category ? (
              <Link href={`/browse/${category.slug}`} className="text-sm font-semibold text-terra-600 hover:text-terra-700">
                More {category.shortLabel.toLowerCase()}
              </Link>
            ) : null}
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {related.slice(0, 4).map((item: any) => (
              <ListingCard key={item._id || item.id} listing={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
