// Form builder — shared types. Server side: server/src/lib/formFields.ts.

export const FORM_LOCALES = ["az", "ru", "en"] as const;
export type FormLocaleCode = (typeof FORM_LOCALES)[number];

export type FormFieldType =
  | "text"
  | "email"
  | "phone"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "checkboxGroup"
  | "date";

export interface FormFieldDef {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder: string;
  helpText: string;
  required: boolean;
  /** Choices for select / radio / checkboxGroup; the chosen text is what gets stored. */
  options: string[];
}

export type AnswerValue = string | string[] | boolean;
export type Answers = Record<string, AnswerValue>;

/** One language version of a form. */
export interface FormLocaleDef {
  fields: FormFieldDef[];
  submitLabel: string;
  successTitle: string;
  successText: string;
}

/** Public definition returned by GET /api/forms/public/:id */
export interface PublicForm extends FormLocaleDef {
  id: string;
  locale: string;
}

/** Admin: GET /api/forms/:id */
export interface AdminForm {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  locales: Partial<Record<FormLocaleCode, FormLocaleDef>>;
}

export interface AdminFormListItem {
  id: string;
  name: string;
  isActive: boolean;
  updatedAt: string;
  locales: string[];
  submissionCount: number;
  newCount: number;
}

export interface StoredAnswer {
  fieldId: string;
  label: string;
  type: FormFieldType;
  value: AnswerValue;
}

export type SubmissionStatus = "new" | "read" | "archived";

export interface FormSubmissionItem {
  id: string;
  formId: string;
  locale: string;
  sourcePage: string;
  status: SubmissionStatus;
  createdAt: string;
  data: StoredAnswer[];
}

export interface SubmissionsPage {
  submissions: FormSubmissionItem[];
  pagination: { page: number; pageSize: number; totalItems: number; totalPages: number };
  unreadCount: number;
}
