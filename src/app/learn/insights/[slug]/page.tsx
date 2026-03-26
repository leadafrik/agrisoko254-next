import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getInsightPost, getInsightPosts } from "@/lib/content-hub";

interface Props {
  params: { slug: string };
}

export const revalidate = 3600;

const formatInsightDate = (value: string | null) => {
  if (!value) return "Recent update";

  return new Date(value).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getInsightPost(params.slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      images: post.coverImage ? [post.coverImage] : [],
      tags: post.tags,
    },
    alternates: {
      canonical: `https://www.agrisoko254.com/learn/insights/${params.slug}`,
    },
  };
}

export default async function LearnInsightDetailPage({ params }: Props) {
  const [post, posts] = await Promise.all([getInsightPost(params.slug), getInsightPosts(6)]);

  if (!post) notFound();

  const related = posts.filter((candidate) => candidate.slug !== post.slug).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
        <article>
          <nav className="mb-6 flex items-center gap-1 text-sm text-stone-500">
            <Link href="/learn" className="hover:text-forest-700">
              Learn
            </Link>
            <span>/</span>
            <Link href="/learn/insights" className="hover:text-forest-700">
              Insights
            </Link>
            <span>/</span>
            <span className="truncate text-stone-800">{post.title}</span>
          </nav>

          <header className="mb-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terra-600">
              Agrisoko insight
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-stone-900">{post.title}</h1>
            <p className="mt-4 text-lg leading-relaxed text-stone-600">
              {post.excerpt || "Agrisoko editorial insight."}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-stone-500">
              <span>{post.authorName ?? "Agrisoko"}</span>
              <span>{post.readTimeMinutes} min read</span>
              <span>{formatInsightDate(post.publishedAt)}</span>
            </div>
            {post.tags.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </header>

          {post.coverImage ? (
            <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-[28px] bg-stone-100">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 70vw, 100vw"
              />
            </div>
          ) : null}

          <div className="prose prose-stone prose-lg max-w-none prose-headings:font-display prose-a:text-terra-600 prose-table:w-full prose-th:bg-stone-100 prose-th:px-3 prose-th:py-2 prose-td:px-3 prose-td:py-2">
            {post.content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
            ) : (
              <p>{post.excerpt || "This insight will be updated with more detail soon."}</p>
            )}
          </div>

          <div className="mt-12 rounded-[28px] border border-terra-200 bg-terra-50 p-6">
            <h2 className="text-xl font-bold text-stone-900">Move from insight into action</h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              Use the marketplace once you are ready to buy, sell, or respond to live demand.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link href="/browse" className="primary-button">
                Browse listings
              </Link>
              <Link href="/request" className="secondary-button">
                View buyer requests
              </Link>
            </div>
          </div>
        </article>

        <aside className="mt-10 lg:mt-0">
          <div className="lg:sticky lg:top-24">
            <div className="rounded-[24px] border border-stone-200 bg-white p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">
                Keep reading
              </h2>
              <div className="mt-4 space-y-3">
                {related.map((item) => (
                  <Link
                    key={item.id}
                    href={`/learn/insights/${item.slug}`}
                    className="block rounded-[18px] border border-stone-200 p-4 transition hover:border-terra-200 hover:bg-stone-50"
                  >
                    <h3 className="text-sm font-semibold leading-snug text-stone-900">{item.title}</h3>
                    <p className="mt-2 text-xs text-stone-500">{item.readTimeMinutes} min read</p>
                  </Link>
                ))}
              </div>
              <Link href="/learn" className="mt-5 inline-flex text-sm font-semibold text-forest-700 hover:text-forest-800">
                Back to Learn hub
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
