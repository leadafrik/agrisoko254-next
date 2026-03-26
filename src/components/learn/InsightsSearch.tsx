"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  readTimeMinutes: number;
  publishedAt: string | null;
  authorName: string | null;
  tags: string[];
}

const formatDate = (value: string | null) => {
  if (!value) return "Recent update";
  return new Date(value).toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" });
};

export default function InsightsSearch({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return posts;
    const q = query.trim().toLowerCase();
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.excerpt || "").toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        (p.authorName || "").toLowerCase().includes(q)
    );
  }, [posts, query]);

  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-8">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search insights by topic, keyword, or author…"
          className="w-full rounded-2xl border border-stone-200 bg-white py-3 pl-11 pr-4 text-sm text-stone-900 focus:border-terra-400 focus:outline-none focus:ring-2 focus:ring-terra-100"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[24px] border border-stone-200 bg-white p-10 text-center">
          <p className="text-sm font-semibold text-stone-700">No insights match &ldquo;{query}&rdquo;</p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-3 text-sm font-semibold text-terra-600 hover:text-terra-700"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((post) => (
            <Link
              key={post.id}
              href={`/learn/insights/${post.slug}`}
              className="group overflow-hidden rounded-[24px] border border-stone-200 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-terra-200 hover:shadow-md"
            >
              {post.coverImage ? (
                <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="(min-width: 1280px) 24vw, (min-width: 640px) 45vw, 100vw"
                  />
                </div>
              ) : (
                <div className="aspect-[16/10] bg-gradient-to-br from-[#FDF5F3] to-stone-100" />
              )}
              <div className="p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terra-600">Insight</p>
                <h3 className="mt-2 line-clamp-2 text-lg font-bold text-stone-900 transition group-hover:text-terra-700">
                  {post.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-stone-500">
                  {post.excerpt || "Agrisoko editorial update."}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-stone-400">
                  {post.readTimeMinutes ? <span>{post.readTimeMinutes} min read</span> : null}
                  <span>{formatDate(post.publishedAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
