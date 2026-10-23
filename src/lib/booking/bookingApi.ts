import { adminFetch } from "@/lib/adminFetch";
import type {
  AdminBooking,
  AdminBookingType,
  BookPayload,
  BookingConfirmation,
  BookingScope,
  BookingSettings,
  BookingsPage,
  BookingTypeLocale,
  BookingLocale,
  PublicBookingType,
  SlotsResponse,
  TimeOffItem,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// ---------------------------------------------------------------------------
// Public (site)
// ---------------------------------------------------------------------------

/** Never throws: if the API is down or the tables do not exist, the block simply shows nothing. */
export async function fetchBookingTypes(locale: string): Promise<PublicBookingType[]> {
  try {
    const res = await fetch(`${API_URL}/api/booking/public/types?locale=${locale}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn(`API fetch failed for booking types (locale: ${locale})`, error);
    return [];
  }
}

export class BookingError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function fetchSlots(typeId: string, from: Date, to: Date): Promise<SlotsResponse> {
  const query = `typeId=${encodeURIComponent(typeId)}&from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`;
  const res = await fetch(`${API_URL}/api/booking/public/slots?${query}`, { cache: "no-store" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new BookingError(typeof data.error === "string" ? data.error : "Failed to load times", res.status);
  }
  return await res.json();
}

export async function createBooking(payload: BookPayload): Promise<BookingConfirmation> {
  const res = await fetch(`${API_URL}/api/booking/public/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new BookingError(typeof data.error === "string" ? data.error : "Failed to book", res.status);
  return data.booking as BookingConfirmation;
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

async function adminJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await adminFetch(`${API_URL}${path}`, init);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(typeof data.error === "string" ? data.error : "Sorğu uğursuz oldu");
  }
  return await res.json();
}

const json = (method: string, body?: unknown): RequestInit => ({ method, body: body === undefined ? undefined : JSON.stringify(body) });

export const getSettings = () => adminJson<BookingSettings>("/api/booking/settings", { cache: "no-store" });
export const saveSettings = (data: BookingSettings) => adminJson<BookingSettings>("/api/booking/settings", json("PUT", data));

export interface SaveTypePayload {
  name: string;
  durationMinutes: number;
  isActive: boolean;
  locales: Partial<Record<BookingLocale, BookingTypeLocale>>;
}
export const listTypes = () => adminJson<AdminBookingType[]>("/api/booking/types", { cache: "no-store" });
export const createType = (data: SaveTypePayload) => adminJson<AdminBookingType>("/api/booking/types", json("POST", data));
export const saveType = (id: string, data: SaveTypePayload) => adminJson<AdminBookingType>(`/api/booking/types/${id}`, json("PUT", data));
export const deleteType = (id: string) => adminJson<{ success: boolean }>(`/api/booking/types/${id}`, json("DELETE"));
export const reorderTypes = (ids: string[]) => adminJson<{ success: boolean }>("/api/booking/types/reorder", json("PUT", { ids }));

export const listTimeOff = () => adminJson<TimeOffItem[]>("/api/booking/time-off", { cache: "no-store" });
export const createTimeOff = (data: { startsLocal: string; endsLocal: string; reason: string }) =>
  adminJson<TimeOffItem>("/api/booking/time-off", json("POST", data));
export const deleteTimeOff = (id: string) => adminJson<{ success: boolean }>(`/api/booking/time-off/${id}`, json("DELETE"));

export const listBookings = (scope: BookingScope, page: number) =>
  adminJson<BookingsPage>(`/api/booking/bookings?scope=${scope}&page=${page}`, { cache: "no-store" });
export const updateBooking = (id: string, data: { status?: "confirmed" | "cancelled"; isSeen?: boolean; adminNote?: string | null }) =>
  adminJson<AdminBooking>(`/api/booking/bookings/${id}`, json("PUT", data));
export const deleteBooking = (id: string) => adminJson<{ success: boolean }>(`/api/booking/bookings/${id}`, json("DELETE"));

export async function fetchBookingUnreadCount(): Promise<number> {
  try {
    const data = await adminJson<{ unreadCount: number }>("/api/booking/unread-count", { cache: "no-store" });
    return data.unreadCount || 0;
  } catch {
    return 0;
  }
}
