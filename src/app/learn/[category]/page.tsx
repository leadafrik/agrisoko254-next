import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticlesByCategory, getAllCategories, CATEGORY_META } from "@/lib/mdx";

interface Props { params: { category: string } }

export async function generateStaticParams() {
  return getAllCategories().map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const meta = CATEGORY_META[params.category];
  if (!meta) return {};
  return {
    title: `${meta.label} Farming Guides for Kenya`,
    description: `${meta.description}. Practical guides for Kenyan farmers.`,
    alternates: { canonical: `https://www.agrisoko254.com/learn/${params.category}` },
  };
}

export default function CategoryPage({ params }: Props) {
  const meta     = CATEGORY_META[params.category];
  const articles = getArticlesByCategory(params.category);

  if (!meta) notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-stone-500 mb-6 flex items-center gap-1">
        <Link href="/learn" className="hover:text-forest-700">Learn</Link>
        <span>/</span>
        <span className="text-stone-800 font-medium">{meta.label}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display text-stone-900 mb-2 flex items-center gap-2">
          <span>{meta.emoji}</span> {meta.label} Farming in Kenya
        </h1>
        <p className="text-stone-600">{meta.description} — practical guides for Kenyan conditions.</p>
      </div>

      {articles.length === 0 ? (
        <p className="text-stone-500">No guides yet. Check back soon.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {articles.map((a) => (
            <Link key={a.slug} href={`/learn/${params.category}/${a.slug}`}
              className="bg-white rounded-xl border border-stone-100 p-6 hover:border-forest-300 hover:shadow-sm transition-all group">
              <h2 className="font-semibold text-stone-800 text-lg group-hover:text-forest-700 leading-snug mb-2">{a.title}</h2>
              <p className="text-sm text-stone-500 line-clamp-3 mb-3">{a.description}</p>
              <div className="flex items-center gap-3 text-xs text-stone-400">
                <span>{a.readTimeMinutes} min read</span>
                {a.tags?.slice(0, 2).map((t) => (
                  <span key={t} className="bg-stone-100 px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
