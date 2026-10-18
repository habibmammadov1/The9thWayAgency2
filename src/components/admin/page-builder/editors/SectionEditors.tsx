"use client";

import React from "react";
import { Info } from "lucide-react";
import { Input } from "@/components/admin/ui/input";
import { Field, TextField } from "../fields";
import type { EditorProps } from "./types";

// Editors for blocks that embed an existing site section; their content is managed elsewhere in the admin.

function SourceNote({ text }: { text: string }) {
  return (
    <div className="flex gap-2 rounded-lg bg-blue-50 border border-blue-100 p-3 text-xs text-blue-900">
      <Info size={14} className="shrink-0 mt-0.5" />
      <span>{text}</span>
    </div>
  );
}

export function TestimonialsEditor({ props, onChange }: EditorProps<"testimonials">) {
  return (
    <div className="space-y-4">
      <SourceNote text="Rəylərin özü admin → Rəylər bölməsindən gəlir. Orada dəyişəndə bu səhifədə də yenilənir." />
      <TextField label="Başlıq (boş qalsa, standart başlıq)" value={props.heading} onChange={(heading) => onChange({ heading })} />
    </div>
  );
}

export function TeamMembersEditor({ props, onChange }: EditorProps<"teamMembers">) {
  return (
    <div className="space-y-4">
      <SourceNote text="Komanda üzvləri admin → Komanda bölməsindən gəlir." />
      <TextField label="Başlıq (boş qalsa, standart başlıq)" value={props.heading} onChange={(heading) => onChange({ heading })} />
      <Field label="Neçə üzv göstərilsin">
        <Input
          type="number"
          min={1}
          max={24}
          value={props.count}
          onChange={(e) => onChange({ count: Math.min(24, Math.max(1, Number(e.target.value) || 1)) })}
          className="w-24"
        />
      </Field>
    </div>
  );
}

export function ClientLogosEditor() {
  return <SourceNote text="Loqolar admin → Müştəri Loqoları bölməsindən gəlir. Bu blokun ayrıca ayarı yoxdur." />;
}

export function ContactFormEditor() {
  return (
    <SourceNote text="Əlaqə forması və ünvan/telefon admin → Əlaqə bölməsindən gəlir. Bu formadan gələn müraciətlər Müraciətlər bölməsində səhifənin slug-u ilə görünəcək." />
  );
}
