import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  compress: true,
  poweredByHeader: false,

  images: {
    formats: ["image/webp", "image/avif"],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "kodisha-backend-vjr9.onrender.com" },
    ],
  },

  async redirects() {
    return [
      { source: "/home",          destination: "/",              permanent: true },
      { source: "/marketplace",   destination: "/browse",        permanent: true },
      { source: "/listings",      destination: "/browse",        permanent: true },
      { source: "/seller/orders", destination: "/sellers/orders", permanent: true },
      { source: "/blog",          destination: "/learn/insights", permanent: true },
      { source: "/blog/:slug",    destination: "/learn/insights/:slug", permanent: true },
      { source: "/find-services", destination: "/browse/services", permanent: true },
      { source: "/privacy",       destination: "/legal/privacy", permanent: true },
      { source: "/terms",         destination: "/legal/terms",   permanent: true },
      { source: "/contact",       destination: "/about",         permanent: true },
      { source: "/help",          destination: "/about",         permanent: true },
      { source: "/seller/:id",    destination: "/sellers/:id",   permanent: true },
      { source: "/l/:id",         destination: "/listings/:id",  permanent: true },
      { source: "/r/:id",         destination: "/request/:id",   permanent: true },
      { source: "/share/blog/:slug", destination: "/learn/insights/:slug", permanent: true },
      { source: "/share/listing/:id", destination: "/listings/:id", permanent: true },
      { source: "/share/request/:id", destination: "/request/:id", permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options",        value: "SAMEORIGIN" },
          { key: "Referrer-Policy",        value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default withMDX(nextConfig);
