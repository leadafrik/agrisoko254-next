"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  CirclePlus,
  LayoutGrid,
  Menu,
  MessageSquare,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

const topLevelLinks = [
  { href: "/browse", label: "Marketplace", icon: LayoutGrid },
  { href: "/request", label: "Buy Requests" },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/b2b", label: "Bulk / B2B" },
  { href: "/about", label: "About" },
];

const sellLinks = [
  { href: "/create-listing/produce", label: "List Produce" },
  { href: "/create-listing/livestock", label: "List Livestock" },
  { href: "/create-listing/inputs", label: "List Inputs" },
  { href: "/create-listing/services", label: "List Service" },
];

const isActive = (pathname: string, href: string) => {
  if (href === "/browse") return pathname === "/browse" || pathname.startsWith("/browse/") || pathname.startsWith("/listings/");
  if (href === "/request") return pathname === "/request" || pathname.startsWith("/request/");
  if (href === "/learn") {
    return (
      pathname === "/learn" ||
      pathname.startsWith("/learn/") ||
      pathname === "/blog" ||
      pathname.startsWith("/blog/")
    );
  }
  if (href === "/create-listing") return pathname === "/create-listing" || pathname.startsWith("/create-listing/");
  return pathname === href;
};

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const sellCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userFirstName = user?.fullName?.split(" ")[0] || user?.name?.split(" ")[0] || "Profile";
  const resolveSellHref = (href: string) =>
    isAuthenticated ? href : `/login?mode=signup&redirect=${encodeURIComponent(href)}`;

  useEffect(() => {
    setMobileOpen(false);
    setSellOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-[rgba(255,253,248,0.92)] backdrop-blur-xl">
      <div className="h-1 w-full bg-gradient-to-r from-terra-500 via-amber-sun-400 to-forest-500" />
      <div className="page-shell">
        <div className="flex h-[72px] items-center justify-between gap-4 py-4">
          <Link href="/" className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                <Image
                  src="/logo192.png"
                  alt="Agrisoko logo"
                  fill
                  priority
                  sizes="44px"
                  className="object-contain p-1.5"
                />
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

            <div
              className="relative"
              onMouseEnter={() => {
                if (sellCloseTimer.current) clearTimeout(sellCloseTimer.current);
                setSellOpen(true);
              }}
              onMouseLeave={() => {
                sellCloseTimer.current = setTimeout(() => setSellOpen(false), 200);
              }}
            >
              <button
                type="button"
                className={`ghost-button ${isActive(pathname, "/create-listing") ? "bg-white text-terra-600 shadow-sm" : ""}`}
                onClick={() => setSellOpen((current) => !current)}
                aria-expanded={sellOpen}
                aria-haspopup="menu"
              >
                <CirclePlus className="mr-2 h-4 w-4" />
                Sell
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${sellOpen ? "rotate-180" : ""}`} />
              </button>

              <div
                className={`absolute left-0 top-full mt-2 w-60 rounded-2xl border border-stone-200 bg-white p-2 shadow-[0_18px_45px_-30px_rgba(120,83,47,0.45)] transition ${
                  sellOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
                }`}
              >
                {sellLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={resolveSellHref(link.href)}
                    className="flex rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 hover:text-terra-600"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
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
                  {userFirstName}
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="secondary-button">
                  Sign in
                </Link>
                <Link href="/login?mode=signup" className="primary-button">
                  Get started
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
            <div className="space-y-2">
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

            <div className="mt-4 rounded-[28px] border border-stone-200 bg-stone-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-terra-600 shadow-sm">
                  <CirclePlus className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-900">Sell on Agrisoko</p>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600">
                    Choose the right listing path and move straight into the correct form.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {sellLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={resolveSellHref(link.href)}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
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
