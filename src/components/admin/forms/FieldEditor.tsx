"use client";

import React, { useState } from "react";
import { Switch } from "@/components/admin/ui/switch";
import { FIELD_TYPES, FIELD_TYPE_INFO } from "@/lib/forms/fields";
import type { FormFieldDef, FormFieldType } from "@/lib/forms/types";
import { Field, TextAreaField, TextField } from "@/components/admin/page-builder/fields";

// One option per line. The raw text is kept locally so blank lines and trailing spaces
// can be typed; the stored list is trimmed and without empty lines.
function OptionsField({ options, onChange }: { options: string[]; onChange: (options: string[]) => void }) {
  const [raw, setRaw] = useState(options.join("\n"));
  return (
    <TextAreaField
      label="Variantlar"
      rows={5}
      value={raw}
      hint="Hər sətirdə bir variant. Ziyarətçi seçdiyi mətn cavab kimi saxlanılır."
      onChange={(text) => {
        setRaw(text);
        onChange(text.split("\n").map((l) => l.trim()).filter(Boolean));
      }}
    />
  );
}

export function FieldEditor({ field, update }: { field: FormFieldDef; update: (patch: Partial<FormFieldDef>) => void }) {
  const info = FIELD_TYPE_INFO[field.type];

  const changeType = (type: FormFieldType) => {
    const next = FIELD_TYPE_INFO[type];
    update({
      type,
      options: next.hasOptions ? (field.options.length ? field.options : ["Variant 1", "Variant 2"]) : [],
      placeholder: next.hasPlaceholder ? field.placeholder : "",
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Sahə növü">
          <select
            value={field.type}
            onChange={(e) => changeType(e.target.value as FormFieldType)}
            className="h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm"
          >
            {FIELD_TYPES.map((t) => (
              <option key={t.type} value={t.type}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Məcburi sahə">
          <div className="flex h-10 items-center gap-3">
            <Switch
              checked={field.required}
              onCheckedChange={(required) => update({ required })}
              className="data-[state=checked]:bg-[var(--primary)] data-[state=unchecked]:bg-gray-300 [&>span]:bg-white"
            />
            <span className="text-xs text-[var(--muted-foreground)]">{field.required ? "Doldurulmalıdır" : "İstəyə görə"}</span>
          </div>
        </Field>
      </div>

      <TextField
        label={field.type === "checkbox" ? "Xananın mətni" : "Başlıq"}
        value={field.label}
        maxLength={200}
        onChange={(label) => update({ label })}
        placeholder={field.type === "checkbox" ? "Məs. Şərtlərlə razıyam" : "Məs. Şirkət adı"}
      />
      {info.hasPlaceholder && (
        <TextField label="Nümunə mətn (placeholder)" value={field.placeholder} maxLength={200} onChange={(placeholder) => update({ placeholder })} />
      )}
      {info.hasOptions && <OptionsField options={field.options} onChange={(options) => update({ options })} />}
      <TextField label="Köməkçi mətn (istəyə görə)" value={field.helpText} maxLength={500} onChange={(helpText) => update({ helpText })} />
    </div>
  );
}
