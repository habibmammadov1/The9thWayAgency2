import { DateTime, IANAZone } from 'luxon';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Booking — availability rules and slot calculation.
//
// Everything here is a pure function (no database, no clock): the routes load
// settings/bookings/time-off and pass them in, which keeps the date logic easy
// to test. Time zone and DST arithmetic is done with luxon in the business
// time zone; results are UTC instants (ISO strings).
// ---------------------------------------------------------------------------

export const BOOKING_LOCALES = ['az', 'ru', 'en'] as const;

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const toMinutes = (v: string) => parseInt(v.slice(0, 2), 10) * 60 + parseInt(v.slice(3, 5), 10);

export const timeRangeSchema = z
  .object({
    start: z.string().regex(HHMM, 'Saat HH:MM formatında olmalıdır'),
    end: z.string().regex(HHMM, 'Saat HH:MM formatında olmalıdır'),
  })
  .refine((r) => toMinutes(r.start) < toMinutes(r.end), 'Başlanğıc vaxtı son vaxtdan əvvəl olmalıdır');

export type TimeRange = z.infer<typeof timeRangeSchema>;

const dayRangesSchema = z
  .array(timeRangeSchema)
  .max(4, 'Bir gündə ən çox 4 saat aralığı ola bilər')
  .default([])
  .superRefine((ranges, ctx) => {
    const sorted = [...ranges].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
    for (let i = 1; i < sorted.length; i++) {
      if (toMinutes(sorted[i].start) < toMinutes(sorted[i - 1].end)) {
        ctx.addIssue({ code: 'custom', message: 'Eyni gündəki saat aralıqları üst-üstə düşməməlidir' });
        return;
      }
    }
  });

/** Keys are weekday numbers as strings: "0" = Sunday ... "6" = Saturday. */
export const weeklyHoursSchema = z.object({
  '0': dayRangesSchema,
  '1': dayRangesSchema,
  '2': dayRangesSchema,
  '3': dayRangesSchema,
  '4': dayRangesSchema,
  '5': dayRangesSchema,
  '6': dayRangesSchema,
});

export type WeeklyHours = z.infer<typeof weeklyHoursSchema>;

export function isValidTimeZone(zone: string): boolean {
  return IANAZone.isValidZone(zone);
}

export const bookingSettingsSchema = z.object({
  timezone: z.string().refine(isValidTimeZone, 'Yanlış saat qurşağı'),
  weeklyHours: weeklyHoursSchema,
  slotStepMinutes: z.number().int().min(5).max(120),
  bufferMinutes: z.number().int().min(0).max(240),
  minNoticeHours: z.number().int().min(0).max(720),
  maxDaysAhead: z.number().int().min(1).max(365),
});

export type BookingSettingsData = z.infer<typeof bookingSettingsSchema>;

export const DEFAULT_BOOKING_SETTINGS: BookingSettingsData = {
  timezone: 'Asia/Baku',
  weeklyHours: {
    '0': [],
    '1': [{ start: '09:00', end: '18:00' }],
    '2': [{ start: '09:00', end: '18:00' }],
    '3': [{ start: '09:00', end: '18:00' }],
    '4': [{ start: '09:00', end: '18:00' }],
    '5': [{ start: '09:00', end: '18:00' }],
    '6': [],
  },
  slotStepMinutes: 30,
  bufferMinutes: 0,
  minNoticeHours: 12,
  maxDaysAhead: 60,
};

export interface Interval {
  start: Date;
  end: Date;
}

export interface SlotParams {
  settings: BookingSettingsData;
  durationMinutes: number;
  /** Confirmed bookings (any meeting type): the calendar is shared. */
  bookings: Interval[];
  timeOff: Interval[];
  /** Only slots starting in [from, to) are returned. */
  from: Date;
  to: Date;
  now: Date;
}

/**
 * Returns the start instants (UTC ISO strings, ascending) at which a meeting of
 * `durationMinutes` can be booked.
 *
 * A slot is offered when it
 *  - starts on the slot grid inside a weekly-hours range of the business time zone and ends within that range,
 *  - starts at least `minNoticeHours` from now and at most `maxDaysAhead` days from now,
 *  - leaves `bufferMinutes` of free time on both sides of every other booking,
 *  - does not overlap a time-off interval.
 */
export function computeSlots(params: SlotParams): string[] {
  const { settings, durationMinutes, bookings, timeOff, from, to, now } = params;
  const zone = settings.timezone;

  const earliest = Math.max(from.getTime(), now.getTime() + settings.minNoticeHours * 3_600_000);
  const latest = Math.min(to.getTime(), now.getTime() + settings.maxDaysAhead * 86_400_000);
  if (earliest >= latest) return [];

  const durationMs = durationMinutes * 60_000;
  const bufferMs = settings.bufferMinutes * 60_000;

  const conflicts = (s: number, e: number): boolean => {
    for (const b of bookings) {
      if (s < b.end.getTime() + bufferMs && e + bufferMs > b.start.getTime()) return true;
    }
    for (const o of timeOff) {
      if (s < o.end.getTime() && e > o.start.getTime()) return true;
    }
    return false;
  };

  const slots = new Set<string>();
  let day = DateTime.fromMillis(earliest, { zone }).startOf('day');
  const lastDay = DateTime.fromMillis(latest, { zone }).startOf('day');

  while (day.toMillis() <= lastDay.toMillis()) {
    // luxon: 1 = Monday ... 7 = Sunday; the settings use 0 = Sunday ... 6 = Saturday
    const ranges = settings.weeklyHours[String(day.weekday % 7) as keyof WeeklyHours] ?? [];

    for (const range of ranges) {
      const at = (hhmm: string) =>
        day.set({ hour: parseInt(hhmm.slice(0, 2), 10), minute: parseInt(hhmm.slice(3, 5), 10), second: 0, millisecond: 0 });
      const rangeEnd = at(range.end).toMillis();
      let t = at(range.start);

      while (t.toMillis() + durationMs <= rangeEnd) {
        const s = t.toMillis();
        if (s >= earliest && s < latest && !conflicts(s, s + durationMs)) {
          slots.add(new Date(s).toISOString());
        }
        t = t.plus({ minutes: settings.slotStepMinutes });
      }
    }

    day = day.plus({ days: 1 });
  }

  return [...slots].sort();
}

/** Re-checks one start instant with exactly the same rules (used when a booking is created). */
export function isSlotAvailable(params: Omit<SlotParams, 'from' | 'to'> & { startsAt: Date }): boolean {
  const { startsAt, ...rest } = params;
  const slots = computeSlots({ ...rest, from: startsAt, to: new Date(startsAt.getTime() + 1) });
  return slots.includes(startsAt.toISOString());
}

/**
 * Picks the text of a meeting type for a visitor language: that language, else Azerbaijani,
 * else any language that has a title. Entries without a title count as missing.
 */
export function pickLocaleText<T extends { locale: string; title: string }>(locales: T[], locale: string): T | undefined {
  const filled = locales.filter((l) => l.title.trim() !== '');
  return filled.find((l) => l.locale === locale) ?? filled.find((l) => l.locale === 'az') ?? filled[0];
}

/** Converts a wall-clock value like "2026-10-25T09:00" in the given zone to a UTC Date (null if invalid). */
export function localToDate(local: string, zone: string): Date | null {
  const dt = DateTime.fromISO(local, { zone });
  return dt.isValid ? dt.toUTC().toJSDate() : null;
}
