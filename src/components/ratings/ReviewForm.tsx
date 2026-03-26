"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

interface Props {
  reviewedId: string;
  listingId: string;
  onSuccess?: () => void;
}

type Categories = { communication: number; accuracy: number; reliability: number };

export default function ReviewForm({ reviewedId, listingId, onSuccess }: Props) {
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [comment, setComment] = useState("");
  const [categories, setCategories] = useState<Categories>({ communication: 5, accuracy: 5, reliability: 5 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.length < 10) { setError("Comment must be at least 10 characters."); return; }
    try {
      setLoading(true);
      setError("");
      await apiRequest(API_ENDPOINTS.ratings.submit, {
        method: "POST",
        body: JSON.stringify({ reviewedId, listingId, rating, comment, categories }),
      });
      setRating(5); setComment(""); setCategories({ communication: 5, accuracy: 5, reliability: 5 });
      setSubmitted(true);
      onSuccess?.();
    } catch (err: any) {
      setError(err?.message || "Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-700">Review submitted successfully!</div>;

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-stone-200 bg-white p-6 space-y-5">
      <h3 className="text-lg font-semibold text-stone-900">Leave a review</h3>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">Overall rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} type="button" onClick={() => setRating(s as 1 | 2 | 3 | 4 | 5)}>
              <Star size={28} className={`transition-colors cursor-pointer ${s <= rating ? "fill-yellow-400 text-yellow-400" : "text-stone-300"}`} />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-stone-700">Category ratings</label>
        {(Object.keys(categories) as (keyof Categories)[]).map((cat) => (
          <div key={cat}>
            <div className="flex items-center justify-between mb-1">
              <span className="capitalize text-sm text-stone-600">{cat}</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} className={s <= categories[cat] ? "fill-yellow-400 text-yellow-400" : "text-stone-300"} />
                ))}
              </div>
            </div>
            <input type="range" min={1} max={5} value={categories[cat]} onChange={(e) => setCategories({ ...categories, [cat]: Number(e.target.value) })} className="w-full" />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">Your review</label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience (min 10 characters)" rows={4} className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-terra-400" />
        <p className="mt-1 text-xs text-stone-400">{comment.length} / 500</p>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <button type="submit" disabled={loading || comment.length < 10} className="w-full rounded-xl bg-terra-500 py-3 text-sm font-semibold text-white hover:bg-terra-600 disabled:opacity-50">
        {loading ? "Submitting..." : "Submit review"}
      </button>
    </form>
  );
}
