"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import {
  getListingImageUrls,
  getListingPriceLabel,
  getLocationLabel,
  getUserDisplayName,
  normalizeMarketplaceListing,
} from "@/lib/marketplace";

type ListingActionPanelProps = {
  listing: any;
};

export default function ListingActionPanel({ listing }: ListingActionPanelProps) {
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const normalizedListing = normalizeMarketplaceListing(listing);

  const sellerId = normalizedListing?.seller?._id || normalizedListing?.userId || normalizedListing?.owner?._id;
  const sellerName = getUserDisplayName(normalizedListing?.seller || normalizedListing?.owner || normalizedListing?.user);
  const location = getLocationLabel(normalizedListing);
  const canCart =
    normalizedListing?.category !== "service" &&
    typeof normalizedListing?.price === "number" &&
    Number.isFinite(normalizedListing.price) &&
    normalizedListing.price > 0;

  const handleAddToCart = () => {
    addItem({
      listingId: normalizedListing._id || normalizedListing.id,
      title: normalizedListing.title || normalizedListing.name || "Listing",
      price: Number(normalizedListing.price),
      quantity,
      unit: normalizedListing.unit,
      image: getListingImageUrls(normalizedListing)[0],
      category: normalizedListing.category,
      county: normalizedListing.location?.county || normalizedListing.location?.region || location || undefined,
      sellerName,
      maxQuantity: typeof normalizedListing.quantity === "number" ? normalizedListing.quantity : undefined,
    });
    router.push("/cart");
  };

  return (
    <div className="surface-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
            Price
          </p>
          <p className="mt-2 text-3xl font-bold text-stone-900">
            {getListingPriceLabel(normalizedListing)}
          </p>
        </div>
        {normalizedListing?.verified || normalizedListing?.isVerified ? (
          <span className="rounded-full border border-forest-200 bg-forest-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-forest-700">
            Verified
          </span>
        ) : null}
      </div>

      {canCart ? (
        <div className="mt-5">
          <label className="field-label">Quantity</label>
          <input
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(event) => setQuantity(Math.max(1, Number(event.target.value || 1)))}
            className="field-input"
          />
          <button type="button" onClick={handleAddToCart} className="primary-button mt-4 w-full">
            Add to cart
          </button>
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {sellerId ? (
          <Link
            href={isAuthenticated ? `/messages?seller=${sellerId}` : `/login?redirect=${encodeURIComponent(`/messages?seller=${sellerId}`)}`}
            className="secondary-button w-full"
          >
            {isAuthenticated ? "Message seller" : "Sign in to message seller"}
          </Link>
        ) : null}
        {!canCart && (
          <Link href="/request" className="secondary-button w-full">
            Check buyer requests
          </Link>
        )}
      </div>
    </div>
  );
}
