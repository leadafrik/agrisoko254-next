"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import UserRatingBadge from "./UserRatingBadge";

interface Rating {
  _id: string;
  score: number;
  review?: string;
  raterId: { _id: string; fullName: string };
  category: string;
  createdAt: string;
}

interface Props {
  userId: string;
  maxReviews?: number;
  verified?: boolean;
}

export default function UserRatingsList({ userId, maxReviews = 5, verified = false }: Props) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [aggregate, setAggregate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest(API_ENDPOINTS.ratings.getUserRatings(userId))
      .then((res: any) => {
        if (!active) return;
        setRatings(res?.data?.ratings || []);
        setAggregate(res?.data?.aggregate || null);
      })
      .catch(() => setError("Failed to load ratings"))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [userId]);

  if (loading) return <p className="text-sm text-stone-500">Loading ratings...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  const displayed = ratings.slice(0, maxReviews);

  return (
    <div className="space-y-6">
      {aggregate && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <h3 className="mb-3 text-base font-bold text-stone-900">Seller ratings</h3>
          <UserRatingBadge rating={aggregate} showCount size="lg" verified={verified} />
          {aggregate.breakdown && (
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {Object.entries(aggregate.breakdown).map(([category, score]: [string, any]) =>
                score > 0 ? (
                  <div key={category} className="flex justify-between">
                    <span className="capitalize text-stone-600">{category}:</span>
                    <span className="font-semibold text-stone-900">{(score / (aggregate.count || 1)).toFixed(1)}/5</span>
                  </div>
                ) : null
              )}
            </div>
          )}
        </div>
      )}

      {displayed.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-stone-900">Recent reviews</h4>
          {displayed.map((r) => (
            <div key={r._id} className="rounded-2xl border border-stone-200 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-stone-900">{r.raterId.fullName}</p>
                  <p className="text-xs text-stone-500">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < r.score ? "fill-yellow-400 text-yellow-500" : "fill-transparent text-stone-300"}`} strokeWidth={2} />
                  ))}
                </div>
              </div>
              {r.category && r.category !== "overall" && <p className="mt-1 text-xs text-stone-500">Rating: <span className="capitalize font-semibold">{r.category}</span></p>}
              {r.review && <p className="mt-2 text-sm text-stone-700">{r.review}</p>}
            </div>
          ))}
          {ratings.length > maxReviews && <p className="text-center text-xs text-stone-500">Showing {maxReviews} of {ratings.length} reviews</p>}
        </div>
      ) : (
        <div className="rounded-2xl bg-stone-50 px-4 py-8 text-center text-sm text-stone-500">No reviews yet. Be the first to review!</div>
      )}
    </div>
  );
}
