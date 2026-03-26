import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { serverFetch } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/lib/endpoints";

export const revalidate = 60;

export default async function HomePage() {
  const trending = await serverFetch<any>(
    API_ENDPOINTS.unifiedListings.trending(undefined, 8),
    { revalidate: 60 }
  );

  const categories = [
    { slug: "produce",   label: "Produce",     emoji: "🌽", desc: "Maize, beans, vegetables" },
    { slug: "livestock", label: "Livestock",   emoji: "🐄", desc: "Cattle, goats, poultry" },
    { slug: "inputs",    label: "Farm Inputs", emoji: "🌱", desc: "Seeds, fertilizers, tools" },
    { slug: "services",  label: "Services",    emoji: "🚜", desc: "Equipment hire, consulting" },
  ];

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-earth py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold font-display text-stone-900 leading-tight mb-4 animate-fade-in-up">
              Kenya&apos;s Agricultural Marketplace
            </h1>
            <p className="text-lg text-stone-600 mb-8 animate-fade-in-up-2">
              Buy and sell farm produce, livestock, inputs, and services. Directly from verified Kenyan farmers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-up-3">
              <Link href="/browse"
                className="bg-terra-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-terra-600 transition-colors">
                Browse Listings
              </Link>
              <Link href="/login?mode=signup"
                className="bg-white border border-stone-200 text-stone-700 px-8 py-3 rounded-xl font-semibold hover:bg-stone-50 transition-colors">
                Start Selling Free
              </Link>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold font-display text-stone-900 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((c) => (
              <Link key={c.slug} href={`/browse/${c.slug}`}
                className="bg-white rounded-xl border border-stone-100 p-5 hover:border-terra-300 hover:shadow-sm transition-all group">
                <div className="text-3xl mb-2">{c.emoji}</div>
                <div className="font-semibold text-stone-800 group-hover:text-terra-600">{c.label}</div>
                <div className="text-xs text-stone-500 mt-0.5">{c.desc}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Learn Hub CTA */}
        <section className="bg-forest-50 border-y border-forest-100 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold font-display text-stone-900 mb-2">
                Kenya Farming Knowledge Hub
              </h2>
              <p className="text-stone-600 max-w-xl">
                Free guides on poultry, crops, livestock, and market prices — written for Kenyan conditions.
                How to raise broilers, when to sell maize, which fertilizer for which soil.
              </p>
            </div>
            <Link href="/learn"
              className="shrink-0 bg-forest-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-forest-700 transition-colors">
              Explore the Hub →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
