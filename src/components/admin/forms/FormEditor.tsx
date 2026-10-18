"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Copy, Loader2, Save } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Switch } from "@/components/admin/ui/switch";
import { useToast } from "@/components/admin/ui/use-toast";
import FormView from "@/components/forms/FormView";
import { Field, TextField } from "@/components/admin/page-builder/fields";
import { RepeatableList } from "@/components/admin/page-builder/RepeatableList";
import { cn } from "@/lib/utils";
import { FIELD_TYPE_INFO, cloneLocale, createField, emptyLocale, starterLocale } from "@/lib/forms/fields";
import { saveForm } from "@/lib/forms/formsApi";
import { FORM_LOCALES, type AdminForm, type FormFieldDef, type FormLocaleCode, type FormLocaleDef } from "@/lib/forms/types";
import { FieldEditor } from "./FieldEditor";
import { FormResponses } from "./FormResponses";

type Tab = "fields" | "responses";
type LocaleMap = Record<FormLocaleCode, FormLocaleDef>;

interface EditorState {
  name: string;
  isActive: boolean;
  locales: LocaleMap;
}

const LOCALE_LABELS: Record<FormLocaleCode, string> = { az: "AZ", ru: "RU", en: "EN" };

function stateFromForm(form: AdminForm): EditorState {
  const locales = {} as LocaleMap;
  for (const l of FORM_LOCALES) locales[l] = form.locales[l] ? { ...emptyLocale(), ...form.locales[l] } : emptyLocale();
  return { name: form.name, isActive: form.isActive, locales };
}

/** Returns a readable problem description, or null when the form can be saved. */
function findProblem(state: EditorState): string | null {
  if (!state.name.trim()) return "Forma adı boş ola bilməz.";
  for (const l of FORM_LOCALES) {
    for (const field of state.locales[l].fields) {
      if (!field.label.trim()) return `${LOCALE_LABELS[l]}: bütün sahələrin başlığı olmalıdır.`;
      if (FIELD_TYPE_INFO[field.type].hasOptions && field.options.length === 0) {
        return `${LOCALE_LABELS[l]}: “${field.label}” sahəsi üçün ən azı bir variant yazın.`;
      }
    }
  }
  return null;
}

