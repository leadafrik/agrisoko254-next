"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiRequest } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { API_ENDPOINTS, SOCKET_URL } from "@/lib/endpoints";
import { useAuth } from "@/contexts/AuthContext";
import { getInitials } from "@/lib/marketplace";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Thread {
  userId: string;
  name?: string;
  profilePicture?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  listingId?: string;
  listingTitle?: string;
}

interface Message {
  _id: string;
  from: string;
  to: string;
  body: string;
  read: boolean;
  createdAt: string;
  listingId?: string;
  listingTitle?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const toFriendlyError = (err: any, fallback: string) => {
  const raw = String(err?.message || "");
  const status = err?.response?.status || err?.status;
  if (status === 401 || raw.toLowerCase().includes("token")) {
    return "Your session has expired. Sign in again to see your conversations.";
  }
  return raw || fallback;
};

const formatShortTime = (value?: string | null) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0)
    return d.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit", hour12: true });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString("en-KE", { weekday: "short" });
  return d.toLocaleDateString("en-KE", { day: "numeric", month: "short" });
};

const normaliseThreads = (payload: any): Thread[] => {
  const raw =
    (Array.isArray(payload?.data) && payload.data) ||
    (Array.isArray(payload?.threads) && payload.threads) ||
    (Array.isArray(payload) && payload) ||
    [];
  return (raw as any[]).map((t) => ({
    userId: String(t.userId ?? t._id ?? t.otherUserId ?? ""),
    name: t.name ?? t.otherUser?.name ?? t.otherUser?.fullName ?? undefined,
    profilePicture: t.profilePicture ?? t.otherUser?.profilePicture ?? undefined,
    lastMessage: t.body ?? t.lastMessage ?? t.preview ?? undefined,
    lastMessageAt: t.lastMessageAt ?? t.createdAt ?? undefined,
    unreadCount: Number(t.unreadCount ?? 0),
    listingId: t.listingId ?? undefined,
    listingTitle: t.listingTitle ?? undefined,
  })).filter((t) => !!t.userId);
};

const normaliseMessages = (payload: any): Message[] => {
  const raw =
    (Array.isArray(payload?.data) && payload.data) ||
    (Array.isArray(payload?.messages) && payload.messages) ||
    (Array.isArray(payload) && payload) ||
    [];
  return raw.map((m: any) => ({
    _id: m._id ?? m.id ?? String(Math.random()),
    from: String(m.from ?? m.fromUserId ?? ""),
    to: String(m.to ?? m.toUserId ?? ""),
    body: m.body ?? m.text ?? m.message ?? "",
    read: !!m.read,
    createdAt: m.createdAt ?? new Date().toISOString(),
    listingId: m.listingId ?? undefined,
    listingTitle: m.listingTitle ?? undefined,
  }));
};

// ---------------------------------------------------------------------------
// Read-status tick icons
// ---------------------------------------------------------------------------

