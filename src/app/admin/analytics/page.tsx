"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminApiRequest, apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

type DashboardStats = {
  totalListings: number;
  pendingListings: number;
  verifiedListings: number;
  totalUsers: number;
  breakdown?: Record<string, { total: number; pending: number; verified: number }>;
};

type ReportSummary = {
  _id: string;
  reason?: string;
  status?: string;
  createdAt?: string;
};

type TrafficSummary = {
  overview?: {
    uniqueVisitorsToday: number;
    uniqueVisitorsWeek: number;
    uniqueVisitorsMonth: number;
    uniqueVisitorsTotal: number;
    liveListingsNow?: number;
    newVisitorsToday?: number;
    newVisitorsWeek?: number;
    newVisitorsMonth?: number;
  };
  trends?: {
    daily?: Array<{ date?: string; uniqueVisitors: number }>;
    weekly?: Array<{ week?: string; uniqueVisitors: number }>;
    monthly?: Array<{ month?: string; uniqueVisitors: number }>;
  };
  topPages?: Array<{ pagePath: string; views: number; uniqueVisitors: number }>;
  topActions?: Array<{
    action: string;
    target?: string;
    clicks: number;
    uniqueVisitors: number;
  }>;
  listingEngagement?: {
    topListings: Array<{
      id: string;
      title: string;
      category: string;
      listingType: string;
      views: number;
      saves: number;
      reachOuts: number;
      score: number;
    }>;
  };
  conversion?: {
    funnel?: {
      homeToSignupRate: number;
      homeToBrowseRate: number;
      signupToCreateListingRate: number;
      browseToDetailsRate: number;
      signupUniqueVisitors: number;
      browseUniqueVisitors: number;
      createListingUniqueVisitors: number;
      listingDetailsUniqueVisitors: number;
    };
    ctaTargets?: Array<{ target: string; clicks: number; uniqueVisitors: number }>;
    acquisition?: {
      channels: Array<{
        source: string;
        medium: string;
        visits: number;
        uniqueVisitors: number;
      }>;
      campaigns: Array<{
        source: string;
        medium: string;
        campaign: string;
        visits: number;
        uniqueVisitors: number;
      }>;
    };
    primaryCtaSignals?: {
      signUpClicks: number;
      browseClicks: number;
      listNowClicks: number;
      buyRequestClicks: number;
    };
  };
};

const formatPercent = (value: number | undefined) => `${Number(value || 0).toFixed(1)}%`;

