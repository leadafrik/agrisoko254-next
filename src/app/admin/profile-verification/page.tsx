"use client";

import { useEffect, useState } from "react";
import { adminApiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { CheckCircle, XCircle } from "lucide-react";

interface PendingProfile {
  _id: string;
  fullName: string;
  phone?: string;
  email?: string;
  county?: string;
  constituency?: string;
  fraud?: { flagsCount?: number };
}

interface SellerDocuments {
  idDocuments: { idFront?: string; idBack?: string; selfie?: string };
  otherDocuments: { type: string; url: string; uploadedAt: string }[];
  verificationDetails: { idVerified?: boolean; selfieVerified?: boolean; notes?: string };
}

export default function AdminProfileVerificationPage() {
  const [profiles, setProfiles] = useState<PendingProfile[]>([]);
  const [selected, setSelected] = useState<PendingProfile | null>(null);
  const [docs, setDocs] = useState<SellerDocuments | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const loadProfiles = async (p = page) => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApiRequest(`${API_ENDPOINTS.admin.verification.pending}?page=${p}&limit=20`);
      setProfiles(res?.data || res?.profiles || []);
      setTotalPages(res?.pagination?.pages || res?.pages || 1);
      setSelected(null);
      setDocs(null);
    } catch (err: any) {
      setError(err?.message || "Failed to load profiles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfiles(page); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selected) return;
    adminApiRequest(`${API_ENDPOINTS.admin.verification.pending.replace("/pending", "")}/${selected._id}/documents`)
      .then((res) => setDocs(res?.data || res))
      .catch(() => setDocs(null));
  }, [selected]);

  const handleVerify = async () => {
    if (!selected) return;
    try {
      await adminApiRequest(API_ENDPOINTS.admin.verification.review(selected._id), { method: "PATCH", body: JSON.stringify({ status: "approved" }) });
      setSuccess(`Profile verified for ${selected.fullName}`);
      setTimeout(() => setSuccess(null), 3000);
      loadProfiles(page);
    } catch (err: any) { setError(err?.message); }
  };

  const handleReject = async () => {
    if (!selected || !rejectReason.trim()) { setError("Rejection reason is required."); return; }
    try {
      await adminApiRequest(API_ENDPOINTS.admin.verification.review(selected._id), { method: "PATCH", body: JSON.stringify({ status: "rejected", notes: rejectReason.trim() }) });
      setSuccess(`Profile rejected for ${selected.fullName}`);
      setRejectReason(""); setShowRejectForm(false);
      setTimeout(() => setSuccess(null), 3000);
      loadProfiles(page);
    } catch (err: any) { setError(err?.message); }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-stone-900">Profile verification</h1>

      {success && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2"><CheckCircle size={16} />{success}</div>}
      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2"><XCircle size={16} />{error}</div>}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile list */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="mb-4 text-base font-semibold text-stone-900">Pending profiles ({profiles.length})</h2>
          {loading && profiles.length === 0 && <p className="text-sm text-stone-500">Loading...</p>}
          {!loading && profiles.length === 0 && <p className="text-sm text-stone-500">No pending profiles.</p>}
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {profiles.map((p) => (
              <button key={p._id} onClick={() => setSelected(p)} className={`w-full rounded-xl p-3 text-left transition ${selected?._id === p._id ? "border-l-4 border-terra-500 bg-terra-50" : "bg-stone-50 hover:bg-stone-100"}`}>
                <p className="font-medium text-stone-900">{p.fullName}</p>
                <p className="text-sm text-stone-500">{p.phone}</p>
                <p className="mt-1 text-xs text-amber-600">Pending verification</p>
              </button>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-4 flex items-center gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="rounded-lg border border-stone-200 px-3 py-1 text-xs disabled:opacity-50 hover:bg-stone-50">Previous</button>
              <span className="text-xs text-stone-600">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="rounded-lg border border-stone-200 px-3 py-1 text-xs disabled:opacity-50 hover:bg-stone-50">Next</button>
            </div>
          )}
        </div>

        {/* Profile details */}
        {selected ? (
          <div className="space-y-5 lg:col-span-2">
            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="mb-4 text-base font-semibold text-stone-900">Profile information</h2>
              <div className="space-y-1 text-sm text-stone-700">
                <p><strong>Name:</strong> {selected.fullName}</p>
                {selected.phone && <p><strong>Phone:</strong> {selected.phone}</p>}
                {selected.email && <p><strong>Email:</strong> {selected.email}</p>}
                <p><strong>Location:</strong> {[selected.county, selected.constituency].filter(Boolean).join(", ") || "N/A"}</p>
                <p><strong>Fraud flags:</strong> <span className="text-red-600">{selected.fraud?.flagsCount || 0}</span></p>
              </div>
            </div>

            {docs && (
              <div className="rounded-2xl border border-stone-200 bg-white p-5">
                <h2 className="mb-4 text-base font-semibold text-stone-900">Documents</h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[["ID Front", docs.idDocuments.idFront], ["ID Back", docs.idDocuments.idBack], ["Selfie", docs.idDocuments.selfie]].map(([label, url]) => url ? (
                    <div key={label as string}>
                      <p className="mb-2 text-sm font-medium text-stone-600">{label}</p>
                      <a href={url as string} target="_blank" rel="noopener noreferrer">
                        <img src={url as string} alt={label as string} className="h-36 w-full rounded-xl border border-stone-200 object-cover" />
                      </a>
                    </div>
                  ) : null)}
                </div>
                {docs.otherDocuments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {docs.otherDocuments.map((d, i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3 text-sm">
                        <p className="font-medium capitalize">{d.type.replace(/_/g, " ")}</p>
                        <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-terra-600 hover:text-terra-700 font-semibold">View</a>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
                  <p>Status: {docs.verificationDetails.idVerified && docs.verificationDetails.selfieVerified ? "✓ ID and selfie verified" : "Pending"}</p>
                  {docs.verificationDetails.notes && <p className="mt-1">Notes: {docs.verificationDetails.notes}</p>}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="mb-4 text-base font-semibold text-stone-900">Actions</h2>
              <div className="flex gap-3">
                <button onClick={handleVerify} className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">Verify profile</button>
                <button onClick={() => setShowRejectForm(!showRejectForm)} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700">Reject profile</button>
              </div>
              {showRejectForm && (
                <div className="mt-4 rounded-xl bg-red-50 p-4">
                  <label className="mb-2 block text-sm font-medium text-stone-700">Reason for rejection (required)</label>
                  <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Explain why you're rejecting this profile..." rows={3} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none" />
                  <div className="mt-3 flex gap-2">
                    <button onClick={handleReject} className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700">Confirm rejection</button>
                    <button onClick={() => { setShowRejectForm(false); setRejectReason(""); }} className="flex-1 rounded-lg border border-stone-200 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-2xl bg-stone-100 lg:col-span-2">
            <p className="text-stone-500">Select a profile to review</p>
          </div>
        )}
      </div>
    </div>
  );
}
