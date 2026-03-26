import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/api-server";
import { API_BASE_URL } from "@/lib/endpoints";

interface Props { params: { slug: string } }

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await serverFetch<any>(`${API_BASE_URL}/blog/${params.slug}`, { revalidate: 3600 });
  if (!data) return {};
  const post = data.post ?? data;
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const data = await serverFetch<any>(`${API_BASE_URL}/blog/${params.slug}`, { revalidate: 3600 });
  if (!data) notFound();

  const post = data.post ?? data;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="text-sm text-stone-500 mb-6 flex items-center gap-1">
        <Link href="/blog" className="hover:text-terra-600">Blog</Link>
        <span>/</span>
        <span className="text-stone-800 truncate max-w-xs">{post.title}</span>
      </nav>

      {post.coverImage && (
        <div className="rounded-xl overflow-hidden aspect-[16/9] mb-8 bg-stone-100">
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags?.map((tag: string) => (
          <span key={tag} className="bg-stone-100 text-stone-600 text-xs px-3 py-1 rounded-full">{tag}</span>
        ))}
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold font-display text-stone-900 leading-tight mb-4">{post.title}</h1>
      <p className="text-lg text-stone-500 mb-6">{post.excerpt}</p>

      <div className="flex items-center gap-4 text-sm text-stone-400 mb-8 pb-8 border-b border-stone-100">
        <span>{post.authorName ?? "Agrisoko"}</span>
        <span>·</span>
        <span>{post.readTimeMinutes} min read</span>
        {post.publishedAt && (
          <>
            <span>·</span>
            <span>{new Date(post.publishedAt).toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })}</span>
          </>
        )}
      </div>

      <div className="prose prose-stone prose-lg max-w-none prose-headings:font-display prose-a:text-terra-600">
        {post.content?.split("\n\n").map((para: string, i: number) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </div>
  );
}
