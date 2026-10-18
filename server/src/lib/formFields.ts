import { z } from 'zod';

// ---------------------------------------------------------------------------
// Form builder — field definitions and answer validation (server side).
// The frontend mirrors the field types in src/lib/forms/types.ts.
// The server is the authority: answers are always re-validated against the
// stored definition and labels come from it, never from the client.
// ---------------------------------------------------------------------------

export const FORM_LOCALES = ['az', 'ru', 'en'] as const;

export const FIELD_TYPES = [
  'text',
  'email',
  'phone',
  'textarea',
  'select',
  'radio',
  'checkbox',
  'checkboxGroup',
  'date',
] as const;
export type FieldType = (typeof FIELD_TYPES)[number];

const CHOICE_TYPES: FieldType[] = ['select', 'radio', 'checkboxGroup'];

const MAX_FIELDS = 30;
const MAX_OPTIONS = 50;

export const formFieldSchema = z
  .object({
    id: z.string().min(1).max(100),
    type: z.enum(FIELD_TYPES),
    label: z.string().trim().min(1, 'Sahənin başlığı boş ola bilməz').max(200),
    placeholder: z.string().max(200).default(''),
    helpText: z.string().max(500).default(''),
    required: z.boolean().default(false),
    options: z.array(z.string().trim().min(1).max(200)).max(MAX_OPTIONS).default([]),
  })
  .superRefine((field, ctx) => {
    if (CHOICE_TYPES.includes(field.type)) {
      if (field.options.length === 0) {
        ctx.addIssue({ code: 'custom', message: `"${field.label}" sahəsi üçün ən azı bir variant lazımdır`, path: ['options'] });
      }
      if (new Set(field.options).size !== field.options.length) {
        ctx.addIssue({ code: 'custom', message: `"${field.label}" sahəsində təkrarlanan variantlar var`, path: ['options'] });
      }
    }
  });

export type FormField = z.infer<typeof formFieldSchema>;

export const formFieldsSchema = z
  .array(formFieldSchema)
  .max(MAX_FIELDS, `Bir formada ən çox ${MAX_FIELDS} sahə ola bilər`)
  .refine((fields) => new Set(fields.map((f) => f.id)).size === fields.length, 'Sahə id-ləri təkrarlanır');

export const formLocaleSchema = z.object({
  fields: formFieldsSchema,
  submitLabel: z.string().max(100).default(''),
  successTitle: z.string().max(200).default(''),
  successText: z.string().max(2000).default(''),
});

export type FormLocaleInput = z.infer<typeof formLocaleSchema>;

// ---------------------------------------------------------------------------
// Answers
// ---------------------------------------------------------------------------

export type AnswerValue = string | string[] | boolean;

export interface StoredAnswer {
  fieldId: string;
  label: string;
  type: FieldType;
  value: AnswerValue;
}

export class AnswerError extends Error {}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+()\d\s.\-]{5,30}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isRealDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Validates submitted answers against the form definition for one locale.
 * Returns the snapshot to store (label and type copied from the definition).
 * Throws AnswerError with a readable message on the first problem.
 */
export function validateAnswers(fields: FormField[], answers: unknown): StoredAnswer[] {
  const input = answers && typeof answers === 'object' && !Array.isArray(answers) ? (answers as Record<string, unknown>) : {};
  const stored: StoredAnswer[] = [];

  for (const field of fields) {
    const raw = input[field.id];
    const requiredError = new AnswerError(`"${field.label}" sahəsi məcburidir.`);
    const invalid = (what: string) => new AnswerError(`"${field.label}": ${what}`);

    switch (field.type) {
      case 'checkbox': {
        const checked = raw === true;
        if (field.required && !checked) throw requiredError;
        if (checked) stored.push({ fieldId: field.id, label: field.label, type: field.type, value: true });
        break;
      }

      case 'checkboxGroup': {
        const list = Array.isArray(raw) ? raw.filter((v): v is string => typeof v === 'string') : [];
        const chosen = Array.from(new Set(list));
        if (chosen.some((v) => !field.options.includes(v))) throw invalid('yanlış seçim');
        if (field.required && chosen.length === 0) throw requiredError;
        if (chosen.length) stored.push({ fieldId: field.id, label: field.label, type: field.type, value: chosen });
        break;
      }

      default: {
        const value = asString(raw);
        if (!value) {
          if (field.required) throw requiredError;
          break;
        }
        if (field.type === 'text' && value.length > 500) throw invalid('çox uzundur (maksimum 500 simvol)');
        if (field.type === 'textarea' && value.length > 5000) throw invalid('çox uzundur (maksimum 5000 simvol)');
        if (field.type === 'email' && (value.length > 254 || !EMAIL_RE.test(value))) throw invalid('düzgün e-poçt daxil edin');
        if (field.type === 'phone' && !PHONE_RE.test(value)) throw invalid('düzgün telefon nömrəsi daxil edin');
        if (field.type === 'date' && !isRealDate(value)) throw invalid('düzgün tarix daxil edin');
        if ((field.type === 'select' || field.type === 'radio') && !field.options.includes(value)) throw invalid('yanlış seçim');
        stored.push({ fieldId: field.id, label: field.label, type: field.type, value });
      }
    }
  }

  if (stored.length === 0) throw new AnswerError('Forma boşdur.');
  return stored;
}
