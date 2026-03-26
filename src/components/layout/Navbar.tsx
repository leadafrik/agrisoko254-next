"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  LayoutGrid,
  Menu,
  MessageSquare,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

const browseLinks = [
  { href: "/browse", label: "All listings" },
  { href: "/browse/produce", label: "Produce" },
  { href: "/browse/livestock", label: "Livestock" },
  { href: "/browse/inputs", label: "Inputs" },
  { href: "/browse/services", label: "Services" },
];

const topLevelLinks = [
  { href: "/request", label: "Buy Requests" },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/b2b", label: "Bulk / B2B" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
];

const isActive = (pathname: string, href: string) => {
  if (href === "/browse") return pathname === "/browse" || pathname.startsWith("/browse/") || pathname.startsWith("/listings/");
  if (href === "/request") return pathname === "/request" || pathname.startsWith("/request/");
  if (href === "/blog") return pathname === "/blog" || pathname.startsWith("/blog/");
  if (href === "/learn") return pathname === "/learn" || pathname.startsWith("/learn/");
  return pathname === href;
};

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-[rgba(255,253,248,0.92)] backdrop-blur-xl">
      <div className="h-1 w-full bg-gradient-to-r from-terra-500 via-amber-sun-400 to-forest-500" />
      <div className="page-shell">
        <div className="flex h-[72px] items-center justify-between gap-4 py-4">
          <Link href="/" className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-terra-50 text-sm font-bold text-terra-700 shadow-sm">
                AG
              </div>
              <div className="min-w-0">
                <p className="truncate text-xl font-bold text-stone-900">Agrisoko</p>
                <p className="truncate text-xs uppercase tracking-[0.18em] text-stone-500">
                  Kenya agricultural marketplace
                </p>
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            <div
              className="relative"
              onMouseEnter={() => setBrowseOpen(true)}
              onMouseLeave={() => setBrowseOpen(false)}
            >
              <button
                type="button"
                className={`ghost-button ${isActive(pathname, "/browse") ? "bg-white text-terra-600 shadow-sm" : ""}`}
                onClick={() => setBrowseOpen((current) => !current)}
              >
                <LayoutGrid className="mr-2 h-4 w-4" />
                Marketplace
                <ChevronDown className={`ml-2 h-4 w-4 transition ${browseOpen ? "rotate-180" : ""}`} />
              </button>
              <div
                className={`absolute left-0 top-full mt-3 w-72 rounded-[26px] border border-stone-200 bg-white p-2 shadow-[0_24px_60px_-32px_rgba(120,83,47,0.45)] transition ${
                  browseOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
                }`}
              >
                {browseLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-2xl px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-terra-50 hover:text-terra-600"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {topLevelLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`ghost-button ${isActive(pathname, link.href) ? "bg-white text-terra-600 shadow-sm" : ""}`}
                >
                  {Icon ? <Icon className="mr-2 h-4 w-4" /> : null}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {isAuthenticated ? (
              <>
                <Link href="/cart" className="ghost-button">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Cart
                  {itemCount > 0 ? (
                    <span className="ml-2 rounded-full bg-terra-100 px-2 py-0.5 text-xs font-semibold text-terra-700">
                      {itemCount}
                    </span>
                  ) : null}
                </Link>
                <Link href="/messages" className="ghost-button">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Messages
                </Link>
                <Link href="/create-listing" className="primary-button">
                  Start selling
                </Link>
                <Link href="/profile" className="secondary-button">
                  <User className="mr-2 h-4 w-4" />
                  {user?.name?.split(" ")[0] || "Profile"}
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="ghost-button">
                  Sign in
                </Link>
                <Link href="/login?mode=signup" className="primary-button">
                  Create account
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-700 lg:hidden"
            onClick={() => setMobileOpen((current) => !current)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-stone-200 bg-white lg:hidden">
          <div className="page-shell py-5">
            <div className="rounded-[26px] border border-stone-200 bg-stone-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                Marketplace
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {browseLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-stone-700 shadow-sm"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {topLevelLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700"
                  >
                    {Icon ? <Icon className="mr-2 h-4 w-4" /> : null}
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-4 space-y-2 border-t border-stone-200 pt-4">
              {isAuthenticated ? (
                <>
                  <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex items-center rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                  <Link href="/messages" onClick={() => setMobileOpen(false)} className="flex items-center rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                  </Link>
                  <Link href="/cart" onClick={() => setMobileOpen(false)} className="flex items-center rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Cart {itemCount > 0 ? `(${itemCount})` : ""}
                  </Link>
                  <Link href="/create-listing" onClick={() => setMobileOpen(false)} className="primary-button w-full">
                    Start selling
                  </Link>
                  <button
                    type="button"
                    className="w-full rounded-2xl border border-red-200 px-4 py-3 text-left text-sm font-semibold text-red-600"
                    onClick={() => {
                      setMobileOpen(false);
                      void logout();
                    }}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="secondary-button w-full">
                    Sign in
                  </Link>
                  <Link href="/login?mode=signup" onClick={() => setMobileOpen(false)} className="primary-button w-full">
                    Create account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
