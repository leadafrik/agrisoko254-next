import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { CATEGORY_META, getAllArticleSlugs, getArticle, getArticlesByCategory } from "@/lib/mdx";
import { buildSocialImageMetadata, getAbsoluteContentImageUrl } from "@/lib/content-images";

interface Props {
  params: { category: string; slug: string };
}

export async function generateStaticParams() {
  return getAllArticleSlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = getArticle(params.category, params.slug);
  if (!article) return {};

  const canonical = `https://agrisoko254.com/learn/${params.category}/${params.slug}`;
  const socialImages = buildSocialImageMetadata(article.coverImage, article.title);

  return {
    title: article.title,
    description: article.description,
    keywords: article.tags,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      url: canonical,
      publishedTime: article.publishedAt,
      images: socialImages.openGraph,
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: socialImages.twitter,
    },
    alternates: {
      canonical,
    },
  };
}

export default function ArticlePage({ params }: Props) {
  const article = getArticle(params.category, params.slug);
  const meta = CATEGORY_META[params.category];
  const related = getArticlesByCategory(params.category)
    .filter((candidate) => candidate.slug !== params.slug)
    .slice(0, 3);

  if (!article) notFound();

  const canonicalUrl = `https://agrisoko254.com/learn/${params.category}/${params.slug}`;
  const categoryUrl = `https://agrisoko254.com/learn/${params.category}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    url: canonicalUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    author: { "@type": "Organization", name: "Agrisoko" },
    publisher: {
      "@type": "Organization",
      name: "Agrisoko",
      logo: { "@type": "ImageObject", url: "https://agrisoko254.com/logo192.png" },
    },
    keywords: article.tags?.join(", "),
    ...(article.coverImage ? { image: getAbsoluteContentImageUrl(article.coverImage) } : {}),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Learn", item: "https://agrisoko254.com/learn" },
      { "@type": "ListItem", position: 2, name: meta?.label ?? params.category, item: categoryUrl },
      { "@type": "ListItem", position: 3, name: article.title },
    ],
  };

  const faqSchema = article.faqs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: article.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      }
    : null;

  const howToSchema = article.steps?.length
    ? {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: article.title,
        description: article.description,
        step: article.steps.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: step.name,
          text: step.text,
        })),
      }
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      ) : null}
      {howToSchema ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      ) : null}

      <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-12">
        <article>
          <nav className="mb-6 flex items-center gap-1 text-sm text-stone-500">
            <Link href="/learn" className="hover:text-forest-700">
              Learn
            </Link>
            <span>/</span>
            <Link href={`/learn/${params.category}`} className="hover:text-forest-700">
              {meta?.label ?? params.category}
            </Link>
            <span>/</span>
            <span className="max-w-[200px] truncate text-stone-700">{article.title}</span>
          </nav>

          <header className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-forest-600">
                {meta?.emoji} {meta?.label}
              </span>
            </div>
            <h1 className="mb-4 text-3xl font-bold font-display leading-tight text-stone-900 sm:text-4xl">
              {article.title}
            </h1>
            <p className="mb-4 text-lg text-stone-600">{article.description}</p>
            <div className="flex items-center gap-4 text-sm text-stone-400">
              <span>{article.readTimeMinutes} min read</span>
              <span>
                {new Date(article.publishedAt).toLocaleDateString("en-KE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            {article.tags?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </header>

          {article.coverImage ? (
            <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-[28px] bg-stone-100">
              <Image
                src={article.coverImage}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 70vw, 100vw"
              />
            </div>
          ) : null}

          <div className="prose prose-stone prose-lg max-w-none prose-headings:font-display prose-a:text-forest-600 prose-a:no-underline hover:prose-a:underline">
            <MDXRemote source={article.content} options={{ mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings] } }} />
          </div>

          <div className="mt-12 rounded-xl border border-terra-200 bg-terra-50 p-6">
            <h3 className="mb-2 text-lg font-bold text-stone-800">Turn this guide into a market decision</h3>
            <p className="mb-4 text-sm text-stone-600">
              Check live prices, browse active supply, or look at buyer demand before you move stock.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/market-intelligence"
                className="rounded-lg bg-terra-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-terra-600"
              >
                Check Today&apos;s Prices
              </Link>
              <Link
                href="/browse"
                className="rounded-lg border border-terra-300 px-5 py-2 text-sm font-semibold text-terra-700 transition-colors hover:bg-terra-50"
              >
                Browse Listings
              </Link>
              <Link
                href="/request"
                className="rounded-lg border border-terra-300 px-5 py-2 text-sm font-semibold text-terra-700 transition-colors hover:bg-terra-50"
              >
                View Buyer Requests
              </Link>
              <Link
                href="/login?mode=signup"
                className="rounded-lg border border-terra-300 px-5 py-2 text-sm font-semibold text-terra-700 transition-colors hover:bg-terra-50"
              >
                Start Selling Free
              </Link>
            </div>
          </div>
        </article>

        <aside className="hidden lg:block">
          {related.length ? (
            <div className="sticky top-24">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-stone-700">
                More {meta?.label} Guides
              </h3>
              <div className="space-y-3">
                {related.map((candidate) => (
                  <Link
                    key={candidate.slug}
                    href={`/learn/${params.category}/${candidate.slug}`}
                    className="group block rounded-lg border border-stone-100 bg-white p-4 transition-all hover:border-forest-300 hover:shadow-sm"
                  >
                    <h4 className="text-sm font-medium leading-snug text-stone-800 group-hover:text-forest-700">
                      {candidate.title}
                    </h4>
                    <span className="mt-1 block text-xs text-stone-400">
                      {candidate.readTimeMinutes} min read
                    </span>
                  </Link>
                ))}
              </div>
              <Link
                href={`/learn/${params.category}`}
                className="mt-4 block text-center text-sm font-medium text-forest-600 hover:text-forest-800"
              >
                All {meta?.label} guides -&gt;
              </Link>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
