import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ListingCard from "@/components/marketplace/ListingCard";
import { serverFetch } from "@/lib/api-server";
import { API_BASE_URL } from "@/lib/endpoints";
import { formatLongDate, getInitials, getUserDisplayName, isVerifiedProfile } from "@/lib/marketplace";

interface Props {
  params: { id: string };
}

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await serverFetch<any>(`${API_BASE_URL}/users/${params.id}`, { revalidate: 60 });
  const user = data?.user ?? data;
  if (!user) return {};
  return {
    title: `${getUserDisplayName(user)} | Seller Profile`,
    description: `Browse listings from ${getUserDisplayName(user)} on Agrisoko.`,
  };
}

export default async function SellerProfilePage({ params }: Props) {
  const data = await serverFetch<any>(`${API_BASE_URL}/users/${params.id}`, { revalidate: 60 });
  if (!data) notFound();

  const user = data?.user ?? data;
  const listings = Array.isArray(data?.listings) ? data.listings : [];
  const verified = isVerifiedProfile(user);

  return (
    <div className="page-shell py-10 sm:py-12">
      <section className="hero-panel p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div className="flex items-center gap-5">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-terra-100 text-2xl font-semibold text-terra-700">
              {getInitials(getUserDisplayName(user))}
            </div>
            <div className="min-w-0">
              <p className="section-kicker">Seller profile</p>
              <h1 className="mt-3 truncate text-4xl font-bold text-stone-900">{getUserDisplayName(user)}</h1>
              <p className="mt-2 text-sm text-stone-500">
                {verified ? "Verified cues visible" : "Marketplace seller"}{" "}
                {user?.createdAt ? `| Joined ${formatLongDate(user.createdAt)}` : ""}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="metric-chip">
              <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Active listings</p>
              <p className="mt-2 text-3xl font-bold text-stone-900">{listings.length}</p>
              <p className="mt-1 text-sm text-stone-600">Current marketplace items from this seller profile.</p>
            </div>
            <div className="metric-chip">
              <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Profile note</p>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Use seller pages to judge consistency, not just a single listing. Trading history,
                active inventory, and verification cues help buyers move faster.
              </p>
            </div>
          </div>
        </div>
      </section>

      {user?.bio ? (
        <section className="mt-8">
          <div className="surface-card p-6">
            <h2 className="text-2xl font-bold text-stone-900">About this seller</h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">{user.bio}</p>
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-stone-900">Listings from this seller</h2>
            <p className="mt-2 text-sm text-stone-500">
              Active marketplace inventory published under this profile.
            </p>
          </div>
          <Link href="/browse" className="text-sm font-semibold text-terra-600 hover:text-terra-700">
            Back to browse
          </Link>
        </div>

        {listings.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {listings.map((listing: any) => (
              <ListingCard key={listing._id || listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="surface-card p-10 text-center">
            <h2 className="text-2xl font-bold text-stone-900">No active listings right now</h2>
            <p className="mt-3 text-sm text-stone-600">
              This seller profile does not currently have live marketplace inventory.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
