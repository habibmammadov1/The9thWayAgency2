"use client";

import React, { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { CalendarPlus, CheckCircle2, ChevronLeft, ChevronRight, Clock, Globe, Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookingError, createBooking, fetchSlots } from "@/lib/booking/bookingApi";
import { downloadIcs } from "@/lib/booking/ics";
import {
  dayKey,
  formatLongDate,
  formatTime,
  groupSlotsByDay,
  isValidTimeZone,
  monthFetchRange,
  monthGrid,
  monthTitle,
  parseKey,
  timeZoneOptions,
} from "@/lib/booking/time";
import type { BookingConfirmation, PublicBookingType } from "@/lib/booking/types";
import { FieldControl } from "@/components/forms/FormView";
import { textsFor, validateField } from "@/lib/forms/fields";
import type { AnswerValue } from "@/lib/forms/types";

// Calendly-style booking widget. No next-intl hooks: all texts come from the small dictionary below,
// so it also renders inside the admin live preview.

const TEXTS = {
  az: {
    selectType: "Görüş növünü seçin",
    selectDate: "Tarix və vaxt seçin",
    pickDay: "Əvvəlcə gün seçin",
    noTimes: "Bu gün üçün boş vaxt yoxdur",
    noTimesMonth: "Bu ayda boş vaxt yoxdur. Növbəti aya baxın.",
    loading: "Yüklənir...",
    loadError: "Boş vaxtları yükləmək alınmadı. Səhifəni yeniləyib yenidən cəhd edin.",
    timeZone: "Saat qurşağı",
    minutes: "dəq",
    weekdays: ["B.e.", "Ç.a.", "Çər.", "C.a.", "Cümə", "Şən.", "Bazar"],
    prevMonth: "Əvvəlki ay",
    nextMonth: "Növbəti ay",
    back: "Geri",
    yourDetails: "Məlumatlarınızı yazın",
    name: "Ad və soyad",
    email: "E-poçt",
    phone: "Telefon",
    message: "Qeyd (istəyə görə)",
    optional: "istəyə görə",
    book: "Rezerv et",
    booking: "Rezerv edilir...",
    previewNote: "Önizləmə: rezerv söndürülüb",
    required: "Bu sahə məcburidir",
    invalidEmail: "Düzgün e-poçt daxil edin",
    invalidPhone: "Düzgün telefon nömrəsi daxil edin",
    taken: "Bu vaxt artıq tutulub. Zəhmət olmasa başqa vaxt seçin.",
    genericError: "Xəta baş verdi. Yenidən cəhd edin.",
    confirmedTitle: "Görüş rezerv olundu!",
    confirmedText: "Vaxtı yadda saxlayın və ya təqvimə əlavə edin. Dəyişiklik lazımdırsa, bizimlə əlaqə saxlayın.",
    when: "Vaxt",
    where: "Yer / link",
    addToCalendar: "Təqvimə əlavə et",
    yourTimeZone: "Sizin saat qurşağınız",
  },
  ru: {
    selectType: "Выберите тип встречи",
    selectDate: "Выберите дату и время",
    pickDay: "Сначала выберите день",
    noTimes: "На этот день нет свободного времени",
    noTimesMonth: "В этом месяце нет свободного времени. Посмотрите следующий.",
    loading: "Загрузка...",
    loadError: "Не удалось загрузить время. Обновите страницу и попробуйте снова.",
    timeZone: "Часовой пояс",
    minutes: "мин",
    weekdays: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
    prevMonth: "Предыдущий месяц",
    nextMonth: "Следующий месяц",
    back: "Назад",
    yourDetails: "Введите ваши данные",
    name: "Имя и фамилия",
    email: "Эл. почта",
    phone: "Телефон",
    message: "Комментарий (необязательно)",
    optional: "необязательно",
    book: "Записаться",
    booking: "Запись...",
    previewNote: "Предпросмотр: запись отключена",
    required: "Обязательное поле",
    invalidEmail: "Неверный эл. адрес",
    invalidPhone: "Неверный номер телефона",
    taken: "Это время уже занято. Пожалуйста, выберите другое.",
    genericError: "Произошла ошибка. Попробуйте ещё раз.",
    confirmedTitle: "Встреча забронирована!",
    confirmedText: "Сохраните время или добавьте его в календарь. Если нужно изменить, свяжитесь с нами.",
    when: "Время",
    where: "Место / ссылка",
    addToCalendar: "Добавить в календарь",
    yourTimeZone: "Ваш часовой пояс",
  },
  en: {
    selectType: "Choose a meeting type",
    selectDate: "Select Date & Time",
    pickDay: "Pick a day first",
    noTimes: "No times available on this day",
    noTimesMonth: "No times available this month. Check the next one.",
    loading: "Loading...",
    loadError: "Could not load available times. Refresh the page and try again.",
    timeZone: "Time zone",
    minutes: "min",
    weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    prevMonth: "Previous month",
    nextMonth: "Next month",
    back: "Back",
    yourDetails: "Enter your details",
    name: "Full name",
    email: "Email",
    phone: "Phone",
    message: "Notes (optional)",
    optional: "optional",
    book: "Book meeting",
    booking: "Booking...",
    previewNote: "Preview: booking is disabled",
    required: "This field is required",
    invalidEmail: "Enter a valid email",
    invalidPhone: "Enter a valid phone number",
    taken: "That time was just taken. Please choose another.",
    genericError: "Something went wrong. Please try again.",
    confirmedTitle: "Meeting booked!",
    confirmedText: "Save the time or add it to your calendar. If you need to change it, contact us.",
    when: "When",
    where: "Where / link",
    addToCalendar: "Add to calendar",
    yourTimeZone: "Your time zone",
  },
} as const;

type Texts = (typeof TEXTS)[keyof typeof TEXTS];

const subscribeNever = () => () => {};
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+()\d\s.\-]{5,30}$/;

