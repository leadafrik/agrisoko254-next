"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { formatKes, getLocationLabel, getUserDisplayName } from "@/lib/marketplace";

type ListingActionPanelProps = {
  listing: any;
};

export default function ListingActionPanel({ listing }: ListingActionPanelProps) {
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);

  const sellerId = listing?.seller?._id || listing?.userId || listing?.owner?._id;
  const sellerName = getUserDisplayName(listing?.seller || listing?.owner || listing?.user);
  const location = getLocationLabel(listing);
  const canCart = typeof listing?.price === "number" && Number.isFinite(listing.price) && listing.price > 0;

  const handleAddToCart = () => {
    addItem({
      listingId: listing._id || listing.id,
      title: listing.title || listing.name || "Listing",
      price: Number(listing.price),
      quantity,
      unit: listing.unit,
      image: listing.images?.[0],
      category: listing.category,
      county: listing.location?.county || listing.location?.region || location || undefined,
      sellerName,
      maxQuantity: typeof listing.quantity === "number" ? listing.quantity : undefined,
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
            {formatKes(listing?.price) || "Negotiable"}
          </p>
        </div>
        {listing?.verified || listing?.isVerified ? (
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
