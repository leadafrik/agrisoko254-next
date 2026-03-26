import type { Metadata } from "next";
import Link from "next/link";
import { serverFetch } from "@/lib/api-server";
import { API_BASE_URL } from "@/lib/endpoints";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog — Agrisoko Kenya",
  description: "Farming tips, market news, and agricultural insights for Kenyan farmers.",
};

export default async function BlogPage() {
  const data = await serverFetch<any>(`${API_BASE_URL}/blog?limit=24`, { revalidate: 3600 });
  const posts = Array.isArray(data?.posts) ? data.posts : Array.isArray(data) ? data : [];
  const featured = posts.find((p: any) => p.featured);
  const rest = posts.filter((p: any) => !p.featured);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold font-display text-stone-900 mb-2">Agrisoko Blog</h1>
      <p className="text-stone-500 mb-10">Farming tips, market news, and agricultural insights</p>

      {featured && (
        <Link href={`/blog/${featured.slug}`}
          className="block bg-white rounded-xl border border-stone-100 overflow-hidden hover:shadow-md transition-all group mb-10">
          <div className="md:grid md:grid-cols-2">
            {featured.coverImage && (
              <div className="aspect-[16/9] md:aspect-auto overflow-hidden bg-stone-100">
                <img src={featured.coverImage} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
            )}
            <div className="p-6 flex flex-col justify-center">
              <span className="text-xs bg-terra-100 text-terra-700 px-2 py-0.5 rounded-full font-medium w-fit mb-3">Featured</span>
              <h2 className="text-2xl font-bold font-display text-stone-900 group-hover:text-terra-600 mb-3">{featured.title}</h2>
              <p className="text-stone-500 line-clamp-3">{featured.excerpt}</p>
              <p className="text-xs text-stone-400 mt-4">{featured.readTimeMinutes} min read</p>
            </div>
          </div>
        </Link>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rest.map((post: any) => (
          <Link key={post._id} href={`/blog/${post.slug}`}
            className="bg-white rounded-xl border border-stone-100 overflow-hidden hover:shadow-md transition-all group">
            {post.coverImage && (
              <div className="aspect-[16/9] overflow-hidden bg-stone-100">
                <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold text-stone-800 group-hover:text-terra-600 line-clamp-2">{post.title}</h3>
              <p className="text-sm text-stone-500 mt-1 line-clamp-2">{post.excerpt}</p>
              <p className="text-xs text-stone-400 mt-3">{post.readTimeMinutes} min read</p>
            </div>
          </Link>
        ))}
      </div>

      {posts.length === 0 && (
        <p className="text-center text-stone-400 py-20">No posts yet.</p>
      )}
    </div>
  );
}
