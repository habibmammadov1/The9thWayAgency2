"use client";

import React from "react";
import { ButtonsField, ImageField, Segmented, TextAreaField, TextField } from "../fields";
import type { EditorProps } from "./types";

export default function ImageTextEditor({ props, onChange }: EditorProps<"imageText">) {
  return (
    <div className="space-y-4">
      <ImageField label="Şəkil" value={props.imageUrl} onChange={(imageUrl) => onChange({ imageUrl })} />
      <TextField label="Şəklin təsviri (alt)" value={props.imageAlt} onChange={(imageAlt) => onChange({ imageAlt })} hint="Axtarış sistemləri və əlçatanlıq üçün" />
      <div className="flex flex-wrap gap-4">
        <Segmented
          label="Şəklin yeri"
          value={props.imagePosition}
          options={[
            { value: "left", label: "Solda" },
            { value: "right", label: "Sağda" },
          ]}
          onChange={(imagePosition) => onChange({ imagePosition })}
        />
        <Segmented
          label="Nisbət"
          value={props.ratio}
          options={[
            { value: "50-50", label: "50 / 50" },
            { value: "40-60", label: "40 / 60" },
          ]}
          onChange={(ratio) => onChange({ ratio })}
        />
      </div>
      <TextField label="Kiçik başlıq (overline)" value={props.overline} onChange={(overline) => onChange({ overline })} />
      <TextField label="Başlıq" value={props.heading} onChange={(heading) => onChange({ heading })} />
      <TextAreaField label="Mətn" rows={5} value={props.text} onChange={(text) => onChange({ text })} />
      <ButtonsField value={props.buttons} onChange={(buttons) => onChange({ buttons })} />
    </div>
  );
}
