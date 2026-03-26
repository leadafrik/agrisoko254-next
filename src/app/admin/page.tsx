"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminApiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    adminApiRequest(API_ENDPOINTS.admin.dashboard).then(setStats).catch(() => {});
  }, []);

  const cards = [
    { label: "Pending Listings",  value: stats?.pendingListings  ?? "–", href: "/admin/listings-approval" },
    { label: "Pending ID Checks", value: stats?.pendingIdVerifications ?? "–", href: "/admin/id-verification" },
    { label: "Total Users",       value: stats?.totalUsers       ?? "–", href: "/admin/users" },
    { label: "Active Listings",   value: stats?.activeListings   ?? "–", href: "/admin/listings-approval" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 mb-8">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}
            className="bg-white rounded-xl border border-stone-100 p-5 hover:border-terra-200 hover:shadow-sm transition-all">
            <p className="text-sm text-stone-500 mb-1">{c.label}</p>
            <p className="text-3xl font-bold text-stone-900">{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { href: "/admin/listings-approval", label: "Review Listings",     desc: "Approve or reject pending listings" },
          { href: "/admin/id-verification",   label: "ID Verification",     desc: "Review uploaded ID documents" },
          { href: "/admin/users",             label: "Manage Users",        desc: "Search, suspend, verify users" },
          { href: "/admin/reports",           label: "Reports",             desc: "Handle user reports" },
          { href: "/admin/broadcast",         label: "Broadcast Email",     desc: "Send emails to all users" },
          { href: "/admin/blog",              label: "Blog",                desc: "Create and manage blog posts" },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className="bg-white rounded-xl border border-stone-100 p-5 hover:border-terra-200 transition-all">
            <p className="font-semibold text-stone-800 mb-1">{item.label}</p>
            <p className="text-sm text-stone-500">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
