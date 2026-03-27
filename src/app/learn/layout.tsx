import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CATEGORY_META } from "@/lib/mdx";

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="border-b border-forest-100 bg-forest-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto text-sm">
          <span className="shrink-0 text-stone-500">Learn hub:</span>
          <Link
            href="/learn/insights"
            className="shrink-0 rounded-full border border-terra-200 bg-white px-3 py-1 text-xs font-medium text-terra-700 transition-colors hover:bg-terra-50"
          >
            Market insights
          </Link>
          {Object.entries(CATEGORY_META).map(([slug, meta]) => (
            <Link
              key={slug}
              href={`/learn/${slug}`}
              className="shrink-0 rounded-full border border-forest-200 bg-white px-3 py-1 text-xs font-medium text-forest-700 transition-colors hover:bg-forest-100"
            >
              {meta.label}
            </Link>
          ))}
        </div>
      </div>
      <main className="min-h-screen pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-0">{children}</main>
      <Footer />
    </>
  );
}
