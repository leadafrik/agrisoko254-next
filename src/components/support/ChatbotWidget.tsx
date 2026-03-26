"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { API_ENDPOINTS } from "@/lib/endpoints";

type ChatMessage = {
  id: string;
  sender: "user" | "bot";
  message: string;
  suggestions?: string[];
};

type ChatSession = {
  chatId: string;
  sessionId: string;
};

const STARTER_SUGGESTIONS = ["Browse listings", "How to list", "ID verification"];

export default function ChatbotWidget() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!isOpen || chatSession) return;

    let cancelled = false;

    const startChat = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(API_ENDPOINTS.chat.start, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.success) {
          throw new Error(data?.message || "Unable to start chat.");
        }

        if (!cancelled) {
          setChatSession(data.data);
          setMessages([
            {
              id: "welcome",
              sender: "bot",
              message: data.data.welcome,
              suggestions: STARTER_SUGGESTIONS,
            },
          ]);
        }
      } catch (chatError: any) {
        if (!cancelled) {
          setError(chatError?.message || "Unable to start chat.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void startChat();

    return () => {
      cancelled = true;
    };
  }, [chatSession, isOpen]);

  if (!isMounted) return null;
  if (pathname.startsWith("/admin")) return null;

  const sendMessage = async (messageText = inputValue) => {
    const message = messageText.trim();
    if (!message || !chatSession || loading) return;

    setMessages((current) => [
      ...current,
      {
        id: `${Date.now()}-user`,
        sender: "user",
        message,
      },
    ]);
    setInputValue("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_ENDPOINTS.chat.message(chatSession.chatId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to send message.");
      }

      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-bot`,
          sender: "bot",
          message: data.data.message,
          suggestions: data.data.suggestions,
        },
      ]);
    } catch (messageError: any) {
      setError(messageError?.message || "Unable to send message.");
    } finally {
      setLoading(false);
    }
  };

  const escalate = async () => {
    if (!chatSession || loading) return;

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.chat.escalate(chatSession.chatId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "User requested human support" }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to escalate chat.");
      }

      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-escalate`,
          sender: "bot",
          message:
            "Our support team is available on WhatsApp. Use the link below and include the context from this chat so they can help faster.\n\nhttps://chat.whatsapp.com/HzCaV5YVz86CjwajiOHR5i",
        },
      ]);
    } catch (escalateError: any) {
      setError(escalateError?.message || "Unable to escalate chat.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-terra-500 text-white shadow-[0_18px_40px_-18px_rgba(120,83,47,0.7)] transition hover:bg-terra-600"
          aria-label="Open support chat"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      ) : null}

      {isOpen ? (
        <div className="fixed bottom-6 right-6 z-40 flex h-[min(38rem,calc(100vh-3rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-[0_30px_80px_-34px_rgba(28,25,23,0.4)]">
          <div className="flex items-center justify-between bg-terra-500 px-5 py-4 text-white">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/75">Support</p>
              <h2 className="mt-1 text-lg font-semibold">Soko Assistant</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10"
              aria-label="Close support chat"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-[#f8f3eb] px-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[84%] rounded-3xl px-4 py-3 text-sm leading-relaxed ${
                    message.sender === "user"
                      ? "rounded-br-lg bg-terra-500 text-white"
                      : "rounded-bl-lg border border-stone-200 bg-white text-stone-700"
                  }`}
                >
                  <p className="whitespace-pre-line break-words">{message.message}</p>
                  {message.suggestions?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => void sendMessage(suggestion)}
                          className="rounded-full border border-terra-200 bg-terra-50 px-3 py-1 text-xs font-semibold text-terra-700"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}

            {loading ? (
              <div className="max-w-[84%] rounded-3xl rounded-bl-lg border border-stone-200 bg-white px-4 py-3 text-sm text-stone-500">
                Thinking...
              </div>
            ) : null}

            <div ref={endRef} />
          </div>

          {error ? (
            <div className="border-t border-red-200 bg-red-50 px-4 py-2 text-xs font-medium text-red-700">
              {error}
            </div>
          ) : null}

          <div className="border-t border-stone-200 bg-white p-4">
            <div className="flex items-end gap-3">
              <textarea
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                rows={1}
                maxLength={600}
                placeholder="Ask about listings, verification, checkout, or support..."
                className="min-h-[52px] flex-1 rounded-2xl border border-stone-200 px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-terra-300 focus:ring-2 focus:ring-terra-100"
              />
              <button
                type="button"
                onClick={() => void sendMessage()}
                disabled={!inputValue.trim() || loading}
                className="inline-flex h-[52px] items-center justify-center rounded-2xl bg-terra-500 px-4 text-sm font-semibold text-white transition hover:bg-terra-600 disabled:opacity-50"
              >
                Send
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-stone-500">Need a person instead? We can move you to WhatsApp support.</p>
              <button
                type="button"
                onClick={() => void escalate()}
                className="text-xs font-semibold text-terra-600 hover:text-terra-700"
              >
                Talk to support
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
