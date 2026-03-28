"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FileText, Gavel, LayoutGrid, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navigation = [
  { name: "Portal home", href: "/b2b/dashboard", icon: LayoutGrid },
  { name: "Sourcing desk", href: "/b2b/dashboard/rfqs", icon: FileText },
  { name: "Supplier desk", href: "/b2b/dashboard/bids", icon: Gavel },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function B2BDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/b2b/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
        <p className="text-sm font-medium text-stone-500">Checking B2B portal access...</p>
      </div>
    );
  }

  const displayName = user?.fullName || user?.name || user?.email || "Agrisoko partner";

  const navItems = navigation.map((item) => {
    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
    return (
      <Link
        key={item.name}
        href={item.href}
        className={classNames(
          active
            ? "bg-terra-50 text-terra-700"
            : "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
          "group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition"
        )}
      >
        <item.icon
          className={classNames(
            active ? "text-terra-600" : "text-stone-400 group-hover:text-stone-600",
            "mr-3 h-5 w-5 shrink-0"
          )}
        />
        {item.name}
      </Link>
    );
  });

  return (
    <div className="min-h-screen bg-stone-50">
      {sidebarOpen ? (
        <div className="fixed inset-0 z-40 bg-stone-950/35 md:hidden" onClick={() => setSidebarOpen(false)} />
      ) : null}

      <aside
        className={classNames(
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-stone-200 bg-white p-5 transition-transform md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-terra-600">Agrisoko</p>
            <h1 className="mt-1 text-2xl font-bold text-stone-900">B2B Portal</h1>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-stone-500 md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="sr-only">Close navigation</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
          Use the live marketplace workflows while dedicated RFQ automation is being wired into the portal.
        </p>

        <nav className="mt-6 space-y-2">{navItems}</nav>

        <div className="mt-auto rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Signed in as</p>
          <p className="mt-2 text-sm font-semibold text-stone-900">{displayName}</p>
          <div className="mt-4 flex flex-col gap-2">
            <Link href="/b2b" className="text-sm font-semibold text-terra-600 hover:text-terra-700">
              Back to B2B overview
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="text-left text-sm font-semibold text-stone-600 hover:text-stone-900"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="md:pl-72">
        <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-[68px] items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-stone-600 md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Open navigation</span>
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">B2B workspace</p>
                <p className="text-sm font-semibold text-stone-900">{displayName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/bulk"
                className="inline-flex min-h-[40px] items-center justify-center rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
              >
                Bulk workflows
              </Link>
              <Link
                href="/messages"
                className="inline-flex min-h-[40px] items-center justify-center rounded-xl bg-terra-500 px-4 py-2 text-sm font-semibold text-white hover:bg-terra-600"
              >
                Messages
              </Link>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
