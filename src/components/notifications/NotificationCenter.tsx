"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, X, Settings } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useAuth } from "@/contexts/AuthContext";

const formatTime = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
};

export default function NotificationCenter() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, preferences } = useNotifications();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  if (!user) return null;

  const resolvePath = (actionUrl?: string) => {
    if (!actionUrl) return "/messages";
    if (actionUrl.startsWith("/")) return actionUrl;
    try { const u = new URL(actionUrl); return `${u.pathname}${u.search}${u.hash}`; } catch { return "/messages"; }
  };

  const handleClick = async (notification: (typeof notifications)[number]) => {
    if (!notification.read) await markAsRead(notification.id);
    setIsOpen(false);
    router.push(resolvePath(notification.actionUrl));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-stone-600 hover:bg-stone-100 transition"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-96 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-stone-200 bg-stone-50 px-4 py-3">
              <h3 className="text-base font-bold text-stone-900">Notifications</h3>
              <div className="flex items-center gap-1">
                {preferences && (
                  <button onClick={() => setShowPreferences(!showPreferences)} className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-200 transition" aria-label="Notification settings">
                    <Settings className="h-4 w-4" />
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-200 transition">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {showPreferences && preferences && (
              <div className="border-b border-stone-200 bg-stone-50 px-4 py-3">
                <h4 className="mb-3 text-sm font-semibold text-stone-900">Notification preferences</h4>
                <div className="space-y-2 text-sm text-stone-600">
                  {[["emailNotifications", "Email notifications"], ["pushNotifications", "Push notifications"], ["monthlyReminders", "Monthly reminders"]].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={!!(preferences as any)[key]} readOnly className="h-4 w-4" />
                      {label}
                    </label>
                  ))}
                  <p className="mt-1 text-xs text-stone-400">Manage fully in profile settings.</p>
                </div>
              </div>
            )}

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-10 text-stone-500">
                  <Bell className="mb-2 h-8 w-8 text-stone-300" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {notifications.slice(0, 10).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleClick(n)}
                      className={`cursor-pointer px-4 py-3 transition hover:bg-stone-50 ${!n.read ? "bg-terra-50" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-stone-900 truncate">{n.title}</p>
                          <p className="mt-0.5 text-xs text-stone-600 line-clamp-2">{n.message}</p>
                          <p className="mt-1 text-xs text-stone-400">{formatTime(n.createdAt)}</p>
                        </div>
                        {!n.read && <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-terra-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 10 && (
              <div className="border-t border-stone-200 p-3 text-center">
                <button onClick={() => { setIsOpen(false); router.push("/profile/notifications"); }} className="text-sm font-semibold text-terra-600 hover:text-terra-700">
                  View all notifications →
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
