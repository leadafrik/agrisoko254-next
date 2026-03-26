"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export function HeroAuthCTA() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/browse" className="primary-button">Browse listings</Link>
        <Link href="/create-listing" className="secondary-button">List now</Link>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      <Link href="/browse" className="primary-button">Browse listings</Link>
      <Link href="/login?mode=signup" className="secondary-button">Create account — free</Link>
    </div>
  );
}

export function BottomAuthCTA() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
        <Link
          href="/create-listing"
          className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-terra-700 transition hover:bg-[#FFF7F4] sm:w-auto"
        >
          List now
        </Link>
        <Link
          href="/browse"
          className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border border-white/50 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
        >
          Browse listings
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
      <Link
        href="/login?mode=signup"
        className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-terra-700 transition hover:bg-[#FFF7F4] sm:w-auto"
      >
        Create account — free
      </Link>
      <Link
        href="/browse"
        className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border border-white/50 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
      >
        Browse listings
      </Link>
    </div>
  );
}
