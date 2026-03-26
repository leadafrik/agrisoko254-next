"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export function AboutHeroCTA() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/browse" className="primary-button">
          Explore Listings
        </Link>
        <Link href="/market-intelligence" className="secondary-button">
          View market prices
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      <Link href="/login?mode=signup&redirect=%2Fbrowse" className="primary-button">
        Create account / Sign in
      </Link>
      <Link href="/browse" className="secondary-button">
        Explore Listings
      </Link>
    </div>
  );
}

export function AboutBottomCTA() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/create-listing" className="primary-button">
          Post a Listing
        </Link>
        <Link href="/browse" className="secondary-button">
          Browse listings
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
      <Link href="/login?mode=signup&redirect=%2Fbrowse" className="secondary-button">
        Create account / Sign in
      </Link>
      <Link
        href="/login?mode=signup&redirect=%2Fcreate-listing%2Fproduce"
        className="primary-button"
      >
        Post a Listing
      </Link>
    </div>
  );
}
