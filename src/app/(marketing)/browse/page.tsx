import type { Metadata } from "next";
import Link from "next/link";
import { serverFetch } from "@/lib/api-server";
import { API_BASE_URL } from "@/lib/endpoints";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Browse Listings — Farm Produce, Livestock, Inputs & Services",
  description: "Browse verified agricultural listings in Kenya. Buy produce, livestock, farm inputs and services directly from farmers.",
};

const CATEGORIES = [
  { slug: "produce",   label: "Produce",     emoji: "🌽", desc: "Maize, beans, vegetables, fruits" },
  { slug: "livestock", label: "Livestock",   emoji: "🐄", desc: "Cattle, goats, sheep, poultry, pigs" },
  { slug: "inputs",    label: "Farm Inputs", emoji: "🌱", desc: "Seeds, fertilizers, pesticides, tools" },
  { slug: "services",  label: "Services",    emoji: "🚜", desc: "Equipment hire, consulting, transport" },
];

export default async function BrowsePage() {
  const data = await serverFetch<any>(`${API_BASE_URL}/unified-listings/trending?limit=24`, { revalidate: 60 });
  const listings = data?.listings ?? data ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold font-display text-stone-900 mb-2">Browse Listings</h1>
      <p className="text-stone-500 mb-8">Verified sellers across Kenya</p>

      {/* Category filter */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link href="/browse" className="px-4 py-2 rounded-full bg-terra-500 text-white text-sm font-medium">All</Link>
        {CATEGORIES.map((c) => (
          <Link key={c.slug} href={`/browse/${c.slug}`}
            className="px-4 py-2 rounded-full bg-white border border-stone-200 text-stone-700 text-sm font-medium hover:border-terra-300 transition-colors">
            {c.emoji} {c.label}
          </Link>
        ))}
      </div>

      {/* Listings grid */}
      {listings.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {listings.map((listing: any) => (
            <Link key={listing._id} href={`/listings/${listing._id}`}
              className="bg-white rounded-xl border border-stone-100 overflow-hidden hover:shadow-md hover:border-terra-200 transition-all group">
              {listing.images?.[0] && (
                <div className="aspect-[4/3] overflow-hidden bg-stone-100">
                  <img src={listing.images[0]} alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              )}
              <div className="p-4">
                <p className="text-xs text-terra-600 font-semibold uppercase tracking-wide mb-1">{listing.category}</p>
                <h3 className="font-semibold text-stone-800 leading-snug line-clamp-2 group-hover:text-terra-600">{listing.title}</h3>
                {listing.price && (
                  <p className="text-lg font-bold text-stone-900 mt-2">KES {listing.price.toLocaleString()}</p>
                )}
                {listing.location && (
                  <p className="text-xs text-stone-400 mt-1">📍 {listing.location}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-stone-400">
          <p className="text-lg">No listings yet — check back soon.</p>
          <Link href="/login?mode=signup" className="mt-4 inline-block bg-terra-500 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-terra-600">
            Be the first to list
          </Link>
        </div>
      )}
    </div>
  );
}
