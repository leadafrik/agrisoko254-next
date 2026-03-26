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
      { source: "/marketplace",   destination: "/browse",        permanent: true },
      { source: "/listings",      destination: "/browse",        permanent: true },
      { source: "/find-services", destination: "/browse/services", permanent: true },
      { source: "/privacy",       destination: "/legal/privacy", permanent: true },
      { source: "/terms",         destination: "/legal/terms",   permanent: true },
      { source: "/contact",       destination: "/about",         permanent: true },
      { source: "/help",          destination: "/about",         permanent: true },
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
