import Link from "next/link";
import { formatKes, getCategoryByApi, getInitials, getLocationLabel, getUserDisplayName, isVerifiedProfile } from "@/lib/marketplace";

type ListingCardProps = {
  listing: any;
  href?: string;
  compact?: boolean;
  showSeller?: boolean;
};

export default function ListingCard({
  listing,
  href,
  compact = false,
  showSeller = true,
}: ListingCardProps) {
  const category = getCategoryByApi(listing?.category);
  const image = listing?.images?.[0];
  const location = getLocationLabel(listing);
  const seller = listing?.seller || listing?.user || listing?.owner;
  const sellerName = getUserDisplayName(seller);
  const verified = isVerifiedProfile(seller) || listing?.verified || listing?.isVerified;
  const title = listing?.title || listing?.name || "Marketplace listing";
  const listingHref = href || `/listings/${listing?._id || listing?.id}`;

  return (
    <Link
      href={listingHref}
      className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-stone-200 bg-white shadow-[0_20px_50px_-35px_rgba(120,83,47,0.45)] transition duration-200 hover:-translate-y-1 hover:border-terra-200 hover:shadow-[0_30px_60px_-35px_rgba(120,83,47,0.55)]"
    >
      <div className={compact ? "aspect-[4/3] bg-stone-100" : "aspect-[4/3] bg-stone-100"}>
        {image ? (
          <img src={image} alt={title} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
        ) : (
          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(160,69,46,0.14),_transparent_55%),linear-gradient(135deg,#fffdf8,#f2ece2)] text-sm font-semibold uppercase tracking-[0.2em] text-stone-400">
            Agrisoko
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terra-600">
              {category?.shortLabel || "Listing"}
            </p>
            <h3 className="mt-2 line-clamp-2 text-xl font-semibold text-stone-900 transition group-hover:text-terra-600">
              {title}
            </h3>
          </div>
          {verified ? (
            <span className="rounded-full border border-forest-200 bg-forest-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-forest-700">
              Verified
            </span>
          ) : null}
        </div>

        {listing?.description ? (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-stone-600">{listing.description}</p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-stone-500">
          {location ? <span>{location}</span> : null}
          {listing?.quantity ? (
            <span>
              {listing.quantity} {listing?.unit || ""}
            </span>
          ) : null}
        </div>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Price</p>
            <p className="mt-1 text-2xl font-bold text-stone-900">{formatKes(listing?.price) || "Negotiable"}</p>
          </div>
          <span className="text-sm font-semibold text-terra-600">View details</span>
        </div>

        {showSeller ? (
          <div className="mt-5 flex items-center gap-3 border-t border-stone-100 pt-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-terra-100 text-sm font-semibold text-terra-700">
              {getInitials(sellerName)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-stone-900">{sellerName}</p>
              <p className="truncate text-xs text-stone-500">
                {verified ? "Identity cues available" : "Marketplace seller"}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </Link>
  );
}

