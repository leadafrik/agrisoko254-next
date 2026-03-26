"use client";

import { useEffect, useState } from "react";
import { adminApiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = (q = "") => {
    const url = q ? `${API_ENDPOINTS.admin.users.search}?q=${q}` : API_ENDPOINTS.admin.users.getAll;
    adminApiRequest(url).then((d) => setUsers(d?.users ?? d ?? [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Users</h1>
      <input type="text" placeholder="Search by name, phone or email…" value={search}
        onChange={(e) => { setSearch(e.target.value); fetchUsers(e.target.value); }}
        className="w-full max-w-sm border border-stone-200 rounded-lg px-4 py-2.5 text-sm mb-6 focus:outline-none focus:border-terra-400" />

      {loading ? <p className="text-stone-400">Loading...</p> : (
        <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>{["Name", "Phone/Email", "Role", "Verified", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {users.map((u: any) => (
                <tr key={u._id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 font-medium text-stone-800">{u.name}</td>
                  <td className="px-4 py-3 text-stone-500">{u.phone ?? u.email}</td>
                  <td className="px-4 py-3"><span className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded text-xs">{u.role}</span></td>
                  <td className="px-4 py-3">
                    {u.verification?.isVerified
                      ? <span className="text-forest-600 text-xs font-semibold">✓ Verified</span>
                      : <span className="text-stone-400 text-xs">Unverified</span>}
                  </td>
                  <td className="px-4 py-3">
                    <a href={`/admin/users/${u._id}`} className="text-terra-600 text-xs hover:underline">View</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="text-center text-stone-400 py-10">No users found.</p>}
        </div>
      )}
    </div>
  );
}
