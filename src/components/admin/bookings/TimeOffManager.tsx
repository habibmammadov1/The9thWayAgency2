"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { useToast } from "@/components/admin/ui/use-toast";
import { createTimeOff, deleteTimeOff, getSettings, listTimeOff } from "@/lib/booking/bookingApi";
import type { TimeOffItem } from "@/lib/booking/types";
import { Field } from "@/components/admin/page-builder/fields";
import { formatDateTime } from "./format";

export function TimeOffManager() {
  const { toast } = useToast();
  const [items, setItems] = useState<TimeOffItem[]>([]);
  const [zone, setZone] = useState("Asia/Baku");
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({ startsLocal: "", endsLocal: "", reason: "" });
  const [saving, setSaving] = useState(false);

  const fail = (err: unknown, fallback: string) =>
    toast({ title: "Xəta", description: err instanceof Error ? err.message : fallback, variant: "destructive" });

  useEffect(() => {
    let cancelled = false;
    Promise.all([listTimeOff(), getSettings()])
      .then(([list, settings]) => {
        if (cancelled) return;
        setItems(list);
        setZone(settings.timezone);
      })
      .catch((err) => toast({ title: "Xəta", description: err instanceof Error ? err.message : "Yüklənmədi", variant: "destructive" }))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.startsLocal || !form.endsLocal) return fail(new Error("Başlanğıc və son vaxtı seçin"), "");
    setSaving(true);
    try {
      await createTimeOff({ ...form, reason: form.reason.trim() });
      setForm({ startsLocal: "", endsLocal: "", reason: "" });
      setItems(await listTimeOff());
      toast({ title: "Bağlı vaxt əlavə olundu" });
    } catch (err) {
      fail(err, "Əlavə etmək alınmadı");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteTimeOff(id);
      setItems((list) => list.filter((i) => i.id !== id));
    } catch (err) {
      fail(err, "Silmək alınmadı");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <form onSubmit={add} className="rounded-xl border border-[var(--border)] bg-white p-5 space-y-4">
        <p className="text-sm text-gray-600">
          Tətil, məzuniyyət və ya məşğul olduğunuz vaxtı bağlayın: bu aralıqda saytda boş saat görünməyəcək. Vaxt biznes saat qurşağındadır: <b>{zone}</b>.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Başlanğıc">
            <Input type="datetime-local" value={form.startsLocal} onChange={(e) => setForm({ ...form, startsLocal: e.target.value })} />
          </Field>
          <Field label="Son">
            <Input type="datetime-local" value={form.endsLocal} onChange={(e) => setForm({ ...form, endsLocal: e.target.value })} />
          </Field>
        </div>
        <Field label="Səbəb (istəyə görə, yalnız sizə görünür)">
          <Input value={form.reason} maxLength={200} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        </Field>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="animate-spin" /> : <Plus />} Bağla
        </Button>
      </form>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-[var(--primary)]" size={28} />
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-500">Bağlı vaxt yoxdur.</p>
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-white overflow-hidden">
          {items.map((i) => (
            <div key={i.id} className="flex items-center justify-between gap-3 px-5 py-3 border-b last:border-b-0 text-sm">
              <div>
                <div className="font-semibold">
                  {formatDateTime(i.startsAt, zone)} → {formatDateTime(i.endsAt, zone)}
                </div>
                {i.reason && <div className="text-gray-500">{i.reason}</div>}
              </div>
              <button type="button" title="Sil" onClick={() => remove(i.id)} className="p-2 rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
