"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CirclePlus,
  Heart,
  LogOut,
  MessageSquare,
  Package,
  ShieldCheck,
  ShoppingBasket,
  Truck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const profileLinks = [
  { href: "/orders", label: "My Orders", icon: Package },
  { href: "/sellers/orders", label: "Seller Orders", icon: Truck },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/create-listing", label: "Create Listing", icon: CirclePlus },
  { href: "/verify", label: "Verification", icon: ShieldCheck },
];

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();
  const displayName = user?.fullName || user?.name || "Agrisoko user";
  const verified = Boolean(user?.verification?.isVerified || user?.verification?.idVerified);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-stone-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-display text-2xl font-bold text-stone-900">My Profile</h1>

      <div className="mb-6 flex items-center gap-5 rounded-xl border border-stone-100 bg-white p-6">
        {user?.profilePicture ? (
          <div className="relative h-16 w-16 overflow-hidden rounded-full">
            <Image
              src={user.profilePicture}
              alt={displayName}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-terra-100 text-2xl font-bold text-terra-700">
            {displayName[0]}
          </div>
        )}

        <div className="min-w-0">
          <p className="text-lg font-bold text-stone-800">{displayName}</p>
          <p className="truncate text-sm text-stone-500">{user?.phone ?? user?.email}</p>
          {verified ? (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-forest-100 px-2 py-0.5 text-xs font-medium text-forest-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified
            </span>
          ) : null}
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        {profileLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl border border-stone-100 bg-white p-4 transition-all hover:border-terra-200 hover:shadow-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-terra-50 text-terra-700">
                <Icon className="h-5 w-5" />
              </span>
              <span className="font-medium text-stone-700">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mb-6 rounded-xl border border-stone-100 bg-white p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
            <ShoppingBasket className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-semibold text-stone-900">Account overview</h2>
            <p className="text-sm text-stone-500">
              Keep your profile, listings, messages, and verification in one place.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={logout}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 py-3 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </div>
  );
}
