"use client";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/endpoints";
import { adminApiRequest } from "@/lib/api";

export const usePageContent = (pageKey: string) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pageKey) return;
    let active = true;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/content/public/${pageKey}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to fetch content"))))
      .then((data) => { if (active) setContent(data?.data?.content || data?.data?.defaultContent || ""); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [pageKey]);

  return { content, loading, error };
};

export const usePageContents = (pageName: string) => {
  const [contents, setContents] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pageName) return;
    let active = true;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/content/page/${pageName}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to fetch page content"))))
      .then((data) => { if (active) setContents(data?.data || {}); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [pageName]);

  return { contents, loading, error };
};

export const updatePageContent = async (key: string, content: string) =>
  adminApiRequest(`${API_BASE_URL}/admin/content/${key}`, { method: "PUT", body: JSON.stringify({ content }) });

export const fetchAllContent = async () =>
  adminApiRequest(`${API_BASE_URL}/admin/content`);
