import { adminFetch } from "@/lib/adminFetch";
import type {
  AdminForm,
  AdminFormListItem,
  Answers,
  FormLocaleCode,
  FormLocaleDef,
  PublicForm,
  SubmissionsPage,
  SubmissionStatus,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// ---------------------------------------------------------------------------
// Public (site) — reading never throws: a missing form simply renders nothing.
// ---------------------------------------------------------------------------

export async function fetchPublicForm(id: string, locale: string): Promise<PublicForm | null> {
  if (!id) return null;
  try {
    const res = await fetch(`${API_URL}/api/forms/public/${encodeURIComponent(id)}?locale=${locale}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.warn(`API fetch failed for form "${id}" (locale: ${locale})`, error);
    return null;
  }
}

export async function submitForm(
  id: string,
  payload: { locale: string; sourcePage: string; answers: Answers; website: string },
): Promise<void> {
  const res = await fetch(`${API_URL}/api/forms/${encodeURIComponent(id)}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(typeof data.error === "string" ? data.error : "Failed to submit form");
  }
}

// ---------------------------------------------------------------------------
// Admin — throw with the server's message
// ---------------------------------------------------------------------------

async function adminJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await adminFetch(`${API_URL}${path}`, init);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(typeof data.error === "string" ? data.error : "Sorğu uğursuz oldu");
  }
  return await res.json();
}

export const listForms = () => adminJson<AdminFormListItem[]>("/api/forms", { cache: "no-store" });
export const getForm = (id: string) => adminJson<AdminForm>(`/api/forms/${id}`, { cache: "no-store" });
export const createForm = (name: string) => adminJson<AdminForm>("/api/forms", { method: "POST", body: JSON.stringify({ name }) });

export interface SaveFormPayload {
  name: string;
  isActive: boolean;
  locales: Partial<Record<FormLocaleCode, FormLocaleDef>>;
}
export const saveForm = (id: string, data: SaveFormPayload) =>
  adminJson<AdminForm>(`/api/forms/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const duplicateForm = (id: string) => adminJson<AdminForm>(`/api/forms/${id}/duplicate`, { method: "POST" });
export const deleteForm = (id: string) => adminJson<{ success: boolean }>(`/api/forms/${id}`, { method: "DELETE" });

export function listSubmissions(id: string, status: SubmissionStatus | "all", page: number) {
  const query = `page=${page}${status === "all" ? "" : `&status=${status}`}`;
  return adminJson<SubmissionsPage>(`/api/forms/${id}/submissions?${query}`, { cache: "no-store" });
}

export const setSubmissionStatus = (sid: string, status: SubmissionStatus) =>
  adminJson<{ success: boolean }>(`/api/forms/submissions/${sid}/status`, { method: "PUT", body: JSON.stringify({ status }) });

export const deleteSubmission = (sid: string) =>
  adminJson<{ success: boolean }>(`/api/forms/submissions/${sid}`, { method: "DELETE" });

export async function fetchFormsUnreadCount(): Promise<number> {
  try {
    const data = await adminJson<{ unreadCount: number }>("/api/forms/unread-count", { cache: "no-store" });
    return data.unreadCount || 0;
  } catch {
    return 0;
  }
}
