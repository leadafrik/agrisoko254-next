"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, Bookmark, MessageCircle, ShoppingCart, Zap } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import {
  formatLastActive,
  getCategoryByApi,
  getDeliveryScopeLabel,
  getInitials,
  getListingEngagement,
  getListingPriceLabel,
  getListingTypeLabel,
  getLocationLabel,
  getPrimaryImageUrl,
  getUserDisplayName,
  isListingBoosted,
  isVerifiedProfile,
  normalizeMarketplaceListing,
} from "@/lib/marketplace";

type ListingCardProps = {
  listing: any;
  href?: string;
  compact?: boolean;
  showSeller?: boolean;
};

function ListingImage({
  src,
  alt,
  sizes,
}: {
  src?: string | null;
  alt: string;
  sizes: string;
}) {
  if (!src) {
    return (
      <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(160,69,46,0.14),_transparent_55%),linear-gradient(135deg,#fffdf8,#f2ece2)] text-sm font-semibold uppercase tracking-[0.2em] text-stone-400">
        Agrisoko
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
    </div>
  );
}

export default function ListingCard({
  listing,
  href,
  compact = false,
  showSeller = true,
}: ListingCardProps) {
  const { addItem } = useCart();
  const normalized = normalizeMarketplaceListing(listing);
  const category = getCategoryByApi(normalized?.category);
  const image = getPrimaryImageUrl(normalized, {
    width: compact ? 640 : 720,
    height: compact ? 480 : 540,
    fit: "fill",
  });
  const location = getLocationLabel(normalized);
  const seller = normalized?.seller || normalized?.user || normalized?.owner;
  const sellerName = getUserDisplayName(seller);
  const sellerAvatar = seller?.profilePicture || seller?.avatar || null;
  const verified = isVerifiedProfile(seller) || normalized?.verified || normalized?.isVerified;
  const boosted = isListingBoosted(normalized);
  const title = normalized?.title || normalized?.name || "Marketplace listing";
  const listingHref = href || `/listings/${normalized?._id || normalized?.id}`;
  const priceLabel = getListingPriceLabel(normalized);
  const typeLabel = getListingTypeLabel(normalized);
  const deliveryLabel = getDeliveryScopeLabel(normalized);
  const engagement = getListingEngagement(normalized);
  const lastActive = formatLastActive(
    seller?.lastActive || seller?.updatedAt || normalized?.updatedAt
  );
  const responseTime = seller?.responseTime || seller?.responseTimeLabel || null;
  const hasEngagement =
    engagement.views > 0 || engagement.saves > 0 || engagement.reachOuts > 0;
  const imageSizes = compact
    ? "(min-width: 1280px) 22rem, (min-width: 640px) 50vw, 100vw"
    : "(min-width: 1280px) 20rem, (min-width: 640px) 50vw, 100vw";

  if (compact) {
    return (
      <Link
        href={listingHref}
        className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-stone-200 bg-white shadow-[0_20px_50px_-35px_rgba(120,83,47,0.45)] transition duration-200 hover:-translate-y-1 hover:border-terra-200 hover:shadow-[0_30px_60px_-35px_rgba(120,83,47,0.55)]"
      >
        <div className="aspect-[4/3] overflow-hidden bg-stone-100">
          <div className="h-full transition duration-300 group-hover:scale-[1.03]">
            <ListingImage src={image} alt={title} sizes={imageSizes} />
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terra-600">
            {typeLabel || category?.shortLabel || "Listing"}
          </p>
          <h2 className="mt-2 line-clamp-2 text-xl font-semibold text-stone-900 transition group-hover:text-terra-600">
            {title}
          </h2>
          <div className="mt-5 flex items-end justify-between gap-4">
            <p className="text-2xl font-bold text-stone-900">{priceLabel}</p>
            <span className="text-sm font-semibold text-terra-600">View details</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-stone-200 bg-white shadow-[0_20px_50px_-35px_rgba(120,83,47,0.3)] transition duration-200 hover:-translate-y-0.5 hover:border-terra-200 hover:shadow-[0_30px_60px_-35px_rgba(120,83,47,0.45)]">
      <Link href={listingHref} className="block aspect-[4/3] overflow-hidden bg-stone-100">
        <div className="transition duration-300 group-hover:scale-[1.03]">
          <ListingImage src={image} alt={title} sizes={imageSizes} />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          {boosted ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-semibold text-white">
              <Zap className="h-3 w-3" />
              Boosted
            </span>
          ) : null}
          {verified ? (
            <span className="rounded-full border border-forest-200 bg-forest-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-forest-700">
              Verified
            </span>
          ) : null}
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-terra-600">
            {typeLabel || category?.shortLabel || "Listing"}
          </span>
        </div>

        <Link href={listingHref} className="mt-2 block">
          <h2 className="line-clamp-2 text-lg font-semibold leading-snug text-stone-900 transition hover:text-terra-600">
            {title}
          </h2>
        </Link>
        <p className="mt-1 text-xl font-bold text-stone-900">{priceLabel}</p>

        {normalized?.description ? (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-stone-500">
            {normalized.description}
          </p>
        ) : null}

        {showSeller ? (
          <div className="mt-3 flex items-center gap-2">
            {sellerAvatar ? (
              <div className="relative h-7 w-7 overflow-hidden rounded-full border border-stone-200">
                <Image
                  src={sellerAvatar}
                  alt={sellerName}
                  fill
                  sizes="28px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-terra-100 text-[10px] font-semibold text-terra-700">
                {getInitials(sellerName)}
              </div>
            )}
            <p className="truncate text-xs font-medium text-stone-700">{sellerName}</p>
          </div>
        ) : null}

        <div className="mt-3 space-y-1">
          {location ? (
            <p className="truncate text-[11px] text-stone-500">{location}</p>
          ) : null}
          <p className="text-[11px] font-medium text-stone-600">{deliveryLabel}</p>
        </div>

        {responseTime || lastActive ? (
          <p className="mt-1.5 text-[11px] text-stone-400">
            {[responseTime && `Responds ${responseTime}`, lastActive]
              .filter(Boolean)
              .join(" · ")}
          </p>
        ) : null}

        {hasEngagement ? (
          <div className="mt-3 flex items-center gap-4 border-t border-stone-100 pt-3">
            {engagement.views > 0 ? (
              <span className="flex items-center gap-1 text-[11px] text-stone-400">
                <Eye className="h-3 w-3" />
                {engagement.views} views
              </span>
            ) : null}
            {engagement.saves > 0 ? (
              <span className="flex items-center gap-1 text-[11px] text-stone-400">
                <Bookmark className="h-3 w-3" />
                {engagement.saves} saves
              </span>
            ) : null}
            {engagement.reachOuts > 0 ? (
              <span className="flex items-center gap-1 text-[11px] text-stone-400">
                <MessageCircle className="h-3 w-3" />
                {engagement.reachOuts} reach-outs
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="flex-1" />

        <div className="mt-4 flex gap-2">
          <Link
            href={listingHref}
            className="flex-1 rounded-xl border border-stone-200 py-2 text-center text-sm font-semibold text-stone-700 transition hover:border-terra-300 hover:bg-terra-50"
          >
            View details
          </Link>
          {normalized?.category !== "service" ? (
            <button
              onClick={() => addItem(normalized)}
              className="flex items-center gap-1.5 rounded-xl bg-terra-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-terra-600"
              aria-label="Add to cart"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
