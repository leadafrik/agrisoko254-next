import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getInsightPosts } from "@/lib/content-hub";
import InsightsSearch from "@/components/learn/InsightsSearch";

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
        <h1 className="mt-3 text-4xl font-bold text-stone-900">
          Market notes, policy shifts, and trade signals for Kenyan agriculture.
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-stone-600">
          This stream carries Agrisoko commentary, market observations, trade signals, and policy
          analysis. Evergreen guides stay under topic pages, while insights stay close to live
          market movement.
        </p>
      </div>

      {featured ? (
        <Link
          href={`/learn/insights/${featured.slug}`}
          className="group block overflow-hidden rounded-[30px] border border-stone-200 bg-white shadow-[0_22px_70px_-54px_rgba(72,52,33,0.4)] transition hover:-translate-y-0.5 hover:border-terra-200 hover:shadow-[0_28px_80px_-50px_rgba(72,52,33,0.5)]"
        >
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-7 sm:p-9">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terra-600">
                Featured insight
              </p>
              <h2 className="mt-4 text-3xl font-bold text-stone-900 transition group-hover:text-terra-700 sm:text-4xl">{featured.title}</h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-600">
                {featured.excerpt || "Agrisoko editorial insight."}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-stone-400">
                {featured.readTimeMinutes ? <span>{featured.readTimeMinutes} min read</span> : null}
                <span>{formatInsightDate(featured.publishedAt)}</span>
                {featured.authorName ? <span className="font-medium text-stone-600">{featured.authorName}</span> : null}
              </div>
            </div>

            {featured.coverImage ? (
              <div className="relative min-h-[280px] overflow-hidden bg-stone-100">
                <Image
                  src={featured.coverImage}
                  alt={featured.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.02]"
                  sizes="(min-width: 1024px) 40vw, 100vw"
                />
              </div>
            ) : (
              <div className="flex min-h-[280px] items-center justify-center bg-gradient-to-br from-[#FDF5F3] to-stone-100" />
            )}
          </div>
        </Link>
      ) : (
        <div className="rounded-[28px] border border-stone-200 bg-white p-12 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">Coming soon</p>
          <p className="mt-3 text-xl font-semibold text-stone-700">No insights published yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-500">
            The first article published from the admin panel will appear here automatically as the featured insight.
          </p>
        </div>
      )}

      {rest.length > 0 ? (
        <section className="mt-10">
          <InsightsSearch posts={rest} />
        </section>
      ) : null}
    </div>
  );
}
