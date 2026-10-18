"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/admin/ui/input";
import { Textarea } from "@/components/admin/ui/textarea";
import { Label } from "@/components/admin/ui/label";
import { ImageUploadField } from "@/components/admin/ui/ImageUploadField";
import { cn } from "@/lib/utils";
import { BLOCK_ICON_NAMES, BlockIcon } from "@/lib/page-builder/icons";
import type { BlockButton } from "@/lib/page-builder/types";

// Small form building blocks for the page-builder editors.

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-semibold text-gray-700">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-[var(--muted-foreground)]">{hint}</p>}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  maxLength?: number;
}) {
  return (
    <Field label={label} hint={hint}>
      <Input value={value ?? ""} placeholder={placeholder} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <Textarea value={value ?? ""} rows={rows} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <Field label={label}>
      <div className="inline-flex flex-wrap rounded-lg border border-[var(--border)] bg-white p-0.5">
        {options.map((opt) => (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
              value === opt.value ? "bg-[var(--primary)] text-black shadow-sm" : "text-gray-600 hover:bg-gray-100",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </Field>
  );
}

export function ImageField({ label, value, onChange, hint }: { label: string; value?: string | null; onChange: (v: string | null) => void; hint?: string }) {
  return (
    <Field label={label} hint={hint}>
      <ImageUploadField value={value} onChange={(url) => onChange(url)} onClear={() => onChange(null)} />
    </Field>
  );
}

export function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Field label="İkon">
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => onChange("")}
          className={cn(
            "h-9 px-2 rounded-md border text-[11px]",
            !value ? "border-[var(--primary)] bg-[var(--primary)]/20" : "border-[var(--border)] bg-white hover:bg-gray-50",
          )}
        >
          Yox
        </button>
        {BLOCK_ICON_NAMES.map((name) => (
          <button
            key={name}
            type="button"
            title={name}
            onClick={() => onChange(name)}
            className={cn(
              "h-9 w-9 rounded-md border flex items-center justify-center",
              value === name ? "border-[var(--primary)] bg-[var(--primary)]/20" : "border-[var(--border)] bg-white hover:bg-gray-50",
            )}
          >
            <BlockIcon name={name} size={16} />
          </button>
        ))}
      </div>
    </Field>
  );
}

const BUTTON_STYLES: { value: BlockButton["style"]; label: string }[] = [
  { value: "primary", label: "Əsas" },
  { value: "secondary", label: "Çərçivəli" },
  { value: "link", label: "Link" },
];

export function ButtonFields({ value, onChange, onRemove }: { value: BlockButton; onChange: (v: BlockButton) => void; onRemove?: () => void }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-gray-50/60 p-3 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <TextField label="Düymə mətni" value={value.label} onChange={(label) => onChange({ ...value, label })} />
        <TextField
          label="Link"
          value={value.href}
          onChange={(href) => onChange({ ...value, href })}
          placeholder="/contact və ya https://..."
        />
      </div>
      <div className="flex items-end justify-between gap-3">
        <Segmented label="Stil" value={value.style} options={BUTTON_STYLES} onChange={(style) => onChange({ ...value, style })} />
        {onRemove && (
          <button type="button" onClick={onRemove} className="text-xs text-red-600 hover:underline inline-flex items-center gap-1 pb-1.5">
            <Trash2 size={12} /> Düyməni sil
          </button>
        )}
      </div>
    </div>
  );
}

export function ButtonsField({ value, onChange, max = 2 }: { value: BlockButton[]; onChange: (v: BlockButton[]) => void; max?: number }) {
  return (
    <Field label="Düymələr">
      <div className="space-y-2">
        {value.map((btn, i) => (
          <ButtonFields
            key={i}
            value={btn}
            onChange={(b) => onChange(value.map((x, j) => (j === i ? b : x)))}
            onRemove={() => onChange(value.filter((_, j) => j !== i))}
          />
        ))}
        {value.length < max && (
          <button
            type="button"
            onClick={() => onChange([...value, { label: "Ətraflı", href: "/contact", style: value.length ? "secondary" : "primary" }])}
            className="text-xs font-semibold text-[#A38B68] hover:underline"
          >
            + Düymə əlavə et
          </button>
        )}
      </div>
    </Field>
  );
}
