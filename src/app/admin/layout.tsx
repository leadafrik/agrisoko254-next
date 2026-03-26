"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { href: "/admin",           label: "Dashboard" },
      { href: "/admin/analytics", label: "Analytics" },
    ],
  },
  {
    label: "Listings",
    items: [
      { href: "/admin/listings-approval",  label: "Approval Queue" },
      { href: "/admin/listing-management", label: "Listing Management" },
      { href: "/admin/moderation",         label: "Moderation" },
      { href: "/admin/boosts",             label: "Boost Requests" },
    ],
  },
  {
    label: "Users",
    items: [
      { href: "/admin/users",                label: "All Users" },
      { href: "/admin/id-verification",      label: "ID Verification" },
      { href: "/admin/profile-verification", label: "Profile Verification" },
      { href: "/admin/reports-management",   label: "Reports" },
    ],
  },
  {
    label: "Commerce",
    items: [
      { href: "/admin/orders",             label: "Orders" },
      { href: "/admin/bulk-applications",  label: "Bulk Applications" },
      { href: "/admin/bulk-orders",        label: "Bulk Orders" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/blog",           label: "Blog Posts" },
      { href: "/admin/broadcast",      label: "Broadcast Email" },
      { href: "/admin/content-editor", label: "Content Editor" },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  if (pathname === "/admin/login") return <>{children}</>;

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="flex min-h-screen bg-stone-100">
      {/* Sidebar */}
      <aside className="flex w-60 shrink-0 flex-col bg-stone-900 text-stone-300">
        <div className="border-b border-stone-800 px-5 py-5">
          <p className="text-lg font-bold text-white">Agrisoko</p>
          <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Admin Console</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-1">
              <p className="px-5 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-600">
                {group.label}
              </p>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-5 py-2 text-sm transition-colors ${
                    isActive(item.href)
                      ? "bg-stone-800 font-semibold text-white"
                      : "text-stone-400 hover:bg-stone-800/60 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <button
          onClick={() => void logout()}
          className="border-t border-stone-800 px-5 py-4 text-left text-sm text-stone-500 transition hover:text-white"
        >
          Sign out
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="min-h-full p-8">{children}</div>
      </main>
    </div>
  );
}
