import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ListingActionPanel from "@/components/marketplace/ListingActionPanel";
import ListingGallery from "@/components/marketplace/ListingGallery";
import ListingSellerPanel from "@/components/marketplace/ListingSellerPanel";
import ListingTypeDetails from "@/components/marketplace/ListingTypeDetails";
import ListingCard from "@/components/marketplace/ListingCard";
import { serverFetch } from "@/lib/api-server";
import { API_BASE_URL } from "@/lib/endpoints";
import {
  getCategoryByApi,
  getDeliveryScopeLabel,
  getListingEngagement,
  getListingImageUrls,
  getListingPriceLabel,
  getListingTypeLabel,
  getLocationLabel,
  isListingBoosted,
  isVerifiedProfile,
  normalizeMarketplaceListing,
} from "@/lib/marketplace";
import { Eye, Bookmark, MessageCircle, Truck, Zap } from "lucide-react";

interface Props {
  params: { id: string };
}

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await serverFetch<any>(`${API_BASE_URL}/unified-listings/${params.id}`, { revalidate: 60 });
  const rawListing = data?.data ?? data;
  if (!rawListing) return {};
  const listing = normalizeMarketplaceListing(rawListing);
  const images = getListingImageUrls(listing);
  return {
    title: listing.title || listing.name || "Marketplace listing",
    description: listing.description || "View listing details on Agrisoko.",
    openGraph: {
      title: listing.title || listing.name,
      description: listing.description || "View listing details on Agrisoko.",
      images: images[0] ? [images[0]] : [],
    },
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const data = await serverFetch<any>(`${API_BASE_URL}/unified-listings/${params.id}`, { revalidate: 60 });
  const rawListing = data?.data ?? data;
  if (!rawListing) notFound();
  const listing = normalizeMarketplaceListing(rawListing);

  const galleryImages = getListingImageUrls(listing);
  const category = getCategoryByApi(listing?.category);
  const location = getLocationLabel(listing);
  const seller = listing?.seller || listing?.owner || listing?.user;
  const verified = isVerifiedProfile(seller) || listing?.verified || listing?.isVerified;
  const boosted = isListingBoosted(listing);
  const typeLabel = getListingTypeLabel(listing);
  const deliveryLabel = getDeliveryScopeLabel(listing);
  const engagement = getListingEngagement(listing);
  const sellerId = seller?._id || seller?.id || listing?.userId;

  const relatedData = await serverFetch<any>(
    `${API_BASE_URL}/unified-listings/trending?category=${category?.apiCategory || "produce"}&limit=5`,
    { revalidate: 60 }
  );
  const related = (relatedData?.listings ?? relatedData?.data ?? relatedData ?? []).filter(
    (item: any) => String(item?._id || item?.id) !== String(listing?._id || listing?.id)
  ).slice(0, 4);

  return (
    <div className="page-shell py-10 sm:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-stone-500">
        <Link href="/browse" className="hover:text-terra-600">Browse</Link>
        <span>/</span>
        {category ? (
          <>
            <Link href={`/browse/${category.slug}`} className="hover:text-terra-600">{category.label}</Link>
            <span>/</span>
          </>
        ) : null}
        <span className="truncate text-stone-900">{listing?.title || listing?.name}</span>
      </nav>

      <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Left: gallery + details */}
        <div className="space-y-6">
          {/* Gallery */}
          <div className="surface-card overflow-hidden p-4">
            <ListingGallery images={galleryImages} title={listing?.title || listing?.name} />
          </div>

          {/* Title + info */}
          <div className="surface-card p-6">
            <div className="flex flex-wrap items-center gap-2">
              <p className="section-kicker">{typeLabel || category?.label || "Marketplace listing"}</p>
              {verified && (
                <span className="rounded-full border border-forest-200 bg-forest-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-forest-700">
                  Verified
                </span>
              )}
              {boosted && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-semibold text-white">
                  <Zap className="h-3 w-3" /> Boosted
                </span>
              )}
            </div>

            <h1 className="mt-3 text-3xl font-bold text-stone-900 sm:text-4xl">
              {listing?.title || listing?.name}
            </h1>

            <p className="mt-2 text-2xl font-bold text-terra-700">
              {getListingPriceLabel(listing)}
            </p>

            {/* Key stats row */}
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-stone-50 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Location</p>
                <p className="mt-1 text-sm font-semibold text-stone-900">{location || "Kenya"}</p>
              </div>
              <div className="rounded-2xl bg-stone-50 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Availability</p>
                <p className="mt-1 text-sm font-semibold text-stone-900">
                  {listing?.quantity ? `${listing.quantity} ${listing?.unit || ""}`.trim() : "Contact seller"}
                </p>
              </div>
              <div className="rounded-2xl bg-stone-50 px-4 py-3 flex items-center gap-2">
                <Truck className="h-4 w-4 text-stone-400 shrink-0" />
                <p className="text-sm font-semibold text-stone-900">{deliveryLabel}</p>
              </div>
            </div>

            {/* Description */}
            {listing?.description ? (
              <div className="mt-6">
                <h2 className="text-lg font-bold text-stone-900">Description</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-stone-600">
                  {listing.description}
                </p>
              </div>
            ) : null}

            {/* Engagement */}
            {(engagement.views > 0 || engagement.saves > 0 || engagement.reachOuts > 0) && (
              <div className="mt-6 flex flex-wrap gap-5 border-t border-stone-100 pt-4 text-sm text-stone-500">
                {engagement.views > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4" /> {engagement.views} views
                  </span>
                )}
                {engagement.saves > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Bookmark className="h-4 w-4" /> {engagement.saves} saves
                  </span>
                )}
                {engagement.reachOuts > 0 && (
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="h-4 w-4" /> {engagement.reachOuts} reach-outs
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Type-specific details */}
          <ListingTypeDetails listing={listing} />
        </div>

        {/* Right: actions + seller */}
        <div className="space-y-6">
          <ListingActionPanel listing={listing} />
          <ListingSellerPanel
            seller={seller}
            sellerId={String(sellerId || "")}
            listingId={String(listing?._id || listing?.id || "")}
          />
        </div>
      </section>

      {/* Related listings */}
      {related.length > 0 && (
        <section className="mt-16">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-stone-900">Related listings</h2>
            {category ? (
              <Link href={`/browse/${category.slug}`} className="text-sm font-semibold text-terra-600 hover:text-terra-700">
                More {category.shortLabel.toLowerCase()}
              </Link>
            ) : null}
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {related.map((item: any) => (
              <ListingCard key={item._id || item.id} listing={item} compact />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
