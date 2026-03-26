"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CREATE_LISTING_CATEGORY_DETAILS } from "@/lib/marketplace";

const entries = Object.entries(CREATE_LISTING_CATEGORY_DETAILS) as Array<
  [keyof typeof CREATE_LISTING_CATEGORY_DETAILS, (typeof CREATE_LISTING_CATEGORY_DETAILS)[keyof typeof CREATE_LISTING_CATEGORY_DETAILS]]
>;

export default function CreateListingPage() {
  const searchParams = useSearchParams();
  const hintedCategory = searchParams.get("category");

  return (
    <div className="page-shell py-10 sm:py-12">
      <section className="hero-panel p-6 sm:p-8">
        <p className="section-kicker">Create listing</p>
        <h1 className="mt-4 text-4xl font-bold text-stone-900">Choose what you want to publish</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-600">
          Pick the right category first so the listing form stays focused, faster to complete, and
          easier for buyers to understand.
        </p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {entries.map(([slug, details]) => {
          const active = hintedCategory === slug;
          return (
            <Link
              key={slug}
              href={`/create-listing/${slug}`}
              className={`surface-card p-6 transition hover:-translate-y-1 hover:border-terra-200 ${
                active ? "border-terra-300 shadow-[0_24px_60px_-34px_rgba(160,69,46,0.45)]" : ""
              }`}
            >
              <p className="section-kicker">{slug}</p>
              <h2 className="mt-4 text-2xl font-bold text-stone-900">{details.heading}</h2>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">{details.intro}</p>
              <p className="mt-4 text-sm font-semibold text-stone-700">{details.placeholderTitle}</p>
            </Link>
          );
        })}
      </section>

      <section className="mt-8">
        <div className="soft-panel p-6">
          <h2 className="text-2xl font-bold text-stone-900">Need demand instead of supply?</h2>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            If you are sourcing instead of selling, use a buyer request so suppliers can respond to
            what you actually need.
          </p>
          <Link href="/request/new" className="primary-button mt-5">
            Post a buyer request
          </Link>
        </div>
      </section>
    </div>
  );
}
