import type { Metadata } from "next";
import Link from "next/link";
import { getAllCategories, getArticlesByCategory, getFeaturedArticles, CATEGORY_META } from "@/lib/mdx";

export const metadata: Metadata = {
  title: "Kenya Farming Knowledge Hub",
  description:
    "Free farming guides for Kenyan farmers. Learn how to raise broilers, grow maize, manage livestock, and track market prices.",
  alternates: { canonical: "https://www.agrisoko254.com/learn" },
};

export default function LearnIndexPage() {
  const featured   = getFeaturedArticles(4);
  const categories = getAllCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold font-display text-stone-900 mb-3">
          Kenya Farming Knowledge Hub
        </h1>
        <p className="text-lg text-stone-600 max-w-2xl">
          Practical guides written for Kenyan conditions — poultry, crops, livestock, inputs, and weekly market prices.
        </p>
      </div>

      {/* Featured articles */}
      {featured.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-stone-800 mb-4">Featured Guides</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.map((a) => (
              <Link key={`${a.category}/${a.slug}`} href={`/learn/${a.category}/${a.slug}`}
                className="bg-white rounded-xl border border-stone-100 p-5 hover:border-terra-300 hover:shadow-sm transition-all group">
                <span className="text-xs font-semibold text-forest-600 uppercase tracking-wide">
                  {CATEGORY_META[a.category]?.label ?? a.category}
                </span>
                <h3 className="font-semibold text-stone-800 mt-1 group-hover:text-terra-600 leading-snug">{a.title}</h3>
                <p className="text-xs text-stone-500 mt-2 line-clamp-2">{a.description}</p>
                <span className="text-xs text-stone-400 mt-3 block">{a.readTimeMinutes} min read</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <section>
        <h2 className="text-xl font-bold text-stone-800 mb-6">Browse by Topic</h2>
        <div className="space-y-10">
          {categories.map((category) => {
            const meta     = CATEGORY_META[category];
            const articles = getArticlesByCategory(category).slice(0, 4);
            if (!articles.length) return null;

            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                    <span>{meta?.emoji}</span> {meta?.label ?? category}
                  </h3>
                  <Link href={`/learn/${category}`}
                    className="text-sm text-forest-600 hover:text-forest-800 font-medium">
                    All {meta?.label} guides →
                  </Link>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {articles.map((a) => (
                    <Link key={a.slug} href={`/learn/${category}/${a.slug}`}
                      className="bg-white rounded-xl border border-stone-100 p-4 hover:border-forest-300 hover:shadow-sm transition-all group">
                      <h4 className="font-semibold text-stone-800 text-sm group-hover:text-forest-700 leading-snug">{a.title}</h4>
                      <p className="text-xs text-stone-500 mt-1.5 line-clamp-2">{a.description}</p>
                      <span className="text-xs text-stone-400 mt-2 block">{a.readTimeMinutes} min read</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
