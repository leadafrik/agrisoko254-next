"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatLongDate } from "@/lib/marketplace";

type UploadState = {
  idFrontDocument: File | null;
  idBackDocument: File | null;
  selfieDocument: File | null;
};

export default function VerifyIdPage() {
  const { refreshUser } = useAuth();
  const [files, setFiles] = useState<UploadState>({
    idFrontDocument: null,
    idBackDocument: null,
    selfieDocument: null,
  });
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadStatus = async () => {
    setLoading(true);
    try {
      const response = await apiRequest(API_ENDPOINTS.verification.idStatus);
      setStatus(response?.verification ?? response?.data?.verification ?? response?.data ?? null);
    } catch (statusError: any) {
      setError(statusError?.message || "Unable to load verification status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStatus();
  }, []);

  const handleFile = (key: keyof UploadState, file: File | null) => {
    setFiles((current) => ({ ...current, [key]: file }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setUploading(true);

    try {
      const formData = new FormData();
      if (files.idFrontDocument) formData.append("idFrontDocument", files.idFrontDocument);
      if (files.idBackDocument) formData.append("idBackDocument", files.idBackDocument);
      if (files.selfieDocument) formData.append("selfieDocument", files.selfieDocument);

      await apiRequest(API_ENDPOINTS.verification.submitDocuments, {
        method: "POST",
        body: formData,
      });

      setSuccess("Documents submitted successfully. Admin review status will appear below.");
      await loadStatus();
      await refreshUser();
      setFiles({
        idFrontDocument: null,
        idBackDocument: null,
        selfieDocument: null,
      });
    } catch (submitError: any) {
      setError(submitError?.message || "Unable to submit verification documents.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-shell py-10 sm:py-12">
      <div className="mb-6">
        <p className="section-kicker">ID verification</p>
        <h1 className="mt-4 text-4xl font-bold text-stone-900">Submit identity documents for review</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600">
          Upload an ID front image, ID back image, and a selfie holding the same document. Agrisoko
          uses this process to strengthen marketplace trust signals.
        </p>
      </div>

      <section className="grid gap-8 xl:grid-cols-[1fr_0.8fr]">
        <form onSubmit={handleSubmit} className="surface-card p-6 sm:p-8">
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-2xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm font-medium text-forest-700">
              {success}
            </div>
          ) : null}

          <div className="mt-6 grid gap-5">
            {[
              ["idFrontDocument", "ID front image"],
              ["idBackDocument", "ID back image"],
              ["selfieDocument", "Selfie holding ID"],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="field-label">{label}</label>
                <input
                  type="file"
                  accept="image/*"
                  className="field-input"
                  onChange={(event) =>
                    handleFile(key as keyof UploadState, event.target.files?.[0] || null)
                  }
                  required
                />
              </div>
            ))}

            <button type="submit" disabled={uploading} className="primary-button w-full">
              {uploading ? "Submitting documents..." : "Submit for review"}
            </button>
          </div>
        </form>

        <aside className="space-y-6">
          <div className="surface-card p-6">
            <h2 className="text-2xl font-bold text-stone-900">Current status</h2>
            {loading ? (
              <p className="mt-4 text-sm text-stone-500">Loading verification status...</p>
            ) : status ? (
              <div className="mt-4 space-y-3 text-sm text-stone-700">
                <div className="rounded-2xl bg-stone-50 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Status</p>
                  <p className="mt-1 font-semibold text-stone-900">{status.status}</p>
                </div>
                {status.submittedAt ? (
                  <div className="rounded-2xl bg-stone-50 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Submitted</p>
                    <p className="mt-1 font-semibold text-stone-900">{formatLongDate(status.submittedAt)}</p>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="mt-4 text-sm text-stone-500">No ID submission found yet.</p>
            )}
          </div>

          <div className="soft-panel p-6">
            <h2 className="text-2xl font-bold text-stone-900">Before you upload</h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-stone-600">
              <li>Use clear, readable images with all corners visible.</li>
              <li>Make sure the selfie shows both your face and the same ID document.</li>
              <li>Use the same legal identity information you expect buyers or admin to trust.</li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}
