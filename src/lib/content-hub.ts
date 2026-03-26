import { serverFetch } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/lib/endpoints";

export interface InsightPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  readTimeMinutes: number;
  publishedAt: string | null;
  authorName: string | null;
  featured: boolean;
  tags: string[];
}

const normalizeInsightPost = (post: any): InsightPost | null => {
  if (!post?.slug || !post?.title) return null;

  return {
    id: String(post._id ?? post.id ?? post.slug),
    slug: String(post.slug),
    title: String(post.title),
    excerpt: String(post.excerpt ?? ""),
    content: String(post.content ?? ""),
    coverImage: typeof post.coverImage === "string" ? post.coverImage : null,
    readTimeMinutes:
      typeof post.readTimeMinutes === "number" && Number.isFinite(post.readTimeMinutes)
        ? post.readTimeMinutes
        : 5,
    publishedAt: typeof post.publishedAt === "string" ? post.publishedAt : null,
    authorName: typeof post.authorName === "string" ? post.authorName : null,
    featured: Boolean(post.featured),
    tags: Array.isArray(post.tags)
      ? post.tags.filter((tag: unknown): tag is string => typeof tag === "string")
      : [],
  };
};

export const getInsightPosts = async (limit = 24): Promise<InsightPost[]> => {
  const data = await serverFetch<any>(`${API_ENDPOINTS.blog.list}?limit=${limit}`, { revalidate: 3600 });
  const posts = Array.isArray(data?.posts) ? data.posts : Array.isArray(data) ? data : [];

  return posts
    .map(normalizeInsightPost)
    .filter((post: InsightPost | null): post is InsightPost => Boolean(post));
};

export const getInsightPost = async (slug: string): Promise<InsightPost | null> => {
  const data = await serverFetch<any>(API_ENDPOINTS.blog.bySlug(slug), { revalidate: 3600 });
  const post = normalizeInsightPost(data?.post ?? data);

  return post ?? null;
};