const humanizeAction = (value: string) =>
  value
    .replace(/^funnel_/, "")
    .replace(/^link_click/, "link click")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const formatPath = (value?: string) =>
  value
    ? value
        .split("/")
        .filter(Boolean)
        .join(" / ") || "/"
    : "/";

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [traffic, setTraffic] = useState<TrafficSummary | null>(null);
  const [pendingReports, setPendingReports] = useState<ReportSummary[]>([]);
  const [flaggedCount, setFlaggedCount] = useState(0);
  const [pendingProfileCount, setPendingProfileCount] = useState(0);
  const [pendingIdCount, setPendingIdCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          dashboardResponse,
          reportsResponse,
          flaggedResponse,
          profilesResponse,
          idResponse,
          trafficResponse,
        ] = await Promise.all([
          adminApiRequest(API_ENDPOINTS.admin.dashboard),
          apiRequest(`${API_ENDPOINTS.admin.reports.getAll}?status=pending&limit=5&page=1`),
          adminApiRequest(`${API_ENDPOINTS.admin.users.search}?status=flagged&limit=1&page=1`),
          adminApiRequest(`${API_ENDPOINTS.admin.profiles.pending}?status=pending&limit=1&page=1`),
          adminApiRequest(API_ENDPOINTS.admin.verification.pending),
          adminApiRequest(API_ENDPOINTS.analytics.admin.summary),
        ]);

        setStats(dashboardResponse?.data || null);
        setPendingReports(Array.isArray(reportsResponse?.data) ? reportsResponse.data : []);
        setFlaggedCount(flaggedResponse?.pagination?.total || 0);
        setPendingProfileCount(profilesResponse?.pagination?.total || 0);
        setPendingIdCount(
          Array.isArray(idResponse?.verifications) ? idResponse.verifications.length : 0
        );
        setTraffic(trafficResponse?.data || null);
      } catch (loadError: any) {
        setError(loadError?.message || "Unable to load analytics.");
      } finally {
        setLoading(false);
      }
    };

    void loadAnalytics();
  }, []);

  const funnel = traffic?.conversion?.funnel;
  const primarySignals = traffic?.conversion?.primaryCtaSignals;
  const genericActions =
    traffic?.topActions?.filter((action) => !action.action.startsWith("funnel_")) || [];
  const breakdownItems = stats?.breakdown
    ? Object.entries(stats.breakdown)
        .map(([key, value]) => ({
          key,
          label: key.replace(/_/g, " "),
          total: value.total,
          pending: value.pending,
          verified: value.verified,
        }))
        .filter((item) => item.total > 0 || item.pending > 0 || item.verified > 0)
    : [];

  return (
    <div className="ui-page-shell">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="ui-hero-panel p-6 md:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="ui-section-kicker">Analytics and reports</p>
              <h1 className="mt-4 text-4xl font-bold text-stone-900">
                Marketplace performance and trust monitoring
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">
                Track traffic quality, moderation pressure, listing health, and the funnel from
                discovery into sign-up and listing intent.
              </p>
            </div>
            <Link href="/admin" className="ui-btn-secondary px-4 py-2.5">
              Back to dashboard
            </Link>
          </div>
        </section>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="ui-card p-6 text-sm text-stone-500">Loading analytics...</div>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                ["Total users", stats?.totalUsers ?? 0],
                ["Listings", stats?.totalListings ?? 0],
                ["Pending reviews", stats?.pendingListings ?? 0],
                ["Verified listings", stats?.verifiedListings ?? 0],
                ["Unique devices today", traffic?.overview?.uniqueVisitorsToday ?? 0],
                ["Unique devices this week", traffic?.overview?.uniqueVisitorsWeek ?? 0],
                ["Live listings now", traffic?.overview?.liveListingsNow ?? 0],
                ["New devices this month", traffic?.overview?.newVisitorsMonth ?? 0],
                ["Pending reports", pendingReports.length],
                ["Flagged users", flaggedCount],
                ["Pending profiles", pendingProfileCount],
                ["Pending ID checks", pendingIdCount],
              ].map(([label, value]) => (
                <div key={String(label)} className="ui-card p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                    {label}
                  </p>
                  <p className="mt-3 text-3xl font-bold text-stone-900">{value}</p>
                </div>
              ))}
            </section>

            <section className="ui-accent-panel p-6">
              <h2 className="text-2xl font-semibold text-stone-900">Conversion focus</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="ui-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                    Home to sign up
                  </p>
                  <p className="mt-2 text-2xl font-bold text-stone-900">
                    {formatPercent(funnel?.homeToSignupRate)}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    {funnel?.signupUniqueVisitors || 0} signup visitors
                  </p>
                </div>
                <div className="ui-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                    Home to browse
                  </p>
                  <p className="mt-2 text-2xl font-bold text-stone-900">
                    {formatPercent(funnel?.homeToBrowseRate)}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    {funnel?.browseUniqueVisitors || 0} browse visitors
                  </p>
                </div>
                <div className="ui-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                    Signup to list
                  </p>
                  <p className="mt-2 text-2xl font-bold text-stone-900">
                    {formatPercent(funnel?.signupToCreateListingRate)}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    {funnel?.createListingUniqueVisitors || 0} create listing visits
                  </p>
                </div>
                <div className="ui-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                    Browse to details
                  </p>
                  <p className="mt-2 text-2xl font-bold text-stone-900">
                    {formatPercent(funnel?.browseToDetailsRate)}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    {funnel?.listingDetailsUniqueVisitors || 0} detail visits
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="ui-card p-5">
                  <h3 className="text-lg font-semibold text-stone-900">Primary CTA signals</h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[
                      ["Sign up clicks", primarySignals?.signUpClicks ?? 0],
                      ["Browse clicks", primarySignals?.browseClicks ?? 0],
                      ["List now clicks", primarySignals?.listNowClicks ?? 0],
                      ["Buy request clicks", primarySignals?.buyRequestClicks ?? 0],
                    ].map(([label, value]) => (
                      <div key={String(label)} className="ui-card-soft p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                          {label}
                        </p>
                        <p className="mt-2 text-2xl font-bold text-stone-900">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="ui-card p-5">
                  <h3 className="text-lg font-semibold text-stone-900">CTA targets</h3>
                  <div className="mt-4 space-y-3">
                    {(traffic?.conversion?.ctaTargets || []).length === 0 ? (
                      <p className="text-sm text-stone-500">No CTA target data available yet.</p>
                    ) : (
                      (traffic?.conversion?.ctaTargets || []).slice(0, 6).map((target, index) => (
                        <div
                          key={`${target.target}-${index}`}
                          className="flex items-center justify-between gap-3 rounded-2xl bg-stone-50 px-4 py-3"
                        >
                          <div>
                            <p className="font-semibold text-stone-900">
                              {target.target || "Unknown target"}
                            </p>
                            <p className="text-xs text-stone-500">
                              {target.uniqueVisitors} unique visitors
                            </p>
                          </div>
                          <p className="text-lg font-semibold text-terra-700">{target.clicks}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-6">
                <div className="ui-card p-5">
                  <h2 className="text-xl font-semibold text-stone-900">Top pages</h2>
                  <div className="mt-4 space-y-3">
                    {(traffic?.topPages || []).length === 0 ? (
                      <p className="text-sm text-stone-500">No top page data available yet.</p>
                    ) : (
                      (traffic?.topPages || []).slice(0, 8).map((page) => (
                        <div
                          key={page.pagePath}
                          className="flex items-center justify-between gap-3 rounded-2xl bg-stone-50 px-4 py-3"
                        >
                          <div>
                            <p className="font-semibold text-stone-900">{formatPath(page.pagePath)}</p>
                            <p className="text-xs text-stone-500">
                              {page.uniqueVisitors} unique visitors
                            </p>
                          </div>
                          <p className="text-lg font-semibold text-terra-700">{page.views}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="ui-card p-5">
                  <h2 className="text-xl font-semibold text-stone-900">Top actions</h2>
                  <div className="mt-4 space-y-3">
                    {genericActions.length === 0 ? (
                      <p className="text-sm text-stone-500">No action data available yet.</p>
                    ) : (
                      genericActions.slice(0, 8).map((action, index) => (
                        <div
                          key={`${action.action}-${index}`}
                          className="flex items-center justify-between gap-3 rounded-2xl bg-stone-50 px-4 py-3"
                        >
                          <div>
                            <p className="font-semibold capitalize text-stone-900">
                              {humanizeAction(action.action)}
                            </p>
                            <p className="text-xs text-stone-500">
                              {action.target || "No target"} | {action.uniqueVisitors} unique
                            </p>
                          </div>
                          <p className="text-lg font-semibold text-stone-900">{action.clicks}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="ui-card p-5">
                  <h2 className="text-xl font-semibold text-stone-900">Listing breakdown</h2>
                  <div className="mt-4 space-y-3">
                    {breakdownItems.length === 0 ? (
                      <p className="text-sm text-stone-500">No listing breakdown available yet.</p>
                    ) : (
                      breakdownItems.map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between gap-3 rounded-2xl bg-stone-50 px-4 py-3"
                        >
                          <div>
                            <p className="font-semibold capitalize text-stone-900">{item.label}</p>
                            <p className="text-xs text-stone-500">
                              Pending {item.pending} | Verified {item.verified}
                            </p>
                          </div>
                          <p className="text-lg font-semibold text-stone-900">{item.total}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="ui-card p-5">
                  <h2 className="text-xl font-semibold text-stone-900">Acquisition channels</h2>
                  <div className="mt-4 space-y-3">
                    {(traffic?.conversion?.acquisition?.channels || []).length === 0 ? (
                      <p className="text-sm text-stone-500">No acquisition data available yet.</p>
                    ) : (
                      (traffic?.conversion?.acquisition?.channels || []).slice(0, 8).map((channel, index) => (
                        <div
                          key={`${channel.source}-${channel.medium}-${index}`}
                          className="rounded-2xl bg-stone-50 px-4 py-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold capitalize text-stone-900">
                                {(channel.source || "direct").replace(/_/g, " ")}
                              </p>
                              <p className="text-xs text-stone-500">
                                {(channel.medium || "none").replace(/_/g, " ")}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-stone-900">{channel.visits}</p>
                              <p className="text-xs text-stone-500">visits</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="ui-card p-5">
                  <h2 className="text-xl font-semibold text-stone-900">Campaigns</h2>
                  <div className="mt-4 space-y-3">
                    {(traffic?.conversion?.acquisition?.campaigns || []).length === 0 ? (
                      <p className="text-sm text-stone-500">No campaign data available yet.</p>
                    ) : (
                      (traffic?.conversion?.acquisition?.campaigns || []).slice(0, 8).map((campaign, index) => (
                        <div
                          key={`${campaign.source}-${campaign.medium}-${campaign.campaign}-${index}`}
                          className="rounded-2xl bg-stone-50 px-4 py-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-stone-900">
                                {campaign.campaign || "Unspecified campaign"}
                              </p>
                              <p className="text-xs text-stone-500">
                                {campaign.source}/{campaign.medium}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-stone-900">{campaign.visits}</p>
                              <p className="text-xs text-stone-500">visits</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="ui-card p-5">
                  <h2 className="text-xl font-semibold text-stone-900">Top listings</h2>
                  <div className="mt-4 space-y-3">
                    {(traffic?.listingEngagement?.topListings || []).length === 0 ? (
                      <p className="text-sm text-stone-500">
                        No listing engagement data available yet.
                      </p>
                    ) : (
                      (traffic?.listingEngagement?.topListings || []).slice(0, 8).map((listing) => (
                        <div
                          key={listing.id}
                          className="rounded-2xl bg-stone-50 px-4 py-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-stone-900">{listing.title}</p>
                              <p className="text-xs text-stone-500">
                                {listing.category} | {listing.listingType}
                              </p>
                              <p className="mt-1 text-xs text-stone-500">
                                Views {listing.views} | Saves {listing.saves} | Reach-outs {listing.reachOuts}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-terra-700">{listing.score}</p>
                              <p className="text-xs text-stone-500">score</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="ui-card p-5">
                  <h2 className="text-xl font-semibold text-stone-900">Pending reports and trends</h2>
                  <div className="mt-4 space-y-3">
                    {pendingReports.map((report) => (
                      <div key={report._id} className="rounded-2xl bg-stone-50 px-4 py-3">
                        <p className="font-semibold text-stone-900">{report.reason || "User report"}</p>
                        <p className="mt-1 text-xs text-stone-500">
                          {report.status || "pending"} |{" "}
                          {report.createdAt
                            ? new Date(report.createdAt).toLocaleDateString("en-KE")
                            : "recent"}
                        </p>
                      </div>
                    ))}
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="ui-card-soft p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                          Daily trend
                        </p>
                        <div className="mt-3 space-y-2 text-sm text-stone-700">
                          {(traffic?.trends?.daily || []).slice(-4).map((point, index) => (
                            <div key={`${point.date}-${index}`} className="flex justify-between gap-3">
                              <span>{point.date || "Day"}</span>
                              <span className="font-semibold">{point.uniqueVisitors}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="ui-card-soft p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                          Weekly trend
                        </p>
                        <div className="mt-3 space-y-2 text-sm text-stone-700">
                          {(traffic?.trends?.weekly || []).slice(-4).map((point, index) => (
                            <div key={`${point.week}-${index}`} className="flex justify-between gap-3">
                              <span>{point.week || "Week"}</span>
                              <span className="font-semibold">{point.uniqueVisitors}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="ui-card-soft p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                          Monthly trend
                        </p>
                        <div className="mt-3 space-y-2 text-sm text-stone-700">
                          {(traffic?.trends?.monthly || []).slice(-4).map((point, index) => (
                            <div key={`${point.month}-${index}`} className="flex justify-between gap-3">
                              <span>{point.month || "Month"}</span>
                              <span className="font-semibold">{point.uniqueVisitors}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
