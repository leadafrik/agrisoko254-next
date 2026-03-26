"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { adminApiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

type PendingVerification = {
  _id: string;
  status?: string;
  notes?: string;
  submittedAt?: string;
  idDocumentUrl?: string;
  idFrontUrl?: string;
  idBackUrl?: string;
  selfieUrl?: string;
  userId?: {
    _id?: string;
    fullName?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
};

const getUserLabel = (user?: { fullName?: string; name?: string; email?: string; phone?: string }) =>
  user?.fullName || user?.name || user?.email || user?.phone || "Unknown user";

export default function AdminIDVerificationPage() {
  const [verifications, setVerifications] = useState<PendingVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workingId, setWorkingId] = useState("");

  const fetchQueue = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await adminApiRequest(API_ENDPOINTS.admin.verification.pending);
      setVerifications(Array.isArray(response?.verifications) ? response.verifications : []);
    } catch (loadError: any) {
      setError(loadError?.message || "Unable to load the ID verification queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchQueue();
  }, []);

  const review = async (entry: PendingVerification, status: "approved" | "rejected") => {
    setWorkingId(entry._id);
    setError("");

    try {
      const notes =
        status === "rejected" ? window.prompt("Reason for rejection") || "" : "Approved by admin";
      await adminApiRequest(API_ENDPOINTS.admin.verification.review(entry._id), {
        method: "PUT",
        body: JSON.stringify({ status, notes }),
      });
      if (status === "approved" && entry.userId?._id) {
        await adminApiRequest(API_ENDPOINTS.admin.users.verifyId(entry.userId._id), {
          method: "PUT",
        }).catch(() => null);
      }
      await fetchQueue();
    } catch (reviewError: any) {
      setError(reviewError?.message || "Unable to review this verification.");
    } finally {
      setWorkingId("");
    }
  };

  return (
    <div className="ui-page-shell">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="ui-hero-panel p-6 md:p-8">
          <p className="ui-section-kicker">ID verification</p>
          <h1 className="mt-4 text-4xl font-bold text-stone-900">Identity review queue</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-stone-600">
            Review submitted ID fronts, backs, and selfies before promoting users into verified marketplace trust.
          </p>
          <div className="mt-5 ui-card inline-flex px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Pending checks</p>
              <p className="mt-2 text-2xl font-bold text-stone-900">{verifications.length}</p>
            </div>
          </div>
        </section>

        {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        {loading ? (
          <div className="ui-card p-6 text-sm text-stone-500">Loading ID verification queue...</div>
        ) : verifications.length === 0 ? (
          <div className="ui-card p-8 text-center text-stone-500">No pending ID verifications.</div>
        ) : (
          <div className="space-y-4">
            {verifications.map((entry) => {
              const docs = [entry.idFrontUrl, entry.idBackUrl, entry.selfieUrl, entry.idDocumentUrl].filter(Boolean) as string[];
              return (
                <div key={entry._id} className="ui-card p-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xl font-semibold text-stone-900">{getUserLabel(entry.userId)}</p>
                      <p className="mt-1 text-sm text-stone-600">{entry.userId?.email || entry.userId?.phone || "No contact"}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-500">Submitted {entry.submittedAt ? new Date(entry.submittedAt).toLocaleString("en-KE") : "recently"}</p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {docs.length === 0 ? (
                          <p className="text-sm text-stone-500">No documents attached.</p>
                        ) : (
                          docs.map((url, index) => (
                            <a key={`${entry._id}-${index}`} href={url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-2xl border border-stone-200">
                              <div className="relative h-36 w-full">
                                <Image src={url} alt="Verification document" fill sizes="(min-width: 1024px) 20vw, 100vw" className="object-cover" />
                              </div>
                            </a>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="flex min-w-[180px] flex-col gap-2">
                      <button type="button" disabled={workingId === entry._id} onClick={() => void review(entry, "approved")} className="ui-btn-primary px-4 py-2.5">Approve</button>
                      <button type="button" disabled={workingId === entry._id} onClick={() => void review(entry, "rejected")} className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60">Reject</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
