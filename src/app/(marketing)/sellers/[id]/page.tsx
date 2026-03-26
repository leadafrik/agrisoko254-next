import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/api-server";
import { API_BASE_URL } from "@/lib/endpoints";

interface Props { params: { id: string } }

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await serverFetch<any>(`${API_BASE_URL}/users/${params.id}`, { revalidate: 60 });
  if (!data) return {};
  const user = data.user ?? data;
  return {
    title: `${user.name} — Verified Seller on Agrisoko`,
    description: `Browse listings from ${user.name} on Agrisoko Kenya's agricultural marketplace.`,
  };
}

export default async function SellerProfilePage({ params }: Props) {
  const data = await serverFetch<any>(`${API_BASE_URL}/users/${params.id}`, { revalidate: 60 });
  if (!data) notFound();

  const user = data.user ?? data;
  const listings = data.listings ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Seller header */}
      <div className="bg-white rounded-xl border border-stone-100 p-6 mb-8 flex items-center gap-5">
        {user.profilePicture ? (
          <img src={user.profilePicture} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-terra-100 text-terra-700 flex items-center justify-center text-2xl font-bold">
            {user.name?.[0]}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            {user.name}
            {user.verification?.isVerified && (
              <span className="text-xs bg-forest-100 text-forest-700 px-2 py-0.5 rounded-full font-medium">✓ Verified</span>
            )}
          </h1>
          {user.location && <p className="text-sm text-stone-500 mt-0.5">📍 {user.location}</p>}
          {user.bio && <p className="text-sm text-stone-600 mt-2">{user.bio}</p>}
        </div>
      </div>

      {/* Listings */}
      <h2 className="text-lg font-bold text-stone-800 mb-4">Listings by {user.name}</h2>
      {listings.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((listing: any) => (
            <Link key={listing._id} href={`/listings/${listing._id}`}
              className="bg-white rounded-xl border border-stone-100 overflow-hidden hover:shadow-md transition-all group">
              {listing.images?.[0] && (
                <div className="aspect-[4/3] overflow-hidden bg-stone-100">
                  <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-stone-800 line-clamp-2 group-hover:text-terra-600">{listing.title}</h3>
                {listing.price && <p className="font-bold text-stone-900 mt-1">KES {listing.price.toLocaleString()}</p>}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-stone-400">No active listings.</p>
      )}
    </div>
  );
}
