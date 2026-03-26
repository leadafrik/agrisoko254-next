import type { Metadata } from "next";
import Link from "next/link";
import SectionHeading from "@/components/marketplace/SectionHeading";
import { ABOUT_FAQS, PLATFORM_PROMISES } from "@/lib/marketplace";

export const metadata: Metadata = {
  title: "About Agrisoko | Marketplace Mission and Model",
  description:
    "Learn how Agrisoko connects Kenyan farmers, buyers, service providers, and institutional demand through one practical marketplace.",
};

const pillars = [
  {
    title: "Built for Kenyan conditions",
    description:
      "County-level trade realities, manual payment verification, and practical trust signals shape the product decisions.",
  },
  {
    title: "Direct-market mindset",
    description:
      "Agrisoko is designed to help farmers and buyers connect with less broker friction and clearer information.",
  },
  {
    title: "One product, not disconnected tools",
    description:
      "Marketplace, buyer requests, bulk trade, and the Learn hub are kept close together so users move naturally between them.",
  },
];

export default function AboutPage() {
  return (
    <div className="page-shell py-10 sm:py-12">
      <section className="hero-panel p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="section-kicker">About Agrisoko</p>
            <h1 className="mt-4 text-4xl font-bold text-stone-900 sm:text-5xl">
              A serious marketplace for Kenya&apos;s agricultural economy.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-stone-600">
              Agrisoko exists to make agricultural trade more direct, more trusted, and easier to
              navigate. Farmers need visibility. Buyers need confidence. Service providers need a
              clearer route to real customers.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/browse" className="primary-button">
                Explore marketplace
              </Link>
              <Link href="/login?mode=signup" className="secondary-button">
                Join Agrisoko
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="metric-chip">
                <h2 className="text-xl font-bold text-stone-900">{pillar.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading
          eyebrow="Platform model"
          title="What Agrisoko is trying to solve"
          description="The strongest parts of the original product were not decorative. They were operational: trust, visibility, and practical ways to close trade."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PLATFORM_PROMISES.map((promise) => (
            <div key={promise.title} className="surface-card p-6">
              <h3 className="text-2xl font-bold text-stone-900">{promise.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">{promise.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading
          eyebrow="How it fits together"
          title="Marketplace, demand, and knowledge stay connected"
          description="Agrisoko works best when listings, requests, bulk trade, and learning are treated as one user journey instead of isolated pages."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {[
            {
              title: "Marketplace",
              body: "Browse produce, livestock, inputs, and services with county context and seller cues.",
            },
            {
              title: "Buyer requests",
              body: "Demand-first flows help suppliers respond to real needs instead of waiting passively for discovery.",
            },
            {
              title: "Learn hub",
              body: "Educational content remains close to the commercial product so guidance leads into action.",
            },
          ].map((item) => (
            <div key={item.title} className="surface-card p-6">
              <h3 className="text-2xl font-bold text-stone-900">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading
          eyebrow="Common questions"
          title="What users usually want to know first"
          description="These are the questions that matter in product onboarding, trust building, and practical trade readiness."
        />
        <div className="mt-8 space-y-4">
          {ABOUT_FAQS.map((item) => (
            <div key={item.question} className="surface-card p-6">
              <h3 className="text-xl font-bold text-stone-900">{item.question}</h3>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
