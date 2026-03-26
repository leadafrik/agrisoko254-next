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
          "/seller/orders",
          "/sellers/orders",
          "/bulk/new",
          "/bulk/seller/orders",
          "/request/new",
          "/api/",
        ],
      },
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
