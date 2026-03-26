"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageCircle, Share2, UserCheck, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { normalizeKenyanPhone } from "@/lib/phone";
import {
  getSellerFollowStats,
  getSellerFollowStatus,
  toggleSellerFollow,
} from "@/services/sellerFollowService";

function IconWhatsApp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

interface Props {
  sellerId: string;
  initialFollowerCount: number;
  whatsappPhone?: string | null;
}

export default function SellerProfileActions({ sellerId, initialFollowerCount, whatsappPhone }: Props) {
  const { user, isAuthenticated } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [followLoading, setFollowLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [shareFeedback, setShareFeedback] = useState("");

  const isOwnProfile = isAuthenticated && String(user?._id) === String(sellerId);
  const normalizedPhone = whatsappPhone ? normalizeKenyanPhone(whatsappPhone) : null;
  const waNumber = normalizedPhone?.replace(/^\+/, "") ?? null;

  useEffect(() => {
    if (!sellerId || initialized) return;
    setInitialized(true);
    if (isAuthenticated && !isOwnProfile) {
      getSellerFollowStatus(sellerId)
        .then((s) => { setIsFollowing(Boolean(s.isFollowing)); setFollowerCount(s.followerCount || initialFollowerCount); })
        .catch(() => {});
    } else {
      getSellerFollowStats(sellerId)
        .then((s) => { setFollowerCount(s.followerCount || initialFollowerCount); })
        .catch(() => {});
    }
  }, [sellerId, isAuthenticated, isOwnProfile, initialized, initialFollowerCount]);

  const handleFollow = async () => {
    if (!isAuthenticated || !sellerId) return;
    setFollowLoading(true);
    try {
      const result = await toggleSellerFollow(sellerId);
      setIsFollowing(Boolean(result.isFollowing));
      setFollowerCount(result.followerCount ?? followerCount);
    } catch { /* ignore */ }
    finally { setFollowLoading(false); }
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if ((navigator as any).share) { await (navigator as any).share({ url }); return; }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setShareFeedback("Copied!");
        setTimeout(() => setShareFeedback(""), 2000);
        return;
      }
      window.prompt("Copy link:", url);
    } catch { /* cancelled */ }
  };

  return (
    <div className="space-y-3">
      {/* Follower count */}
      {followerCount > 0 && (
        <p className="text-sm text-stone-500">
          <span className="font-semibold text-stone-900">{followerCount.toLocaleString()}</span>{" "}
          follower{followerCount === 1 ? "" : "s"}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {!isOwnProfile && (
          <Link
            href={
              isAuthenticated
                ? `/messages?seller=${sellerId}`
                : `/login?redirect=${encodeURIComponent(`/sellers/${sellerId}`)}`
            }
            className="inline-flex items-center gap-2 rounded-xl bg-terra-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-terra-600"
          >
            <MessageCircle className="h-4 w-4" />
            {isAuthenticated ? "Message" : "Sign in to message"}
          </Link>
        )}

        {waNumber && (
          <a
            href={`https://wa.me/${waNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-[#25D366] px-4 py-2.5 text-sm font-semibold text-[#128C7E] transition hover:bg-[#25D366]/5"
          >
            <IconWhatsApp className="h-4 w-4 text-[#25D366]" />
            WhatsApp
          </a>
        )}

        {!isOwnProfile && (
          <button
            type="button"
            onClick={handleFollow}
            disabled={followLoading || !isAuthenticated}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
              isFollowing
                ? "border-forest-300 bg-forest-50 text-forest-700 hover:bg-forest-100"
                : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
            }`}
          >
            {isFollowing ? (
              <><UserCheck className="h-4 w-4" /> Following</>
            ) : (
              <><UserPlus className="h-4 w-4" /> Follow</>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-600 transition hover:bg-stone-50"
        >
          <Share2 className="h-4 w-4" />
          {shareFeedback || "Share"}
        </button>
      </div>
    </div>
  );
}