export function FormEditor({ initialForm, initialTab }: { initialForm: AdminForm; initialTab: Tab }) {
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState(initialForm);
  const [state, setState] = useState<EditorState>(() => stateFromForm(initialForm));
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(stateFromForm(initialForm)));
  const [locale, setLocale] = useState<FormLocaleCode>(() => FORM_LOCALES.find((l) => initialForm.locales[l]) ?? "az");
  const [tab, setTab] = useState<Tab>(initialTab);
  const [isSaving, setIsSaving] = useState(false);

  const isDirty = useMemo(() => JSON.stringify(state) !== savedSnapshot, [state, savedSnapshot]);
  const def = state.locales[locale];
  const filledLocales = FORM_LOCALES.filter((l) => state.locales[l].fields.length > 0);
  const otherFilled = filledLocales.filter((l) => l !== locale);

  // Warn before closing the tab with unsaved changes
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const updateLocale = (patch: Partial<FormLocaleDef>) =>
    setState((s) => ({ ...s, locales: { ...s.locales, [locale]: { ...s.locales[locale], ...patch } } }));

  const copyFrom = (source: FormLocaleCode) => {
    updateLocale(cloneLocale(state.locales[source]));
    toast({ title: "Kopyalandı", description: `${LOCALE_LABELS[source]} versiyası ${LOCALE_LABELS[locale]} dilinə kopyalandı. İndi mətnləri tərcümə edin.` });
  };

  const save = async () => {
    const problem = findProblem(state);
    if (problem) {
      toast({ title: "Xəta", description: problem, variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const locales: Partial<Record<FormLocaleCode, FormLocaleDef>> = {};
      for (const l of filledLocales) locales[l] = state.locales[l];
      const saved = await saveForm(form.id, { name: state.name.trim(), isActive: state.isActive, locales });
      const next = stateFromForm(saved);
      setForm(saved);
      setState(next);
      setSavedSnapshot(JSON.stringify(next));
      toast({ title: "Yadda saxlanıldı", description: "Dəyişikliklər saytda dərhal görünür." });
    } catch (err) {
      toast({ title: "Xəta", description: err instanceof Error ? err.message : "Yadda saxlamaq alınmadı", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const goBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDirty && !window.confirm("Yadda saxlanmamış dəyişikliklər itəcək. Çıxmaq istəyirsiniz?")) return;
    router.push("/admin/forms");
  };

  const hasAnyFields = filledLocales.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sticky -top-4 sm:-top-6 lg:-top-8 z-40 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-8 px-4 sm:px-6 lg:px-8 py-4 bg-[#F7F6F4] border-b border-[var(--border)] shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link href="/admin/forms" onClick={goBack} className="p-2 rounded-lg hover:bg-white text-gray-600" title="Formalar">
              <ArrowLeft size={18} />
            </Link>
            <div className="min-w-0 flex-1 max-w-md">
              <Input
                value={state.name}
                maxLength={200}
                onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
                className="h-9 text-lg font-extrabold tracking-tight bg-transparent border-transparent hover:border-[var(--border)] focus:bg-white"
                aria-label="Forma adı"
              />
              {isDirty && <span className="text-xs text-amber-700">Yadda saxlanmamış dəyişikliklər var</span>}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={state.isActive}
                onCheckedChange={(isActive) => setState((s) => ({ ...s, isActive }))}
                className="data-[state=checked]:bg-[var(--primary)] data-[state=unchecked]:bg-gray-300 [&>span]:bg-white"
              />
              {state.isActive ? "Aktiv" : "Deaktiv"}
            </label>
            <Button onClick={save} disabled={!isDirty || isSaving}>
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Yadda saxla
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {tab === "fields" && (
            <div className="inline-flex rounded-lg bg-[var(--muted)] p-1">
              {FORM_LOCALES.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLocale(l)}
                  className={cn("px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-1.5", locale === l ? "bg-white shadow-sm text-black" : "text-gray-500")}
                >
                  {LOCALE_LABELS[l]}
                  <span className={cn("w-1.5 h-1.5 rounded-full", state.locales[l].fields.length ? "bg-green-500" : "bg-gray-300")} />
                </button>
              ))}
            </div>
          )}
          <div className="inline-flex rounded-lg bg-[var(--muted)] p-1">
            {(
              [
                ["fields", "Sahələr"],
                ["responses", "Cavablar"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={cn("px-3 py-1.5 text-sm font-medium rounded-md", tab === value ? "bg-white shadow-sm text-black" : "text-gray-500")}
              >
                {label}
              </button>
            ))}
          </div>
          {!state.isActive && (
            <span className="inline-flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
              <AlertTriangle size={12} /> Deaktiv forma saytda göstərilmir
            </span>
          )}
        </div>
      </div>

      {tab === "responses" ? (
        <FormResponses formId={form.id} />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-6 items-start">
          {/* Fields */}
          <div className="space-y-4">
            {def.fields.length === 0 && (
              <div className="rounded-xl border border-dashed border-[var(--primary)] bg-[var(--primary)]/5 p-4 text-sm space-y-3">
                <p>
                  {LOCALE_LABELS[locale]} dilində hələ sahə yoxdur.
                  {!hasAnyFields && " Başlanğıc üçün hazır sahələrlə başlaya və ya özünüz əlavə edə bilərsiniz."}
                </p>
                <div className="flex flex-wrap gap-2">
                  {otherFilled.map((l) => (
                    <Button key={l} variant="outline" size="sm" onClick={() => copyFrom(l)}>
                      <Copy size={13} /> {LOCALE_LABELS[l]} versiyasını kopyala
                    </Button>
                  ))}
                  {!hasAnyFields && (
                    <Button variant="outline" size="sm" onClick={() => updateLocale(starterLocale())}>
                      Ad, e-poçt, mesaj ilə başla
                    </Button>
                  )}
                </div>
              </div>
            )}

            <Field label={`Sahələr (${def.fields.length})`}>
              <RepeatableList<FormFieldDef>
                key={locale}
                items={def.fields}
                onChange={(fields) => updateLocale({ fields })}
                addLabel="Sahə əlavə et"
                max={30}
                itemTitle={(f, i) => `${f.label || `Sahə ${i + 1}`}${f.required ? " *" : ""}  ·  ${FIELD_TYPE_INFO[f.type].label}`}
                createItem={() => createField("text")}
                renderItem={(field, update) => <FieldEditor field={field} update={update} />}
              />
            </Field>

            {def.fields.length > 0 && (
              <div className="rounded-xl border border-[var(--border)] bg-white p-4 space-y-3">
                <h3 className="text-sm font-bold">Düymə və təşəkkür mətni ({LOCALE_LABELS[locale]})</h3>
                <TextField label="Göndər düyməsinin mətni" value={def.submitLabel} maxLength={100} onChange={(submitLabel) => updateLocale({ submitLabel })} placeholder="Göndər" />
                <TextField label="Uğur başlığı" value={def.successTitle} maxLength={200} onChange={(successTitle) => updateLocale({ successTitle })} placeholder="Təşəkkür edirik!" />
                <TextField label="Uğur mətni" value={def.successText} maxLength={2000} onChange={(successText) => updateLocale({ successText })} placeholder="Müraciətiniz göndərildi." />
              </div>
            )}
            <p className="text-xs text-[var(--muted-foreground)]">
              Boş qalan dil saytda göstərilmir. Sahələri silsəniz, köhnə cavablar öz başlıqları ilə qalır.
            </p>
          </div>

          {/* Preview */}
          <div className="xl:sticky xl:top-36 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Önizləmə ({LOCALE_LABELS[locale]})</span>
            <div className="rounded-xl border border-[var(--border)] bg-[#F4F3F0] p-4 md:p-6 max-h-[calc(100vh-14rem)] overflow-y-auto">
              {def.fields.length === 0 ? (
                <p className="py-10 text-center text-sm text-neutral-500">Sahə əlavə etdikdə forma burada görünəcək</p>
              ) : (
                <div className="rounded-[2rem] bg-white p-6 md:p-8 shadow-sm border border-gray-100 relative">
                  <FormView key={locale} formId={form.id} form={def} locale={locale} sourcePage="preview" isPreview />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
