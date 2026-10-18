"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { listForms } from "@/lib/forms/formsApi";
import type { AdminFormListItem } from "@/lib/forms/types";
import { Field, TextAreaField, TextField } from "../fields";
import type { EditorProps } from "./types";

export default function FormBlockEditor({ props, onChange }: EditorProps<"form">) {
  const [forms, setForms] = useState<AdminFormListItem[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listForms()
      .then((data) => !cancelled && setForms(data))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = forms?.find((f) => f.id === props.formId);
  const missing = Boolean(forms && props.formId && !selected);

  return (
    <div className="space-y-4">
      <Field label="Forma" hint="Formaları Admin → Formalar bölməsində qurursunuz. Eyni formanı bir neçə səhifədə istifadə etmək olar.">
        <select
          value={props.formId}
          disabled={!forms}
          onChange={(e) => onChange({ formId: e.target.value })}
          className="h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm"
        >
          <option value="">{forms ? "— Forma seçin —" : failed ? "Formalar yüklənmədi" : "Yüklənir..."}</option>
          {forms?.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
              {!f.isActive ? " (deaktiv)" : ""}
            </option>
          ))}
        </select>
      </Field>

      {selected && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--muted-foreground)]">
          <span>Dillər: {selected.locales.length ? selected.locales.map((l) => l.toUpperCase()).join(", ") : "heç biri"}</span>
          <Link href={`/admin/forms/${selected.id}`} target="_blank" className="inline-flex items-center gap-1 font-semibold text-[#A38B68] hover:underline">
            Formanı redaktə et <ExternalLink size={12} />
          </Link>
        </div>
      )}
      {selected && !selected.isActive && (
        <p className="flex gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" /> Forma deaktivdir, saytda göstərilməyəcək.
        </p>
      )}
      {missing && (
        <p className="flex gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-800">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" /> Seçilmiş forma tapılmadı (silinib). Başqa forma seçin.
        </p>
      )}
      {forms && forms.length === 0 && (
        <p className="text-xs text-[var(--muted-foreground)]">
          Hələ forma yoxdur.{" "}
          <Link href="/admin/forms" target="_blank" className="font-semibold text-[#A38B68] hover:underline">
            Admin → Formalar
          </Link>{" "}
          bölməsində yaradın.
        </p>
      )}

      <TextField label="Başlıq (istəyə görə)" value={props.heading} onChange={(heading) => onChange({ heading })} />
      <TextAreaField label="Alt mətn (istəyə görə)" rows={2} value={props.text} onChange={(text) => onChange({ text })} />
    </div>
  );
}
