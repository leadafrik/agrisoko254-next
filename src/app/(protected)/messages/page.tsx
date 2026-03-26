"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

export default function MessagesPage() {
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest(API_ENDPOINTS.messages.threads)
      .then((d) => setThreads(d?.threads ?? d ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen text-stone-400">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold font-display text-stone-900 mb-6">Messages</h1>

      {threads.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <p>No messages yet.</p>
          <Link href="/browse" className="mt-4 inline-block text-terra-600 font-medium hover:underline">Browse listings to start a conversation</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {threads.map((t: any) => (
            <Link key={t._id ?? t.userId} href={`/messages?user=${t.userId ?? t._id}`}
              className="flex items-center gap-4 bg-white rounded-xl border border-stone-100 p-4 hover:border-terra-200 transition-all">
              <div className="w-10 h-10 rounded-full bg-terra-100 text-terra-700 flex items-center justify-center font-bold shrink-0">
                {(t.name ?? t.otherUser?.name ?? "?")?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-stone-800 text-sm">{t.name ?? t.otherUser?.name}</p>
                <p className="text-xs text-stone-400 truncate">{t.lastMessage ?? "No messages yet"}</p>
              </div>
              {t.unreadCount > 0 && (
                <span className="bg-terra-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0">{t.unreadCount}</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
