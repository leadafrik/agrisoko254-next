import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, MapPin, Star } from "lucide-react";
import ListingCard from "@/components/marketplace/ListingCard";
import SellerProfileActions from "@/components/marketplace/SellerProfileActions";
import { serverFetch } from "@/lib/api-server";
import { API_BASE_URL } from "@/lib/endpoints";
import {
  formatLastActive,
  formatLongDate,
  getInitials,
  getUserDisplayName,
  isVerifiedProfile,
} from "@/lib/marketplace";
import { normalizeKenyanPhone } from "@/lib/phone";

interface Props {
  params: { id: string };
}

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await serverFetch<any>(`${API_BASE_URL}/users/${params.id}`, { revalidate: 60 });
  const user = data?.user ?? data;
  if (!user) return {};
  const name = getUserDisplayName(user);
  const county = user?.county || user?.location?.county || user?.address?.county || null;
  const verified = isVerifiedProfile(user);
  const canonicalUrl = `https://www.agrisoko254.com/sellers/${params.id}`;

  const descParts = [
    verified ? `Verified seller on Agrisoko.` : null,
    county ? `Based in ${county}, Kenya.` : "Kenya.",
    user?.bio ? user.bio.slice(0, 100).trim() : null,
    `Browse active listings from ${name} on Agrisoko Kenya's agricultural marketplace.`,
  ].filter(Boolean);

  return {
    title: `${name} | Seller on Agrisoko Kenya`,
    description: descParts.join(" "),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "profile",
      url: canonicalUrl,
      title: `${name} — Agrisoko Seller`,
      description: descParts.join(" "),
      images: user?.profilePicture
        ? [{ url: user.profilePicture, width: 400, height: 400, alt: name }]
        : [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary",
      title: `${name} | Agrisoko Seller`,
      description: descParts.join(" "),
    },
  };
}

export default async function SellerProfilePage({ params }: Props) {
  const [profileData, listingsData] = await Promise.all([
    serverFetch<any>(`${API_BASE_URL}/users/${params.id}`, { revalidate: 60 }),
    serverFetch<any>(
      `${API_BASE_URL}/unified-listings?userId=${params.id}&limit=12&status=approved`,
      { revalidate: 60 }
    ).catch(() => null),
  ]);

  if (!profileData) notFound();

  const user = profileData?.user ?? profileData;
  const rawListings = listingsData?.data ?? listingsData?.listings ?? listingsData ?? [];
  const listings = Array.isArray(rawListings) ? rawListings : [];
  const verified = isVerifiedProfile(user);

  const avatar = user?.profilePicture || user?.avatar || null;
  const displayName = getUserDisplayName(user);
  const county = user?.county || user?.location?.county || user?.address?.county || null;
  const lastActive = formatLastActive(user?.lastActive || user?.updatedAt);
  const responseTime = user?.responseTime || user?.responseTimeLabel || null;

  const rawPhone = String(user?.phone || user?.contact || "").trim();
  const whatsappPhone = normalizeKenyanPhone(rawPhone);

  const ratings = user?.ratings || user?.ratingSummary || null;
  const avgRating = Number(ratings?.average ?? ratings?.avg ?? user?.averageRating ?? 0);
  const ratingCount = Number(ratings?.count ?? ratings?.total ?? user?.ratingCount ?? 0);

  const followerCount = Number(user?.followers?.length ?? user?.followerCount ?? 0);

  const sellerSchema = {
    "@context": "https://schema.org",
    "@type": verified ? "Person" : "Person",
    name: displayName,
    url: `https://www.agrisoko254.com/sellers/${params.id}`,
    ...(avatar ? { image: avatar } : {}),
    ...(user?.bio ? { description: user.bio } : {}),
    ...(county
      ? {
          address: {
            "@type": "PostalAddress",
            addressRegion: county,
            addressCountry: "KE",
          },
        }
      : {}),
    ...(avgRating > 0 && ratingCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount: ratingCount,
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
    worksFor: { "@type": "Organization", name: "Agrisoko" },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Marketplace", item: "https://www.agrisoko254.com/browse" },
      { "@type": "ListItem", position: 2, name: displayName },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(sellerSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    <div className="page-shell py-10 sm:py-12">
      {/* Profile hero */}
      <section className="hero-panel p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {avatar ? (
              <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-stone-200 shadow-sm sm:h-28 sm:w-28">
                <Image src={avatar} alt={displayName} fill sizes="112px" className="object-cover" />
              </div>
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-terra-100 text-2xl font-bold text-terra-700 sm:h-28 sm:w-28">
                {getInitials(displayName)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <p className="section-kicker">Seller profile</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold text-stone-900 sm:text-4xl">{displayName}</h1>
              {verified && (
                <span className="inline-flex items-center gap-1 rounded-full border border-forest-200 bg-forest-50 px-2.5 py-1 text-xs font-semibold text-forest-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verified
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-500">
              {county && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {county}
                </span>
              )}
              {avgRating > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-stone-700">{avgRating.toFixed(1)}</span>
                  {ratingCount > 0 && (
                    <span className="text-stone-400">({ratingCount.toLocaleString()})</span>
                  )}
                </span>
              )}
              {user?.createdAt && (
                <span>Joined {formatLongDate(user.createdAt)}</span>
              )}
              {(responseTime || lastActive) && (
                <span>
                  {[responseTime && `Responds ${responseTime}`, lastActive]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              )}
            </div>

            {user?.bio && (
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-600">{user.bio}</p>
            )}

            <div className="mt-4">
              <SellerProfileActions
                sellerId={String(user._id || user.id || params.id)}
                initialFollowerCount={followerCount}
                whatsappPhone={whatsappPhone}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-row gap-3 sm:flex-col sm:items-end">
            <div className="metric-chip min-w-[90px] text-center">
              <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Listings</p>
              <p className="mt-1 text-3xl font-bold text-stone-900">{listings.length}</p>
            </div>
            {ratingCount > 0 && (
              <div className="metric-chip min-w-[90px] text-center">
                <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Rating</p>
                <p className="mt-1 text-3xl font-bold text-stone-900">{avgRating.toFixed(1)}</p>
                <p className="text-[10px] text-stone-400">{ratingCount} review{ratingCount !== 1 ? "s" : ""}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="mt-10">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-stone-900">Listings from this seller</h2>
            <p className="mt-1 text-sm text-stone-500">
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
              This seller does not currently have live marketplace inventory.
            </p>
          </div>
        )}
      </section>
    </div>
    </>
  );
}
