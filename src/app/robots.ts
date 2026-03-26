import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
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
          "/bulk/new",
          "/request/new",
          "/api/",
        ],
      },
      // Block AI training crawlers from price data and marketplace content
      {
        userAgent: "GPTBot",
        disallow: ["/"],
      },
      {
        userAgent: "CCBot",
        disallow: ["/"],
      },
      {
        userAgent: "anthropic-ai",
        disallow: ["/"],
      },
    ],
    sitemap: "https://www.agrisoko254.com/sitemap.xml",
    host: "https://www.agrisoko254.com",
  };
}
