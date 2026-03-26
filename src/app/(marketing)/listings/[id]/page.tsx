import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/api-server";
import { API_BASE_URL } from "@/lib/endpoints";

interface Props { params: { id: string } }

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await serverFetch<any>(`${API_BASE_URL}/unified-listings/${params.id}`, { revalidate: 60 });
  if (!data) return {};
  return {
    title: data.title,
    description: data.description ?? `Buy ${data.title} in Kenya on Agrisoko`,
    openGraph: {
      title: data.title,
      images: data.images?.[0] ? [data.images[0]] : [],
    },
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const data = await serverFetch<any>(`${API_BASE_URL}/unified-listings/${params.id}`, { revalidate: 60 });
  if (!data) notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="text-sm text-stone-500 mb-6 flex items-center gap-1">
        <Link href="/browse" className="hover:text-terra-600">Browse</Link>
        <span>/</span>
        <span className="text-stone-800 truncate max-w-xs">{data.title}</span>
      </nav>

      <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-10">
        {/* Images */}
        <div>
          {data.images?.[0] ? (
            <div className="rounded-xl overflow-hidden bg-stone-100 aspect-[4/3]">
              <img src={data.images[0]} alt={data.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="rounded-xl bg-stone-100 aspect-[4/3] flex items-center justify-center text-stone-300 text-5xl">🌾</div>
          )}
          {data.images?.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {data.images.slice(1).map((img: string, i: number) => (
                <img key={i} src={img} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
              ))}
            </div>
          )}

          {data.description && (
            <div className="mt-8">
              <h2 className="font-semibold text-stone-800 mb-2">Description</h2>
              <p className="text-stone-600 leading-relaxed whitespace-pre-line">{data.description}</p>
            </div>
          )}
        </div>

        {/* Details panel */}
        <div className="mt-8 lg:mt-0">
          <p className="text-xs text-terra-600 font-semibold uppercase tracking-wide mb-1">{data.category}</p>
          <h1 className="text-2xl font-bold font-display text-stone-900 mb-3">{data.title}</h1>
          {data.price && (
            <p className="text-3xl font-bold text-stone-900 mb-4">KES {data.price.toLocaleString()}</p>
          )}
          {data.location && (
            <p className="text-sm text-stone-500 mb-6">📍 {data.location}</p>
          )}

          {/* Contact CTA */}
          <div className="bg-earth rounded-xl p-5 space-y-3">
            <Link href={`/messages?seller=${data.seller?._id ?? data.userId}`}
              className="block w-full bg-terra-500 text-white text-center py-3 rounded-lg font-semibold hover:bg-terra-600 transition-colors">
              Message Seller
            </Link>
            <Link href="/login?mode=signup"
              className="block w-full border border-stone-200 bg-white text-stone-700 text-center py-3 rounded-lg font-semibold hover:bg-stone-50 transition-colors text-sm">
              Sign up to contact
            </Link>
          </div>

          {/* Seller info */}
          {(data.seller ?? data.user) && (
            <div className="mt-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-terra-100 text-terra-700 flex items-center justify-center font-bold text-sm">
                {(data.seller?.name ?? data.user?.name ?? "S")[0]}
              </div>
              <div>
                <p className="font-semibold text-stone-800 text-sm">{data.seller?.name ?? data.user?.name}</p>
                <Link href={`/sellers/${data.seller?._id ?? data.userId}`}
                  className="text-xs text-terra-600 hover:underline">View profile</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
