"use client";

import { CheckCircle } from "lucide-react";

interface VerificationBadges {
  verified: boolean;
  trustScore: number;
  badges: { phone: boolean; email: boolean; id: boolean; selfie: boolean };
  verificationYear?: number;
  canShowBadge: boolean;
}

export function TrustBadges({ badges }: { badges: VerificationBadges }) {
  const trustLevel = badges.trustScore >= 80 ? "high" : badges.trustScore >= 40 ? "medium" : "low";
  const barColor = trustLevel === "high" ? "bg-emerald-500" : trustLevel === "medium" ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="h-2 flex-1 rounded-full bg-stone-200">
          <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${badges.trustScore}%` }} />
        </div>
        <span className="text-xs font-semibold text-stone-600">{badges.trustScore}</span>
      </div>
      {badges.canShowBadge && badges.verificationYear && (
        <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
          <CheckCircle size={12} /> Verified {badges.verificationYear}
        </div>
      )}
      <div className="flex flex-wrap gap-1">
        {[
          { key: "phone", icon: "📱", label: "Phone" },
          { key: "email", icon: "✉️", label: "Email" },
          { key: "id", icon: "🆔", label: "ID" },
          { key: "selfie", icon: "👤", label: "Selfie" },
        ].map(({ key, icon, label }) => (
          <span key={key} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${(badges.badges as any)[key] ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>
            {icon} {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function TrustScoreBar({ trustScore, size = "medium" }: { trustScore: number; size?: "small" | "medium" | "large" }) {
  const pct = Math.min(trustScore, 100);
  const color = pct >= 80 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500";
  const h = size === "small" ? "h-1.5" : size === "large" ? "h-3" : "h-2";
  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 rounded-full bg-stone-200 ${h}`}>
        <div className={`rounded-full ${h} ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="shrink-0 text-xs font-semibold text-stone-600">{trustScore}/100</span>
    </div>
  );
}

export function VerificationProgress({ badges }: { badges: VerificationBadges }) {
  const steps = [
    { name: "Phone", completed: badges.badges.phone, points: 20 },
    { name: "Email", completed: badges.badges.email, points: 20 },
    { name: "ID Document", completed: badges.badges.id, points: 30 },
    { name: "Selfie", completed: badges.badges.selfie, points: 30 },
  ];
  const done = steps.filter((s) => s.completed).length;
  const pct = (done / steps.length) * 100;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4">
      <div>
        <h3 className="text-base font-bold text-stone-900">Build your trust</h3>
        <p className="mt-1 text-sm text-stone-500">Complete verification steps to increase your trust score.</p>
      </div>
      <div>
        <div className="h-2 w-full rounded-full bg-stone-200">
          <div className="h-2 rounded-full bg-terra-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1 flex justify-between text-xs text-stone-500">
          <span>{done}/{steps.length} steps</span>
          <span>{badges.trustScore}/100 points</span>
        </div>
      </div>
      <div className="space-y-2">
        {steps.map((s) => (
          <div key={s.name} className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm ${s.completed ? "bg-emerald-50" : "bg-stone-50"}`}>
            <div className="flex items-center gap-2">
              <span className={s.completed ? "text-emerald-600 font-bold" : "text-stone-400"}>
                {s.completed ? "✓" : "○"}
              </span>
              <span className={s.completed ? "font-medium text-stone-900" : "text-stone-600"}>{s.name}</span>
            </div>
            <span className="text-xs font-semibold text-stone-500">+{s.points} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SellerCredibility({ sellerName, trustScore, listings, reviews, verified, verified_year }: {
  sellerName: string; trustScore: number; listings: number; reviews: number; verified: boolean; verified_year?: number;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4">
      <div className="flex items-start justify-between">
        <h3 className="text-base font-bold text-stone-900">About the seller</h3>
        {verified && verified_year && <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1"><CheckCircle size={12} /> Verified {verified_year}</span>}
      </div>
      <p className="font-semibold text-stone-900">{sellerName}</p>
      <div className="grid grid-cols-3 gap-3 text-center text-sm">
        <div className="rounded-xl bg-stone-50 py-3"><p className="text-xl font-bold text-stone-900">{listings}</p><p className="text-xs text-stone-500">Listings</p></div>
        <div className="rounded-xl bg-stone-50 py-3"><p className="text-xl font-bold text-stone-900">{reviews}</p><p className="text-xs text-stone-500">Reviews</p></div>
        <div className="rounded-xl bg-stone-50 py-3"><p className="text-xl font-bold text-stone-900">{trustScore}%</p><p className="text-xs text-stone-500">Trust</p></div>
      </div>
      <TrustScoreBar trustScore={trustScore} size="medium" />
    </div>
  );
}
