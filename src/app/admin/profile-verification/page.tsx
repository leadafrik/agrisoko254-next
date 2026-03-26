"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { adminApiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

type PendingProfile = {
  _id: string;
  fullName?: string;
  phone?: string;
  email?: string;
  county?: string;
  constituency?: string;
  profileVerificationStatus?: string;
  fraud?: { flagsCount?: number };
};

type SellerDocuments = {
  idDocuments: { idFront?: string | null; idBack?: string | null; selfie?: string | null };
  otherDocuments: { type: string; url: string; uploadedAt?: string }[];
  verificationDetails: { idVerified?: boolean; selfieVerified?: boolean; notes?: string; status?: string };
};

export default function AdminProfileVerificationPage() {
  const [profiles, setProfiles] = useState<PendingProfile[]>([]);
  const [selected, setSelected] = useState<PendingProfile | null>(null);
  const [docs, setDocs] = useState<SellerDocuments | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rejectReason, setRejectReason] = useState("");
  const [working, setWorking] = useState(false);

  const loadProfiles = async (targetPage = page) => {
    setLoading(true);
    setError("");
    try {
      const response = await adminApiRequest(`${API_ENDPOINTS.admin.profiles.pending}?page=${targetPage}&limit=20&status=pending`);
      setProfiles(Array.isArray(response?.data) ? response.data : []);
      setTotalPages(response?.pagination?.pages || 1);
      setPage(targetPage);
    } catch (loadError: any) {
      setError(loadError?.message || "Unable to load pending profiles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await adminApiRequest(`${API_ENDPOINTS.admin.profiles.pending}?page=1&limit=20&status=pending`);
        setProfiles(Array.isArray(response?.data) ? response.data : []);
        setTotalPages(response?.pagination?.pages || 1);
        setPage(1);
      } catch (loadError: any) {
        setError(loadError?.message || "Unable to load pending profiles.");
      } finally {
        setLoading(false);
      }
    };

    void initialLoad();
  }, []);

  useEffect(() => {
    if (!selected?._id) return;
    adminApiRequest(API_ENDPOINTS.admin.sellers.documents(selected._id))
      .then((response) => setDocs(response?.data || null))
      .catch(() => setDocs(null));
  }, [selected]);

  const reviewProfile = async (status: "approved" | "rejected") => {
    if (!selected?._id) return;
    setWorking(true);
    setError("");
    try {
      if (status === "approved") {
        await adminApiRequest(API_ENDPOINTS.admin.profiles.verify(selected._id), {
          method: "PUT",
          body: JSON.stringify({ notes: "Approved by admin" }),
        });
      } else {
        if (!rejectReason.trim()) {
          setError("Rejection reason is required.");
          setWorking(false);
          return;
        }
        await adminApiRequest(API_ENDPOINTS.admin.profiles.reject(selected._id), {
          method: "PUT",
          body: JSON.stringify({ reason: rejectReason.trim() }),
        });
      }
      setSelected(null);
      setDocs(null);
      setRejectReason("");
      await loadProfiles(page);
    } catch (reviewError: any) {
      setError(reviewError?.message || "Unable to review this profile.");
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="ui-page-shell">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="ui-hero-panel p-6 md:p-8">
          <p className="ui-section-kicker">Profile verification</p>
          <h1 className="mt-4 text-4xl font-bold text-stone-900">Pending profile reviews</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-stone-600">
            Review seller documents and supporting uploads before upgrading a profile to verified status.
          </p>
        </section>

        {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="ui-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="ui-section-kicker">Queue</p>
                <h2 className="mt-2 text-xl font-semibold text-stone-900">Pending profiles</h2>
              </div>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">{profiles.length} on page</span>
            </div>
            <div className="mt-4 space-y-3">
              {loading ? (
                <p className="text-sm text-stone-500">Loading profiles...</p>
              ) : profiles.length === 0 ? (
                <p className="text-sm text-stone-500">No pending profiles.</p>
              ) : (
                profiles.map((profile) => (
                  <button key={profile._id} type="button" onClick={() => setSelected(profile)} className={`w-full rounded-2xl border px-4 py-3 text-left transition ${selected?._id === profile._id ? "border-terra-300 bg-terra-50" : "border-stone-200 bg-stone-50 hover:bg-stone-100"}`}>
                    <p className="font-semibold text-stone-900">{profile.fullName || "User profile"}</p>
                    <p className="mt-1 text-sm text-stone-600">{profile.email || profile.phone || "No contact"}</p>
                    <p className="mt-1 text-xs text-stone-500">{[profile.constituency, profile.county].filter(Boolean).join(", ") || "Location not set"}</p>
                  </button>
                ))
              )}
            </div>
            <div className="mt-5 flex items-center justify-between gap-3">
              <button type="button" disabled={page <= 1} onClick={() => void loadProfiles(page - 1)} className="ui-btn-secondary px-4 py-2">Previous</button>
              <p className="text-sm text-stone-500">Page {page} of {totalPages}</p>
              <button type="button" disabled={page >= totalPages} onClick={() => void loadProfiles(page + 1)} className="ui-btn-secondary px-4 py-2">Next</button>
            </div>
          </div>

          <div className="space-y-5">
            {selected ? (
              <>
                <div className="ui-card p-5">
                  <h2 className="text-xl font-semibold text-stone-900">{selected.fullName || "Profile"}</h2>
                  <div className="mt-4 grid gap-3 text-sm text-stone-700 md:grid-cols-2">
                    <p><span className="font-semibold text-stone-900">Email:</span> {selected.email || "-"}</p>
                    <p><span className="font-semibold text-stone-900">Phone:</span> {selected.phone || "-"}</p>
                    <p><span className="font-semibold text-stone-900">County:</span> {selected.county || "-"}</p>
                    <p><span className="font-semibold text-stone-900">Constituency:</span> {selected.constituency || "-"}</p>
                    <p><span className="font-semibold text-stone-900">Fraud flags:</span> {selected.fraud?.flagsCount || 0}</p>
                    <p><span className="font-semibold text-stone-900">Status:</span> {selected.profileVerificationStatus || "pending"}</p>
                  </div>
                </div>

                <div className="ui-card p-5">
                  <h2 className="text-xl font-semibold text-stone-900">Documents</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    {[docs?.idDocuments?.idFront, docs?.idDocuments?.idBack, docs?.idDocuments?.selfie].filter(Boolean).map((url, index) => (
                      <a key={`${selected._id}-${index}`} href={url as string} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-2xl border border-stone-200">
                        <div className="relative h-40 w-full">
                          <Image src={url as string} alt="Profile document" fill sizes="(min-width: 640px) 30vw, 100vw" className="object-cover" />
                        </div>
                      </a>
                    ))}
                  </div>
                  {docs?.otherDocuments?.length ? (
                    <div className="mt-4 space-y-2">
                      {docs.otherDocuments.map((document, index) => (
                        <a key={`${document.type}-${index}`} href={document.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-700">
                          <span className="font-semibold capitalize">{document.type.replace(/_/g, " ")}</span>
                          <span className="text-terra-700">Open</span>
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="ui-card p-5">
                  <h2 className="text-xl font-semibold text-stone-900">Review actions</h2>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button type="button" disabled={working} onClick={() => void reviewProfile("approved")} className="ui-btn-primary px-5 py-2.5">Approve profile</button>
                    <button type="button" disabled={working} onClick={() => void reviewProfile("rejected")} className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60">Reject profile</button>
                  </div>
                  <label className="mt-4 block">
                    <span className="ui-label">Rejection reason</span>
                    <textarea className="ui-textarea" value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} placeholder="Explain why this profile should be rejected." />
                  </label>
                </div>
              </>
            ) : (
              <div className="ui-card flex min-h-[420px] items-center justify-center p-8 text-center text-stone-500">
                Select a profile from the queue to review documents and approve or reject it.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
