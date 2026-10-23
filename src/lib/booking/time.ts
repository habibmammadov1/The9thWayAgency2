// Booking — date/time helpers built on Intl (no date library). Slots arrive as UTC instants;
// everything shown to a visitor is formatted in the time zone they picked.

const INTL_LOCALE: Record<string, string> = { az: "az", ru: "ru", en: "en-GB" };
const intlLocale = (locale: string) => INTL_LOCALE[locale] ?? "az";

/** "YYYY-MM-DD" of an instant in the given zone. */
export function dayKey(instant: Date | string, timeZone: string): string {
  const d = typeof instant === "string" ? new Date(instant) : instant;
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

export function formatTime(instant: Date | string, timeZone: string): string {
  const d = typeof instant === "string" ? new Date(instant) : instant;
  return new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d);
}

/** e.g. "Fri, 23 Oct 2026" in the visitor's language. */
export function formatLongDate(instantOrKey: Date | string, timeZone: string, locale: string): string {
  // A bare "YYYY-MM-DD" key is a calendar date, so it is formatted at UTC noon (no zone shift).
  const isKey = typeof instantOrKey === "string" && /^\d{4}-\d{2}-\d{2}$/.test(instantOrKey);
  const d = isKey ? new Date(`${instantOrKey}T12:00:00Z`) : typeof instantOrKey === "string" ? new Date(instantOrKey) : instantOrKey;
  return new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: isKey ? "UTC" : timeZone,
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function monthTitle(year: number, month: number, locale: string): string {
  return new Intl.DateTimeFormat(intlLocale(locale), { timeZone: "UTC", month: "long", year: "numeric" }).format(new Date(Date.UTC(year, month, 1)));
}

export interface CalendarCell {
  key: string;
  day: number;
  inMonth: boolean;
}

/** Month grid (Monday first) as calendar dates; independent of any time zone. */
export function monthGrid(year: number, month: number): CalendarCell[] {
  const first = new Date(Date.UTC(year, month, 1));
  const offset = (first.getUTCDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const total = Math.ceil((offset + daysInMonth) / 7) * 7;
  const cells: CalendarCell[] = [];
  for (let i = 0; i < total; i++) {
    const d = new Date(Date.UTC(year, month, 1 - offset + i));
    cells.push({ key: d.toISOString().slice(0, 10), day: d.getUTCDate(), inMonth: d.getUTCMonth() === month });
  }
  return cells;
}

export function groupSlotsByDay(slots: string[], timeZone: string): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const s of slots) {
    const key = dayKey(s, timeZone);
    const list = map.get(key);
    if (list) list.push(s);
    else map.set(key, [s]);
  }
  return map;
}

/** Instants that surely cover every local day of the month in any time zone (zones span UTC-12..UTC+14). */
export function monthFetchRange(year: number, month: number): { from: Date; to: Date } {
  return {
    from: new Date(Date.UTC(year, month, 1) - 36 * 3_600_000),
    to: new Date(Date.UTC(year, month + 1, 1) + 36 * 3_600_000),
  };
}

export function parseKey(key: string): { year: number; month: number } {
  return { year: parseInt(key.slice(0, 4), 10), month: parseInt(key.slice(5, 7), 10) - 1 };
}

const FALLBACK_ZONES = [
  "Pacific/Honolulu", "America/Anchorage", "America/Los_Angeles", "America/Denver", "America/Chicago", "America/New_York",
  "America/Sao_Paulo", "UTC", "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Istanbul", "Europe/Moscow",
  "Asia/Dubai", "Asia/Baku", "Asia/Tbilisi", "Asia/Tashkent", "Asia/Kolkata", "Asia/Bangkok", "Asia/Singapore",
  "Asia/Tokyo", "Australia/Sydney", "Pacific/Auckland",
];

export function offsetLabel(timeZone: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en", { timeZone, timeZoneName: "shortOffset" }).formatToParts(new Date());
    return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
  } catch {
    return "";
  }
}

/** All zones the browser knows (or a short list), always including the given ones. */
export function timeZoneOptions(...include: string[]): { value: string; label: string }[] {
  let zones: string[] = FALLBACK_ZONES;
  try {
    const supported = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf?.("timeZone");
    if (supported && supported.length) zones = supported;
  } catch {
    // keep the fallback
  }
  const set = new Set([...zones, ...include.filter(Boolean)]);
  return [...set].sort().map((z) => ({ value: z, label: `${z.replace(/_/g, " ")} (${offsetLabel(z)})` }));
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone });
    return true;
  } catch {
    return false;
  }
}
