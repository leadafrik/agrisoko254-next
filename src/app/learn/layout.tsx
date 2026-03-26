import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CATEGORY_META } from "@/lib/mdx";

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="bg-forest-50 border-b border-forest-100 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-1 text-sm overflow-x-auto">
          <span className="text-stone-500 shrink-0">Kenya Farming Hub:</span>
          {Object.entries(CATEGORY_META).map(([slug, meta]) => (
            <Link key={slug} href={`/learn/${slug}`}
              className="shrink-0 px-3 py-1 rounded-full bg-white border border-forest-200 text-forest-700 hover:bg-forest-100 transition-colors text-xs font-medium">
              {meta.emoji} {meta.label}
            </Link>
          ))}
        </div>
      </div>
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
