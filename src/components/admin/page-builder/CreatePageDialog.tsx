"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/admin/ui/dialog";
import { Input } from "@/components/admin/ui/input";
import { cn } from "@/lib/utils";
import { toSlug, validateSlug } from "@/lib/page-builder/registry";
import { PAGE_TEMPLATES } from "@/lib/page-builder/templates";
import { PAGE_LOCALES, type AdminPage, type PageLocale } from "@/lib/page-builder/types";
import { createPage } from "@/lib/page-builder/pagesApi";
import { Field } from "./fields";
import { LOCALE_LABELS } from "./editorState";

export function CreatePageDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (page: AdminPage) => void;
}) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [locale, setLocale] = useState<PageLocale>("az");
  const [templateId, setTemplateId] = useState("blank");
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const reset = () => {
    setTitle("");
    setSlug("");
    setSlugTouched(false);
    setLocale("az");
    setTemplateId("blank");
    setError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError("Başlıq boş ola bilməz");
    const slugError = validateSlug(slug);
    if (slugError) return setError(slugError);

    setIsCreating(true);
    setError(null);
    try {
      const template = PAGE_TEMPLATES.find((t) => t.id === templateId) ?? PAGE_TEMPLATES[0];
      const page = await createPage({ title: title.trim(), slug, locale, blocks: template.build() });
      reset();
      onCreated(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Səhifə yaradıla bilmədi");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-xl">
        <form onSubmit={submit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>Yeni səhifə</DialogTitle>
            <DialogDescription className="text-xs text-[var(--muted-foreground)]">
              Səhifə qaralama kimi yaranır və dərc edilənə qədər saytda görünmür.
            </DialogDescription>
          </DialogHeader>

          <Field label="Başlıq">
            <Input
              autoFocus
              value={title}
              maxLength={300}
              placeholder="Məs. Yay kampaniyası 2026"
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slugTouched) setSlug(toSlug(e.target.value));
              }}
            />
          </Field>

          <Field label="URL" hint="Başlıqdan avtomatik yaranır, dəyişə bilərsiniz.">
            <div className="flex items-center rounded-md border border-[var(--border)] bg-white focus-within:ring-2 focus-within:ring-[var(--ring)]">
              <span className="pl-3 text-sm text-gray-400">/{locale}/</span>
              <input
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                }}
                className="flex-1 h-10 bg-transparent px-1 text-sm outline-none"
              />
            </div>
          </Field>

          <Field label="İlk dil" hint="Digər dilləri sonra redaktorda əlavə edə bilərsiniz.">
            <div className="inline-flex rounded-lg border border-[var(--border)] p-0.5">
              {PAGE_LOCALES.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLocale(l)}
                  className={cn("px-3 py-1.5 text-xs font-medium rounded-md", locale === l ? "bg-[var(--primary)] text-black" : "text-gray-600")}
                >
                  {LOCALE_LABELS[l]}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Şablon">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PAGE_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplateId(t.id)}
                  className={cn(
                    "text-left rounded-lg border p-3 transition-colors",
                    templateId === t.id ? "border-[var(--primary)] bg-[var(--primary)]/10" : "border-[var(--border)] hover:bg-gray-50",
                  )}
                >
                  <div className="text-sm font-bold">{t.label}</div>
                  <div className="text-[11px] text-[var(--muted-foreground)] mt-0.5">{t.description}</div>
                </button>
              ))}
            </div>
          </Field>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
              Ləğv et
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating && <Loader2 size={14} className="animate-spin" />}
              Yarat
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
