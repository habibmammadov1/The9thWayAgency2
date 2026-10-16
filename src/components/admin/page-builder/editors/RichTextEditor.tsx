"use client";

import React from "react";
import TipTapEditor from "@/components/admin/content/blogs/TipTapEditor";
import { Field, Segmented } from "../fields";
import type { EditorProps } from "./types";

export default function RichTextEditor({ props, onChange }: EditorProps<"richText">) {
  return (
    <div className="space-y-4">
      <Segmented
        label="Mətn eni"
        value={props.width}
        options={[
          { value: "narrow", label: "Dar (oxunaqlı)" },
          { value: "wide", label: "Geniş" },
        ]}
        onChange={(width) => onChange({ width })}
      />
      <Field label="Məzmun">
        <TipTapEditor content={props.html} onChange={(html) => onChange({ html })} />
      </Field>
    </div>
  );
}
