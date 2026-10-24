"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, CalendarClock, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/admin/ui/dialog";
import { Input } from "@/components/admin/ui/input";
import { Switch } from "@/components/admin/ui/switch";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { useToast } from "@/components/admin/ui/use-toast";
import { cn } from "@/lib/utils";
import { createType, deleteType, listTypes, reorderTypes, saveType } from "@/lib/booking/bookingApi";
import { BOOKING_LOCALES, type AdminBookingType, type BookingLocale, type BookingTypeLocale } from "@/lib/booking/types";
import { Field, TextAreaField, TextField } from "@/components/admin/page-builder/fields";
import { RepeatableList } from "@/components/admin/page-builder/RepeatableList";
import { FieldEditor } from "@/components/admin/forms/FieldEditor";
import { FIELD_TYPE_INFO, createField } from "@/lib/forms/fields";
import type { FormFieldDef } from "@/lib/forms/types";

const EMPTY_LOCALE: BookingTypeLocale = { title: "", description: "", locationNote: "", successText: "", fields: [] };

// Starting fields (like the old fixed form): a phone number and a note, both optional
const STARTER_LABELS: Record<BookingLocale, { phone: string; note: string }> = {
  az: { phone: "Telefon", note: "Qeyd" },
  ru: { phone: "Телефон", note: "Заметка" },
  en: { phone: "Phone", note: "Notes" },
};

function starterFields(locale: BookingLocale): FormFieldDef[] {
  return [
    { ...createField("phone"), label: STARTER_LABELS[locale].phone },
    { ...createField("textarea"), label: STARTER_LABELS[locale].note },
  ];
}

interface Draft {
  id: string | null;
  name: string;
  durationMinutes: number;
  isActive: boolean;
  locales: Record<BookingLocale, BookingTypeLocale>;
}

const toDraft = (t?: AdminBookingType): Draft => ({
  id: t?.id ?? null,
  name: t?.name ?? "",
  durationMinutes: t?.durationMinutes ?? 30,
  isActive: t?.isActive ?? true,
  locales: {
    az: { ...EMPTY_LOCALE, ...t?.locales.az, fields: t?.locales.az?.fields ?? starterFields("az") },
    ru: { ...EMPTY_LOCALE, ...t?.locales.ru, fields: t?.locales.ru?.fields ?? starterFields("ru") },
    en: { ...EMPTY_LOCALE, ...t?.locales.en, fields: t?.locales.en?.fields ?? starterFields("en") },
  },
});

