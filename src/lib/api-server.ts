// Server-side fetch helpers — no localStorage, no auth token
// Used in Server Components for SSR/ISR pages

import { API_BASE_URL } from "./endpoints";

export const serverFetch = async <T>(
  path: string,
  options?: { revalidate?: number; tags?: string[] }
): Promise<T | null> => {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  try {
    const res = await fetch(url, {
      next: {
        revalidate: options?.revalidate ?? 60,
        tags: options?.tags,
      },
    });

    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
};
