"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();
  const displayName = user?.fullName || user?.name || "Agrisoko user";

  if (isLoading) return <div className="flex items-center justify-center min-h-screen text-stone-400">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold font-display text-stone-900 mb-8">My Profile</h1>

      <div className="bg-white rounded-xl border border-stone-100 p-6 mb-6 flex items-center gap-5">
        {user?.profilePicture ? (
          <img src={user.profilePicture} alt={displayName} className="w-16 h-16 rounded-full object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-terra-100 text-terra-700 flex items-center justify-center text-2xl font-bold">
            {displayName[0]}
          </div>
        )}
        <div>
          <p className="text-lg font-bold text-stone-800">{displayName}</p>
          <p className="text-sm text-stone-500">{user?.phone ?? user?.email}</p>
          {user?.verification?.isVerified && (
            <span className="text-xs bg-forest-100 text-forest-700 px-2 py-0.5 rounded-full font-medium mt-1 inline-block">✓ Verified</span>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {[
          { href: "/orders", label: "My Orders", emoji: "📦" },
          { href: "/seller/orders", label: "Seller Orders", emoji: "🛒" },
          { href: "/messages", label: "Messages", emoji: "💬" },
          { href: "/favorites", label: "Favorites", emoji: "❤️" },
          { href: "/create-listing", label: "Create Listing", emoji: "➕" },
          { href: "/verify", label: "Verification", emoji: "✅" },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className="bg-white rounded-xl border border-stone-100 p-4 flex items-center gap-3 hover:border-terra-200 hover:shadow-sm transition-all">
            <span className="text-2xl">{item.emoji}</span>
            <span className="font-medium text-stone-700">{item.label}</span>
          </Link>
        ))}
      </div>

      <button onClick={logout}
        className="w-full border border-red-200 text-red-500 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors text-sm">
        Sign Out
      </button>
    </div>
  );
}
