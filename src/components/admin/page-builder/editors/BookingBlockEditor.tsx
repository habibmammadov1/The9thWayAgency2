"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { listTypes } from "@/lib/booking/bookingApi";
import type { AdminBookingType } from "@/lib/booking/types";
import { Field, TextAreaField, TextField } from "../fields";
import type { EditorProps } from "./types";

export default function BookingBlockEditor({ props, onChange }: EditorProps<"booking">) {
  const [types, setTypes] = useState<AdminBookingType[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listTypes()
      .then((data) => !cancelled && setTypes(data))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = types?.find((t) => t.id === props.typeId);
  const missing = Boolean(types && props.typeId && !selected);

  return (
    <div className="space-y-4">
      <Field label="Görüş növü" hint="Boş buraxsanız, ziyarətçi aktiv görüş növlərindən birini özü seçir. Növləri Admin → Rezervasiyalar bölməsində qurursunuz. Başlığı yazılmayan dildə AZ mətn göstərilir.">
        <select
          value={props.typeId}
          disabled={!types}
          onChange={(e) => onChange({ typeId: e.target.value })}
          className="h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm"
        >
          <option value="">{types ? "— Ziyarətçi seçsin —" : failed ? "Növlər yüklənmədi" : "Yüklənir..."}</option>
          {missing && <option value={props.typeId}>— Silinib, başqa növ seçin —</option>}
          {types?.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.durationMinutes} dəq){!t.isActive ? " (deaktiv)" : ""}
            </option>
          ))}
        </select>
      </Field>

      {selected && !selected.isActive && (
        <p className="flex gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" /> Bu görüş növü deaktivdir, saytda göstərilməyəcək.
        </p>
      )}
      {missing && (
        <p className="flex gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-800">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" /> Seçilmiş görüş növü tapılmadı. Başqa növ seçin.
        </p>
      )}
      {types && types.length === 0 && (
        <p className="text-xs text-[var(--muted-foreground)]">
          Hələ görüş növü yoxdur.{" "}
          <Link href="/admin/bookings" target="_blank" className="inline-flex items-center gap-1 font-semibold text-[#A38B68] hover:underline">
            Admin → Rezervasiyalar <ExternalLink size={12} />
          </Link>{" "}
          bölməsində yaradın.
        </p>
      )}

      <TextField label="Başlıq (istəyə görə)" value={props.heading} onChange={(heading) => onChange({ heading })} />
      <TextAreaField label="Alt mətn (istəyə görə)" rows={2} value={props.text} onChange={(text) => onChange({ text })} />
    </div>
  );
}
