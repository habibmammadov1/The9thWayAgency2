"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { useToast } from "@/components/admin/ui/use-toast";
import { getSettings, saveSettings } from "@/lib/booking/bookingApi";
import { timeZoneOptions } from "@/lib/booking/time";
import type { BookingSettings, TimeRange, WeeklyHours } from "@/lib/booking/types";
import { Field } from "@/components/admin/page-builder/fields";

// Display order: Monday first; keys are 0 = Sunday ... 6 = Saturday
const DAYS: { key: keyof WeeklyHours; label: string }[] = [
  { key: "1", label: "Bazar ertəsi" },
  { key: "2", label: "Çərşənbə axşamı" },
  { key: "3", label: "Çərşənbə" },
  { key: "4", label: "Cümə axşamı" },
  { key: "5", label: "Cümə" },
  { key: "6", label: "Şənbə" },
  { key: "0", label: "Bazar" },
];

const STEPS = [15, 30, 45, 60];
const selectCls = "h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm";

export function AvailabilityEditor() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<BookingSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getSettings()
      .then((s) => !cancelled && setSettings(s))
      .catch((err) => toast({ title: "Xəta", description: err instanceof Error ? err.message : "Yüklənmədi", variant: "destructive" }));
    return () => {
      cancelled = true;
    };
  }, [toast]);

  if (!settings) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-[var(--primary)]" size={28} />
      </div>
    );
  }

  const setDay = (key: keyof WeeklyHours, ranges: TimeRange[]) =>
    setSettings({ ...settings, weeklyHours: { ...settings.weeklyHours, [key]: ranges } });
  const num = (field: keyof BookingSettings, v: string) => setSettings({ ...settings, [field]: Math.max(0, parseInt(v, 10) || 0) });

  const save = async () => {
    setSaving(true);
    try {
      setSettings(await saveSettings(settings));
      toast({ title: "Saxlandı", description: "İş cədvəli yeniləndi." });
    } catch (err) {
      toast({ title: "Xəta", description: err instanceof Error ? err.message : "Saxlamaq alınmadı", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="rounded-xl border border-[var(--border)] bg-white p-5 space-y-4">
        <Field label="Biznes saat qurşağı" hint="İş saatları bu qurşaqda hesablanır. Ziyarətçi öz qurşağında görür.">
          <select className={selectCls} value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}>
            {timeZoneOptions(settings.timezone).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <div className="space-y-3">
          <h3 className="text-sm font-bold">Həftəlik iş saatları</h3>
          {DAYS.map(({ key, label }) => {
            const ranges = settings.weeklyHours[key];
            return (
              <div key={key} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 border-b last:border-b-0 pb-3">
                <div className="w-40 pt-2 text-sm font-medium">{label}</div>
                <div className="flex-1 space-y-2">
                  {ranges.length === 0 && <p className="pt-2 text-sm text-gray-400">Bağlı</p>}
                  {ranges.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input type="time" className="w-32" value={r.start} onChange={(e) => setDay(key, ranges.map((x, j) => (j === i ? { ...x, start: e.target.value } : x)))} />
                      <span>–</span>
                      <Input type="time" className="w-32" value={r.end} onChange={(e) => setDay(key, ranges.map((x, j) => (j === i ? { ...x, end: e.target.value } : x)))} />
                      <button type="button" title="Sil" onClick={() => setDay(key, ranges.filter((_, j) => j !== i))} className="p-2 rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                  {ranges.length < 4 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setDay(key, [...ranges, ranges.length ? { start: "14:00", end: "18:00" } : { start: "09:00", end: "18:00" }])}>
                      <Plus /> Saat aralığı əlavə et
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-white p-5 grid gap-4 sm:grid-cols-2">
        <Field label="Saatların addımı" hint="Saatlar nə qədər aralıqla təklif olunur (məs. 09:00, 09:30...).">
          <select className={selectCls} value={settings.slotStepMinutes} onChange={(e) => num("slotStepMinutes", e.target.value)}>
            {STEPS.map((s) => (
              <option key={s} value={s}>
                {s} dəqiqə
              </option>
            ))}
          </select>
        </Field>
        <Field label="Görüşlər arası fasilə (dəq)" hint="Hər görüşdən əvvəl və sonra boş qalan vaxt.">
          <Input type="number" min={0} max={240} value={settings.bufferMinutes} onChange={(e) => num("bufferMinutes", e.target.value)} />
        </Field>
        <Field label="Minimum xəbərdarlıq (saat)" hint="Ziyarətçi ən tez neçə saat sonraya rezerv edə bilər.">
          <Input type="number" min={0} max={720} value={settings.minNoticeHours} onChange={(e) => num("minNoticeHours", e.target.value)} />
        </Field>
        <Field label="Ən çox neçə gün irəli" hint="Təqvimdə bugündən neçə gün sonraya qədər rezerv olunur.">
          <Input type="number" min={1} max={365} value={settings.maxDaysAhead} onChange={(e) => num("maxDaysAhead", e.target.value)} />
        </Field>
      </div>

      <Button onClick={save} disabled={saving}>
        {saving && <Loader2 className="animate-spin" />} Yadda saxla
      </Button>
    </div>
  );
}
