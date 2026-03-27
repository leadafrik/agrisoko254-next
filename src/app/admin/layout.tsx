"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ClipboardCheck,
  FileBadge2,
  FileText,
  LayoutDashboard,
  LogOut,
  Megaphone,
  PackageSearch,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Trust",
    items: [
      { href: "/admin/listings-approval", label: "Approval Queue", icon: ClipboardCheck },
      { href: "/admin/id-verification", label: "ID Verification", icon: ShieldCheck },
      { href: "/admin/profile-verification", label: "Profile Verification", icon: FileBadge2 },
      { href: "/admin/reports-management", label: "Reports", icon: FileText },
    ],
  },
  {
    label: "Marketplace",
    items: [
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/listing-management", label: "Listing Management", icon: PackageSearch },
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    ],
  },
  {
    label: "Growth",
    items: [
      { href: "/admin/market-intelligence", label: "Market Intelligence", icon: BarChart3 },
      { href: "/admin/blog", label: "Blog Posts", icon: FileText },
      { href: "/admin/broadcast", label: "Broadcast", icon: Megaphone },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAdmin, isLoading, logout, refreshUser, user } = useAuth();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-950 px-6">
        <div className="ui-card max-w-md px-8 py-10 text-center">
          <p className="ui-section-kicker">Admin console</p>
          <h1 className="mt-4 text-3xl font-bold text-stone-900">Loading access</h1>
          <p className="mt-3 text-sm text-stone-600">
            Checking your current role and admin permissions.
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-950 px-6">
        <div className="ui-card max-w-xl px-8 py-10 text-center">
          <p className="ui-section-kicker">Access restricted</p>
          <h1 className="mt-4 text-3xl font-bold text-stone-900">Admin access only</h1>
          <p className="mt-3 text-sm text-stone-600">
            This console is reserved for admin, moderator, and super admin accounts.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => void refreshUser()}
              className="ui-btn-primary gap-2 px-5 py-2.5"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh session
            </button>
            <Link href="/" className="ui-btn-secondary px-5 py-2.5">
              Back to marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-stone-950 text-stone-300 lg:flex lg:flex-col">
          <div className="border-b border-white/10 px-6 py-6">
            <div className="flex items-center justify-between gap-3">
              <Link href="/admin" className="block">
                <p className="text-lg font-bold text-white">Agrisoko</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                  Admin console
                </p>
              </Link>
              <Link
                href="/"
                title="Back to marketplace"
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 text-stone-400 transition hover:border-white/20 hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              </Link>
            </div>
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Signed in as</p>
              <p className="mt-1 font-semibold text-white">
                {user?.fullName || user?.name || "Admin"}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-emerald-300">
                {user?.role || "admin"}
              </p>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-5">
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="mb-5">
                <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition ${
                          isActive(item.href)
                            ? "bg-white text-stone-950 shadow-sm"
                            : "text-stone-300 hover:bg-white/8 hover:text-white"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-white/10 px-4 py-4">
            <button
              type="button"
              onClick={() => void logout()}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-stone-300 transition hover:bg-white/8 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 bg-stone-100">
          <div className="border-b border-stone-200 bg-white/90 px-5 py-4 backdrop-blur lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                  Agrisoko administration
                </p>
                <h1 className="mt-1 text-lg font-semibold text-stone-900">
                  Marketplace operations and trust controls
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-600 transition hover:border-stone-300 hover:text-stone-900"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                  Marketplace
                </Link>
                <button
                  type="button"
                  onClick={() => void refreshUser()}
                  className="ui-btn-secondary gap-2 px-4 py-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh role
                </button>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Access active
                </span>
              </div>
            </div>
          </div>

          <div className="min-h-[calc(100vh-81px)] p-5 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
