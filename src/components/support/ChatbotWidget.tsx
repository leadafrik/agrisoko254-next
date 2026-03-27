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

const MARKETPLACE_SUGGESTIONS = ["Browse listings", "How to list", "Contact support"];
const LEARN_SUGGESTIONS = ["How to sell maize?", "Who started Agrisoko?", "Contact support"];
const SUPPORT_EMAIL = "info@leadafrik.com";
const SUPPORT_WHATSAPP_URL = "https://chat.whatsapp.com/HzCaV5YVz86CjwajiOHR5i";
const HIDDEN_PREFIXES = ["/admin", "/login", "/forgot-password", "/welcome/setup-password", "/messages"];

export default function ChatbotWidget() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  // Drag state
  const [pos, setPos] = useState({ x: 0, y: 0 }); // offset from default bottom-right
  const dragState = useRef<{ dragging: boolean; startX: number; startY: number; originX: number; originY: number }>({
    dragging: false, startX: 0, startY: 0, originX: 0, originY: 0,
  });
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsMounted(true);

    const syncViewport = () => setIsMobile(window.innerWidth < 1024);
    syncViewport();
    window.addEventListener("resize", syncViewport);

    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setPos({ x: 0, y: 0 });
    }
  }, [isMobile]);

  useEffect(() => {
    const container = messagesRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: messages.length > 1 ? "smooth" : "auto",
    });
  }, [messages, loading]);

  useEffect(() => {
    if (!isMounted || !isMobile) return;

    const previousOverflow = document.body.style.overflow;
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMounted, isMobile, isOpen]);

  const starterSuggestions = pathname.startsWith("/learn")
    ? LEARN_SUGGESTIONS
    : MARKETPLACE_SUGGESTIONS;

  useEffect(() => {
    if (!isOpen || chatSession) return;
    let cancelled = false;
    const startChat = async () => {
      setLoading(true); setError("");
      try {
        const response = await fetch(API_ENDPOINTS.chat.start, { method: "POST", headers: { "Content-Type": "application/json" } });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.success) throw new Error(data?.message || "Unable to start chat.");
        if (!cancelled) {
          setChatSession(data.data);
          setMessages([{ id: "welcome", sender: "bot", message: data.data.welcome, suggestions: starterSuggestions }]);
        }
      } catch (chatError: any) {
        if (!cancelled) setError(chatError?.message || "Unable to start chat.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void startChat();
    return () => { cancelled = true; };
  }, [chatSession, isOpen, starterSuggestions]);

  // Drag handlers
  const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isMobile) return;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    dragState.current = { dragging: true, startX: clientX, startY: clientY, originX: pos.x, originY: pos.y };

    const onMove = (ev: MouseEvent | TouchEvent) => {
      if (!dragState.current.dragging) return;
      const mx = "touches" in ev ? ev.touches[0].clientX : ev.clientX;
      const my = "touches" in ev ? ev.touches[0].clientY : ev.clientY;
      const rawX = dragState.current.originX + (mx - dragState.current.startX);
      const rawY = dragState.current.originY + (my - dragState.current.startY);
      // Clamp so the button (56px) stays fully on screen with 16px margin
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const btnSize = 56;
      const margin = 16;
      const defaultBottom = 24; // 1.5rem
      const defaultRight = 24; // 1.5rem
      const clampedX = Math.max(defaultRight - (vw - btnSize - margin), Math.min(defaultRight - margin, rawX));
      const clampedY = Math.max(defaultBottom - (vh - btnSize - margin), Math.min(defaultBottom - margin, rawY));
      setPos({ x: clampedX, y: clampedY });
    };
    const onUp = () => { dragState.current.dragging = false; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); window.removeEventListener("touchmove", onMove as any); window.removeEventListener("touchend", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove as any, { passive: false });
    window.addEventListener("touchend", onUp);
  };

  if (!isMounted) return null;
  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null;

  const sendMessage = async (messageText = inputValue) => {
    const message = messageText.trim();
    if (!message || !chatSession || loading) return;
    setMessages((current) => [...current, { id: `${Date.now()}-user`, sender: "user", message }]);
    setInputValue(""); setLoading(true); setError("");
    try {
      const response = await fetch(API_ENDPOINTS.chat.message(chatSession.chatId), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) throw new Error(data?.message || "Unable to send message.");
      setMessages((current) => [...current, { id: `${Date.now()}-bot`, sender: "bot", message: data.data.message, suggestions: data.data.suggestions }]);
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
      const response = await fetch(API_ENDPOINTS.chat.escalate(chatSession.chatId), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason: "User requested human support" }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) throw new Error(data?.message || "Unable to escalate chat.");
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-escalate`,
          sender: "bot",
          message: `You can reach our support team by email or WhatsApp.\n\nEmail: ${SUPPORT_EMAIL}\nWhatsApp: ${SUPPORT_WHATSAPP_URL}\n\nInclude the context from this chat so they can help faster.`,
        },
      ]);
    } catch (escalateError: any) {
      setError(escalateError?.message || "Unable to escalate chat.");
    } finally {
      setLoading(false);
    }
  };

  const btnStyle: React.CSSProperties = {
    position: "fixed",
    bottom: isMobile
      ? "calc(env(safe-area-inset-bottom) + 5rem)"
      : `calc(1.5rem - ${pos.y}px)`,
    right: isMobile ? "1rem" : `calc(1.5rem - ${pos.x}px)`,
    zIndex: 45,
    cursor: isMobile ? "pointer" : dragState.current.dragging ? "grabbing" : "grab",
  };

  const panelStyle: React.CSSProperties = {
    position: "fixed",
    left: isMobile ? "0.75rem" : undefined,
    right: isMobile ? "0.75rem" : `calc(1.5rem - ${pos.x}px)`,
    bottom: isMobile
      ? "calc(env(safe-area-inset-bottom) + 4.8rem)"
      : `calc(5.5rem - ${pos.y}px)`,
    zIndex: 46,
  };

  return (
    <>
      {!isOpen && (
        <button
          ref={btnRef}
          type="button"
          style={btnStyle}
          onMouseDown={isMobile ? undefined : onDragStart}
          onTouchStart={isMobile ? undefined : onDragStart}
          onClick={() => {
            if (!dragState.current.dragging) {
              setIsOpen(true);
            }
          }}
          className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-terra-500 text-white shadow-[0_18px_40px_-18px_rgba(120,83,47,0.7)] transition hover:bg-terra-600 select-none"
          aria-label="Open support chat"
        >
          <svg className="h-6 w-6 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {isOpen && (
        <>
        {isMobile ? (
          <button
            type="button"
            aria-label="Close support chat"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[44] bg-stone-950/28 lg:hidden"
          />
        ) : null}
        <div
          style={panelStyle}
          className={`flex flex-col overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-[0_30px_80px_-34px_rgba(28,25,23,0.4)] ${
            isMobile
              ? "h-[min(34rem,calc(100dvh-7.75rem-env(safe-area-inset-bottom)))] overscroll-contain"
              : "h-[min(38rem,calc(100vh-9rem))] w-[min(24rem,calc(100vw-2rem))]"
          }`}
        >
          {/* Header — drag handle */}
          <div
            className={`flex items-center justify-between bg-terra-500 px-5 py-4 text-white select-none ${
              isMobile ? "" : "cursor-grab active:cursor-grabbing"
            }`}
            onMouseDown={isMobile ? undefined : onDragStart}
            onTouchStart={isMobile ? undefined : onDragStart}
          >
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/75">Support</p>
              <h2 className="mt-1 text-lg font-semibold">Soko Assistant</h2>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10" aria-label="Close support chat">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <div ref={messagesRef} className="flex-1 space-y-3 overflow-y-auto overscroll-contain bg-[#f8f3eb] px-4 py-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[84%] rounded-3xl px-4 py-3 text-sm leading-relaxed ${message.sender === "user" ? "rounded-br-lg bg-terra-500 text-white" : "rounded-bl-lg border border-stone-200 bg-white text-stone-700"}`}>
                  <p className="whitespace-pre-line break-words">{message.message}</p>
                  {message.suggestions?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion) => (
                        <button key={suggestion} type="button" onClick={() => void sendMessage(suggestion)} className="rounded-full border border-terra-200 bg-terra-50 px-3 py-1 text-xs font-semibold text-terra-700">
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            {loading && <div className="max-w-[84%] rounded-3xl rounded-bl-lg border border-stone-200 bg-white px-4 py-3 text-sm text-stone-500">Thinking...</div>}
          </div>

          {error && <div className="border-t border-red-200 bg-red-50 px-4 py-2 text-xs font-medium text-red-700">{error}</div>}

          <div className="border-t border-stone-200 bg-white p-4">
            <div className="flex items-end gap-3">
              <textarea
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }}
                rows={1}
                maxLength={600}
                placeholder="Ask about listings, verification, checkout, or support..."
                className="min-h-[52px] flex-1 rounded-2xl border border-stone-200 px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-terra-300 focus:ring-2 focus:ring-terra-100"
              />
              <button type="button" onClick={() => void sendMessage()} disabled={!inputValue.trim() || loading} className="inline-flex h-[52px] items-center justify-center rounded-2xl bg-terra-500 px-4 text-sm font-semibold text-white transition hover:bg-terra-600 disabled:opacity-50">
                Send
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-stone-500">Need a person? Email {SUPPORT_EMAIL} or continue on WhatsApp.</p>
              <button type="button" onClick={() => void escalate()} className="text-xs font-semibold text-terra-600 hover:text-terra-700">Contact support</button>
            </div>
          </div>
        </div>
        </>
      )}
    </>
  );
}
