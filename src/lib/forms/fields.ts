import { newId } from "@/lib/page-builder/registry";
import type { AnswerValue, FormFieldDef, FormFieldType, FormLocaleDef } from "./types";

// Field catalogue used by the admin editor and the public renderer.

export interface FieldTypeInfo {
  type: FormFieldType;
  label: string;
  hasOptions: boolean;
  hasPlaceholder: boolean;
}

export const FIELD_TYPES: FieldTypeInfo[] = [
  { type: "text", label: "Qısa mətn", hasOptions: false, hasPlaceholder: true },
  { type: "email", label: "E-poçt", hasOptions: false, hasPlaceholder: true },
  { type: "phone", label: "Telefon", hasOptions: false, hasPlaceholder: true },
  { type: "textarea", label: "Uzun mətn", hasOptions: false, hasPlaceholder: true },
  { type: "select", label: "Açılan siyahı", hasOptions: true, hasPlaceholder: true },
  { type: "radio", label: "Bir seçim (radio)", hasOptions: true, hasPlaceholder: false },
  { type: "checkboxGroup", label: "Çoxlu seçim", hasOptions: true, hasPlaceholder: false },
  { type: "checkbox", label: "Təsdiq xanası", hasOptions: false, hasPlaceholder: false },
  { type: "date", label: "Tarix", hasOptions: false, hasPlaceholder: false },
];

export const FIELD_TYPE_INFO = Object.fromEntries(FIELD_TYPES.map((t) => [t.type, t])) as Record<FormFieldType, FieldTypeInfo>;

export function createField(type: FormFieldType = "text"): FormFieldDef {
  return {
    id: newId(),
    type,
    label: FIELD_TYPE_INFO[type].label,
    placeholder: "",
    helpText: "",
    required: false,
    options: FIELD_TYPE_INFO[type].hasOptions ? ["Variant 1", "Variant 2"] : [],
  };
}

export function emptyLocale(): FormLocaleDef {
  return { fields: [], submitLabel: "", successTitle: "", successText: "" };
}

/** Starting point for a brand-new form: the classic contact fields. */
export function starterLocale(): FormLocaleDef {
  const name = { ...createField("text"), label: "Ad və soyad", required: true };
  const email = { ...createField("email"), label: "E-poçt", required: true };
  const message = { ...createField("textarea"), label: "Mesaj", required: true };
  return { fields: [name, email, message], submitLabel: "Göndər", successTitle: "Təşəkkür edirik!", successText: "Mesajınız göndərildi." };
}

/** Copies a language version; field ids are kept (they only need to be unique within one language). */
export function cloneLocale(source: FormLocaleDef): FormLocaleDef {
  return JSON.parse(JSON.stringify(source));
}

// ---------------------------------------------------------------------------
// Client-side validation (mirrors server/src/lib/formFields.ts)
// ---------------------------------------------------------------------------

const MESSAGES = {
  az: { required: "Bu sahə məcburidir", email: "Düzgün e-poçt daxil edin", phone: "Düzgün telefon nömrəsi daxil edin", date: "Düzgün tarix daxil edin", tooLong: "Mətn çox uzundur" },
  ru: { required: "Обязательное поле", email: "Неверный эл. адрес", phone: "Неверный номер телефона", date: "Неверная дата", tooLong: "Слишком длинный текст" },
  en: { required: "This field is required", email: "Enter a valid email", phone: "Enter a valid phone number", date: "Enter a valid date", tooLong: "Text is too long" },
} as const;

export const FORM_TEXTS = {
  az: { sending: "Göndərilir...", error: "Xəta baş verdi. Yenidən cəhd edin.", select: "Seçin", defaultSubmit: "Göndər", defaultSuccessTitle: "Təşəkkür edirik!", defaultSuccessText: "Müraciətiniz göndərildi.", preview: "Önizləmə: göndərmə söndürülüb" },
  ru: { sending: "Отправка...", error: "Произошла ошибка. Попробуйте ещё раз.", select: "Выберите", defaultSubmit: "Отправить", defaultSuccessTitle: "Спасибо!", defaultSuccessText: "Ваша заявка отправлена.", preview: "Предпросмотр: отправка отключена" },
  en: { sending: "Sending...", error: "Something went wrong. Please try again.", select: "Select", defaultSubmit: "Send", defaultSuccessTitle: "Thank you!", defaultSuccessText: "Your submission has been sent.", preview: "Preview: sending is disabled" },
} as const;

export function textsFor(locale: string) {
  return FORM_TEXTS[(locale in FORM_TEXTS ? locale : "az") as keyof typeof FORM_TEXTS];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+()\d\s.\-]{5,30}$/;

export function validateField(field: FormFieldDef, value: AnswerValue | undefined, locale: string): string | null {
  const m = MESSAGES[(locale in MESSAGES ? locale : "az") as keyof typeof MESSAGES];

  if (field.type === "checkbox") return field.required && value !== true ? m.required : null;
  if (field.type === "checkboxGroup") {
    return field.required && (!Array.isArray(value) || value.length === 0) ? m.required : null;
  }

  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return field.required ? m.required : null;
  if (field.type === "text" && text.length > 500) return m.tooLong;
  if (field.type === "textarea" && text.length > 5000) return m.tooLong;
  if (field.type === "email" && !EMAIL_RE.test(text)) return m.email;
  if (field.type === "phone" && !PHONE_RE.test(text)) return m.phone;
  if (field.type === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(text)) return m.date;
  return null;
}
