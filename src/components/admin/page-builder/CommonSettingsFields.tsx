"use client";

import React from "react";
import type { BlockSettings } from "@/lib/page-builder/types";
import { Segmented, TextField } from "./fields";

export function CommonSettingsFields({ value, onChange }: { value: BlockSettings; onChange: (v: BlockSettings) => void }) {
  return (
    <div className="space-y-3 rounded-lg bg-gray-50 border border-[var(--border)] p-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Görünüş ayarları</p>
      <div className="flex flex-wrap gap-4">
        <Segmented
          label="Fon"
          value={value.background}
          options={[
            { value: "dark", label: "Tünd" },
            { value: "paper", label: "Açıq" },
            { value: "white", label: "Ağ" },
            { value: "accent", label: "Qızılı" },
          ]}
          onChange={(background) => onChange({ ...value, background })}
        />
        <Segmented
          label="Boşluq"
          value={value.spacing}
          options={[
            { value: "sm", label: "S" },
            { value: "md", label: "M" },
            { value: "lg", label: "L" },
          ]}
          onChange={(spacing) => onChange({ ...value, spacing })}
        />
        <Segmented
          label="Hizalama"
          value={value.align}
          options={[
            { value: "left", label: "Sol" },
            { value: "center", label: "Mərkəz" },
          ]}
          onChange={(align) => onChange({ ...value, align })}
        />
      </div>
      <TextField
        label="Anchor id (istəyə görə)"
        value={value.anchorId}
        onChange={(anchorId) => onChange({ ...value, anchorId: anchorId.replace(/[^a-zA-Z0-9_-]/g, "") })}
        placeholder="meselen: qiymetler"
        hint="Linklərdə #qiymetler yazaraq bu bloka keçid etmək olar."
      />
    </div>
  );
}