function Ticks({ mine, read }: { mine: boolean; read: boolean }) {
  if (!mine) return null;
  return (
    <span className={`ml-1 inline-flex items-center gap-0.5 ${read ? "text-sky-300" : "text-terra-200"}`}>
      <svg viewBox="0 0 16 10" className="h-3 w-3 fill-current">
        <path d="M1 5l4 4L15 1" strokeWidth="1.8" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {read && (
        <svg viewBox="0 0 16 10" className="-ml-2 h-3 w-3 fill-current">
          <path d="M1 5l4 4L15 1" strokeWidth="1.8" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Avatar
// ---------------------------------------------------------------------------

function Avatar({ name, src, size = "md" }: { name?: string; src?: string; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "h-8 w-8 text-xs" : "h-11 w-11 text-sm";
  if (src) {
    return <img src={src} alt={name ?? ""} className={`${dim} rounded-full object-cover flex-shrink-0`} />;
  }
  return (
    <div className={`${dim} flex flex-shrink-0 items-center justify-center rounded-full bg-terra-100 font-semibold text-terra-700`}>
      {getInitials(name)}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function MessagesPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const myUserId = String((user as any)?._id || (user as any)?.id || "");

  const selectedUserId =
    searchParams.get("user") ||
    searchParams.get("seller") ||
    searchParams.get("userId") ||
    "";

  // panel state (mobile: show thread list or conversation)
  const [mobileView, setMobileView] = useState<"threads" | "conversation">(
    selectedUserId ? "conversation" : "threads"
  );

  const [threads, setThreads] = useState<Thread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [convLoading, setConvLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const socketRef = useRef<any>(null);
  const threadsPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ------------------------------------------------------------------
  // Scroll to bottom
  // ------------------------------------------------------------------

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // ------------------------------------------------------------------
  // Fetch threads
  // ------------------------------------------------------------------

  const fetchThreads = useCallback(async () => {
    try {
      const res = await apiRequest(API_ENDPOINTS.messages.threads);
      setThreads(normaliseThreads(res));
    } catch {
      // silently ignore background poll errors
    }
  }, []);

  useEffect(() => {
    setError("");
    apiRequest(API_ENDPOINTS.messages.threads)
      .then((res) => setThreads(normaliseThreads(res)))
      .catch((err) => setError(toFriendlyError(err, "Unable to load message threads.")))
      .finally(() => setThreadsLoading(false));
  }, []);

  // Poll threads every 15s
  useEffect(() => {
    threadsPollRef.current = setInterval(fetchThreads, 15000);
    return () => {
      if (threadsPollRef.current) clearInterval(threadsPollRef.current);
    };
  }, [fetchThreads]);

  // ------------------------------------------------------------------
  // Fetch conversation
  // ------------------------------------------------------------------

  const fetchConversation = useCallback(async (userId: string, silent = false) => {
    if (!userId) return;
    if (!silent) setConvLoading(true);
    try {
      const res = await apiRequest(API_ENDPOINTS.messages.withUser(userId));
      setMessages(normaliseMessages(res));
      // Mark read silently
      apiRequest(API_ENDPOINTS.messages.markRead(userId), { method: "PATCH" }).catch(() => null);
      // Refresh thread unread counts
      fetchThreads();
    } catch (err) {
      if (!silent) setError(toFriendlyError(err, "Unable to load the conversation."));
    } finally {
      if (!silent) setConvLoading(false);
    }
  }, [fetchThreads]);

  useEffect(() => {
    if (!selectedUserId) {
      setMessages([]);
      return;
    }
    setMobileView("conversation");
    fetchConversation(selectedUserId);
  }, [selectedUserId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Poll messages every 5s when a conversation is open
  useEffect(() => {
    if (!selectedUserId) return;
    messagesPollRef.current = setInterval(() => fetchConversation(selectedUserId, true), 5000);
    return () => {
      if (messagesPollRef.current) clearInterval(messagesPollRef.current);
    };
  }, [selectedUserId, fetchConversation]);

  // ------------------------------------------------------------------
  // Socket.io
  // ------------------------------------------------------------------

  useEffect(() => {
    if (!myUserId) return;

    let io: any;
    import("socket.io-client").then(({ io: ioLib }) => {
      const token = getToken();
      const socket = ioLib(SOCKET_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnectionAttempts: 5,
      });
      socketRef.current = socket;

      socket.on("connect", () => setSocketConnected(true));
      socket.on("disconnect", () => setSocketConnected(false));

      socket.on("message:new", (incoming: any) => {
        const msg: Message = {
          _id: incoming._id ?? String(Math.random()),
          from: String(incoming.from ?? incoming.fromUserId ?? ""),
          to: String(incoming.to ?? incoming.toUserId ?? ""),
          body: incoming.body ?? incoming.text ?? "",
          read: false,
          createdAt: incoming.createdAt ?? new Date().toISOString(),
          listingId: incoming.listingId,
          listingTitle: incoming.listingTitle,
        };
        const senderId = msg.from !== myUserId ? msg.from : msg.to;

        // If this conversation is open, append + mark read
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === msg._id);
          if (exists) return prev;
          if (senderId === selectedUserId || msg.from === myUserId) {
            apiRequest(API_ENDPOINTS.messages.markRead(senderId), { method: "PATCH" }).catch(() => null);
            return [...prev, msg];
          }
          return prev;
        });

        // Always refresh threads
        fetchThreads();
      });

      io = socket;
    }).catch(() => {
      // socket.io unavailable — fall back to polling only
    });

    return () => {
      io?.disconnect();
    };
  }, [myUserId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ------------------------------------------------------------------
  // Send
  // ------------------------------------------------------------------

  const handleSend = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!selectedUserId || !draft.trim() || sending) return;
    setError("");
    setSending(true);

    const optimisticId = `opt-${Date.now()}`;
    const optimistic: Message = {
      _id: optimisticId,
      from: myUserId,
      to: selectedUserId,
      body: draft.trim(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft("");

    try {
      await apiRequest(API_ENDPOINTS.messages.send, {
        method: "POST",
        body: JSON.stringify({ toUserId: selectedUserId, body: optimistic.body }),
      });
      // Replace optimistic with real data
      fetchConversation(selectedUserId, true);
      fetchThreads();
    } catch (err: any) {
      setMessages((prev) => prev.filter((m) => m._id !== optimisticId));
      setError(toFriendlyError(err, "Unable to send the message."));
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  // ------------------------------------------------------------------
  // Derived
  // ------------------------------------------------------------------

  const selectedThread = useMemo(
    () => threads.find((t) => t.userId === selectedUserId) ?? null,
    [threads, selectedUserId]
  );

  const threadName =
    selectedThread?.name ?? (selectedUserId ? `User ${selectedUserId.slice(-5)}` : "");

  const totalUnread = threads.reduce((acc, t) => acc + (t.unreadCount ?? 0), 0);

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  if (threadsLoading) {
    return (
      <div className="page-shell py-10 sm:py-12 text-center text-stone-500">
        Loading messages...
      </div>
    );
  }

  const hasNoActivity = threads.length === 0 && !selectedUserId;

  return (
    <div className="page-shell py-8 sm:py-12">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="section-kicker">
            Messages{totalUnread > 0 ? ` · ${totalUnread} unread` : ""}
          </p>
          <h1 className="mt-3 text-3xl font-bold text-stone-900">Direct conversations</h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-500">
            Keep deal discussions, follow-ups, and listing questions in one place.
          </p>
        </div>
        {socketConnected && (
          <span className="mt-1 flex items-center gap-1.5 text-xs text-forest-600">
            <span className="h-2 w-2 rounded-full bg-forest-500 animate-pulse" />
            Live
          </span>
        )}
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 flex items-center justify-between gap-3">
          <span>{error}</span>
          {error.toLowerCase().includes("sign in again") && (
            <Link href="/login" className="font-semibold text-red-800 underline underline-offset-2 whitespace-nowrap">
              Go to sign in
            </Link>
          )}
        </div>
      )}

      {hasNoActivity ? (
        <div className="surface-card p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-stone-100">
            <svg className="h-7 w-7 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-stone-900">No messages yet</h2>
          <p className="mt-2 text-sm text-stone-500">
            Open a listing or buyer request and tap &quot;Message seller&quot; to start a conversation.
          </p>
          <Link href="/browse" className="primary-button mt-6 inline-block">
            Browse listings
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile toggle */}
          {selectedUserId && (
            <div className="mb-3 flex lg:hidden">
              <button
                onClick={() => setMobileView(mobileView === "threads" ? "conversation" : "threads")}
                className="flex items-center gap-2 text-sm font-medium text-terra-600"
              >
                {mobileView === "conversation" ? (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                    All threads
                  </>
                ) : (
                  <>
                    Back to conversation
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-[340px_1fr] lg:items-start">
            {/* Thread list */}
            <div
              className={`surface-card overflow-hidden ${
                selectedUserId && mobileView === "conversation" ? "hidden lg:block" : "block"
              }`}
            >
              <div className="border-b border-stone-100 px-5 py-4">
                <h2 className="font-semibold text-stone-800">Conversations</h2>
              </div>
              <div className="divide-y divide-stone-50 max-h-[70vh] overflow-y-auto">
                {threads.length === 0 ? (
                  <p className="px-5 py-8 text-center text-sm text-stone-500">No threads yet.</p>
                ) : (
                  threads.map((thread) => {
                    const active = thread.userId === selectedUserId;
                    return (
                      <Link
                        key={thread.userId}
                        href={`/messages?user=${thread.userId}`}
                        onClick={() => setMobileView("conversation")}
                        className={`flex items-center gap-3 px-4 py-4 transition-colors ${
                          active
                            ? "bg-terra-50 border-l-2 border-terra-500"
                            : "hover:bg-stone-50 border-l-2 border-transparent"
                        }`}
                      >
                        <Avatar name={thread.name} src={thread.profilePicture} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`truncate text-sm ${active || (thread.unreadCount ?? 0) > 0 ? "font-semibold text-stone-900" : "font-medium text-stone-700"}`}>
                              {thread.name ?? `User …${thread.userId.slice(-5)}`}
                            </p>
                            <span className="flex-shrink-0 text-[11px] text-stone-400">
                              {formatShortTime(thread.lastMessageAt)}
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-center justify-between gap-1">
                            <p className={`truncate text-xs ${(thread.unreadCount ?? 0) > 0 ? "font-medium text-stone-700" : "text-stone-400"}`}>
                              {thread.lastMessage || "No messages yet"}
                            </p>
                            {(thread.unreadCount ?? 0) > 0 && (
                              <span className="flex-shrink-0 rounded-full bg-terra-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                {thread.unreadCount}
                              </span>
                            )}
                          </div>
                          {thread.listingTitle && (
                            <p className="mt-0.5 truncate text-[10px] text-stone-400">
                              re: {thread.listingTitle}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>

            {/* Conversation panel */}
            <div
              className={`surface-card flex flex-col ${
                selectedUserId && mobileView === "threads" ? "hidden lg:flex" : "flex"
              }`}
              style={{ minHeight: "520px", maxHeight: "80vh" }}
            >
              {/* Conversation header */}
              <div className="flex items-center gap-3 border-b border-stone-100 px-5 py-4">
                {selectedUserId ? (
                  <>
                    <Avatar name={threadName} src={selectedThread?.profilePicture} size="sm" />
                    <div className="min-w-0">
                      <p className="font-semibold text-stone-900">{threadName}</p>
                      {selectedThread?.listingTitle && (
                        <p className="truncate text-xs text-stone-400">
                          re:{" "}
                          {selectedThread.listingId ? (
                            <Link href={`/browse/${selectedThread.listingId}`} className="hover:text-terra-600">
                              {selectedThread.listingTitle}
                            </Link>
                          ) : (
                            selectedThread.listingTitle
                          )}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-stone-500">Select a conversation</p>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
                {!selectedUserId ? (
                  <div className="flex h-full min-h-[260px] items-center justify-center text-center text-sm text-stone-400">
                    <div>
                      <p className="font-medium">No conversation selected</p>
                      <p className="mt-1">Pick a thread from the left to read messages.</p>
                    </div>
                  </div>
                ) : convLoading ? (
                  <div className="flex h-full min-h-[260px] items-center justify-center text-sm text-stone-400">
                    Loading…
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full min-h-[260px] items-center justify-center text-center text-sm text-stone-400">
                    <div>
                      <p className="font-medium">No messages yet</p>
                      <p className="mt-1">Send a short introduction and what you need.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => {
                      const mine = msg.from === myUserId;
                      const showDateDivider =
                        index === 0 ||
                        new Date(messages[index - 1].createdAt).toDateString() !==
                          new Date(msg.createdAt).toDateString();

                      return (
                        <div key={msg._id}>
                          {showDateDivider && (
                            <div className="my-4 flex items-center gap-3">
                              <hr className="flex-1 border-stone-100" />
                              <span className="text-[11px] text-stone-400">
                                {new Date(msg.createdAt).toLocaleDateString("en-KE", {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>
                              <hr className="flex-1 border-stone-100" />
                            </div>
                          )}
                          <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                                mine
                                  ? "rounded-br-sm bg-terra-500 text-white"
                                  : "rounded-bl-sm bg-stone-100 text-stone-800"
                              }`}
                            >
                              {msg.listingTitle && (
                                <p className={`mb-1.5 text-[11px] font-medium ${mine ? "text-terra-100" : "text-stone-400"}`}>
                                  re: {msg.listingTitle}
                                </p>
                              )}
                              <p className="leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                              <div className={`mt-1.5 flex items-center gap-1 ${mine ? "justify-end" : "justify-start"}`}>
                                <span className={`text-[11px] ${mine ? "text-terra-100" : "text-stone-400"}`}>
                                  {new Date(msg.createdAt).toLocaleTimeString("en-KE", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </span>
                                <Ticks mine={mine} read={msg.read} />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Send bar */}
              {selectedUserId && (
                <form onSubmit={handleSend} className="border-t border-stone-100 p-4">
                  <div className="flex items-end gap-3">
                    <textarea
                      ref={textareaRef}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Write a message… (Enter to send, Shift+Enter for newline)"
                      rows={2}
                      className="field-textarea flex-1 resize-none"
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={!draft.trim() || sending}
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-terra-500 text-white transition-colors hover:bg-terra-600 disabled:opacity-40"
                      aria-label="Send message"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                      </svg>
                    </button>
                  </div>
                  <p className="mt-1.5 text-[11px] text-stone-400">
                    Enter to send · Shift+Enter for newline
                  </p>
                </form>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
