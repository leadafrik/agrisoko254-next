"use client";

import Link from "next/link";
import { ArrowRight, MessageCircle, ShoppingBag, Store, Truck } from "lucide-react";

const supplierActions = [
  {
    title: "Browse buyer requests",
    description: "Open the live demand board and respond through the existing marketplace sourcing flow.",
    href: "/request",
    cta: "Open buyer requests",
    icon: Store,
  },
  {
    title: "Manage seller fulfilment",
    description: "Use the bulk seller order workspace for operational follow-up once supply is confirmed.",
    href: "/bulk/seller/orders",
    cta: "Open seller orders",
    icon: Truck,
  },
  {
    title: "Keep negotiation moving",
    description: "Use messages for price confirmation, logistics alignment, and buyer follow-up.",
    href: "/messages",
    cta: "Open messages",
    icon: MessageCircle,
  },
  {
    title: "Stay inside bulk workflows",
    description: "Move back to the bulk workspace whenever you need the broader demand and execution context.",
    href: "/bulk",
    cta: "Open bulk workspace",
    icon: ShoppingBag,
  },
];

export default function B2BBidsPage() {
  return (
    <div className="space-y-8">
      <section className="surface-card p-6 sm:p-8">
        <div className="sm:flex sm:items-start sm:justify-between">
          <div>
            <p className="section-kicker">Supplier desk</p>
            <h1 className="mt-4 text-3xl font-bold text-stone-900">Respond through the live seller workflows.</h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-stone-600 sm:text-base">
              Dedicated bid tracking is still being wired into the B2B portal. For now, suppliers should
              work from live buyer requests, messages, and the current bulk fulfilment tools.
            </p>
          </div>
          <Link href="/request" className="primary-button mt-5 sm:mt-0">
            Browse buyer requests
          </Link>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {supplierActions.map((item) => (
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
