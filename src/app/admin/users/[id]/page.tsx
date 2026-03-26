"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminApiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

export default function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApiRequest(API_ENDPOINTS.admin.users.getById(params.id))
      .then((response) => setUser(response?.data ?? response?.user ?? response))
      .catch((loadError) => setError(loadError?.message || "Unable to load the user profile."))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <div className="text-stone-500">Loading user profile...</div>;
  }

  if (!user) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-stone-900">User not found</h1>
        <p className="mt-3 text-sm text-stone-600">{error || "The requested user could not be loaded."}</p>
        <Link href="/admin/users" className="mt-6 inline-flex text-sm font-semibold text-terra-600 hover:text-terra-700">
          Back to users
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Admin user profile</p>
        <h1 className="mt-3 text-3xl font-bold text-stone-900">{user.name || user.fullName || "User"}</h1>
      </div>

      <div className="rounded-[26px] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-stone-400">Email</p>
            <p className="mt-1 font-semibold text-stone-900">{user.email || "Not set"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-stone-400">Phone</p>
            <p className="mt-1 font-semibold text-stone-900">{user.phone || "Not set"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-stone-400">Role</p>
            <p className="mt-1 font-semibold text-stone-900">{user.role || "user"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-stone-400">Verification</p>
            <p className="mt-1 font-semibold text-stone-900">
              {user.verification?.isVerified ? "Verified" : "Unverified"}
            </p>
          </div>
        </div>
      </div>

      <Link href="/admin/users" className="inline-flex text-sm font-semibold text-terra-600 hover:text-terra-700">
        Back to users
      </Link>
    </div>
  );
}
