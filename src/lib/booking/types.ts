// Booking — shared types. Server side: server/src/lib/bookingSlots.ts and server/src/routes/booking.ts.

export const BOOKING_LOCALES = ["az", "ru", "en"] as const;
export type BookingLocale = (typeof BOOKING_LOCALES)[number];

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------

export interface PublicBookingType {
  id: string;
  durationMinutes: number;
  title: string;
  description: string;
}

export interface SlotsResponse {
  /** Business time zone (IANA). */
  timezone: string;
  durationMinutes: number;
  /** Start instants, UTC ISO strings. */
  slots: string[];
}

export interface BookingConfirmation {
  id: string;
  startsAt: string;
  endsAt: string;
  title: string;
  locationNote: string;
  successText: string;
}

export interface BookPayload {
  typeId: string;
  startsAt: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  locale: string;
  timezone: string;
  website: string;
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export interface TimeRange {
  start: string;
  end: string;
}

/** Keys: "0" = Sunday ... "6" = Saturday. */
export type WeeklyHours = Record<"0" | "1" | "2" | "3" | "4" | "5" | "6", TimeRange[]>;

export interface BookingSettings {
  timezone: string;
  weeklyHours: WeeklyHours;
  slotStepMinutes: number;
  bufferMinutes: number;
  minNoticeHours: number;
  maxDaysAhead: number;
}

export interface BookingTypeLocale {
  title: string;
  description: string;
  locationNote: string;
  successText: string;
}

export interface AdminBookingType {
  id: string;
  name: string;
  durationMinutes: number;
  isActive: boolean;
  order: number;
  bookingCount: number;
  locales: Partial<Record<BookingLocale, BookingTypeLocale>>;
}

export interface TimeOffItem {
  id: string;
  startsAt: string;
  endsAt: string;
  reason: string;
}

export type BookingStatus = "confirmed" | "cancelled";
export type BookingScope = "upcoming" | "past" | "cancelled";

export interface AdminBooking {
  id: string;
  type: { id: string; name: string };
  startsAt: string;
  endsAt: string;
  status: BookingStatus;
  isSeen: boolean;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  locale: string;
  visitorTimezone: string;
  adminNote: string | null;
  createdAt: string;
}

export interface BookingsPage {
  timezone: string;
  bookings: AdminBooking[];
  pagination: { page: number; pageSize: number; totalItems: number; totalPages: number };
  unreadCount: number;
}
