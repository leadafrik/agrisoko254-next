import type { Metadata } from "next";
import BrowseBuyerRequestsBoard from "@/components/marketplace/BrowseBuyerRequestsBoard";

export const metadata: Metadata = {
  title: "Buyer Requests | Active Demand Across Kenya",
  description:
    "Browse active buyer requests on Agrisoko and see what buyers across Kenya are looking for right now.",
};

export default function BuyerRequestsPage() {
  return <BrowseBuyerRequestsBoard />;
}
