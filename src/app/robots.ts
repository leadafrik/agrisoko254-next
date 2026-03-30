import type { MetadataRoute } from "next";

const PRIVATE_ROUTES = [
  "/admin",
  "/admin/",
  "/login",
  "/forgot-password",
  "/profile",
  "/messages",
  "/orders",
  "/checkout",
  "/create-listing",
  "/favorites",
  "/verify",
  "/verify-id",
  "/welcome",
  "/seller/",
  "/seller/orders",
  "/sellers/orders",
  "/bulk/new",
  "/bulk/seller/orders",
  "/request/new",
  "/api/",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // General crawlers — allow public content
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_ROUTES,
      },
      // Perplexity — retrieval crawler, explicitly allow all public content
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: PRIVATE_ROUTES,
      },
      // OpenAI search/retrieval (ChatGPT web browsing) — allow public content
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: PRIVATE_ROUTES,
      },
      // ChatGPT user-agent for live browsing — allow public content
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: PRIVATE_ROUTES,
      },
      // GPTBot — OpenAI training crawler, block to protect content
      {
        userAgent: "GPTBot",
        disallow: ["/"],
      },
      // CCBot — Common Crawl training dataset, block to protect content
      {
        userAgent: "CCBot",
        disallow: ["/"],
      },
      // anthropic-ai — Claude training crawler, block to protect content
      {
        userAgent: "anthropic-ai",
        disallow: ["/"],
      },
    ],
    sitemap: "https://agrisoko254.com/sitemap.xml",
    host: "https://agrisoko254.com",
  };
}