export function BookingTypesManager() {
  const { toast } = useToast();
  const [types, setTypes] = useState<AdminBookingType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [lang, setLang] = useState<BookingLocale>("az");
  const [saving, setSaving] = useState(false);

  const fail = useCallback(
    (err: unknown, fallback: string) =>
      toast({ title: "Xəta", description: err instanceof Error ? err.message : fallback, variant: "destructive" }),
    [toast],
  );

  useEffect(() => {
    let cancelled = false;
    listTypes()
      .then((data) => !cancelled && setTypes(data))
      .catch((err) => fail(err, "Növlər yüklənmədi"))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [fail]);

  const submit = async () => {
    if (!draft) return;
    if (!draft.name.trim()) return fail(new Error("Daxili ad boş ola bilməz"), "");
    if (!BOOKING_LOCALES.some((l) => draft.locales[l].title.trim())) return fail(new Error("Ən azı bir dildə başlıq yazın"), "");
    setSaving(true);
    try {
      const payload = {
        name: draft.name.trim(),
        durationMinutes: draft.durationMinutes,
        isActive: draft.isActive,
        locales: Object.fromEntries(BOOKING_LOCALES.filter((l) => draft.locales[l].title.trim()).map((l) => [l, draft.locales[l]])),
      };
      if (draft.id) await saveType(draft.id, payload);
      else await createType(payload);
      setDraft(null);
      setTypes(await listTypes());
      toast({ title: "Saxlandı" });
    } catch (err) {
      fail(err, "Saxlamaq alınmadı");
    } finally {
      setSaving(false);
    }
  };

  const move = async (index: number, delta: number) => {
    const next = [...types];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    setTypes(next);
    try {
      await reorderTypes(next.map((t) => t.id));
    } catch (err) {
      fail(err, "Sıra dəyişmədi");
      setTypes(await listTypes());
    }
  };

  const remove = async (t: AdminBookingType) => {
    if (!window.confirm(`“${t.name}” silinsin?`)) return;
    try {
      await deleteType(t.id);
      setTypes((list) => list.filter((x) => x.id !== t.id));
    } catch (err) {
      fail(err, "Silmək alınmadı");
    }
  };

  const setLocale = (patch: Partial<BookingTypeLocale>) =>
    setDraft((d) => (d ? { ...d, locales: { ...d.locales, [lang]: { ...d.locales[lang], ...patch } } } : d));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setDraft(toDraft());
            setLang("az");
          }}
        >
          <Plus /> Yeni görüş növü
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-[var(--primary)]" size={28} />
        </div>
      ) : types.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="Hələ görüş növü yoxdur"
          description="Məsələn “Pulsuz konsultasiya, 60 dəq”. Növ yaradın, sonra səhifə qurucusunda “Rezervasiya” bloku ilə səhifəyə əlavə edin."
          actionLabel="Yeni görüş növü"
          onAction={() => setDraft(toDraft())}
        />
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-white overflow-hidden">
          {types.map((t, i) => (
            <div key={t.id} className="flex flex-wrap items-center gap-3 px-5 py-4 border-b last:border-b-0">
              <div className="min-w-0 flex-1">
                <div className="font-semibold flex items-center gap-2">
                  {t.name}
                  {!t.isActive && <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-600">deaktiv</span>}
                </div>
                <div className="text-xs text-gray-500">
                  {t.durationMinutes} dəq · {t.bookingCount} rezervasiya ·{" "}
                  {BOOKING_LOCALES.map((l) => (
                    <span key={l} className={cn("mr-1 font-bold", t.locales[l] ? "text-black" : "text-gray-300 line-through")}>
                      {l.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
              <button type="button" title="Yuxarı" disabled={i === 0} onClick={() => move(i, -1)} className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-30">
                <ArrowUp size={15} />
              </button>
              <button type="button" title="Aşağı" disabled={i === types.length - 1} onClick={() => move(i, 1)} className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-30">
                <ArrowDown size={15} />
              </button>
              <button
                type="button"
                title="Redaktə et"
                onClick={() => {
                  setDraft(toDraft(t));
                  setLang("az");
                }}
                className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
              >
                <Pencil size={15} />
              </button>
              <button type="button" title="Sil" onClick={() => remove(t)} className="p-2 rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={Boolean(draft)} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          {draft && (
            <>
              <DialogHeader>
                <DialogTitle>{draft.id ? "Görüş növünü redaktə et" : "Yeni görüş növü"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <TextField label="Daxili ad (yalnız admin görür)" value={draft.name} onChange={(name) => setDraft({ ...draft, name })} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Müddət (dəqiqə)">
                    <Input type="number" min={5} max={480} value={draft.durationMinutes} onChange={(e) => setDraft({ ...draft, durationMinutes: parseInt(e.target.value, 10) || 0 })} />
                  </Field>
                  <Field label="Aktiv" hint="Deaktiv növ saytda göstərilmir.">
                    <div className="pt-1">
                      <Switch
                        checked={draft.isActive}
                        onCheckedChange={(isActive) => setDraft({ ...draft, isActive })}
                        className="data-[state=checked]:bg-[var(--primary)] data-[state=unchecked]:bg-gray-300 [&>span]:bg-white"
                      />
                    </div>
                  </Field>
                </div>

                <div className="inline-flex rounded-lg bg-[var(--muted)] p-1">
                  {BOOKING_LOCALES.map((l) => (
                    <button key={l} type="button" onClick={() => setLang(l)} className={cn("px-3 py-1.5 text-sm font-medium rounded-md", lang === l ? "bg-white shadow-sm text-black" : "text-gray-500")}>
                      {l.toUpperCase()}
                      {draft.locales[l].title.trim() && " ✓"}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-gray-500">Başlığı boş qoysanız, həmin dildə AZ mətn göstərilir. Heç bir dildə başlıq yoxdursa, növ saytda görünməz.</p>
                <TextField label="Başlıq" value={draft.locales[lang].title} onChange={(title) => setLocale({ title })} />
                <TextAreaField label="Təsvir (istəyə görə)" rows={3} value={draft.locales[lang].description} onChange={(description) => setLocale({ description })} />
                <TextAreaField label="Görüş yeri / link (təsdiqdən sonra göstərilir)" rows={2} value={draft.locales[lang].locationNote} onChange={(locationNote) => setLocale({ locationNote })} />
                <TextAreaField label="Təşəkkür mətni (istəyə görə)" rows={2} value={draft.locales[lang].successText} onChange={(successText) => setLocale({ successText })} />

                <div className="space-y-3 rounded-xl border border-[var(--border)] bg-gray-50 p-4">
                  <h3 className="text-sm font-bold">Rezervasiya formunun sahələri</h3>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Ziyarətçi saat seçəndən sonra bu formu doldurur. <b>Ad və E-poçt həmişə var</b> və məcburidir. Əlavə sahələri (məsələn &quot;Clinic name&quot;, &quot;Website&quot;) burada qurursunuz. Ziyarətçinin cavabları rezervasiyada görünür.
                  </p>
                  <RepeatableList<FormFieldDef>
                    key={lang}
                    items={draft.locales[lang].fields ?? []}
                    onChange={(fields) => setLocale({ fields })}
                    addLabel="Sahə əlavə et"
                    max={30}
                    itemTitle={(f, i) => `${f.label || `Sahə ${i + 1}`}${f.required ? " *" : ""}  ·  ${FIELD_TYPE_INFO[f.type].label}`}
                    createItem={() => createField("text")}
                    renderItem={(field, update) => <FieldEditor field={field} update={update} />}
                  />
                </div>
                {lang !== "az" && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setLocale({ ...draft.locales.az })}>
                    AZ-dan kopyala (mətnlər və sahələr)
                  </Button>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDraft(null)}>
                  Ləğv et
                </Button>
                <Button onClick={submit} disabled={saving}>
                  {saving && <Loader2 className="animate-spin" />} Saxla
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
