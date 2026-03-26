"use client";

import { useEffect, useState } from "react";
import { adminApiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    adminApiRequest(API_ENDPOINTS.admin.dashboard).then(setStats).catch(() => {});
  }, []);

  const metrics = stats ? [
    { label: "Total Users",        value: stats.totalUsers },
    { label: "Active Listings",    value: stats.activeListings },
    { label: "Pending Listings",   value: stats.pendingListings },
    { label: "Verified Users",     value: stats.verifiedUsers },
    { label: "Total Orders",       value: stats.totalOrders },
    { label: "Pending ID Checks",  value: stats.pendingIdVerifications },
  ] : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 mb-8">Analytics</h1>
      {!stats ? <p className="text-stone-400">Loading...</p> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {metrics.map((m) => (
            <div key={m.label} className="bg-white rounded-xl border border-stone-100 p-5">
              <p className="text-sm text-stone-500 mb-1">{m.label}</p>
              <p className="text-3xl font-bold text-stone-900">{m.value ?? "–"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
