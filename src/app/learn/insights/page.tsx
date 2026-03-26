import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getInsightPosts } from "@/lib/content-hub";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Market Insights",
  description:
    "Editorial market updates, field observations, and Agrisoko commentary now live inside the Learn hub.",
  alternates: { canonical: "https://www.agrisoko254.com/learn/insights" },
};

const formatInsightDate = (value: string | null) => {
  if (!value) return "Recent update";

  return new Date(value).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default async function LearnInsightsPage() {
  const posts = await getInsightPosts(24);
  const featured = posts.find((post) => post.featured) ?? posts[0] ?? null;
  const rest = posts.filter((post) => post.slug !== featured?.slug);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <nav className="flex items-center gap-1 text-sm text-stone-500">
          <Link href="/learn" className="hover:text-forest-700">
            Learn
          </Link>
          <span>/</span>
          <span className="text-stone-800">Insights</span>
        </nav>
        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-terra-600">
          Editorial insights
        </p>
        <h1 className="mt-3 text-4xl font-bold text-stone-900">The blog is now part of the Learn hub.</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-stone-600">
          This stream carries Agrisoko commentary, market observations, trade signals, and practical editorial updates.
          Evergreen guides still live under topic pages, but public content now reads as one connected knowledge system.
        </p>
      </div>

      {featured ? (
        <Link
          href={`/learn/insights/${featured.slug}`}
          className="block overflow-hidden rounded-[30px] border border-stone-200 bg-white shadow-[0_22px_70px_-54px_rgba(72,52,33,0.4)] transition hover:-translate-y-1"
        >
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-7 sm:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terra-600">
                Featured insight
              </p>
              <h2 className="mt-4 text-3xl font-bold text-stone-900 sm:text-4xl">{featured.title}</h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-600">
                {featured.excerpt || "Agrisoko editorial insight."}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-stone-500">
                <span>{featured.readTimeMinutes} min read</span>
                <span>{formatInsightDate(featured.publishedAt)}</span>
                {featured.authorName ? <span>{featured.authorName}</span> : null}
              </div>
            </div>

            {featured.coverImage ? (
              <div className="relative min-h-[280px] bg-stone-100">
                <Image
                  src={featured.coverImage}
                  alt={featured.title}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 40vw, 100vw"
                />
              </div>
            ) : null}
          </div>
        </Link>
      ) : (
        <div className="rounded-[28px] border border-stone-200 bg-white p-8 text-center text-stone-500">
          No insights have been published yet.
        </div>
      )}

      {rest.length > 0 ? (
        <section className="mt-10">
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {rest.map((post) => (
              <Link
                key={post.id}
                href={`/learn/insights/${post.slug}`}
                className="overflow-hidden rounded-[24px] border border-stone-200 bg-white transition hover:-translate-y-1 hover:border-terra-200"
              >
                {post.coverImage ? (
                  <div className="relative aspect-[16/10] bg-stone-100">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1280px) 24vw, (min-width: 640px) 45vw, 100vw"
                    />
                  </div>
                ) : null}
                <div className="p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                    Insight
                  </p>
                  <h3 className="mt-3 text-xl font-bold text-stone-900">{post.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-stone-600">
                    {post.excerpt || "Agrisoko editorial update."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-stone-500">
                    <span>{post.readTimeMinutes} min read</span>
                    <span>{formatInsightDate(post.publishedAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
