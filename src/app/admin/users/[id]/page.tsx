"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  Flag,
  Mail,
  Phone,
  ShieldCheck,
  Star,
} from "lucide-react";
import { adminApiRequest, apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { buildMarketplaceCards, MarketplaceCard } from "@/lib/marketplace-cards";
import { normalizeKenyanPhone } from "@/utils/phone";

type AdminUserDetail = {
  _id: string;
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
  county?: string;
  constituency?: string;
  ward?: string;
  town?: string;
  verification?: { idVerified?: boolean; selfieVerified?: boolean };
  fraudFlags?: number;
  accountStatus?: string;
  createdAt?: string;
  ratings?: { average?: number; count?: number };
};

type BuyerRequestRecord = {
  _id: string;
  title?: string;
  productType?: string;
  category?: string;
  location?: { county?: string };
  status?: string;
  createdAt?: string;
};

type ReportRecord = {
  _id: string;
  reason?: string;
  status?: string;
  createdAt?: string;
};

const toArray = (value: unknown) => (Array.isArray(value) ? value : []);

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-KE");
};

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const userId = typeof params?.id === "string" ? params.id : "";
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [publicProfile, setPublicProfile] = useState<any>(null);
  const [listingCards, setListingCards] = useState<MarketplaceCard[]>([]);
  const [buyerRequests, setBuyerRequests] = useState<BuyerRequestRecord[]>([]);
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [ratingsSummary, setRatingsSummary] = useState<{ average?: number; count?: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [
          adminUserResponse,
          reportsResponse,
          profileResponse,
          ratingsResponse,
          buyerRequestsResponse,
          productsResponse,
          equipmentResponse,
          professionalResponse,
          inputsResponse,
        ] = await Promise.all([
          adminApiRequest(API_ENDPOINTS.admin.users.getById(userId)),
          adminApiRequest(API_ENDPOINTS.admin.users.reports(userId)).catch(() => ({ data: [] })),
          apiRequest(API_ENDPOINTS.users.getProfile(userId)).catch(() => null),
          apiRequest(API_ENDPOINTS.ratings.getUserRatings(userId)).catch(() => ({ data: { aggregate: { average: 0, count: 0 } } })),
          apiRequest(API_ENDPOINTS.buyerRequests.byUser(userId)).catch(() => ({ data: [] })),
          apiRequest(API_ENDPOINTS.products.list).catch(() => ({ data: [] })),
          apiRequest(API_ENDPOINTS.services.equipment.list).catch(() => ({ data: [] })),
          apiRequest(API_ENDPOINTS.services.professional.list).catch(() => ({ data: [] })),
          apiRequest(API_ENDPOINTS.services.agrovets.list).catch(() => ({ data: [] })),
        ]);

        const adminUser = adminUserResponse?.data || null;
        const reportsData = toArray(reportsResponse?.data) as ReportRecord[];
        const buyerRequestData = toArray(buyerRequestsResponse?.data) as BuyerRequestRecord[];
        const ratingAggregate = ratingsResponse?.data?.aggregate || {};
        const marketplaceCards = buildMarketplaceCards(
          toArray(productsResponse?.data) as any[],
          [
            ...(toArray(equipmentResponse?.data) as any[]),
            ...(toArray(professionalResponse?.data) as any[]),
            ...(toArray(inputsResponse?.data) as any[]).map((item) => ({ ...item, type: "agrovet" })),
          ]
        ).filter((item) => String(item.ownerId || "") === userId);

        setUser(adminUser);
        setPublicProfile(profileResponse?.data || profileResponse || null);
        setListingCards(marketplaceCards);
        setBuyerRequests(buyerRequestData);
        setReports(reportsData);
        setRatingsSummary({
          average: ratingAggregate.average ?? adminUser?.ratings?.average,
          count: ratingAggregate.count ?? adminUser?.ratings?.count,
        });
      } catch (loadError: any) {
        setError(loadError?.message || "Failed to load user profile.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [userId]);

  const activity = useMemo(() => {
    const listingActivity = listingCards.map((listing) => ({
      id: `listing-${listing.id}`,
      title: listing.title,
      meta: `Listing | ${listing.typeLabel}${listing.county ? ` | ${listing.county}` : ""}`,
      createdAt: listing.createdAt ? listing.createdAt.getTime() : 0,
    }));
    const requestActivity = buyerRequests.map((request) => ({
      id: `request-${request._id}`,
      title: request.title || request.productType || "Buyer request",
      meta: `Buy request | ${request.category || "uncategorized"}`,
      createdAt: request.createdAt ? new Date(request.createdAt).getTime() : 0,
    }));
    const reportActivity = reports.map((report) => ({
      id: `report-${report._id}`,
      title: report.reason || "User report",
      meta: `Report | ${report.status || "pending"}`,
      createdAt: report.createdAt ? new Date(report.createdAt).getTime() : 0,
    }));

    return [...listingActivity, ...requestActivity, ...reportActivity]
      .filter((item) => item.createdAt > 0)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10);
  }, [buyerRequests, listingCards, reports]);

  if (loading) {
    return <div className="ui-card p-6 text-sm text-stone-500">Loading user profile...</div>;
  }

  if (error || !user) {
    return (
      <div className="ui-card p-6">
        <p className="text-lg font-semibold text-red-700">Unable to load user profile</p>
        <p className="mt-2 text-sm text-stone-600">{error || "User not found."}</p>
        <Link href="/admin/users" className="ui-btn-primary mt-4 gap-2 px-4 py-2">
          <ArrowLeft className="h-4 w-4" />
          Back to user management
        </Link>
      </div>
    );
  }

  const isVerified = !!user.verification?.idVerified;
  const locationLabel = [publicProfile?.town, publicProfile?.ward, publicProfile?.constituency, publicProfile?.county].filter(Boolean).join(", ");
  const normalizedPhone = normalizeKenyanPhone(user.phone || publicProfile?.phone || "");

  return (
    <div className="ui-page-shell">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/admin/users" className="ui-btn-ghost gap-2 px-4 py-2">
            <ArrowLeft className="h-4 w-4" />
            Back to user management
          </Link>
          <Link href={`/sellers/${user._id}`} target="_blank" className="ui-btn-secondary gap-2 px-4 py-2">
            View public seller profile
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        <section className="ui-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="ui-section-kicker">User profile</p>
              <h1 className="mt-3 text-3xl font-bold text-stone-900">{user.fullName || user.name || "User"}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold ${isVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
                  {isVerified ? <ShieldCheck className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  {isVerified ? "Verified" : "Unverified"}
                </span>
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold ${user.accountStatus === "suspended" ? "bg-red-100 text-red-700" : "bg-stone-100 text-stone-700"}`}>
                  {user.accountStatus === "suspended" ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  {user.accountStatus === "suspended" ? "Suspended" : "Active"}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1 font-semibold text-stone-700">
                  <Flag className="h-4 w-4" />
                  {user.fraudFlags || 0} fraud flags
                </span>
              </div>
            </div>

            <div className="grid gap-2 text-sm text-stone-600 sm:text-right">
              <p className="inline-flex items-center gap-2 sm:justify-end"><Mail className="h-4 w-4" />{user.email || "No email"}</p>
              <p className="inline-flex items-center gap-2 sm:justify-end"><Phone className="h-4 w-4" />{normalizedPhone || "No phone"}</p>
              <p>{locationLabel || "Location not set"}</p>
              <p>Joined {formatDate(user.createdAt)}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="ui-card-soft p-4"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Active listings</p><p className="mt-2 text-2xl font-semibold text-stone-900">{listingCards.length}</p></div>
          <div className="ui-card-soft p-4"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Buy requests</p><p className="mt-2 text-2xl font-semibold text-stone-900">{buyerRequests.length}</p></div>
          <div className="ui-card-soft p-4"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Reports</p><p className="mt-2 text-2xl font-semibold text-stone-900">{reports.length}</p></div>
          <div className="ui-card-soft p-4"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Rating</p><p className="mt-2 inline-flex items-center gap-2 text-2xl font-semibold text-stone-900"><Star className="h-5 w-5 text-amber-500" />{typeof ratingsSummary?.average === "number" ? ratingsSummary.average.toFixed(1) : "-"}</p><p className="mt-1 text-xs text-stone-500">{ratingsSummary?.count || 0} review{ratingsSummary?.count === 1 ? "" : "s"}</p></div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="ui-card p-5">
              <div><p className="ui-section-kicker">Listings</p><h2 className="mt-2 text-xl font-semibold text-stone-900">Current public inventory</h2></div>
              <div className="mt-4 space-y-3">
                {listingCards.length === 0 ? <p className="text-sm text-stone-500">No public listings found for this user.</p> : listingCards.map((listing) => (
                  <div key={listing.id} className="ui-card-soft p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-stone-900">{listing.title}</p>
                        <p className="mt-1 text-sm text-stone-500">{listing.typeLabel}{listing.county ? ` | ${listing.county}` : ""}</p>
                        {listing.priceLabel ? <p className="mt-2 text-sm font-semibold text-terra-700">{listing.priceLabel}</p> : null}
                      </div>
                      <Link href={`/listings/${listing.id}`} target="_blank" className="ui-btn-ghost gap-2 px-3 py-2">Open listing</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ui-card p-5">
              <div><p className="ui-section-kicker">Buyer requests</p><h2 className="mt-2 text-xl font-semibold text-stone-900">Demand created by this user</h2></div>
              <div className="mt-4 space-y-3">
                {buyerRequests.length === 0 ? <p className="text-sm text-stone-500">No buyer requests found.</p> : buyerRequests.slice(0, 10).map((request) => (
                  <div key={request._id} className="ui-card-soft p-4">
                    <p className="font-semibold text-stone-900">{request.title || request.productType || "Buyer request"}</p>
                    <p className="mt-1 text-sm text-stone-500">{request.category || "uncategorized"}{request.location?.county ? ` | ${request.location.county}` : ""}</p>
                    <p className="mt-2 text-xs text-stone-500">Created {formatDate(request.createdAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="ui-card p-5">
              <div><p className="ui-section-kicker">Reports</p><h2 className="mt-2 text-xl font-semibold text-stone-900">Admin report history</h2></div>
              <div className="mt-4 space-y-3">
                {reports.length === 0 ? <p className="text-sm text-stone-500">No reports found for this user.</p> : reports.slice(0, 10).map((report) => (
                  <div key={report._id} className="ui-card-soft p-4">
                    <p className="font-semibold text-stone-900">{report.reason || "User report"}</p>
                    <p className="mt-1 text-sm text-stone-500">{report.status || "pending"} | {formatDate(report.createdAt)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="ui-card p-5">
              <div><p className="ui-section-kicker">Activity</p><h2 className="mt-2 text-xl font-semibold text-stone-900">Recent activity timeline</h2></div>
              <div className="mt-4 space-y-3">
                {activity.length === 0 ? <p className="text-sm text-stone-500">No recent activity found.</p> : activity.map((item) => (
                  <div key={item.id} className="ui-card-soft p-4">
                    <p className="font-semibold text-stone-900">{item.title}</p>
                    <p className="mt-1 text-sm text-stone-500">{item.meta}</p>
                    <p className="mt-1 text-xs text-stone-500">{new Date(item.createdAt).toLocaleString("en-KE")}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
