import type { Metadata } from "next";
import BrowseListingsPage from "@/components/marketplace/BrowseListingsPage";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Browse Listings | Produce, Livestock, Inputs, and Services",
  description:
    "Browse active Agrisoko listings in Kenya across produce, livestock, farm inputs, and service categories.",
};

export default function BrowsePage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  return <BrowseListingsPage searchParams={searchParams} />;
}
