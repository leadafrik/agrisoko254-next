"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function VerifyPage() {
  const { user } = useAuth();

  const steps = [
    {
      label: "Account created",
      done: Boolean(user),
      helper: "You can browse and trade without waiting for verification.",
    },
    {
      label: "Phone on file",
      done: Boolean(user?.phone),
      helper: "A working phone number helps with checkout, contact, and trust signals.",
    },
    {
      label: "Identity review",
      done: Boolean(user?.verification?.idVerified || user?.verification?.isVerified),
      helper: "Optional ID review improves trust and marketplace credibility.",
    },
  ];

  return (
    <div className="page-shell py-10 sm:py-12">
      <section className="hero-panel p-6 sm:p-8">
        <p className="section-kicker">Verification</p>
        <h1 className="mt-4 text-4xl font-bold text-stone-900">Strengthen trust on your Agrisoko account</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600">
          Verification stays optional, but stronger trust signals help buyers move faster and take
          listings more seriously.
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {steps.map((step) => (
          <div
            key={step.label}
            className={`surface-card p-6 ${step.done ? "border-forest-200" : ""}`}
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-stone-900">{step.label}</h2>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                  step.done ? "bg-forest-50 text-forest-700" : "bg-stone-100 text-stone-500"
                }`}
              >
                {step.done ? "Done" : "Pending"}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">{step.helper}</p>
          </div>
        ))}
      </section>

      <section className="mt-8">
        <div className="soft-panel p-6">
          <h2 className="text-2xl font-bold text-stone-900">Upload identity documents</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600">
            Submit your ID front, ID back, and selfie for review. The status page shows whether
            your documents are pending, approved, or need attention.
          </p>
          <Link href="/verify-id" className="primary-button mt-5">
            Open ID verification
          </Link>
        </div>
      </section>
    </div>
  );
}
