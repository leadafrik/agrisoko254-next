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
  return {
    title: `${category.label} Listings in Kenya`,
    description: `${category.description} Browse active ${category.shortLabel.toLowerCase()} listings on Agrisoko.`,
  };
}

export default function BrowseCategoryPage({ params, searchParams }: Props) {
  if (!normalizeBrowseCategory(params.category)) {
    notFound();
  }

  return <BrowseListingsPage categorySlug={params.category} searchParams={searchParams} />;
}
