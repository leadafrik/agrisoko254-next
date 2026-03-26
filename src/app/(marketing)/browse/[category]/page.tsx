import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BrowseListingsPage from "@/components/marketplace/BrowseListingsPage";
import { MARKETPLACE_CATEGORIES, normalizeBrowseCategory } from "@/lib/marketplace";

type Props = {
  params: { category: string };
  searchParams?: Record<string, string | string[] | undefined>;
};

export const revalidate = 60;

export function generateStaticParams() {
  return MARKETPLACE_CATEGORIES.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = normalizeBrowseCategory(params.category);
  if (!category) return {};
  const canonicalUrl = `https://www.agrisoko254.com/browse/${category.slug}`;
  const title = `Buy & Sell ${category.label} in Kenya | Agrisoko`;
  const description = `${category.description} Browse verified ${category.shortLabel.toLowerCase()} listings from farmers and traders across all 47 Kenyan counties. Buy direct, no middlemen.`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title,
      description,
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function BrowseCategoryPage({ params, searchParams }: Props) {
  if (!normalizeBrowseCategory(params.category)) {
    notFound();
  }

  return <BrowseListingsPage categorySlug={params.category} searchParams={searchParams} />;
}
