// Booking — date/time helpers built on Intl (no date library). Slots arrive as UTC instants;
// everything shown to a visitor is formatted in the time zone they picked.

/** "YYYY-MM-DD" of an instant in the given zone. */
export function dayKey(instant: Date | string, timeZone: string): string {
  const d = typeof instant === "string" ? new Date(instant) : instant;
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

export function formatTime(instant: Date | string, timeZone: string): string {
  const d = typeof instant === "string" ? new Date(instant) : instant;
  return new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d);
}

// Month and weekday names are fixed here instead of coming from Intl: some browsers have no data
// for "az" and print "M10" instead of the month name, and server and browser could differ.
const MONTHS = {
  az: ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"],
  ru: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
} as const;
const MONTHS_OF_DATE_RU = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
// Index 0 = Sunday
const WEEKDAYS = {
  az: ["Bazar", "B.e.", "Ç.a.", "Çərş.", "C.a.", "Cümə", "Şən."],
  ru: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
} as const;
const lang = (locale: string): "az" | "ru" | "en" => (locale === "ru" || locale === "en" ? locale : "az");

/** e.g. "Fri, 23 October 2026" in the visitor's language. Accepts an instant or a "YYYY-MM-DD" calendar key. */
export function formatLongDate(instantOrKey: Date | string, timeZone: string, locale: string): string {
  // A bare key is already a calendar date; an instant is first converted to a date in the chosen zone.
  const isKey = typeof instantOrKey === "string" && /^\d{4}-\d{2}-\d{2}$/.test(instantOrKey);
  const key = isKey ? (instantOrKey as string) : dayKey(instantOrKey, timeZone);
  const [y, m, d] = key.split("-").map(Number);
  const l = lang(locale);
  const weekday = WEEKDAYS[l][new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  const month = l === "ru" ? MONTHS_OF_DATE_RU[m - 1] : l === "az" ? MONTHS.az[m - 1].toLocaleLowerCase("az") : MONTHS.en[m - 1];
  return `${weekday}, ${d} ${month} ${y}`;
}

/** e.g. "Oktyabr 2026"; month is 0-based. */
export function monthTitle(year: number, month: number, locale: string): string {
  return `${MONTHS[lang(locale)][month]} ${year}`;
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
