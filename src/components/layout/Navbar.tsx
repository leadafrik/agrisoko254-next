"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-terra-600 font-display">Agrisoko</span>
            <span className="text-xs bg-forest-100 text-forest-700 px-1.5 py-0.5 rounded font-medium">KE</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
            <Link href="/browse"          className="hover:text-terra-600 transition-colors">Browse</Link>
            <Link href="/request"         className="hover:text-terra-600 transition-colors">Buy Requests</Link>
            <Link href="/learn"           className="hover:text-terra-600 transition-colors flex items-center gap-1">
              <BookOpen size={15} /> Learn
            </Link>
            <Link href="/b2b"             className="hover:text-terra-600 transition-colors">Bulk / B2B</Link>
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link href="/create-listing"
                  className="bg-terra-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-terra-600 transition-colors">
                  + Sell
                </Link>
                <Link href="/profile" className="flex items-center gap-2 text-sm text-stone-700 hover:text-terra-600">
                  {user?.profilePicture
                    ? <img src={user.profilePicture} className="w-8 h-8 rounded-full object-cover" alt={user.name} />
                    : <span className="w-8 h-8 rounded-full bg-terra-100 text-terra-700 flex items-center justify-center font-semibold text-sm">{user?.name?.[0]}</span>
                  }
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-stone-600 hover:text-terra-600 font-medium">Sign in</Link>
                <Link href="/login?mode=signup"
                  className="bg-terra-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-terra-600 transition-colors">
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2 text-stone-600" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-stone-100 px-4 py-4 space-y-3 text-sm font-medium text-stone-700">
          <Link href="/browse"         className="block py-2" onClick={() => setOpen(false)}>Browse Listings</Link>
          <Link href="/request"        className="block py-2" onClick={() => setOpen(false)}>Buy Requests</Link>
          <Link href="/learn"          className="block py-2" onClick={() => setOpen(false)}>Learn</Link>
          <Link href="/b2b"            className="block py-2" onClick={() => setOpen(false)}>Bulk / B2B</Link>
          {isAuthenticated ? (
            <>
              <Link href="/create-listing" className="block py-2 text-terra-600 font-semibold" onClick={() => setOpen(false)}>+ Sell</Link>
              <Link href="/profile"        className="block py-2" onClick={() => setOpen(false)}>My Profile</Link>
              <Link href="/orders"         className="block py-2" onClick={() => setOpen(false)}>Orders</Link>
              <Link href="/messages"       className="block py-2" onClick={() => setOpen(false)}>Messages</Link>
              <button onClick={logout} className="block py-2 text-red-500 w-full text-left">Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login"              className="block py-2" onClick={() => setOpen(false)}>Sign in</Link>
              <Link href="/login?mode=signup"  className="block py-2 text-terra-600 font-semibold" onClick={() => setOpen(false)}>Get started free</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
