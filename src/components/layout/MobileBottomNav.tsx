"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CirclePlus,
  NotebookText,
  Search,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const isActive = (pathname: string, href: string) => {
  if (href === "/browse") {
    return (
      pathname === "/" ||
      pathname === "/browse" ||
      pathname.startsWith("/browse/") ||
      pathname.startsWith("/listings/")
    );
  }
  if (href === "/request") return pathname === "/request" || pathname.startsWith("/request/");
  if (href === "/profile") return pathname === "/profile" || pathname.startsWith("/profile/");
  if (href === "/create-listing")
    return pathname === "/create-listing" || pathname.startsWith("/create-listing/");
  return pathname === href;
};

const HIDDEN_PREFIXES = ["/login", "/forgot-password", "/welcome/setup-password"];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  const resolveAuthedHref = (href: string) =>
    isAuthenticated ? href : `/login?redirect=${encodeURIComponent(href)}`;

  const items = [
    {
      href: "/browse",
      label: "Browse",
      Icon: Search,
    },
    {
      href: "/create-listing",
      label: "Sell",
      Icon: CirclePlus,
      resolvedHref: isAuthenticated
        ? "/create-listing"
        : `/login?mode=signup&redirect=${encodeURIComponent("/create-listing")}`,
    },
    {
      href: "/request",
      label: "Requests",
      Icon: NotebookText,
    },
    {
      href: "/profile",
      label: "Profile",
      Icon: User,
      resolvedHref: resolveAuthedHref("/profile"),
    },
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200/90 bg-[rgba(255,253,248,0.97)] px-2 pb-[calc(env(safe-area-inset-bottom)+0.55rem)] pt-2 backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-xl grid-cols-4 gap-1 rounded-[26px] border border-stone-200/80 bg-white/90 p-1.5 shadow-[0_-16px_42px_-30px_rgba(28,25,23,0.35)]">
        {items.map(({ href, label, Icon, resolvedHref }) => {
          const active = isActive(pathname, href);
          const isSell = href === "/create-listing";

          return (
            <Link
              key={href}
              href={resolvedHref ?? href}
              className={`flex min-h-[62px] flex-col items-center justify-center gap-1 rounded-[20px] px-1.5 text-[11px] font-semibold transition ${
                isSell
                  ? active
                    ? "bg-terra-600 text-white shadow-[0_18px_30px_-18px_rgba(160,69,46,0.9)]"
                    : "bg-terra-500 text-white shadow-[0_18px_30px_-18px_rgba(160,69,46,0.75)]"
                  : active
                    ? "bg-stone-900 text-white"
                    : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
              }`}
            >
              <Icon className={`h-[18px] w-[18px] ${isSell ? "h-5 w-5" : ""}`} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
