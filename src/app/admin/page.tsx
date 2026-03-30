"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  ClipboardList,
  RefreshCw,
  Shield,
  ShoppingCart,
  Users,
} from "lucide-react";
import { adminApiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

type DashboardStats = {
  totalListings: number;
  pendingListings: number;
  verifiedListings: number;
  totalUsers: number;
  breakdown?: Record<string, { total: number; pending: number; verified: number }>;
};

type AdminUserSummary = {
  _id: string;
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
  accountStatus?: string;
  verification?: { idVerified?: boolean };
  fraudFlags?: number;
  role?: string;
};

type AdminReportSummary = {
  _id: string;
  reason?: string;
  status?: string;
  createdAt?: string;
  reportingUser?: { fullName?: string; name?: string; email?: string; phone?: string };
  reportedBy?: { fullName?: string; name?: string; email?: string; phone?: string };
  reportedUser?: { fullName?: string; name?: string; email?: string; phone?: string };
};

type PendingProfile = {
  _id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  county?: string;
  constituency?: string;
};

type PendingIdVerification = {
  _id: string;
  status?: string;
  submittedAt?: string;
  userId?: {
    _id?: string;
    fullName?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
};

const getUserLabel = (user?: {
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
}) => user?.fullName || user?.name || user?.email || user?.phone || "Unknown user";

const formatDateTime = (value?: string) => {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const OPERATIONS = [
  {
    href: "/admin/users",
    label: "User management",
    description: "Search users, suspend fraud risks, edit account details, and create bulk accounts.",
    icon: Users,
  },
  {
    href: "/admin/listings-approval",
    label: "Listings approval",
    description: "Clear pending marketplace submissions and keep new inventory moving.",
    icon: ClipboardList,
  },
  {
    href: "/admin/profile-verification",
    label: "Profile verification",
    description: "Review identity documents, supporting files, and trust status updates.",
    icon: Shield,
  },
  {
    href: "/admin/orders",
    label: "Order operations",
    description: "Verify managed checkout payments and move orders into fulfillment.",
    icon: ShoppingCart,
  },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<AdminUserSummary[]>([]);
  const [recentReports, setRecentReports] = useState<AdminReportSummary[]>([]);
  const [pendingProfiles, setPendingProfiles] = useState<PendingProfile[]>([]);
  const [pendingIdChecks, setPendingIdChecks] = useState<PendingIdVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastSyncLabel, setLastSyncLabel] = useState("Syncing...");
  const [workingUserId, setWorkingUserId] = useState("");

  const loadSnapshot = async () => {
    setLoading(true);
    setError("");

    const [dashboardResult, usersResult, reportsResult, profilesResult, idResult] =
      await Promise.allSettled([
        adminApiRequest(API_ENDPOINTS.admin.dashboard),
        adminApiRequest(`${API_ENDPOINTS.admin.users.search}?limit=6&page=1&sortBy=createdAt`),
        adminApiRequest(`${API_ENDPOINTS.admin.reports.getAll}?status=pending&limit=6&page=1`),
        adminApiRequest(`${API_ENDPOINTS.admin.profiles.pending}?limit=6&page=1&status=pending`),
        adminApiRequest(API_ENDPOINTS.admin.verification.pending),
      ]);

    const val = <T,>(r: PromiseSettledResult<T>) =>
      r.status === "fulfilled" ? r.value : null;

    setStats(val(dashboardResult)?.data ?? null);
    setRecentUsers(Array.isArray(val(usersResult)?.data) ? val(usersResult).data : []);
    setRecentReports(Array.isArray(val(reportsResult)?.data) ? val(reportsResult).data : []);
    setPendingProfiles(Array.isArray(val(profilesResult)?.data) ? val(profilesResult).data : []);
    setPendingIdChecks(
      Array.isArray(val(idResult)?.verifications) ? val(idResult).verifications.slice(0, 6) : []
    );

    const failures = [dashboardResult, usersResult, reportsResult, profilesResult, idResult]
      .filter((r) => r.status === "rejected").length;
    if (failures === 5) {
      setError("Unable to reach the backend. Check your connection or try again.");
    } else if (failures > 0) {
      setError(`${failures} section(s) failed to load — partial data shown.`);
    }

    setLastSyncLabel(new Date().toLocaleTimeString("en-KE"));
    setLoading(false);
  };

  useEffect(() => {
    void loadSnapshot();
  }, []);

  const handleQuickSuspend = async (userId: string, accountStatus?: string) => {
    setWorkingUserId(userId);
    setError("");

    try {
      if (accountStatus === "suspended") {
        await adminApiRequest(API_ENDPOINTS.admin.users.unsuspend(userId), { method: "PUT" });
      } else {
        const reason = window.prompt("Suspension reason");
        if (!reason || !reason.trim()) {
          setWorkingUserId("");
          return;
        }
        await adminApiRequest(API_ENDPOINTS.admin.users.suspend(userId), {
          method: "PUT",
          body: JSON.stringify({ reason: reason.trim() }),
        });
      }

      await loadSnapshot();
    } catch (actionError: any) {
      setError(actionError?.message || "Unable to update the user account.");
    } finally {
      setWorkingUserId("");
    }
  };

  const keyMetrics = [
    { label: "Total users", value: stats?.totalUsers ?? 0 },
    { label: "Total listings", value: stats?.totalListings ?? 0 },
    { label: "Pending listings", value: stats?.pendingListings ?? 0 },
    { label: "Verified listings", value: stats?.verifiedListings ?? 0 },
    { label: "Pending reports", value: recentReports.length },
    { label: "Pending profiles", value: pendingProfiles.length },
    { label: "ID checks", value: pendingIdChecks.length },
  ];

  const breakdownItems = stats?.breakdown
    ? Object.entries(stats.breakdown).map(([key, value]) => ({
        key,
        label: key.replace(/_/g, " "),
        ...value,
      }))
    : [];

  return (
    <div className="ui-page-shell">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="ui-hero-panel p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="ui-section-kicker">Admin dashboard</p>
              <h1 className="mt-4 text-4xl font-bold text-stone-900">
                Control center for trust, safety, and marketplace operations
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">
                This console should make it easy to clear review queues, catch fraud signals early,
                and keep serious users moving through Agrisoko without delay.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-stone-200 bg-white/85 px-3 py-1.5 text-xs font-semibold text-stone-600">
                Last sync: {lastSyncLabel}
              </span>
              <button
                type="button"
                onClick={() => void loadSnapshot()}
                className="ui-btn-secondary gap-2 px-4 py-2.5"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh snapshot
              </button>
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {keyMetrics.map((metric) => (
            <div key={metric.label} className="ui-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                {metric.label}
              </p>
              <p className="mt-3 text-3xl font-bold text-stone-900">{metric.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-4">
          {OPERATIONS.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="ui-card p-5 transition hover:-translate-y-0.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="rounded-2xl bg-terra-50 p-3 text-terra-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-stone-400" />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-stone-900">{item.label}</h2>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{item.description}</p>
              </Link>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="ui-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="ui-section-kicker">Recent users</p>
                  <h2 className="mt-2 text-2xl font-semibold text-stone-900">
                    New accounts and quick actions
                  </h2>
                </div>
                <Link href="/admin/users" className="ui-btn-ghost px-4 py-2">
                  Open users
                </Link>
              </div>

              <div className="mt-5 space-y-3">
                {loading ? (
                  <p className="text-sm text-stone-500">Loading users...</p>
                ) : recentUsers.length === 0 ? (
                  <p className="text-sm text-stone-500">No recent users found.</p>
                ) : (
                  recentUsers.map((user) => {
                    const accountSuspended = user.accountStatus === "suspended";
                    return (
                      <div key={user._id} className="ui-card-soft p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <p className="font-semibold text-stone-900">
                              {user.fullName || user.name || "User"}
                            </p>
                            <p className="mt-1 text-sm text-stone-600">
                              {user.email || user.phone || "No primary contact"}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  user.verification?.idVerified
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {user.verification?.idVerified ? "Verified" : "Unverified"}
                              </span>
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  accountSuspended
                                    ? "bg-red-100 text-red-700"
                                    : "bg-stone-100 text-stone-700"
                                }`}
                              >
                                {accountSuspended ? "Suspended" : "Active"}
                              </span>
                              {user.fraudFlags ? (
                                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                                  {user.fraudFlags} flag{user.fraudFlags === 1 ? "" : "s"}
                                </span>
                              ) : null}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={workingUserId === user._id}
                              onClick={() => void handleQuickSuspend(user._id, user.accountStatus)}
                              className="ui-btn-secondary px-4 py-2"
                            >
                              {accountSuspended ? "Unsuspend" : "Suspend"}
                            </button>
                            <Link
                              href={`/admin/users/${user._id}`}
                              className="ui-btn-primary px-4 py-2"
                            >
                              Review
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="ui-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="ui-section-kicker">Risk queue</p>
                  <h2 className="mt-2 text-2xl font-semibold text-stone-900">
                    Pending reports
                  </h2>
                </div>
                <Link href="/admin/reports-management" className="ui-btn-ghost px-4 py-2">
                  Open reports
                </Link>
              </div>

              <div className="mt-5 space-y-3">
                {loading ? (
                  <p className="text-sm text-stone-500">Loading reports...</p>
                ) : recentReports.length === 0 ? (
                  <p className="text-sm text-stone-500">No pending reports right now.</p>
                ) : (
                  recentReports.map((report) => (
                    <div key={report._id} className="ui-card-soft p-4">
                      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="font-semibold text-stone-900">
                            {report.reason || "User report"}
                          </p>
                          <p className="mt-1 text-sm text-stone-600">
                            Reporter: {getUserLabel(report.reportedBy || report.reportingUser)}
                          </p>
                          <p className="mt-1 text-sm text-stone-600">
                            Reported user: {getUserLabel(report.reportedUser)}
                          </p>
                        </div>
                        <div className="text-sm text-stone-500">
                          {formatDateTime(report.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="ui-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="ui-section-kicker">Verification queue</p>
                  <h2 className="mt-2 text-xl font-semibold text-stone-900">
                    Pending profile reviews
                  </h2>
                </div>
                <Link href="/admin/profile-verification" className="ui-btn-ghost px-4 py-2">
                  Review all
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {loading ? (
                  <p className="text-sm text-stone-500">Loading profiles...</p>
                ) : pendingProfiles.length === 0 ? (
                  <p className="text-sm text-stone-500">No pending profile reviews.</p>
                ) : (
                  pendingProfiles.map((profile) => (
                    <div key={profile._id} className="ui-card-soft p-4">
                      <p className="font-semibold text-stone-900">
                        {profile.fullName || "User profile"}
                      </p>
                      <p className="mt-1 text-sm text-stone-600">
                        {profile.email || profile.phone || "No contact"}
                      </p>
                      <p className="mt-1 text-sm text-stone-500">
                        {[profile.constituency, profile.county].filter(Boolean).join(", ") ||
                          "Location not set"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="ui-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="ui-section-kicker">Identity review</p>
                  <h2 className="mt-2 text-xl font-semibold text-stone-900">
                    ID verification submissions
                  </h2>
                </div>
                <Link href="/admin/id-verification" className="ui-btn-ghost px-4 py-2">
                  Open queue
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {loading ? (
                  <p className="text-sm text-stone-500">Loading ID checks...</p>
                ) : pendingIdChecks.length === 0 ? (
                  <p className="text-sm text-stone-500">No pending ID checks.</p>
                ) : (
                  pendingIdChecks.map((entry) => (
                    <div key={entry._id} className="ui-card-soft p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-stone-900">
                            {getUserLabel(entry.userId)}
                          </p>
                          <p className="mt-1 text-sm text-stone-600">
                            {entry.userId?.email || entry.userId?.phone || "No contact"}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-stone-500">
                            Submitted {formatDateTime(entry.submittedAt)}
                          </p>
                        </div>
                        <BadgeCheck className="h-5 w-5 text-terra-600" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="ui-accent-panel p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terra-700">
                Fraud prevention posture
              </p>
              <ul className="mt-4 space-y-3 text-sm text-stone-700">
                <li className="flex gap-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-terra-700" />
                  Clear payment-review orders and pending reports first. Those queues affect trust fastest.
                </li>
                <li className="flex gap-3">
                  <Shield className="mt-0.5 h-4 w-4 shrink-0 text-terra-700" />
                  Suspend bad actors quickly, but document a reason so the trail is defensible.
                </li>
                <li className="flex gap-3">
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-terra-700" />
                  Keep legitimate sellers moving by clearing ID and profile verification backlog daily.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="ui-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="ui-section-kicker">Marketplace breakdown</p>
              <h2 className="mt-2 text-2xl font-semibold text-stone-900">
                Inventory by listing type
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {breakdownItems.length === 0 ? (
              <p className="text-sm text-stone-500">No breakdown available yet.</p>
            ) : (
              breakdownItems.map((item) => (
                <div key={item.key} className="ui-card-soft p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                    {item.label}
                  </p>
                  <p className="mt-3 text-2xl font-bold text-stone-900">{item.total}</p>
                  <div className="mt-3 space-y-1 text-sm text-stone-600">
                    <p>Pending: {item.pending}</p>
                    <p>Verified: {item.verified}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
