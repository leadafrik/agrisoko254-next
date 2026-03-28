"use client";

import Link from "next/link";
import { ArrowRight, ClipboardList, PackageSearch, ShoppingBag, TrendingUp } from "lucide-react";

const deskActions = [
  {
    title: "Create a buyer request",
    description: "Publish quantity, quality, county, budget, and delivery timing through the live marketplace request flow.",
    href: "/request/new",
    cta: "Create request",
    icon: ClipboardList,
  },
  {
    title: "Review active requests",
    description: "Open the current request board to see your sourcing activity and active demand in the marketplace.",
    href: "/request",
    cta: "Open request board",
    icon: PackageSearch,
  },
  {
    title: "Move into bulk follow-up",
    description: "Use the bulk workflow board where higher-volume sourcing and order coordination already live.",
    href: "/bulk/orders",
    cta: "Open bulk orders",
    icon: ShoppingBag,
  },
  {
    title: "Check live price signals",
    description: "Benchmark procurement decisions against the live intelligence board before you send or accept offers.",
    href: "/market-intelligence",
    cta: "Open market board",
    icon: TrendingUp,
  },
];

export default function B2BRFQsPage() {
  return (
    <div className="space-y-8">
      <section className="surface-card p-6 sm:p-8">
        <div className="sm:flex sm:items-start sm:justify-between">
          <div>
            <p className="section-kicker">Sourcing desk</p>
            <h1 className="mt-4 text-3xl font-bold text-stone-900">Use the live sourcing workflows.</h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-stone-600 sm:text-base">
              Dedicated RFQ tracking is still being wired into the B2B portal. For now, this desk routes
              buyers into the real request and bulk flows already running in Agrisoko.
            </p>
          </div>
          <Link href="/b2b/dashboard/rfqs/new" className="primary-button mt-5 sm:mt-0">
            Start a sourcing request
          </Link>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {deskActions.map((item) => (
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
    </div>
  );
}
