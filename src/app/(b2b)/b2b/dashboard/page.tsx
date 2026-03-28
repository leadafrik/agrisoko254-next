"use client";

import Link from "next/link";
import { ArrowRight, ClipboardList, MessageCircle, PackageSearch, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const quickActions = [
  {
    title: "Post a sourcing request",
    description: "Use the live buyer-request flow to publish quantity, quality, county, and delivery timing.",
    href: "/request/new",
    cta: "Create request",
    icon: ClipboardList,
  },
  {
    title: "Review live demand",
    description: "See current buyer requests and active marketplace demand before you source or bid.",
    href: "/request",
    cta: "Open request board",
    icon: PackageSearch,
  },
  {
    title: "Track bulk workflows",
    description: "Move into the bulk order board for higher-volume operational follow-up and fulfilment.",
    href: "/bulk/orders",
    cta: "Open bulk orders",
    icon: ArrowRight,
  },
  {
    title: "Watch price signals",
    description: "Use live intelligence to anchor procurement decisions before you publish or negotiate.",
    href: "/market-intelligence",
    cta: "Open market intelligence",
    icon: TrendingUp,
  },
];

export default function B2BDashboardPage() {
  const { user } = useAuth();
  const displayName = user?.fullName || user?.name || "B2B partner";

  return (
    <div className="space-y-8">
      <section className="rounded-[30px] border border-stone-200 bg-white p-6 shadow-[0_18px_50px_-36px_rgba(28,25,23,0.22)] sm:p-8">
        <p className="inline-flex rounded-full border border-terra-200 bg-terra-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-terra-700">
          Portal home
        </p>
        <h1 className="mt-4 text-3xl font-bold text-stone-900 sm:text-4xl">Welcome back, {displayName}.</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-stone-600 sm:text-base">
          The B2B portal now uses Agrisoko&apos;s live marketplace workflows instead of demo-only data.
          Use the actions below for sourcing, messaging, bulk coordination, and market checks while the
          dedicated RFQ automation layer is being completed.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/b2b/dashboard/rfqs/new" className="primary-button">
            Start a sourcing request
          </Link>
          <Link href="/messages" className="secondary-button">
            Open messages
          </Link>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {quickActions.map((item) => (
          <article key={item.title} className="surface-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-terra-50 text-terra-600">
                <item.icon className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-stone-900">{item.title}</h2>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-stone-600">{item.description}</p>
            <Link href={item.href} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-terra-600 hover:text-terra-700">
              {item.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </section>

      <section className="rounded-[28px] border border-stone-200 bg-stone-50 p-6">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-5 w-5 text-terra-600" />
          <h2 className="text-xl font-semibold text-stone-900">What this salvage changed</h2>
        </div>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-stone-600">
          <li>The portal now uses the real Agrisoko session instead of demo credentials.</li>
          <li>Navigation points to live sourcing, messaging, and bulk workflows already in production.</li>
          <li>Placeholder bids and RFQs were removed so users do not see fabricated commercial data.</li>
        </ul>
      </section>
    </div>
  );
}
