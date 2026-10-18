"use client";

import React, { useId, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { textsFor, validateField } from "@/lib/forms/fields";
import { submitForm } from "@/lib/forms/formsApi";
import type { AnswerValue, Answers, FormFieldDef, FormLocaleDef } from "@/lib/forms/types";

// Renders an admin-built form. Contains no next-intl hooks, so it also works inside the
// admin panel (live preview). All visible text comes from the form definition.

interface FormViewProps {
  formId: string;
  form: FormLocaleDef;
  locale: string;
  /** Page slug, stored with each answer so the inbox shows where it came from. */
  sourcePage: string;
  /** Preview mode: nothing is sent. */
  isPreview?: boolean;
}

const INPUT =
  "w-full bg-transparent border-0 border-b border-[#E4E2DF] py-3 text-[#0B0B0C] placeholder:text-[#B5B3AE] focus:outline-none focus:border-[#0B0B0C] transition-colors";

function FieldControl({
  field,
  inputId,
  value,
  placeholderFallback,
  onChange,
}: {
  field: FormFieldDef;
  inputId: string;
  value: AnswerValue | undefined;
  placeholderFallback: string;
  onChange: (value: AnswerValue) => void;
}) {
  const str = typeof value === "string" ? value : "";

  switch (field.type) {
    case "textarea":
      return <textarea id={inputId} rows={4} value={str} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} className={cn(INPUT, "resize-none")} />;

    case "select":
      return (
        <select id={inputId} value={str} onChange={(e) => onChange(e.target.value)} className={cn(INPUT, "appearance-none cursor-pointer", !str && "text-[#B5B3AE]")}>
          <option value="">{field.placeholder || placeholderFallback}</option>
          {field.options.map((o) => (
            <option key={o} value={o} className="text-[#0B0B0C]">
              {o}
            </option>
          ))}
        </select>
      );

    case "radio":
      return (
        <div className="flex flex-col gap-3 pt-1">
          {field.options.map((o) => (
            <label key={o} className="flex items-center gap-3 cursor-pointer text-[#0B0B0C]">
              <input type="radio" name={inputId} checked={str === o} onChange={() => onChange(o)} className="w-4 h-4 accent-[#0B0B0C]" />
              {o}
            </label>
          ))}
        </div>
      );

    case "checkboxGroup": {
      const chosen = Array.isArray(value) ? value : [];
      return (
        <div className="flex flex-col gap-3 pt-1">
          {field.options.map((o) => (
            <label key={o} className="flex items-center gap-3 cursor-pointer text-[#0B0B0C]">
              <input
                type="checkbox"
                checked={chosen.includes(o)}
                onChange={(e) => onChange(e.target.checked ? [...chosen, o] : chosen.filter((x) => x !== o))}
                className="w-4 h-4 accent-[#0B0B0C]"
              />
              {o}
            </label>
          ))}
        </div>
      );
    }

    case "checkbox":
      return (
        <label className="flex items-start gap-3 cursor-pointer text-[#0B0B0C]">
          <input type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 mt-1 accent-[#0B0B0C]" />
          <span>
            {field.label}
            {field.required && " *"}
          </span>
        </label>
      );

    default: {
      const type = field.type === "email" ? "email" : field.type === "phone" ? "tel" : field.type === "date" ? "date" : "text";
      return <input id={inputId} type={type} value={str} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} className={INPUT} />;
    }
  }
}

export default function FormView({ formId, form, locale, sourcePage, isPreview = false }: FormViewProps) {
  const uid = useId();
  const t = textsFor(locale);
  const [answers, setAnswers] = useState<Answers>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [website, setWebsite] = useState(""); // honeypot
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setValue = (id: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) return;

    const nextErrors: Record<string, string> = {};
    for (const field of form.fields) {
      const message = validateField(field, answers[field.id], locale);
      if (message) nextErrors[field.id] = message;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await submitForm(formId, { locale, sourcePage, answers, website });
      setIsDone(true);
    } catch (err) {
      setSubmitError(err instanceof Error && err.message ? err.message : t.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDone) {
    return (
      <div className="flex flex-col items-center text-center gap-3 py-10 text-[#0B0B0C]">
        <CheckCircle2 size={44} className="text-[#A38B68]" />
        <h3 className="text-2xl font-display font-bold">{form.successTitle || t.defaultSuccessTitle}</h3>
        <p className="text-[#4A4A4A] max-w-md">{form.successText || t.defaultSuccessText}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col text-left">
      {/* Honeypot: hidden from people, bots tend to fill it */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>

      {form.fields.map((field) => {
        const inputId = `${uid}-${field.id}`;
        return (
          <div key={field.id} className="mb-8">
            {field.type !== "checkbox" && (
              <label htmlFor={inputId} className="block text-xs font-semibold tracking-widest uppercase text-[#8A8A87] mb-2">
                {field.label}
                {field.required && " *"}
              </label>
            )}
            <FieldControl
              field={field}
              inputId={inputId}
              value={answers[field.id]}
              placeholderFallback={t.select}
              onChange={(v) => setValue(field.id, v)}
            />
            {field.helpText && <p className="text-xs text-[#8A8A87] mt-2">{field.helpText}</p>}
            {errors[field.id] && <p className="text-red-500 text-xs mt-1 font-semibold">{errors[field.id]}</p>}
          </div>
        );
      })}

      {submitError && (
        <p className="text-red-600 text-sm font-semibold mb-6 bg-red-50 p-3 rounded-xl border border-red-200">{submitError}</p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting || isPreview}
          className="bg-[#d9c2a0] text-[#0B0B0C] px-10 py-4 rounded-full font-bold hover:bg-[#0B0B0C] hover:text-[#d9c2a0] transition-colors duration-300 shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={16} /> {t.sending}
            </>
          ) : (
            form.submitLabel || t.defaultSubmit
          )}
        </button>
        {isPreview && <span className="text-xs text-[#8A8A87]">{t.preview}</span>}
      </div>
    </form>
  );
}
