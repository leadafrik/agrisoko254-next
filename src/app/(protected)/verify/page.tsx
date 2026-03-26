"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function VerifyPage() {
  const { user } = useAuth();

  const steps = [
    { label: "Phone verified", done: !!user?.verification?.phoneVerified },
    { label: "ID uploaded", done: !!user?.verification?.idVerified },
    { label: "Profile verified", done: !!user?.verification?.isVerified },
  ];

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold font-display text-stone-900 mb-2">Account Verification</h1>
      <p className="text-stone-500 mb-8">Verified sellers get more trust and visibility on Agrisoko.</p>

      <div className="space-y-3 mb-8">
        {steps.map((s) => (
          <div key={s.label} className={`flex items-center gap-3 p-4 rounded-xl border ${s.done ? "bg-forest-50 border-forest-200" : "bg-white border-stone-100"}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${s.done ? "bg-forest-500 text-white" : "bg-stone-200 text-stone-500"}`}>
              {s.done ? "✓" : "–"}
            </span>
            <span className={`font-medium text-sm ${s.done ? "text-forest-700" : "text-stone-600"}`}>{s.label}</span>
          </div>
        ))}
      </div>

      {!user?.verification?.idVerified && (
        <Link href="/verify-id" className="block w-full bg-terra-500 text-white text-center py-3 rounded-lg font-semibold hover:bg-terra-600 transition-colors">
          Upload ID Documents
        </Link>
      )}
    </div>
  );
}
