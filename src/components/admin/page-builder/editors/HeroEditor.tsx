"use client";

import React from "react";
import { ButtonsField, ImageField, Segmented, TextAreaField, TextField } from "../fields";
import type { EditorProps } from "./types";

export default function HeroEditor({ props, onChange }: EditorProps<"hero">) {
  return (
    <div className="space-y-4">
      <Segmented
        label="Görünüş"
        value={props.variant}
        options={[
          { value: "image", label: "Tam şəkil" },
          { value: "split", label: "Bölünmüş" },
          { value: "text", label: "Yalnız mətn" },
        ]}
        onChange={(variant) => onChange({ variant })}
      />
      <TextField label="Kiçik başlıq (overline)" value={props.overline} onChange={(overline) => onChange({ overline })} />
      <TextField label="Başlıq" value={props.heading} onChange={(heading) => onChange({ heading })} />
      <TextAreaField label="Mətn" value={props.text} onChange={(text) => onChange({ text })} />
      {props.variant !== "text" && (
        <ImageField
          label={props.variant === "image" ? "Fon şəkli" : "Şəkil"}
          value={props.imageUrl}
          onChange={(imageUrl) => onChange({ imageUrl })}
          hint={props.variant === "image" ? "Tam şəkil görünüşündə mətn həmişə ağ olur." : undefined}
        />
      )}
      <ButtonsField value={props.buttons} onChange={(buttons) => onChange({ buttons })} />
    </div>
  );
}
