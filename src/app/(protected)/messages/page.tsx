"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatLongDate, getInitials } from "@/lib/marketplace";

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const selectedUserId = searchParams.get("user") || searchParams.get("seller") || "";
  const [threads, setThreads] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest(API_ENDPOINTS.messages.threads)
      .then((d) => setThreads(d?.data ?? d?.threads ?? d ?? []))
      .catch((loadError) => setError(loadError?.message || "Unable to load message threads."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      setMessages([]);
      return;
    }

    setConversationLoading(true);
    apiRequest(API_ENDPOINTS.messages.withUser(selectedUserId))
      .then((response) => {
        setMessages(response?.data ?? response ?? []);
        return apiRequest(API_ENDPOINTS.messages.markRead(selectedUserId), { method: "PATCH" }).catch(() => null);
      })
      .catch((loadError) => setError(loadError?.message || "Unable to load the conversation."))
      .finally(() => setConversationLoading(false));
  }, [selectedUserId]);

  const selectedThread = useMemo(
    () =>
      threads.find((thread) => String(thread.userId ?? thread._id) === selectedUserId) ||
      null,
    [selectedUserId, threads]
  );

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedUserId || !draft.trim()) return;
    setError("");

    try {
      await apiRequest(API_ENDPOINTS.messages.send, {
        method: "POST",
        body: JSON.stringify({
          toUserId: selectedUserId,
          body: draft.trim(),
        }),
      });
      setDraft("");
      const response = await apiRequest(API_ENDPOINTS.messages.withUser(selectedUserId));
      setMessages(response?.data ?? response ?? []);
      const threadResponse = await apiRequest(API_ENDPOINTS.messages.threads);
      setThreads(threadResponse?.data ?? threadResponse?.threads ?? threadResponse ?? []);
    } catch (sendError: any) {
      setError(sendError?.message || "Unable to send the message.");
    }
  };

  if (loading) {
    return <div className="page-shell py-10 sm:py-12 text-center text-stone-500">Loading messages...</div>;
  }

  return (
    <div className="page-shell py-10 sm:py-12">
      <div className="mb-6">
        <p className="section-kicker">Messages</p>
        <h1 className="mt-4 text-4xl font-bold text-stone-900">Direct conversations</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600">
          Keep deal discussions, follow-ups, and listing questions in one place.
        </p>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {threads.length === 0 && !selectedUserId ? (
        <div className="surface-card p-10 text-center">
          <h2 className="text-2xl font-bold text-stone-900">No messages yet</h2>
          <p className="mt-3 text-sm text-stone-600">
            Start from a listing to open a direct conversation with a seller.
          </p>
          <Link href="/browse" className="primary-button mt-6">
            Browse listings
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="surface-card overflow-hidden">
            <div className="border-b border-stone-200 px-5 py-4">
              <h2 className="text-xl font-bold text-stone-900">Threads</h2>
            </div>
            <div className="divide-y divide-stone-100">
              {threads.map((thread) => {
                const threadId = String(thread.userId ?? thread._id);
                const active = threadId === selectedUserId;
                const label = thread.name ?? thread.otherUser?.name ?? threadId;

                return (
                  <Link
                    key={threadId}
                    href={`/messages?user=${threadId}`}
                    className={`flex items-center gap-4 px-5 py-4 ${
                      active ? "bg-terra-50" : "bg-white hover:bg-stone-50"
                    }`}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-terra-100 text-sm font-semibold text-terra-700">
                      {getInitials(label)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-stone-900">{label}</p>
                      <p className="truncate text-xs text-stone-500">
                        {thread.body || thread.lastMessage || "No message preview"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="surface-card flex min-h-[520px] flex-col">
            <div className="border-b border-stone-200 px-5 py-4">
              <h2 className="text-xl font-bold text-stone-900">
                {selectedThread?.name ?? selectedThread?.otherUser?.name ?? (selectedUserId ? "Conversation" : "Select a thread")}
              </h2>
            </div>

            <div className="flex-1 space-y-3 px-5 py-5">
              {!selectedUserId ? (
                <div className="flex h-full items-center justify-center text-center text-sm text-stone-500">
                  Select a thread to open the conversation.
                </div>
              ) : conversationLoading ? (
                <div className="flex h-full items-center justify-center text-sm text-stone-500">
                  Loading conversation...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-stone-500">
                  No messages in this conversation yet. Start with a short introduction and what you need.
                </div>
              ) : (
                messages.map((message) => {
                  const mine = String(message.from) !== String(selectedUserId);
                  return (
                    <div
                      key={message._id}
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                        mine
                          ? "ml-auto bg-terra-500 text-white"
                          : "bg-stone-100 text-stone-800"
                      }`}
                    >
                      <p>{message.body}</p>
                      <p className={`mt-2 text-[11px] ${mine ? "text-terra-100" : "text-stone-500"}`}>
                        {formatLongDate(message.createdAt) || "Recently"}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {selectedUserId ? (
              <form onSubmit={handleSend} className="border-t border-stone-200 p-5">
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  className="field-textarea"
                  placeholder="Write your message..."
                />
                <button type="submit" className="primary-button mt-3 w-full">
                  Send message
                </button>
              </form>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
