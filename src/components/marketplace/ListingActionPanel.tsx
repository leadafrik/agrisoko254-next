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
import { Bookmark, BookmarkCheck, Phone, Share2, Truck, Zap, CheckCircle, BadgeCheck } from "lucide-react";
import { normalizeKenyanPhone } from "@/lib/phone";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

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
  const [soldLoading, setSoldLoading] = useState(false);
  const [isSold, setIsSold] = useState(Boolean(n?.sold));

  const n = normalizeMarketplaceListing(listing);
  const sellerId = n?.seller?._id || n?.userId || n?.owner?._id;
  const sellerObj = n?.seller || n?.owner || n?.user;
  const sellerName = getUserDisplayName(sellerObj);
  const rawPhone = String(sellerObj?.phone || n?.contact || n?.contactPhone || "").trim();
  const sellerPhone = normalizeKenyanPhone(rawPhone) || (rawPhone && /^[+\d][\d\s\-().]{6,}$/.test(rawPhone) ? rawPhone : null);
  const whatsappPhone = normalizeKenyanPhone(rawPhone)?.replace(/^\+/, "") ?? null;
  const location = getLocationLabel(n);
  const verified = isVerifiedProfile(n?.seller || n?.owner) || n?.verified || n?.isVerified;
  const boosted = isListingBoosted(n);
  const deliveryLabel = getDeliveryScopeLabel(n);
  const listingId = String(n?._id || n?.id || "");
  const favorited = isFavorited(listingId);

  const effectivePrice =
    n?.price || n?.pricePerUnit || n?.unitPrice || n?.askingPrice || n?.sellingPrice || n?.basePrice;
  const canCart =
    n?.category !== "service" &&
    Number.isFinite(Number(effectivePrice)) &&
    Number(effectivePrice) > 0;

  const handleAddToCart = (destination: "/cart" | "/checkout" = "/cart") => {
    addItem({
      listingId,
      title: n.title || n.name || "Listing",
      price: Number(effectivePrice),
      quantity,
      unit: n.unit,
      image: getListingImageUrls(n)[0],
      category: n.category,
      county: n.location?.county || n.location?.region || location || undefined,
      sellerName,
      maxQuantity: typeof n.quantity === "number" ? n.quantity : undefined,
    });
    router.push(destination);
  };

  const handleBuyNow = () => {
    handleAddToCart("/checkout");
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) { router.push(`/login?redirect=/listings/${listingId}`); return; }
    setFavLoading(true);
    try { await toggleFavorite(listingId, n?.category || "produce"); }
    catch { /* ignore */ }
    finally { setFavLoading(false); }
  };

  const isOwner = user && sellerId && (user._id === sellerId || (user as any).id === sellerId);

  const handleMarkSold = async () => {
    setSoldLoading(true);
    try {
      await apiRequest(API_ENDPOINTS.unifiedListings.markSold(listingId), { method: "POST" });
      setIsSold(true);
    } catch { /* ignore */ }
    finally { setSoldLoading(false); }
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
      {/* Sold strip */}
      {isSold && (
        <div className="flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white">
          <BadgeCheck className="h-4 w-4 shrink-0" />
          This listing has been marked as sold
        </div>
      )}
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
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={() => handleAddToCart("/cart")} className="secondary-button w-full">
              Add to cart
            </button>
            <button type="button" onClick={handleBuyNow} className="primary-button w-full">
              Buy now
            </button>
          </div>
        </div>
      )}

      {/* Contact seller */}
      <div className="space-y-2">
        {sellerId ? (
          <Link
            href={isAuthenticated ? `/messages?seller=${sellerId}` : `/login?redirect=${encodeURIComponent(`/messages?seller=${sellerId}`)}`}
            className="secondary-button w-full"
          >
            {isAuthenticated ? "Message seller" : "Sign in to message seller"}
          </Link>
        ) : null}
        {whatsappPhone && (
          <a
            href={`https://wa.me/${whatsappPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#25D366] py-2.5 text-sm font-semibold text-[#128C7E] transition hover:bg-[#25D366]/5"
          >
            <svg className="h-4 w-4 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp seller
          </a>
        )}
        {sellerPhone && (
          <a
            href={`tel:${sellerPhone}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
          >
            <Phone className="h-4 w-4 text-stone-400" />
            Call seller
          </a>
        )}
        {!canCart && (
          <Link href="/request" className="secondary-button w-full">Check buyer requests</Link>
        )}
      </div>

      {/* Owner actions */}
      {isOwner && !isSold && (
        <div className="border-t border-stone-100 pt-4">
          <button
            onClick={handleMarkSold}
            disabled={soldLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 disabled:opacity-50"
          >
            <BadgeCheck className="h-4 w-4" />
            {soldLoading ? "Updating..." : "Mark as sold"}
          </button>
        </div>
      )}

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
