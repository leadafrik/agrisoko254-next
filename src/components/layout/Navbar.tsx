"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Beef,
  ChevronDown,
  CirclePlus,
  LayoutDashboard,
  Leaf,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  ShoppingCart,
  User,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

const navLinks = [
  { href: "/browse", label: "Marketplace" },
  { href: "/request", label: "Buy Requests" },
  { href: "/learn", label: "Learn" },
  { href: "/b2b", label: "Bulk / B2B" },
  { href: "/about", label: "About" },
];

const sellLinks = [
  {
    href: "/create-listing/produce",
    label: "List Produce",
    description: "Maize, onions, vegetables, fruit",
    Icon: Leaf,
  },
  {
    href: "/create-listing/livestock",
    label: "List Livestock",
    description: "Cattle, goats, poultry, pigs",
    Icon: Beef,
  },
  {
    href: "/create-listing/inputs",
    label: "List Farm Inputs",
    description: "Seeds, feeds, fertilizer, tools",
    Icon: Package,
  },
  {
    href: "/create-listing/services",
    label: "List a Service",
    description: "Transport, spraying, agronomy",
    Icon: Wrench,
  },
];

const isActive = (pathname: string, href: string) => {
  if (href === "/browse") return pathname === "/browse" || pathname.startsWith("/browse/") || pathname.startsWith("/listings/");
  if (href === "/request") return pathname === "/request" || pathname.startsWith("/request/");
  if (href === "/learn") return pathname === "/learn" || pathname.startsWith("/learn/") || pathname.startsWith("/blog/");
  if (href === "/b2b") return pathname === "/b2b" || pathname.startsWith("/b2b/");
  return pathname === href;
};

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const sellTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const userFirstName = user?.fullName?.split(" ")[0] || user?.name?.split(" ")[0] || "Account";
  const resolveSellHref = (href: string) =>
    isAuthenticated ? href : `/login?mode=signup&redirect=${encodeURIComponent(href)}`;

  useEffect(() => {
    setMobileOpen(false);
    setSellOpen(false);
    setUserOpen(false);
  }, [pathname]);

  // Close mobile menu on outside scroll
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = () => setMobileOpen(false);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [mobileOpen]);

  const hoverProps = (
    open: boolean,
    setOpen: (v: boolean) => void,
    timer: React.MutableRefObject<ReturnType<typeof setTimeout> | null>
  ) => ({
    onMouseEnter: () => {
      if (timer.current) clearTimeout(timer.current);
      setOpen(true);
    },
    onMouseLeave: () => {
      timer.current = setTimeout(() => setOpen(false), 220);
    },
  });

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-[rgba(255,253,248,0.94)] backdrop-blur-xl">
      {/* Accent bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-terra-500 via-amber-400 to-forest-500" />

      <div className="page-shell">
        <div className="flex h-16 items-center justify-between gap-6">

          {/* ── Logo ── */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
              <Image
                src="/logo192.png"
                alt="Agrisoko"
                fill
                priority
                sizes="36px"
                className="object-contain p-1"
              />
            </div>
            <span className="text-[17px] font-bold tracking-tight text-stone-900">Agrisoko</span>
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="hidden flex-1 items-center gap-0.5 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(pathname, link.href)
                    ? "text-terra-600"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {link.label}
                {isActive(pathname, link.href) && (
                  <span className="absolute inset-x-3 -bottom-[18px] h-[2px] rounded-full bg-terra-500" />
                )}
              </Link>
            ))}

            {/* Sell dropdown */}
            <div className="relative ml-1" {...hoverProps(sellOpen, setSellOpen, sellTimer)}>
              <button
                type="button"
                onClick={() => setSellOpen((v) => !v)}
                aria-expanded={sellOpen}
                aria-haspopup="menu"
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive(pathname, "/create-listing")
                    ? "bg-terra-50 text-terra-700"
                    : "text-terra-600 hover:bg-terra-50 hover:text-terra-700"
                }`}
              >
                <CirclePlus className="h-4 w-4" />
                Sell
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${sellOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Sell mega-dropdown */}
              <div
                className={`absolute left-0 top-full mt-2.5 w-72 rounded-2xl border border-stone-200 bg-white p-2 shadow-[0_20px_60px_-20px_rgba(120,83,47,0.3)] transition-all duration-150 ${
                  sellOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
                }`}
              >
                <div className="px-3 pb-2 pt-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">Choose a listing type</p>
                </div>
                {sellLinks.map(({ href, label, description, Icon }) => (
                  <Link
                    key={href}
                    href={resolveSellHref(href)}
                    className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-stone-50"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-terra-50 text-terra-600 transition group-hover:bg-terra-100">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-stone-900">{label}</p>
                      <p className="text-xs text-stone-400">{description}</p>
                    </div>
                  </Link>
                ))}
                <div className="mx-2 mt-2 border-t border-stone-100 pt-2 pb-1">
                  <Link
                    href={resolveSellHref("/create-listing")}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-terra-600 transition hover:bg-terra-50"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    Not sure? Start here
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* ── Right side ── */}
          <div className="hidden items-center gap-2 lg:flex">
            {isAuthenticated ? (
              <>
                {/* Messages icon */}
                <Link
                  href="/messages"
                  className="relative flex h-9 w-9 items-center justify-center rounded-xl text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
                  aria-label="Messages"
                >
                  <MessageSquare className="h-[18px] w-[18px]" />
                </Link>

                {/* Cart icon */}
                <Link
                  href="/cart"
                  className="relative flex h-9 w-9 items-center justify-center rounded-xl text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
                  aria-label="Cart"
                >
                  <ShoppingCart className="h-[18px] w-[18px]" />
                  {itemCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-terra-500 text-[10px] font-bold text-white">
                      {itemCount > 9 ? "9+" : itemCount}
                    </span>
                  )}
                </Link>

                <div className="mx-1 h-5 w-px bg-stone-200" />

                {/* List now CTA */}
                <Link
                  href="/create-listing"
                  className="flex items-center gap-1.5 rounded-xl bg-terra-500 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-terra-600"
                >
                  <CirclePlus className="h-4 w-4" />
                  List now
                </Link>

                {/* User dropdown */}
                <div className="relative" {...hoverProps(userOpen, setUserOpen, userTimer)}>
                  <button
                    type="button"
                    onClick={() => setUserOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-terra-100 text-[10px] font-bold text-terra-700">
                      {userFirstName[0]?.toUpperCase()}
                    </span>
                    {userFirstName}
                    <ChevronDown className={`h-3.5 w-3.5 text-stone-400 transition-transform duration-200 ${userOpen ? "rotate-180" : ""}`} />
                  </button>

                  <div
                    className={`absolute right-0 top-full mt-2.5 w-52 rounded-2xl border border-stone-200 bg-white p-2 shadow-[0_20px_60px_-20px_rgba(28,25,23,0.18)] transition-all duration-150 ${
                      userOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
                    }`}
                  >
                    <div className="px-3 py-2">
                      <p className="truncate text-sm font-semibold text-stone-900">{user?.fullName || user?.name || "Account"}</p>
                      <p className="truncate text-xs text-stone-400">{user?.email || ""}</p>
                    </div>
                    <div className="my-1 border-t border-stone-100" />
                    {[
                      { href: "/profile", label: "Profile", Icon: User },
                      { href: "/messages", label: "Messages", Icon: MessageSquare },
                      { href: "/cart", label: `Cart${itemCount > 0 ? ` (${itemCount})` : ""}`, Icon: ShoppingCart },
                      ...(isAdmin ? [{ href: "/admin", label: "Admin Console", Icon: LayoutDashboard }] : []),
                    ].map(({ href, label, Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50 hover:text-stone-900"
                      >
                        <Icon className="h-4 w-4 text-stone-400" />
                        {label}
                      </Link>
                    ))}
                    <div className="my-1 border-t border-stone-100" />
                    <button
                      type="button"
                      onClick={() => { void logout(); }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="px-3.5 py-2 text-sm font-semibold text-stone-600 transition hover:text-stone-900">
                  Sign in
                </Link>
                <Link
                  href="/login?mode=signup"
                  className="flex items-center gap-1.5 rounded-xl bg-terra-500 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-terra-600"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 transition hover:bg-stone-50 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-4.5 w-4.5 h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="border-t border-stone-200 bg-white lg:hidden">
          <div className="page-shell py-4">

            {/* Primary links */}
            <div className="grid grid-cols-2 gap-1.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive(pathname, link.href)
                      ? "bg-terra-50 text-terra-700"
                      : "border border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Sell section */}
            <div className="mt-3 rounded-2xl border border-stone-200 bg-stone-50 p-3">
              <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">Sell on Agrisoko</p>
              <div className="grid grid-cols-2 gap-1.5">
                {sellLinks.map(({ href, label, Icon }) => (
                  <Link
                    key={href}
                    href={resolveSellHref(href)}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-terra-200 hover:text-terra-700"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-terra-500" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Auth section */}
            <div className="mt-3 space-y-1.5 border-t border-stone-100 pt-3">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 rounded-2xl bg-stone-50 px-4 py-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-terra-100 text-sm font-bold text-terra-700">
                      {userFirstName[0]?.toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-stone-900">{user?.fullName || user?.name}</p>
                      <p className="truncate text-xs text-stone-400">{user?.email || ""}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { href: "/profile", label: "Profile", Icon: User },
                      { href: "/messages", label: "Messages", Icon: MessageSquare },
                      { href: "/cart", label: itemCount > 0 ? `Cart (${itemCount})` : "Cart", Icon: ShoppingCart },
                    ].map(({ href, label, Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMobileOpen(false)}
                        className="flex flex-col items-center gap-1.5 rounded-2xl border border-stone-200 bg-white px-2 py-3 text-xs font-semibold text-stone-700"
                      >
                        <Icon className="h-4 w-4 text-stone-500" />
                        {label}
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/create-listing"
                    onClick={() => setMobileOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-terra-500 py-3 text-sm font-semibold text-white transition hover:bg-terra-600"
                  >
                    <CirclePlus className="h-4 w-4" />
                    List now
                  </Link>
                  <button
                    type="button"
                    onClick={() => { setMobileOpen(false); void logout(); }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center rounded-2xl border border-stone-200 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/login?mode=signup"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center rounded-2xl bg-terra-500 py-3 text-sm font-semibold text-white transition hover:bg-terra-600"
                  >
                    Get started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
