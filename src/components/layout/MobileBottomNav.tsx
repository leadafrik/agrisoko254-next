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
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200/90 bg-[rgba(255,253,248,0.97)] px-2 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] pt-1.5 backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-4 gap-0.5 rounded-[24px] border border-stone-200/80 bg-white/90 p-1 shadow-[0_-12px_32px_-26px_rgba(28,25,23,0.32)]">
        {items.map(({ href, label, Icon, resolvedHref }) => {
          const active = isActive(pathname, href);
          const isSell = href === "/create-listing";

          return (
            <Link
              key={href}
              href={resolvedHref ?? href}
              className={`flex min-h-[54px] flex-col items-center justify-center gap-0.5 rounded-[17px] px-1 text-[10px] font-semibold leading-none tracking-[0.01em] transition ${
                isSell
                  ? active
                    ? "bg-terra-600 text-white shadow-[0_18px_30px_-18px_rgba(160,69,46,0.9)]"
                    : "bg-terra-500 text-white shadow-[0_18px_30px_-18px_rgba(160,69,46,0.75)]"
                  : active
                    ? "bg-stone-900 text-white"
                    : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
              }`}
            >
              <Icon className={`h-4 w-4 ${isSell ? "h-[18px] w-[18px]" : ""}`} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
