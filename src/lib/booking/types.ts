// Booking — shared types. Server side: server/src/lib/bookingSlots.ts and server/src/routes/booking.ts.

import type { AnswerValue, FormFieldDef, FormFieldType } from "@/lib/forms/types";

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
  /** Own form fields built in the admin (this language, or the fallback language). null = classic form (phone + note). */
  fields: FormFieldDef[] | null;
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
  /** Answers to the type's own fields, by field id */
  answers?: Record<string, AnswerValue>;
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
  /** null = classic fixed form; an array = own fields (empty = no extra fields) */
  fields: FormFieldDef[] | null;
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
  /** Answers to the type's own form fields (label and type were copied at booking time) */
  answers: BookingAnswer[] | null;
  createdAt: string;
}

export interface BookingAnswer {
  fieldId: string;
  label: string;
  type: FormFieldType;
  value: AnswerValue;
}

export interface BookingsPage {
  timezone: string;
  bookings: AdminBooking[];
  pagination: { page: number; pageSize: number; totalItems: number; totalPages: number };
  unreadCount: number;
}