const INPUT =
  "w-full bg-transparent border-0 border-b border-[#E4E2DF] py-3 text-[#0B0B0C] placeholder:text-[#B5B3AE] focus:outline-none focus:border-[#0B0B0C] transition-colors";

interface BookingWidgetProps {
  types: PublicBookingType[];
  /** Fixed meeting type; when empty the visitor chooses (or the only type is used). */
  typeId?: string;
  locale: string;
  /** Admin live preview: everything works except the final booking. */
  isPreview?: boolean;
}

interface FetchedSlots {
  key: string;
  slots: string[];
  error: boolean;
}

export default function BookingWidget({ types, typeId, locale, isPreview = false }: BookingWidgetProps) {
  const t: Texts = TEXTS[(locale in TEXTS ? locale : "az") as keyof typeof TEXTS];

  // Browser-only values read through useSyncExternalStore so server and client markup match on first render
  const visitorZone = useSyncExternalStore(
    subscribeNever,
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    () => "UTC",
  );
  const [zoneOverride, setZoneOverride] = useState<string | null>(null);
  const zone = zoneOverride && isValidTimeZone(zoneOverride) ? zoneOverride : visitorZone;
  const today = useSyncExternalStore(
    subscribeNever,
    () => dayKey(new Date(), zone),
    () => "",
  );

  const [chosenTypeId, setChosenTypeId] = useState<string | null>(null);
  const activeType = types.find((x) => x.id === (typeId || chosenTypeId)) ?? (types.length === 1 && !typeId ? types[0] : null);

  // Own form fields built in the admin; null = the classic fixed form (phone + note)
  const customFields = activeType?.fields ?? null;

  const [monthOverride, setMonthOverride] = useState<{ y: number; m: number } | null>(null);
  const todayMonth = today ? parseKey(today) : null;
  const todayY = todayMonth?.year ?? null;
  const todayM = todayMonth?.month ?? null;
  const view = useMemo(
    () => monthOverride ?? (todayY !== null && todayM !== null ? { y: todayY, m: todayM } : null),
    [monthOverride, todayY, todayM],
  );

  const [tick, setTick] = useState(0);
  const [fetched, setFetched] = useState<FetchedSlots | null>(null);
  const requestKey = activeType && view ? `${activeType.id}|${view.y}-${view.m}|${tick}` : null;
  const loading = requestKey !== null && fetched?.key !== requestKey;

  // Load the month's slots (the range covers every local day of the month in any time zone)
  const activeTypeId = activeType?.id ?? null;
  const viewY = view?.y ?? null;
  const viewM = view?.m ?? null;
  useEffect(() => {
    if (!activeTypeId || viewY === null || viewM === null) return;
    const key = `${activeTypeId}|${viewY}-${viewM}|${tick}`;
    const { from, to } = monthFetchRange(viewY, viewM);
    let cancelled = false;
    fetchSlots(activeTypeId, from, to)
      .then((res) => !cancelled && setFetched({ key, slots: res.slots, error: false }))
      .catch(() => !cancelled && setFetched({ key, slots: [], error: true }));
    return () => {
      cancelled = true;
    };
  }, [activeTypeId, viewY, viewM, tick]);

  const slotsByDay = useMemo(
    () => (fetched && fetched.key === requestKey ? groupSlotsByDay(fetched.slots, zone) : new Map<string, string[]>()),
    [fetched, requestKey, zone],
  );

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [step, setStep] = useState<"pick" | "details" | "done">("pick");

  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", website: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Answers to the meeting type's own form fields (keys are field ids; errors use "a:" + id)
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);

  const zoneChoices = useMemo(() => timeZoneOptions(zone, visitorZone), [zone, visitorZone]);
  const weekdays = t.weekdays;
  const cells = useMemo(() => (view ? monthGrid(view.y, view.m) : []), [view]);

  const monthHasSlots = [...slotsByDay.keys()].some((k) => view && k.startsWith(`${view.y}-${String(view.m + 1).padStart(2, "0")}`));
  const isCurrentMonth = !!(view && todayMonth && view.y === todayMonth.year && view.m === todayMonth.month);

  const shiftMonth = (delta: number) => {
    if (!view) return;
    const d = new Date(Date.UTC(view.y, view.m + delta, 1));
    setMonthOverride({ y: d.getUTCFullYear(), m: d.getUTCMonth() });
    setSelectedDay(null);
  };

  const chooseType = (id: string) => {
    setChosenTypeId(id);
    setSelectedDay(null);
    setSelectedSlot(null);
    setStep("pick");
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = t.required;
    if (!form.email.trim()) next.email = t.required;
    else if (!EMAIL_RE.test(form.email.trim())) next.email = t.invalidEmail;
    if (customFields) {
      for (const field of customFields) {
        const message = validateField(field, answers[field.id], locale);
        if (message) next[`a:${field.id}`] = message;
      }
    } else if (form.phone.trim() && !PHONE_RE.test(form.phone.trim())) next.phone = t.invalidPhone;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview || !activeType || !selectedSlot || !validate()) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const booking = await createBooking({
        typeId: activeType.id,
        startsAt: selectedSlot,
        name: form.name.trim(),
        email: form.email.trim(),
        ...(customFields ? { answers } : { phone: form.phone.trim() || undefined, message: form.message.trim() || undefined }),
        locale,
        timezone: zone,
        website: form.website,
      });
      setConfirmation(booking);
      setStep("done");
    } catch (err) {
      if (err instanceof BookingError && err.status === 409) {
        // The time was taken meanwhile: go back to the calendar with fresh times
        setFormError(t.taken);
        setSelectedSlot(null);
        setStep("pick");
        setTick((n) => n + 1);
      } else {
        setFormError(err instanceof BookingError && err.status !== 500 ? err.message : t.genericError);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Left info panel
  // ---------------------------------------------------------------------------
  const summarySlot = step === "done" && confirmation ? confirmation.startsAt : selectedSlot;

  const info = (
    <aside className="p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-gray-100 space-y-5 text-left">
      {activeType ? (
        <>
          <h3 className="text-2xl md:text-3xl font-display font-bold leading-tight text-[#0B0B0C]">{activeType.title}</h3>
          <div className="space-y-3 text-sm font-semibold text-[#4A4A4A]">
            <p className="flex items-center gap-2.5">
              <Clock size={18} className="text-[#8A8A87]" /> {activeType.durationMinutes} {t.minutes}
            </p>
            {summarySlot && (
              <p className="flex items-start gap-2.5">
                <CalendarPlus size={18} className="mt-0.5 shrink-0 text-[#8A8A87]" />
                <span>
                  {formatTime(summarySlot, zone)} – {formatTime(new Date(new Date(summarySlot).getTime() + activeType.durationMinutes * 60_000), zone)},{" "}
                  {formatLongDate(summarySlot, zone, locale)}
                </span>
              </p>
            )}
            <p className="flex items-center gap-2.5">
              <Globe size={18} className="text-[#8A8A87]" /> {zone.replace(/_/g, " ")}
            </p>
          </div>
          {activeType.description && <p className="text-sm leading-relaxed text-[#4A4A4A] whitespace-pre-line">{activeType.description}</p>}
        </>
      ) : (
        <h3 className="text-2xl font-display font-bold text-[#0B0B0C]">{t.selectType}</h3>
      )}
    </aside>
  );

  // ---------------------------------------------------------------------------
  // Right-hand content
  // ---------------------------------------------------------------------------
  let content: React.ReactNode;

  if (!activeType) {
    content = (
      <div className="grid gap-3">
        {types.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => chooseType(type.id)}
            className="text-left rounded-2xl border border-[#0B0B0C]/15 p-5 hover:border-[#0B0B0C] transition-colors"
          >
            <div className="text-lg font-bold text-[#0B0B0C]">{type.title}</div>
            <div className="mt-1 text-sm text-[#4A4A4A]">
              {type.durationMinutes} {t.minutes}
            </div>
          </button>
        ))}
      </div>
    );
  } else if (step === "done" && confirmation) {
    content = (
      <div className="flex flex-col items-start gap-5 text-left">
        <CheckCircle2 size={44} className="text-[#A38B68]" />
        <div>
          <h3 className="text-2xl font-display font-bold text-[#0B0B0C]">{t.confirmedTitle}</h3>
          <p className="mt-2 text-[#4A4A4A] max-w-md">{confirmation.successText || t.confirmedText}</p>
        </div>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-widest text-[#8A8A87]">{t.when}</dt>
            <dd className="mt-1 font-semibold text-[#0B0B0C]">
              {formatTime(confirmation.startsAt, zone)} – {formatTime(confirmation.endsAt, zone)}, {formatLongDate(confirmation.startsAt, zone, locale)}
              <span className="block font-normal text-[#8A8A87]">
                {t.yourTimeZone}: {zone.replace(/_/g, " ")}
              </span>
            </dd>
          </div>
          {confirmation.locationNote && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-widest text-[#8A8A87]">{t.where}</dt>
              <dd className="mt-1 flex items-start gap-2 font-semibold text-[#0B0B0C] break-words">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <span className="whitespace-pre-line">{confirmation.locationNote}</span>
              </dd>
            </div>
          )}
        </dl>
        <button
          type="button"
          onClick={() =>
            downloadIcs({
              id: confirmation.id,
              title: confirmation.title,
              description: activeType.description,
              location: confirmation.locationNote,
              startsAt: confirmation.startsAt,
              endsAt: confirmation.endsAt,
            })
          }
          className="inline-flex items-center gap-2 rounded-full bg-[#d9c2a0] px-7 py-3.5 text-sm font-bold text-[#0B0B0C] transition-colors hover:bg-[#0B0B0C] hover:text-[#d9c2a0]"
        >
          <CalendarPlus size={18} /> {t.addToCalendar}
        </button>
      </div>
    );
  } else if (step === "details" && selectedSlot) {
    content = (
      <form onSubmit={submit} noValidate className="text-left">
        <button type="button" onClick={() => setStep("pick")} className="mb-5 inline-flex items-center gap-1 text-sm font-semibold text-[#4A4A4A] hover:text-black">
          <ChevronLeft size={16} /> {t.back}
        </button>
        <h3 className="mb-6 text-xl font-display font-bold text-[#0B0B0C]">{t.yourDetails}</h3>

        {/* Honeypot: hidden from people, bots tend to fill it */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
        </div>

        {(
          [
            ["name", t.name, "text", true],
            ["email", t.email, "email", true],
            ...(customFields ? [] : ([["phone", t.phone, "tel", false]] as const)),
          ] as const
        ).map(([field, label, type, required]) => (
          <div key={field} className="mb-6">
            <label htmlFor={`bk-${field}`} className="mb-1 block text-xs font-semibold uppercase tracking-widest text-[#8A8A87]">
              {label} {required ? "*" : `(${t.optional})`}
            </label>
            <input
              id={`bk-${field}`}
              type={type}
              value={form[field]}
              onChange={(e) => {
                setForm({ ...form, [field]: e.target.value });
                if (errors[field]) setErrors({ ...errors, [field]: "" });
              }}
              className={INPUT}
            />
            {errors[field] && <p className="mt-1 text-xs font-semibold text-red-500">{errors[field]}</p>}
          </div>
        ))}
        {customFields ? (
          customFields.map((field) => {
            const inputId = `bk-a-${field.id}`;
            return (
              <div key={field.id} className="mb-6">
                {field.type !== "checkbox" && (
                  <label htmlFor={inputId} className="mb-1 block text-xs font-semibold uppercase tracking-widest text-[#8A8A87]">
                    {field.label} {field.required ? "*" : `(${t.optional})`}
                  </label>
                )}
                <FieldControl
                  field={field}
                  inputId={inputId}
                  value={answers[field.id]}
                  placeholderFallback={textsFor(locale).select}
                  onChange={(value) => {
                    setAnswers({ ...answers, [field.id]: value });
                    if (errors[`a:${field.id}`]) setErrors({ ...errors, [`a:${field.id}`]: "" });
                  }}
                />
                {field.helpText && <p className="mt-1 text-xs text-[#8A8A87]">{field.helpText}</p>}
                {errors[`a:${field.id}`] && <p className="mt-1 text-xs font-semibold text-red-500">{errors[`a:${field.id}`]}</p>}
              </div>
            );
          })
        ) : (
          <div className="mb-6">
            <label htmlFor="bk-message" className="mb-1 block text-xs font-semibold uppercase tracking-widest text-[#8A8A87]">
              {t.message}
            </label>
            <textarea id="bk-message" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={cn(INPUT, "resize-none")} />
          </div>
        )}

        {formError && <p className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-600">{formError}</p>}

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={submitting || isPreview}
            className="flex items-center justify-center gap-2 rounded-full bg-[#d9c2a0] px-10 py-4 font-bold text-[#0B0B0C] shadow-md transition-colors duration-300 hover:bg-[#0B0B0C] hover:text-[#d9c2a0] disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={16} /> {t.booking}
              </>
            ) : (
              t.book
            )}
          </button>
          {isPreview && <span className="text-xs text-[#8A8A87]">{t.previewNote}</span>}
        </div>
      </form>
    );
  } else {
    const daySlots = selectedDay ? (slotsByDay.get(selectedDay) ?? []) : [];
    content = (
      <div className="text-left">
        <h3 className="mb-6 text-xl font-display font-bold text-[#0B0B0C]">{t.selectDate}</h3>
        {formError && <p className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-600">{formError}</p>}

        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_200px]">
          {/* Calendar */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                aria-label={t.prevMonth}
                disabled={isCurrentMonth || !view}
                onClick={() => shiftMonth(-1)}
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-base font-bold capitalize text-[#0B0B0C]">{view ? monthTitle(view.y, view.m, locale) : ""}</span>
              <button
                type="button"
                aria-label={t.nextMonth}
                disabled={!view}
                onClick={() => shiftMonth(1)}
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-30"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="mb-1 grid grid-cols-7 text-center text-xs font-bold uppercase text-[#0B0B0C]">
              {weekdays.map((w) => (
                <span key={w} className="py-2">
                  {w}
                </span>
              ))}
            </div>
            <div className={cn("grid grid-cols-7 gap-y-1 text-center", loading && "opacity-50")}>
              {cells.map((cell) => {
                if (!cell.inMonth) return <span key={cell.key} />;
                const available = slotsByDay.has(cell.key);
                const selected = selectedDay === cell.key;
                return (
                  <button
                    key={cell.key}
                    type="button"
                    disabled={!available}
                    aria-pressed={selected}
                    onClick={() => setSelectedDay(cell.key)}
                    className={cn(
                      "mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm transition-colors",
                      selected && "bg-[#0B0B0C] font-bold text-white",
                      !selected && available && "bg-[#D9C2A0]/30 font-bold text-[#0B0B0C] hover:bg-[#D9C2A0]",
                      !available && "cursor-default text-gray-300",
                    )}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>

            {loading && (
              <p className="mt-4 flex items-center gap-2 text-sm text-[#8A8A87]">
                <Loader2 size={14} className="animate-spin" /> {t.loading}
              </p>
            )}
            {!loading && fetched?.error && <p className="mt-4 text-sm font-semibold text-red-600">{t.loadError}</p>}
            {!loading && !fetched?.error && !monthHasSlots && <p className="mt-4 text-sm text-[#8A8A87]">{t.noTimesMonth}</p>}

            <div className="mt-6">
              <label htmlFor="bk-zone" className="mb-1 block text-xs font-bold uppercase tracking-widest text-[#8A8A87]">
                {t.timeZone}
              </label>
              <select
                id="bk-zone"
                value={zone}
                onChange={(e) => setZoneOverride(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-[#0B0B0C]"
              >
                {zoneChoices.map((z) => (
                  <option key={z.value} value={z.value}>
                    {z.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Times of the selected day */}
          <div>
            {selectedDay ? (
              <>
                <p className="mb-3 text-sm font-bold text-[#0B0B0C]">{formatLongDate(selectedDay, zone, locale)}</p>
                <div className="flex max-h-[380px] flex-col gap-2 overflow-y-auto pr-1">
                  {daySlots.length === 0 && <p className="text-sm text-[#8A8A87]">{t.noTimes}</p>}
                  {daySlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => {
                        setSelectedSlot(slot);
                        setFormError(null);
                        setStep("details");
                      }}
                      className="w-full rounded-xl border border-[#0B0B0C]/20 py-3 text-sm font-bold text-[#0B0B0C] transition-colors hover:border-[#0B0B0C] hover:bg-[#0B0B0C] hover:text-white"
                    >
                      {formatTime(slot, zone)}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-[#8A8A87]">{t.pickDay}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto grid max-w-5xl grid-cols-1 overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm lg:grid-cols-[300px_minmax(0,1fr)]">
      {info}
      <div className="p-6 md:p-8">{content}</div>
    </div>
  );
}
