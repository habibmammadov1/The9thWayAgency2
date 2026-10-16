"use client";

import React from "react";
import { ButtonFields, Field, TextAreaField, TextField } from "../fields";
import type { EditorProps } from "./types";

export default function CtaEditor({ props, onChange }: EditorProps<"cta">) {
  return (
    <div className="space-y-4">
      <TextField label="Başlıq" value={props.heading} onChange={(heading) => onChange({ heading })} />
      <TextAreaField label="Mətn" rows={2} value={props.text} onChange={(text) => onChange({ text })} />
      <Field label="Düymə">
        <ButtonFields value={props.button} onChange={(button) => onChange({ button })} />
      </Field>
    </div>
  );
}
