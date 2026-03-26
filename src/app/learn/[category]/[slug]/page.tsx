import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getArticle, getAllArticleSlugs, getArticlesByCategory, CATEGORY_META } from "@/lib/mdx";

interface Props { params: { category: string; slug: string } }

export async function generateStaticParams() {
  return getAllArticleSlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = getArticle(params.category, params.slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    keywords: article.tags,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.publishedAt,
      tags: article.tags,
    },
    alternates: {
      canonical: `https://www.agrisoko254.com/learn/${params.category}/${params.slug}`,
    },
  };
}

export default function ArticlePage({ params }: Props) {
  const article  = getArticle(params.category, params.slug);
  const meta     = CATEGORY_META[params.category];
  const related  = getArticlesByCategory(params.category)
    .filter((a) => a.slug !== params.slug)
    .slice(0, 3);

  if (!article) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-12">
        {/* Article */}
        <article>
          {/* Breadcrumb */}
          <nav className="text-sm text-stone-500 mb-6 flex items-center gap-1">
            <Link href="/learn" className="hover:text-forest-700">Learn</Link>
            <span>/</span>
            <Link href={`/learn/${params.category}`} className="hover:text-forest-700">
              {meta?.label ?? params.category}
            </Link>
            <span>/</span>
            <span className="text-stone-700 truncate max-w-[200px]">{article.title}</span>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-forest-600 uppercase tracking-wide">
                {meta?.emoji} {meta?.label}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-display text-stone-900 leading-tight mb-4">
              {article.title}
            </h1>
            <p className="text-lg text-stone-600 mb-4">{article.description}</p>
            <div className="flex items-center gap-4 text-sm text-stone-400">
              <span>{article.readTimeMinutes} min read</span>
              <span>{new Date(article.publishedAt).toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
            {article.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {article.tags.map((t) => (
                  <span key={t} className="bg-stone-100 text-stone-600 text-xs px-3 py-1 rounded-full">{t}</span>
                ))}
              </div>
            )}
          </header>

          {/* MDX Content */}
          <div className="prose prose-stone prose-lg max-w-none prose-headings:font-display prose-a:text-forest-600 prose-a:no-underline hover:prose-a:underline">
            <MDXRemote source={article.content} />
          </div>

          {/* CTA */}
          <div className="mt-12 bg-terra-50 border border-terra-200 rounded-xl p-6">
            <h3 className="font-bold text-stone-800 text-lg mb-2">Ready to buy or sell on Agrisoko?</h3>
            <p className="text-stone-600 text-sm mb-4">
              Connect with verified Kenyan farmers and buyers. List your produce, livestock, or inputs in minutes.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/browse" className="bg-terra-500 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-terra-600 transition-colors">
                Browse Listings
              </Link>
              <Link href="/login?mode=signup" className="border border-terra-300 text-terra-700 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-terra-50 transition-colors">
                Start Selling Free
              </Link>
            </div>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="hidden lg:block">
          {related.length > 0 && (
            <div className="sticky top-24">
              <h3 className="font-semibold text-stone-700 text-sm uppercase tracking-wide mb-4">
                More {meta?.label} Guides
              </h3>
              <div className="space-y-3">
                {related.map((a) => (
                  <Link key={a.slug} href={`/learn/${params.category}/${a.slug}`}
                    className="block bg-white rounded-lg border border-stone-100 p-4 hover:border-forest-300 hover:shadow-sm transition-all group">
                    <h4 className="text-sm font-medium text-stone-800 group-hover:text-forest-700 leading-snug">{a.title}</h4>
                    <span className="text-xs text-stone-400 mt-1 block">{a.readTimeMinutes} min read</span>
                  </Link>
                ))}
              </div>
              <Link href={`/learn/${params.category}`}
                className="mt-4 block text-center text-sm text-forest-600 hover:text-forest-800 font-medium">
                All {meta?.label} guides →
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
