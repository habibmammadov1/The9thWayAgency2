import { adminFetch } from "@/lib/adminFetch";
import type { AdminPage, AdminPageListItem, NavPageLink, PageBlock, PageLocale, PageTranslation, PublicPage } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// ---------------------------------------------------------------------------
// Public (site) — never throw; the site must keep working if the API is down
// or the page tables do not exist yet.
// ---------------------------------------------------------------------------

export async function fetchPublicPage(locale: string, slug: string): Promise<PublicPage | null> {
  try {
    const res = await fetch(`${API_URL}/api/pages/by-slug/${encodeURIComponent(slug)}?locale=${locale}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.warn(`API fetch failed for page "${slug}" (locale: ${locale})`, error);
    return null;
  }
}

export async function fetchNavPages(locale: string): Promise<NavPageLink[]> {
  try {
    const res = await fetch(`${API_URL}/api/pages/nav?locale=${locale}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Admin — throw with the server's error message
// ---------------------------------------------------------------------------

async function adminJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await adminFetch(`${API_URL}${path}`, init);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(typeof data.error === "string" ? data.error : "Sorğu uğursuz oldu");
  }
  return await res.json();
}

export function listPages() {
  return adminJson<AdminPageListItem[]>("/api/pages", { cache: "no-store" });
}

export function getPage(id: string) {
  return adminJson<AdminPage>(`/api/pages/${id}`, { cache: "no-store" });
}

export function createPage(data: { title: string; slug: string; locale: PageLocale; blocks: PageBlock[] }) {
  return adminJson<AdminPage>("/api/pages", { method: "POST", body: JSON.stringify(data) });
}

export interface SavePagePayload {
  slug: string;
  showInNav: boolean;
  navOrder: number;
  translations: PageTranslation[];
  blocks: Record<PageLocale, PageBlock[]>;
}

export function savePage(id: string, data: SavePagePayload) {
  return adminJson<AdminPage>(`/api/pages/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function publishPage(id: string) {
  return adminJson<AdminPage>(`/api/pages/${id}/publish`, { method: "POST" });
}

export function unpublishPage(id: string) {
  return adminJson<AdminPage>(`/api/pages/${id}/unpublish`, { method: "POST" });
}

export function duplicatePage(id: string) {
  return adminJson<AdminPage>(`/api/pages/${id}/duplicate`, { method: "POST" });
}

export function deletePage(id: string) {
  return adminJson<{ success: boolean }>(`/api/pages/${id}`, { method: "DELETE" });
}
