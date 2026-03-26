"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { adminApiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

interface Report {
  _id: string;
  reportedBy?: { fullName?: string; name?: string; email?: string; phone?: string };
  reportingUser?: { fullName?: string; email?: string };
  reportedUser?: { fullName?: string; email?: string };
  reason: string;
  description?: string;
  status: string;
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
}

const getUserLabel = (u?: { fullName?: string; name?: string; email?: string; phone?: string }) =>
  u?.fullName || u?.name || u?.email || u?.phone || "Unknown user";
const getUserEmail = (u?: { email?: string }) => u?.email || "No email";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  open: "bg-yellow-100 text-yellow-800",
  investigating: "bg-blue-100 text-blue-800",
  reviewing: "bg-blue-100 text-blue-800",
  resolved: "bg-emerald-100 text-emerald-800",
  dismissed: "bg-stone-100 text-stone-700",
};

const STATUS_MAP: Record<string, string> = {
  pending: "open",
  investigating: "reviewing",
  resolved: "resolved",
  dismissed: "dismissed",
};

function ReportModal({ report, onClose, onUpdate }: { report: Report; onClose: () => void; onUpdate: (id: string, status: string, resolution?: string) => void }) {
  const [newStatus, setNewStatus] = useState(report.status);
  const [resolution, setResolution] = useState(report.resolution || "");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-stone-900">Report details</h2>
          <button onClick={onClose} className="text-stone-500 hover:text-stone-700 text-2xl font-bold">×</button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <h3 className="font-semibold text-stone-900 mb-2">Reported user</h3>
            <div className="rounded-xl bg-stone-50 p-4">
              <p className="font-medium text-stone-900">{getUserLabel(report.reportedUser)}</p>
              <p className="text-sm text-stone-500">{getUserEmail(report.reportedUser)}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-stone-900 mb-2">Reported by</h3>
            <div className="rounded-xl bg-stone-50 p-4">
              <p className="font-medium text-stone-900">{getUserLabel(report.reportedBy || report.reportingUser)}</p>
              <p className="text-sm text-stone-500">{getUserEmail(report.reportedBy || report.reportingUser)}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-stone-900 mb-2">Report reason</h3>
            <p className="text-stone-700 rounded-xl bg-stone-50 p-4">{report.reason}</p>
          </div>
          {report.description && (
            <div>
              <h3 className="font-semibold text-stone-900 mb-2">Description</h3>
              <p className="text-stone-700 rounded-xl bg-stone-50 p-4">{report.description}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Report status</label>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:outline-none">
              <option value="pending">Pending</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
          {(newStatus === "resolved" || newStatus === "dismissed") && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Resolution / notes</label>
              <textarea value={resolution} onChange={(e) => setResolution(e.target.value)} placeholder="Document the resolution..." className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:outline-none" rows={3} />
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={() => onUpdate(report._id, newStatus, resolution)} className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">Update report</button>
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl border border-stone-200 text-sm font-semibold text-stone-700 hover:bg-stone-50">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminReportsManagementPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchReports = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        status: STATUS_MAP[statusFilter] || statusFilter,
        page: String(page),
        limit: "15",
      });
      const res = await adminApiRequest(`${API_ENDPOINTS.admin.reports.getAll}?${params}`);
      setReports(Array.isArray(res?.data) ? res.data : []);
      setTotal(res?.pagination?.total || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, [statusFilter, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdate = async (reportId: string, newStatus: string, resolution?: string) => {
    try {
      const apiStatus = STATUS_MAP[newStatus] || newStatus;
      await adminApiRequest(API_ENDPOINTS.admin.reports.update(reportId), {
        method: "PATCH",
        body: JSON.stringify({ status: apiStatus, resolution }),
      });
      setSelectedReport(null);
      fetchReports();
    } catch (err: any) {
      setError(err.message || "Failed to update report.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">Reports management</h1>
        <p className="mt-2 text-stone-500">Review and resolve user reports and fraud cases.</p>
      </div>

      <div className="rounded-2xl border border-stone-100 bg-white p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {["pending", "investigating", "resolved", "dismissed"].map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`rounded-lg px-4 py-2 text-sm font-semibold transition capitalize ${statusFilter === s ? "bg-emerald-600 text-white" : "bg-stone-100 text-stone-800 hover:bg-stone-200"}`}>{s}</button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="rounded-2xl border border-stone-100 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">Reported user</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">Reporter</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-sm text-stone-500">Loading reports...</td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-stone-500">No reports found in this status.</td></tr>
              ) : reports.map((report) => (
                <tr key={report._id} className="hover:bg-stone-50 transition">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-stone-900">{getUserLabel(report.reportedUser)}</p>
                    <p className="text-xs text-stone-500">{getUserEmail(report.reportedUser)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-stone-900">{getUserLabel(report.reportedBy || report.reportingUser)}</p>
                    <p className="text-xs text-stone-500">{getUserEmail(report.reportedBy || report.reportingUser)}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-700 max-w-xs"><p className="line-clamp-1">{report.reason}</p></td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[report.status] || "bg-stone-100 text-stone-700"}`}>
                      {report.status === "pending" || report.status === "open" ? <Clock size={12} /> : report.status === "investigating" || report.status === "reviewing" ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-600">{new Date(report.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => setSelectedReport(report)} className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">Review</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {total > 15 && (
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="rounded-lg border border-stone-200 px-4 py-2 text-sm disabled:opacity-50 hover:bg-stone-50">Previous</button>
          <span className="px-4 py-2 text-sm text-stone-700">Page {page}</span>
          <button onClick={() => setPage(page + 1)} disabled={page * 15 >= total} className="rounded-lg border border-stone-200 px-4 py-2 text-sm disabled:opacity-50 hover:bg-stone-50">Next</button>
        </div>
      )}

      {selectedReport && (
        <ReportModal report={selectedReport} onClose={() => setSelectedReport(null)} onUpdate={handleUpdate} />
      )}
    </div>
  );
}
