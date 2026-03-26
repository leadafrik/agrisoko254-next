"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import {
  getDeliveryScopeLabel,
  getListingImageUrls,
  getListingPriceLabel,
  getLocationLabel,
  getUserDisplayName,
  isListingBoosted,
  isVerifiedProfile,
  normalizeMarketplaceListing,
} from "@/lib/marketplace";
import { Bookmark, BookmarkCheck, Share2, Truck, Zap, CheckCircle } from "lucide-react";

type ListingActionPanelProps = {
  listing: any;
};

export default function ListingActionPanel({ listing }: ListingActionPanelProps) {
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const { isFavorited, toggleFavorite } = useFavorites();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [shareFeedback, setShareFeedback] = useState("");
  const [favLoading, setFavLoading] = useState(false);

  const n = normalizeMarketplaceListing(listing);
  const sellerId = n?.seller?._id || n?.userId || n?.owner?._id;
  const sellerName = getUserDisplayName(n?.seller || n?.owner || n?.user);
  const location = getLocationLabel(n);
  const verified = isVerifiedProfile(n?.seller || n?.owner) || n?.verified || n?.isVerified;
  const boosted = isListingBoosted(n);
  const deliveryLabel = getDeliveryScopeLabel(n);
  const listingId = String(n?._id || n?.id || "");
  const favorited = isFavorited(listingId);

  const canCart =
    n?.category !== "service" &&
    typeof n?.price === "number" &&
    Number.isFinite(n.price) &&
    n.price > 0;

  const handleAddToCart = () => {
    addItem({
      listingId,
      title: n.title || n.name || "Listing",
      price: Number(n.price),
      quantity,
      unit: n.unit,
      image: getListingImageUrls(n)[0],
      category: n.category,
      county: n.location?.county || n.location?.region || location || undefined,
      sellerName,
      maxQuantity: typeof n.quantity === "number" ? n.quantity : undefined,
    });
    router.push("/cart");
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) { router.push(`/login?redirect=/listings/${listingId}`); return; }
    setFavLoading(true);
    try { await toggleFavorite(listingId, n?.category || "produce"); }
    catch { /* ignore */ }
    finally { setFavLoading(false); }
  };

  const handleShare = async () => {
    const url = `${typeof window !== "undefined" ? window.location.href : ""}`;
    try {
      if ((navigator as any).share) {
        await (navigator as any).share({ title: n?.title || n?.name, text: n?.description, url });
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setShareFeedback("Link copied!");
        setTimeout(() => setShareFeedback(""), 2200);
        return;
      }
      window.prompt("Copy this listing link:", url);
    } catch { /* cancelled */ }
  };

  return (
    <div className="surface-card p-5 space-y-5">
      {/* Price + badges */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Price</p>
          <p className="mt-1.5 text-3xl font-bold text-stone-900">{getListingPriceLabel(n)}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
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
      </div>

      {/* Delivery scope */}
      <div className="flex items-center gap-2 rounded-xl bg-stone-50 px-3 py-2.5">
        <Truck className="h-4 w-4 shrink-0 text-stone-400" />
        <span className="text-sm font-medium text-stone-700">{deliveryLabel}</span>
      </div>

      {/* Cart */}
      {canCart && (
        <div>
          <label className="field-label">Quantity</label>
          <input
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value || 1)))}
            className="field-input"
          />
          <button type="button" onClick={handleAddToCart} className="primary-button mt-3 w-full">
            Add to cart
          </button>
        </div>
      )}

      {/* Message seller */}
      <div className="space-y-2">
        {sellerId ? (
          <Link
            href={isAuthenticated ? `/messages?seller=${sellerId}` : `/login?redirect=${encodeURIComponent(`/messages?seller=${sellerId}`)}`}
            className="secondary-button w-full"
          >
            {isAuthenticated ? "Message seller" : "Sign in to message seller"}
          </Link>
        ) : null}
        {!canCart && (
          <Link href="/request" className="secondary-button w-full">Check buyer requests</Link>
        )}
      </div>

      {/* Save + Share */}
      <div className="flex gap-2 border-t border-stone-100 pt-4">
        <button
          onClick={handleToggleFavorite}
          disabled={favLoading}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-stone-200 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 disabled:opacity-50"
        >
          {favorited
            ? <><BookmarkCheck className="h-4 w-4 text-terra-600" /> Saved</>
            : <><Bookmark className="h-4 w-4" /> Save</>
          }
        </button>
        <button
          onClick={handleShare}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-stone-200 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
        >
          <Share2 className="h-4 w-4" />
          {shareFeedback || "Share"}
        </button>
      </div>
    </div>
  );
}
