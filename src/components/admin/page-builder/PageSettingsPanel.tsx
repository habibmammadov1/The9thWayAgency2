"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Input } from "@/components/admin/ui/input";
import { Switch } from "@/components/admin/ui/switch";
import { toSlug, validateSlug } from "@/lib/page-builder/registry";
import type { PageLocale, PageTranslation } from "@/lib/page-builder/types";
import { Field, ImageField, TextAreaField, TextField } from "./fields";
import { LOCALE_LABELS, type EditorState } from "./editorState";

interface Props {
  state: EditorState;
  locale: PageLocale;
  savedSlug: string;
  isPublished: boolean;
  onChange: (patch: Partial<EditorState>) => void;
  onTranslationChange: (patch: Partial<PageTranslation>) => void;
}

export function PageSettingsPanel({ state, locale, savedSlug, isPublished, onChange, onTranslationChange }: Props) {
  const t = state.translations[locale];
  const slugError = validateSlug(state.slug);
  const seoLength = t.seoDescription?.length ?? 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <section className="rounded-xl border border-[var(--border)] bg-white p-5 space-y-5">
        <div>
          <h2 className="text-sm font-bold">Ümumi ayarlar</h2>
          <p className="text-xs text-[var(--muted-foreground)]">Bütün dillər üçün eynidir.</p>
        </div>

        <Field label="URL (slug)" hint={slugError ?? `Səhifə ünvanı: /${locale}/${state.slug}`}>
          <div className="flex gap-2">
            <div className="flex flex-1 items-center rounded-md border border-[var(--border)] bg-white focus-within:ring-2 focus-within:ring-[var(--ring)]">
              <span className="pl-3 text-sm text-gray-400">/{locale}/</span>
              <input
                value={state.slug}
                onChange={(e) => onChange({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                className="flex-1 h-10 bg-transparent px-1 text-sm outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => onChange({ slug: toSlug(t.title || state.translations.az.title) })}
              className="px-3 text-xs font-medium rounded-md border border-[var(--border)] hover:bg-gray-50 whitespace-nowrap"
            >
              Başlıqdan yarat
            </button>
          </div>
        </Field>
        {slugError && <p className="text-xs text-red-600 -mt-3">{slugError}</p>}
        {isPublished && state.slug !== savedSlug && (
          <div className="flex gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>Səhifə canlıdır. URL dəyişsə, köhnə ünvan (/{savedSlug}) ilə paylaşılmış linklər işləməyəcək.</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 rounded-lg border border-[var(--border)] p-3">
          <div>
            <p className="text-sm font-semibold">Menyuda göstər</p>
            <p className="text-xs text-[var(--muted-foreground)]">Dərc olunanda saytın yuxarı menyusunda link görünəcək.</p>
          </div>
          <Switch
            checked={state.showInNav}
            onCheckedChange={(showInNav) => onChange({ showInNav })}
            className="data-[state=checked]:bg-[var(--primary)] data-[state=unchecked]:bg-gray-300 [&>span]:bg-white"
          />
        </div>
        {state.showInNav && (
          <Field label="Menyuda sıra" hint="Kiçik rəqəm əvvəl göstərilir. Linklər “Haqqımızda” ilə “Əlaqə” arasında görünür.">
            <Input
              type="number"
              min={0}
              max={1000}
              value={state.navOrder}
              onChange={(e) => onChange({ navOrder: Math.max(0, Math.min(1000, Number(e.target.value) || 0)) })}
              className="w-28"
            />
          </Field>
        )}
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-white p-5 space-y-5">
        <div>
          <h2 className="text-sm font-bold">{LOCALE_LABELS[locale]} — menyu və SEO</h2>
          <p className="text-xs text-[var(--muted-foreground)]">Hər dil üçün ayrıca doldurulur.</p>
        </div>
        {state.showInNav && (
          <TextField
            label="Menyu adı (boş qalsa, səhifə başlığı)"
            value={t.navLabel ?? ""}
            maxLength={100}
            hint="Qısa ad seçin (1–2 söz), uzun adlar menyuda iki sətrə düşür."
            onChange={(navLabel) => onTranslationChange({ navLabel })}
          />
        )}
        <TextField
          label="SEO başlıq (Google-da görünən)"
          value={t.seoTitle ?? ""}
          maxLength={300}
          placeholder={t.title ? `${t.title} | THE9THWAY AGENCY` : ""}
          onChange={(seoTitle) => onTranslationChange({ seoTitle })}
        />
        <TextAreaField
          label={`SEO təsvir (${seoLength}/160)`}
          value={t.seoDescription ?? ""}
          onChange={(seoDescription) => onTranslationChange({ seoDescription: seoDescription.slice(0, 500) })}
          hint={seoLength > 160 ? "Google adətən 160 simvoldan sonrasını kəsir." : "Axtarış nəticələrində başlığın altında görünən qısa mətn."}
        />
        <ImageField
          label="Paylaşım şəkli (Facebook, WhatsApp, LinkedIn)"
          value={t.ogImageUrl}
          onChange={(ogImageUrl) => onTranslationChange({ ogImageUrl })}
          hint="Tövsiyə olunan ölçü: 1200×630"
        />
      </section>
    </div>
  );
}
