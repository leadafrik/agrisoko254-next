import type { Metadata } from "next";
import BrowseListingsPage from "@/components/marketplace/BrowseListingsPage";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Browse Agricultural Listings Kenya | Produce, Livestock, Inputs & Services",
  description:
    "Browse thousands of agricultural listings across Kenya — fresh produce, livestock, farm inputs, and services. Buy directly from verified farmers and traders. No middlemen.",
  alternates: { canonical: "https://www.agrisoko254.com/browse" },
  openGraph: {
    type: "website",
    url: "https://www.agrisoko254.com/browse",
    title: "Browse Agricultural Listings in Kenya | Agrisoko",
    description:
      "Buy directly from verified Kenyan farmers and traders. Produce, livestock, farm inputs, and services across all 47 counties.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function BrowsePage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  return <BrowseListingsPage searchParams={searchParams} />;
}
