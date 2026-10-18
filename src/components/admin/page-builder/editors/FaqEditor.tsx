"use client";

import React from "react";
import { newId } from "@/lib/page-builder/registry";
import type { FaqItem } from "@/lib/page-builder/types";
import { RepeatableList } from "../RepeatableList";
import { Field, TextAreaField, TextField } from "../fields";
import type { EditorProps } from "./types";

export default function FaqEditor({ props, onChange }: EditorProps<"faq">) {
  return (
    <div className="space-y-4">
      <TextField label="Başlıq" value={props.heading} onChange={(heading) => onChange({ heading })} />
      <Field label={`Suallar (${props.items.length})`}>
        <RepeatableList<FaqItem>
          items={props.items}
          onChange={(items) => onChange({ items })}
          addLabel="Sual əlavə et"
          max={50}
          itemTitle={(item, i) => item.question || `Sual ${i + 1}`}
          createItem={() => ({ id: newId(), question: "Yeni sual?", answer: "" })}
          renderItem={(item, update) => (
            <>
              <TextField label="Sual" value={item.question} onChange={(question) => update({ question })} />
              <TextAreaField label="Cavab" rows={4} value={item.answer} onChange={(answer) => update({ answer })} />
            </>
          )}
        />
      </Field>
    </div>
  );
}
