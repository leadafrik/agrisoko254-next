import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import { CATEGORY_META, getAllCategories, getArticlesByCategory } from "@/lib/mdx";

interface Props {
  params: { category: string };
}

export async function generateStaticParams() {
  return getAllCategories().map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const meta = CATEGORY_META[params.category];
  if (!meta) return {};

  const description = `${meta.description}. Practical guides, pricing context, and selling tips for Kenyan farmers.`;
  const canonical = `https://www.agrisoko254.com/learn/${params.category}`;
  const leadImage = getArticlesByCategory(params.category)[0]?.coverImage ?? null;

  return {
    title: `${meta.label} Farming Guides for Kenya | Agrisoko Learn`,
    description,
    keywords: [
      `${meta.label} farming in Kenya`,
      `${meta.label} prices Kenya`,
      `${meta.label} buyers Kenya`,
      `${meta.label} guides`,
      "Kenya agriculture",
      "Agrisoko Learn",
    ],
    openGraph: {
      title: `${meta.label} Farming Guides for Kenya`,
      description,
      type: "website",
      url: canonical,
      images: leadImage ? [leadImage] : [],
    },
    alternates: { canonical },
  };
}

export default function CategoryPage({ params }: Props) {
  const meta = CATEGORY_META[params.category];
  const articles = getArticlesByCategory(params.category);

  if (!meta) notFound();

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${meta.label} Farming Guides for Kenya`,
    description: `${meta.description}. Practical guides, pricing context, and selling tips for Kenyan farmers.`,
    url: `https://www.agrisoko254.com/learn/${params.category}`,
    isPartOf: {
      "@type": "WebSite",
      name: "Agrisoko",
      url: "https://www.agrisoko254.com",
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: articles.map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: article.title,
        url: `https://www.agrisoko254.com/learn/${params.category}/${article.slug}`,
      })),
    },
  };

  const browseHref = params.category === "market-prices" ? "/browse" : `/browse/${params.category}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd data={collectionSchema} />

      <nav className="mb-6 flex items-center gap-1 text-sm text-stone-500">
        <Link href="/learn" className="hover:text-forest-700">
          Learn
        </Link>
        <span>/</span>
        <span className="font-medium text-stone-800">{meta.label}</span>
      </nav>

      <div className="mb-8">
        <h1 className="mb-2 flex items-center gap-2 text-3xl font-bold font-display text-stone-900">
          <span>{meta.emoji}</span> {meta.label} Farming in Kenya
        </h1>
        <p className="text-stone-600">
          {meta.description} - practical guides for Kenyan conditions.
        </p>
      </div>

      <div className="mb-10 grid gap-4 rounded-[28px] border border-stone-200 bg-[#FFF9F5] p-5 sm:grid-cols-3">
        <Link
          href="/market-intelligence"
          className="rounded-[22px] border border-stone-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-terra-200"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-terra-600">Live prices</p>
          <h2 className="mt-2 text-lg font-semibold text-stone-900">Check today&apos;s market board</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Compare counties, averages, and live market signals before you move stock.
          </p>
        </Link>

        <Link
          href={browseHref}
          className="rounded-[22px] border border-stone-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-terra-200"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-terra-600">Marketplace</p>
          <h2 className="mt-2 text-lg font-semibold text-stone-900">Browse active supply</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            See how real listings are written, priced, and distributed across Kenyan counties.
          </p>
        </Link>

        <Link
          href="/request"
          className="rounded-[22px] border border-stone-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-terra-200"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-terra-600">Buyer demand</p>
          <h2 className="mt-2 text-lg font-semibold text-stone-900">See what buyers need</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Use live requests to decide what to sell, how to position it, and where demand is moving.
          </p>
        </Link>
      </div>

      {articles.length === 0 ? (
        <p className="text-stone-500">No guides yet. Check back soon.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/learn/${params.category}/${article.slug}`}
              className="group overflow-hidden rounded-xl border border-stone-100 bg-white transition-all hover:border-forest-300 hover:shadow-sm"
            >
              {article.coverImage ? (
                <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                  <Image
                    src={article.coverImage}
                    alt={article.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="(min-width: 640px) 45vw, 100vw"
                  />
                </div>
              ) : null}
              <div className="p-6">
                <h2 className="mb-2 text-lg font-semibold leading-snug text-stone-800 group-hover:text-forest-700">
                  {article.title}
                </h2>
                <p className="mb-3 line-clamp-3 text-sm text-stone-500">{article.description}</p>
                <div className="flex items-center gap-3 text-xs text-stone-400">
                  <span>{article.readTimeMinutes} min read</span>
                  {article.tags?.slice(0, 2).map((tag) => (
                    <span key={tag} className="rounded-full bg-stone-100 px-2 py-0.5">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
