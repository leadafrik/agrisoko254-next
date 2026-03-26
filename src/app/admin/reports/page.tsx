"use client";

import { useEffect, useState } from "react";
import { adminApiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApiRequest(API_ENDPOINTS.admin.reports.getAll)
      .then((d) =>
        setReports(
          Array.isArray(d?.data) ? d.data : Array.isArray(d?.reports) ? d.reports : []
        )
      )
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Reports</h1>
      {loading ? <p className="text-stone-400">Loading...</p> : reports.length === 0 ? (
        <p className="text-stone-400">No reports.</p>
      ) : (
        <div className="space-y-3">
          {reports.map((r: any) => (
            <div key={r._id} className="bg-white rounded-xl border border-stone-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-stone-800">Report against: {r.reportedUser?.name ?? r.reportedUserId}</p>
                  <p className="text-sm text-stone-500 mt-1">{r.reason}</p>
                  {r.details && <p className="text-xs text-stone-400 mt-1">{r.details}</p>}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${r.status === "resolved" ? "bg-forest-100 text-forest-700" : "bg-amber-100 text-amber-700"}`}>
                  {r.status ?? "pending"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
