"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { apiRequest } from "@/lib/api";
import { API_BASE_URL } from "@/lib/endpoints";

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  monthlyReminders: boolean;
}

interface NotificationsContextType {
  notifications: AppNotification[];
  unreadCount: number;
  preferences: NotificationPreferences | null;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

const POLL_INTERVAL_MS = 30000;

const toDate = (v: unknown): Date => {
  const d = v instanceof Date ? v : new Date(typeof v === "string" || typeof v === "number" ? v : Date.now());
  return isNaN(d.getTime()) ? new Date() : d;
};

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const userId = (user as any)?._id || (user as any)?.id || "";
  const mountedRef = useRef(true);

  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await apiRequest(`${API_BASE_URL}/notifications?limit=20&userId=${userId}`);
      if (!mountedRef.current) return;
      const items: AppNotification[] = (res?.data?.notifications || res?.data || []).map((n: any) => ({
        id: n._id || n.id,
        type: n.type || "info",
        title: n.title || "",
        message: n.message || "",
        read: !!n.read,
        actionUrl: n.actionUrl,
        createdAt: toDate(n.createdAt),
      })).filter((n: AppNotification) => !!n.id);
      setNotifications(items);
    } catch {
      // non-critical
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [userId]);

  const fetchPreferences = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await apiRequest(`${API_BASE_URL}/notifications/preferences/${userId}`);
      if (mountedRef.current) setPreferences(res?.data || null);
    } catch { /* non-critical */ }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setPreferences(null);
      return;
    }
    fetchNotifications();
    fetchPreferences();
    const interval = window.setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [userId, fetchNotifications, fetchPreferences]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    try {
      await apiRequest(`${API_BASE_URL}/notifications/${id}/read`, { method: "PATCH" });
    } catch { /* non-critical */ }
  }, []);

  const updatePreferences = useCallback(async (prefs: Partial<NotificationPreferences>) => {
    if (!userId) return;
    const updated = await apiRequest(`${API_BASE_URL}/notifications/preferences/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(prefs),
    });
    if (mountedRef.current) setPreferences((prev) => ({ ...prev, ...updated?.data }));
  }, [userId]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, preferences, loading, fetchNotifications, markAsRead, updatePreferences }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
};
