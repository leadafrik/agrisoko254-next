import type { Metadata } from "next";
import BrowseBuyerRequestsBoard from "@/components/marketplace/BrowseBuyerRequestsBoard";

export const metadata: Metadata = {
  title: "Buyer Requests | Active Demand Across Kenya",
  description:
    "Browse active buyer requests on Agrisoko and see what buyers across Kenya are looking for right now.",
  keywords: [
    "buyer requests kenya",
    "produce buyers kenya",
    "maize buyers kenya",
    "bulk buyers kenya",
    "farm produce demand kenya",
    "agrisoko buyer requests",
  ],
  alternates: { canonical: "https://agrisoko254.com/request" },
  openGraph: {
    type: "website",
    url: "https://agrisoko254.com/request",
    title: "Buyer Requests in Kenya | Agrisoko",
    description:
      "See what buyers across Kenya are looking for right now and respond with direct supply on Agrisoko.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Buyer Requests in Kenya | Agrisoko",
    description:
      "Live buyer demand across Kenya for produce, livestock, inputs, and services.",
  },
};

export default function BuyerRequestsPage() {
  return <BrowseBuyerRequestsBoard />;
}
