"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

const CATEGORIES = [
  { slug: "produce",   label: "Produce",     emoji: "🌽", desc: "Maize, beans, vegetables, fruits" },
  { slug: "livestock", label: "Livestock",   emoji: "🐄", desc: "Cattle, goats, sheep, poultry" },
  { slug: "inputs",    label: "Farm Inputs", emoji: "🌱", desc: "Seeds, fertilizers, pesticides" },
  { slug: "services",  label: "Services",    emoji: "🚜", desc: "Equipment hire, consulting" },
];

export default function CreateListingPage() {
  const router = useRouter();
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold font-display text-stone-900 mb-2">Create a Listing</h1>
      <p className="text-stone-500 mb-8">What are you selling?</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {CATEGORIES.map((c) => (
          <button key={c.slug} onClick={() => router.push(`/create-listing/${c.slug}`)}
            className="bg-white rounded-xl border border-stone-100 p-6 text-left hover:border-terra-300 hover:shadow-sm transition-all group">
            <div className="text-3xl mb-3">{c.emoji}</div>
            <h3 className="font-bold text-stone-800 group-hover:text-terra-600 mb-1">{c.label}</h3>
            <p className="text-sm text-stone-500">{c.desc}</p>
          </button>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Link href="/request/new" className="text-sm text-forest-600 hover:underline font-medium">
          Looking to buy instead? Post a Buy Request →
        </Link>
      </div>
    </div>
  );
}
