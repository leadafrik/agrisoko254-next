"use client";

import { CheckCircle, Star } from "lucide-react";

interface UserRating {
  average: number;
  count: number;
}

interface Props {
  rating?: UserRating;
  showCount?: boolean;
  size?: "sm" | "md" | "lg";
  verified?: boolean;
}

export default function UserRatingBadge({ rating, showCount = true, size = "md", verified = false }: Props) {
  const sizeClass = size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm";
  const iconClass = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5";

  if (!rating || rating.count === 0) {
    return <span className={`${sizeClass} text-stone-400`}>No ratings yet</span>;
  }

  return (
    <div className={`inline-flex items-center gap-2 ${sizeClass}`} aria-label={`${rating.average.toFixed(1)} out of 5 from ${rating.count} reviews`}>
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`${iconClass} ${i < Math.round(rating.average) ? "fill-yellow-400 text-yellow-500" : "fill-transparent text-stone-300"}`} strokeWidth={2} aria-hidden />
        ))}
      </div>
      <span className="font-semibold text-stone-800">{rating.average.toFixed(1)}</span>
      {showCount && <span className="text-stone-500">({rating.count} {rating.count === 1 ? "review" : "reviews"})</span>}
      {verified && <><CheckCircle className={`${iconClass} ml-1 text-emerald-600`} aria-hidden /><span className="sr-only">Verified</span></>}
    </div>
  );
}
