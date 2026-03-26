"use client";

import { useState } from "react";
import { submitReport } from "@/services/reportService";

interface ReportModalProps {
  isOpen: boolean;
  sellerId: string;
  sellerName: string;
  listingId?: string;
  listingType?: string;
  onClose: () => void;
  onSubmitSuccess?: () => void;
}

export default function ReportModal({ isOpen, sellerId, sellerName, listingId, listingType, onClose, onSubmitSuccess }: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) { setError("Please select a reason for the report"); return; }
    try {
      setLoading(true);
      setError(null);
      const result = await submitReport(sellerId, reason, description, listingId, listingType, severity);
      if (!result || (!result._id && !result.reportId)) throw new Error("Failed to submit report");
      setReason(""); setDescription(""); setSeverity("medium");
      onSubmitSuccess?.();
      onClose();
    } catch (err) {
      setError((err as Error).message || "Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between rounded-t-2xl bg-red-600 px-6 py-4 text-white">
          <h2 className="text-lg font-semibold">Report user</h2>
          <button onClick={onClose} className="text-white hover:opacity-80 text-xl font-bold">×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <p className="text-sm text-stone-600">Reporting: <strong>{sellerName}</strong></p>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">Reason *</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-red-400">
              <option value="">Select a reason...</option>
              <option value="Fraud">Fraud or scam</option>
              <option value="Harassment">Harassment or abuse</option>
              <option value="Inappropriate Content">Inappropriate content</option>
              <option value="Spam">Spam</option>
              <option value="Fake Profile">Fake or misrepresented profile</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">Description (optional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide details about the issue..." rows={3} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-red-400" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">Severity</label>
            <select value={severity} onChange={(e) => setSeverity(e.target.value as "low" | "medium" | "high")} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-red-400">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50">Cancel</button>
            <button type="submit" disabled={loading || !reason.trim()} className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
              {loading ? "Submitting..." : "Submit report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
