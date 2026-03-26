"use client";

import { useEffect, useState } from "react";
import { adminApiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

export default function AdminIDVerificationPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    adminApiRequest(API_ENDPOINTS.admin.verification.pending)
      .then((d) => setUsers(d?.users ?? d ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const review = async (id: string, status: "approved" | "rejected") => {
    await adminApiRequest(API_ENDPOINTS.admin.verification.review(id), { method: "PUT", body: JSON.stringify({ status }) });
    fetch();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 mb-6">ID Verification</h1>
      {loading ? <p className="text-stone-400">Loading...</p> : users.length === 0 ? (
        <p className="text-stone-400">No pending verifications.</p>
      ) : (
        <div className="space-y-4">
          {users.map((u: any) => (
            <div key={u._id} className="bg-white rounded-xl border border-stone-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold text-stone-800">{u.name}</p>
                  <p className="text-xs text-stone-500">{u.phone ?? u.email}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => review(u._id, "approved")}
                    className="bg-forest-500 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-forest-600">Approve</button>
                  <button onClick={() => review(u._id, "rejected")}
                    className="bg-red-50 text-red-600 border border-red-200 px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-100">Reject</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {["idFront", "idBack", "selfie"].map((doc) => u.verification?.[doc] && (
                  <a key={doc} href={u.verification[doc]} target="_blank" rel="noopener noreferrer"
                    className="block w-28 h-20 rounded-lg overflow-hidden border border-stone-200 hover:border-terra-300 transition-colors">
                    <img src={u.verification[doc]} alt={doc} className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
