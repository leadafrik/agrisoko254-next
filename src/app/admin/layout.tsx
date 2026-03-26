"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const NAV = [
  { href: "/admin",                    label: "Dashboard" },
  { href: "/admin/listings-approval",  label: "Listings Approval" },
  { href: "/admin/id-verification",    label: "ID Verification" },
  { href: "/admin/users",              label: "Users" },
  { href: "/admin/reports",            label: "Reports" },
  { href: "/admin/analytics",          label: "Analytics" },
  { href: "/admin/broadcast",          label: "Broadcast" },
  { href: "/admin/orders",             label: "Orders" },
  { href: "/admin/blog",               label: "Blog" },
  { href: "/admin/content-editor",     label: "Content" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-stone-900 text-stone-300 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-stone-800">
          <span className="font-bold text-white font-display">Agrisoko</span>
          <span className="text-xs text-stone-500 block">Admin</span>
        </div>
        <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}
              className={`block px-5 py-2.5 text-sm transition-colors ${pathname === item.href ? "bg-stone-800 text-white" : "hover:bg-stone-800 hover:text-white"}`}>
              {item.label}
            </Link>
          ))}
        </nav>
        <button onClick={logout} className="px-5 py-4 text-sm text-stone-500 hover:text-white text-left border-t border-stone-800">
          Sign out
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
