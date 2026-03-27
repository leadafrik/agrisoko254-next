import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ListingActionPanel from "@/components/marketplace/ListingActionPanel";
import ListingGallery from "@/components/marketplace/ListingGallery";
import ListingMapSection from "@/components/marketplace/ListingMapSection";
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
import { Eye, Bookmark, MessageCircle, Truck, Zap, CheckCircle, MapPin } from "lucide-react";

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
  const title = listing.title || listing.name || "Marketplace listing";
  const priceLabel = getListingPriceLabel(listing);
  const location = getLocationLabel(listing);
  const seller = listing?.seller || listing?.owner || listing?.user;
  const sellerName = seller?.fullName || seller?.name || "Verified seller";

  const descriptionParts = [
    priceLabel && priceLabel !== "Contact for price" ? `${priceLabel}.` : null,
    location ? `Available in ${location}.` : null,
    listing.description ? listing.description.slice(0, 120).replace(/\s+/g, " ").trim() : null,
    `Sold by ${sellerName} on Agrisoko Kenya.`,
  ].filter(Boolean);
  const description = descriptionParts.join(" ") || "View listing details on Agrisoko, Kenya's agricultural marketplace.";

  const canonicalUrl = `https://www.agrisoko254.com/listings/${params.id}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title,
      description,
      images: images[0]
        ? [{ url: images[0], width: 1200, height: 630, alt: title }]
        : [{ url: "https://www.agrisoko254.com/og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images[0] ? [images[0]] : ["https://www.agrisoko254.com/og-image.png"],
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
  const sellerId = seller?._id || seller?.id || listing?.userId;
  const verified = isVerifiedProfile(seller) || listing?.verified || listing?.isVerified;
  const boosted = isListingBoosted(listing);
  const typeLabel = getListingTypeLabel(listing);
  const deliveryLabel = getDeliveryScopeLabel(listing);
  const engagement = getListingEngagement(listing);
  const listingId = String(listing?._id || listing?.id || "");
  const latitude = Number(listing?.location?.coordinates?.lat);
  const longitude = Number(listing?.location?.coordinates?.lng);

  // Parallel fetch: related + more from seller
  const [relatedData, sellerListingsData] = await Promise.all([
    serverFetch<any>(
      `${API_BASE_URL}/unified-listings/trending?category=${category?.apiCategory || "produce"}&limit=6`,
      { revalidate: 60 }
    ),
    sellerId
      ? serverFetch<any>(
          `${API_BASE_URL}/unified-listings?userId=${sellerId}&limit=5&status=approved`,
          { revalidate: 60 }
        )
      : Promise.resolve(null),
  ]);

  const related = (relatedData?.listings ?? relatedData?.data ?? relatedData ?? [])
    .filter((item: any) => String(item?._id || item?.id) !== listingId)
    .slice(0, 4);

  const sellerListings = ((sellerListingsData?.data ?? sellerListingsData?.listings ?? sellerListingsData ?? []) as any[])
    .filter((item: any) => String(item?._id || item?.id) !== listingId)
    .slice(0, 4);

  const hasEngagement = engagement.views > 0 || engagement.saves > 0 || engagement.reachOuts > 0;

  const numericPrice = Number(
    listing?.price || listing?.pricePerUnit || listing?.unitPrice ||
    listing?.askingPrice || listing?.sellingPrice || listing?.basePrice || 0
  );
  const sellerName = seller?.fullName || seller?.name || "Agrisoko Seller";
  const county = listing?.location?.county || seller?.county || null;
  const galleryImagesForSchema = getListingImageUrls(listing);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing?.title || listing?.name,
    description: listing?.description || undefined,
    image: galleryImagesForSchema.length ? galleryImagesForSchema : undefined,
    category: category?.label || listing?.category || undefined,
    brand: { "@type": "Brand", name: "Agrisoko" },
    offers: {
      "@type": "Offer",
      priceCurrency: "KES",
      price: numericPrice > 0 ? numericPrice : undefined,
      priceValidUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      availability: "https://schema.org/InStock",
      url: `https://www.agrisoko254.com/listings/${listingId}`,
      seller: {
        "@type": "Person",
        name: sellerName,
        ...(sellerId ? { url: `https://www.agrisoko254.com/sellers/${sellerId}` } : {}),
      },
      availableAtOrFrom: county
        ? {
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              addressRegion: county,
              addressCountry: "KE",
            },
          }
        : undefined,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Browse", item: "https://www.agrisoko254.com/browse" },
      ...(category
        ? [{ "@type": "ListItem", position: 2, name: category.label, item: `https://www.agrisoko254.com/browse/${category.slug}` }]
        : []),
      { "@type": "ListItem", position: category ? 3 : 2, name: listing?.title || listing?.name },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    <div className="page-shell py-8 sm:py-10">
      <Link
        href="/browse"
        className="mb-4 inline-flex text-sm font-semibold text-terra-600 transition hover:text-terra-700"
      >
        Back to listings
      </Link>

      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-stone-500">
        <Link href="/browse" className="hover:text-terra-600 transition-colors">Browse</Link>
        <span className="text-stone-300">/</span>
        {category ? (
          <>
            <Link href={`/browse/${category.slug}`} className="hover:text-terra-600 transition-colors">{category.label}</Link>
            <span className="text-stone-300">/</span>
          </>
        ) : null}
        <span className="truncate text-stone-700 font-medium">{listing?.title || listing?.name}</span>
      </nav>

      {/* Main layout */}
      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        {/* LEFT */}
        <div className="space-y-5 min-w-0">
          {/* Gallery */}
          <div className="overflow-hidden rounded-[28px] border border-stone-200 bg-white p-4 shadow-[0_20px_50px_-30px_rgba(120,83,47,0.25)]">
            <ListingGallery images={galleryImages} title={listing?.title || listing?.name} />
          </div>

          {/* Title + core info */}
          <div className="overflow-hidden rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_20px_50px_-30px_rgba(120,83,47,0.15)]">
            {/* Type + badges row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terra-600">
                {typeLabel || category?.label || "Marketplace listing"}
              </span>
              {verified && (
                <span className="inline-flex items-center gap-1 rounded-full border border-forest-200 bg-forest-50 px-2.5 py-1 text-[11px] font-semibold text-forest-700">
                  <CheckCircle className="h-3 w-3" /> Verified
                </span>
              )}
              {boosted && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-semibold text-white">
                  <Zap className="h-3 w-3" /> Boosted
                </span>
              )}
            </div>

            <h1 className="mt-3 text-2xl font-bold text-stone-900 sm:text-3xl leading-snug">
              {listing?.title || listing?.name}
            </h1>

            <p className="mt-2 text-2xl font-bold text-terra-600">
              {getListingPriceLabel(listing)}
            </p>

            {/* Stats row */}
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {location ? (
                <div className="flex items-center gap-2.5 rounded-2xl bg-stone-50 px-4 py-3">
                  <MapPin className="h-4 w-4 shrink-0 text-stone-400" />
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-stone-400">Location</p>
                    <p className="text-sm font-semibold text-stone-900">{location}</p>
                  </div>
                </div>
              ) : null}
              <div className="flex items-center gap-2.5 rounded-2xl bg-stone-50 px-4 py-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-stone-400">Availability</p>
                  <p className="text-sm font-semibold text-stone-900">
                    {listing?.quantity ? `${listing.quantity} ${listing?.unit ?? ""}`.trim() : "Contact seller"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-2xl bg-stone-50 px-4 py-3">
                <Truck className="h-4 w-4 shrink-0 text-stone-400" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-stone-400">Delivery</p>
                  <p className="text-sm font-semibold text-stone-900">{deliveryLabel}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {listing?.description ? (
              <div className="mt-6 border-t border-stone-100 pt-5">
                <h2 className="text-base font-bold text-stone-900">About this listing</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-stone-600">
                  {listing.description}
                </p>
              </div>
            ) : null}

            {/* Engagement */}
            {hasEngagement && (
              <div className="mt-5 flex flex-wrap gap-5 border-t border-stone-100 pt-4 text-sm text-stone-400">
                {engagement.views > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4" /> {engagement.views.toLocaleString()} views
                  </span>
                )}
                {engagement.saves > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Bookmark className="h-4 w-4" /> {engagement.saves.toLocaleString()} saves
                  </span>
                )}
                {engagement.reachOuts > 0 && (
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="h-4 w-4" /> {engagement.reachOuts.toLocaleString()} reach-outs
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Type-specific details */}
          <ListingTypeDetails listing={listing} />

          {Number.isFinite(latitude) && Number.isFinite(longitude) ? (
            <ListingMapSection lat={latitude} lng={longitude} />
          ) : null}
        </div>

        {/* RIGHT — sticky on xl */}
        <div className="space-y-5">
          <div className="xl:sticky xl:top-24 space-y-5">
            <ListingActionPanel listing={listing} />
            <ListingSellerPanel
              seller={seller}
              sellerId={String(sellerId || "")}
              listingId={listingId}
              listingContact={listing?.contact || listing?.contactPhone || seller?.phone || null}
            />
          </div>
        </div>
      </div>

      {/* More from seller */}
      {sellerListings.length > 0 && (
        <section className="mt-14">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="section-kicker">Same seller</p>
              <h2 className="mt-1 text-2xl font-bold text-stone-900">
                More from this seller
              </h2>
            </div>
            {sellerId && (
              <Link
                href={`/sellers/${sellerId}`}
                className="text-sm font-semibold text-terra-600 hover:text-terra-700 transition-colors"
              >
                View all
              </Link>
            )}
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {sellerListings.map((item: any) => (
              <ListingCard key={item._id || item.id} listing={item} compact />
            ))}
          </div>
        </section>
      )}

      {/* Related listings */}
      {related.length > 0 && (
        <section className="mt-14">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="section-kicker">{category?.label || "Similar"}</p>
              <h2 className="mt-1 text-2xl font-bold text-stone-900">Related listings</h2>
            </div>
            {category ? (
              <Link
                href={`/browse/${category.slug}`}
                className="text-sm font-semibold text-terra-600 hover:text-terra-700 transition-colors"
              >
                Browse {category.shortLabel.toLowerCase()}
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
    </>
  );
}
