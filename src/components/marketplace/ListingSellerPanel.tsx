"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  formatLastActive,
  getInitials,
  getUserDisplayName,
  isVerifiedProfile,
} from "@/lib/marketplace";
import { normalizeKenyanPhone } from "@/lib/phone";
import {
  getSellerFollowStats,
  getSellerFollowStatus,
  toggleSellerFollow,
} from "@/services/sellerFollowService";
import { submitReport } from "@/services/reportService";
import {
  CheckCircle,
  Clock,
  Flag,
  MessageCircle,
  Phone,
  Star,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";

interface Props {
  seller: any;
  listingId?: string;
  sellerId?: string;
  listingContact?: string | null;
}

export default function ListingSellerPanel({
  seller,
  listingId,
  sellerId,
  listingContact,
}: Props) {
  const { user, isAuthenticated } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState<number>(seller?.followerCount || 0);
  const [followLoading, setFollowLoading] = useState(false);
  const [followInitialized, setFollowInitialized] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reporting, setReporting] = useState(false);
  const [reportDone, setReportDone] = useState(false);

  const name = getUserDisplayName(seller);
  const verified = isVerifiedProfile(seller);
  const avatar = seller?.profilePicture || seller?.avatar || null;
  const ratingAverage = seller?.ratings?.average ?? seller?.ratingAverage ?? 0;
  const ratingCount = seller?.ratings?.count ?? seller?.ratingCount ?? 0;
  const lastActive = formatLastActive(seller?.lastActive || seller?.updatedAt);
  const responseTime = seller?.responseTime || seller?.responseTimeLabel || null;
  const rawPhoneInput = String(listingContact || seller?.phone || seller?.contact || "").trim();
  const sellerPhone = normalizeKenyanPhone(rawPhoneInput) || null;
  // For tel: links use normalized form if available, otherwise use raw if it looks like a phone
  const callPhone =
    sellerPhone ||
    (rawPhoneInput && /^[+\d][\d\s\-().]{6,}$/.test(rawPhoneInput) ? rawPhoneInput : null);
  const whatsappPhone = sellerPhone ? sellerPhone.replace(/^\+/, "") : null;
  const resolvedSellerId = sellerId || seller?._id || seller?.id;
  const isOwnProfile =
    isAuthenticated && user?._id && String(user._id) === String(resolvedSellerId);
  const listingHref = listingId ? `/listings/${listingId}` : "/browse";
  const roundedRating = Math.round(ratingAverage);

  const initializeFollow = async () => {
    if (followInitialized || !resolvedSellerId) return;
    setFollowInitialized(true);
    try {
      if (isAuthenticated && !isOwnProfile) {
        const status = await getSellerFollowStatus(resolvedSellerId);
        setIsFollowing(Boolean(status.isFollowing));
        setFollowerCount(status.followerCount || followerCount);
      } else {
        const stats = await getSellerFollowStats(resolvedSellerId);
        setFollowerCount(stats.followerCount || followerCount);
      }
    } catch {
      // Non-blocking. The panel still works without the initial follow state.
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated || !resolvedSellerId) return;
    if (!followInitialized) await initializeFollow();

    setFollowLoading(true);
    try {
      const result = await toggleSellerFollow(resolvedSellerId);
      setIsFollowing(Boolean(result.isFollowing));
      setFollowerCount(result.followerCount ?? followerCount);
    } catch {
      // Ignore transient follow failures in the panel UI.
    } finally {
      setFollowLoading(false);
    }
  };

  const handleReport = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resolvedSellerId || !reportReason) return;

    setReporting(true);
    try {
      await submitReport(resolvedSellerId, reportReason, reportDescription, listingId);
      setReportDone(true);
    } catch {
      // Ignore report failures in inline UI. User can retry.
    } finally {
      setReporting(false);
    }
  };

  return (
    <div className="surface-card p-6">
      <p className="section-kicker mb-4">Seller profile</p>

      <div className="flex items-start gap-4">
        {avatar ? (
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-stone-200">
            <Image src={avatar} alt={name} fill sizes="56px" className="object-cover" />
          </div>
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-terra-100 text-base font-semibold text-terra-700">
            {getInitials(name)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold text-stone-900">{name}</h2>
          {verified ? (
            <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-forest-700">
              <CheckCircle className="h-3.5 w-3.5" />
              Verified
            </span>
          ) : (
            <p className="text-xs text-stone-500">Marketplace seller</p>
          )}
        </div>
      </div>

      {ratingCount > 0 ? (
        <div className="mt-4 flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= roundedRating
                    ? "fill-amber-400 text-amber-400"
                    : "text-stone-200"
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-stone-900">
            {ratingAverage.toFixed(1)}
          </span>
          <span className="text-xs text-stone-500">
            ({ratingCount} review{ratingCount === 1 ? "" : "s"})
          </span>
        </div>
      ) : null}

      <div className="mt-4 space-y-1.5 text-xs text-stone-500">
        {followerCount > 0 ? (
          <p className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {followerCount} follower{followerCount === 1 ? "" : "s"}
          </p>
        ) : null}
        {responseTime ? (
          <p className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Responds {responseTime}
          </p>
        ) : null}
        {lastActive ? (
          <p className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-forest-400" />
            {lastActive}
          </p>
        ) : null}
      </div>

      <div className="mt-5 space-y-2">
        <Link
          href={resolvedSellerId ? `/sellers/${resolvedSellerId}` : "/browse"}
          className="secondary-button w-full"
        >
          View profile
        </Link>

        {resolvedSellerId ? (
          <Link
            href={
              isAuthenticated
                ? `/messages?seller=${resolvedSellerId}`
                : `/login?redirect=${encodeURIComponent(`/messages?seller=${resolvedSellerId}`)}`
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-terra-500 py-2.5 text-sm font-semibold text-white transition hover:bg-terra-600"
          >
            <MessageCircle className="h-4 w-4" />
            {isAuthenticated ? "Message" : "Sign in to message"}
          </Link>
        ) : null}

        {whatsappPhone ? (
          <a
            href={`https://wa.me/${whatsappPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#25D366] py-2.5 text-sm font-semibold text-[#128C7E] transition hover:bg-[#25D366]/5"
          >
            <MessageCircle className="h-4 w-4 text-[#25D366]" />
            WhatsApp
          </a>
        ) : null}

        {callPhone ? (
          isAuthenticated ? (
            <a
              href={`tel:${callPhone}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
            >
              <Phone className="h-4 w-4" />
              Call seller
            </a>
          ) : (
            <Link
              href={`/login?redirect=${encodeURIComponent(listingHref)}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
            >
              <Phone className="h-4 w-4" />
              Log in to call
            </Link>
          )
        ) : null}

        {isAuthenticated && !isOwnProfile && resolvedSellerId ? (
          <button
            onClick={handleFollow}
            onMouseEnter={initializeFollow}
            disabled={followLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 disabled:opacity-50"
          >
            {isFollowing ? (
              <>
                <UserCheck className="h-4 w-4 text-forest-600" />
                Following
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Follow
              </>
            )}
          </button>
        ) : null}
      </div>

      {isAuthenticated && !isOwnProfile ? (
        <div className="mt-4 border-t border-stone-100 pt-4">
          {!showReport ? (
            <button
              onClick={() => setShowReport(true)}
              className="flex items-center gap-1.5 text-xs text-stone-400 transition hover:text-red-600"
            >
              <Flag className="h-3.5 w-3.5" />
              Report seller
            </button>
          ) : reportDone ? (
            <p className="text-xs text-forest-700">Report submitted.</p>
          ) : (
            <form onSubmit={handleReport} className="space-y-2">
              <select
                value={reportReason}
                onChange={(event) => setReportReason(event.target.value)}
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-terra-400 focus:outline-none"
                required
              >
                <option value="">Select reason...</option>
                <option value="spam">Spam</option>
                <option value="fraud">Fraud / scam</option>
                <option value="fake_listing">Fake listing</option>
                <option value="inappropriate">Inappropriate</option>
                <option value="other">Other</option>
              </select>

              <textarea
                value={reportDescription}
                onChange={(event) => setReportDescription(event.target.value)}
                placeholder="Details (optional)"
                rows={2}
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-terra-400 focus:outline-none"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowReport(false)}
                  className="flex-1 rounded-xl border border-stone-200 py-1.5 text-xs font-semibold text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reporting}
                  className="flex-1 rounded-xl bg-red-600 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {reporting ? "Sending..." : "Report"}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : null}
    </div>
  );
}
