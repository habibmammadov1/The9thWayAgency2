"use client";

import React from "react";
import { newId } from "@/lib/page-builder/registry";
import type { GalleryImage } from "@/lib/page-builder/types";
import { RepeatableList } from "../RepeatableList";
import { Field, ImageField, Segmented, TextField } from "../fields";
import type { EditorProps } from "./types";

export default function GalleryEditor({ props, onChange }: EditorProps<"gallery">) {
  return (
    <div className="space-y-4">
      <TextField label="Başlıq (istəyə görə)" value={props.heading} onChange={(heading) => onChange({ heading })} />
      <div className="flex flex-wrap gap-4">
        <Segmented
          label="Görünüş"
          value={props.layout}
          options={[
            { value: "grid", label: "Grid" },
            { value: "slider", label: "Slider" },
          ]}
          onChange={(layout) => onChange({ layout })}
        />
        <Segmented
          label="Sütun sayı"
          value={props.columns}
          options={[
            { value: 2, label: "2" },
            { value: 3, label: "3" },
            { value: 4, label: "4" },
          ]}
          onChange={(columns) => onChange({ columns })}
        />
      </div>
      <Field label={`Şəkillər (${props.images.length})`}>
        <RepeatableList<GalleryImage>
          items={props.images}
          onChange={(images) => onChange({ images })}
          addLabel="Şəkil əlavə et"
          max={48}
          itemTitle={(img, i) => img.alt || (img.url ? `Şəkil ${i + 1}` : `Şəkil ${i + 1} (boş)`)}
          createItem={() => ({ id: newId(), url: "", alt: "" })}
          renderItem={(img, update) => (
            <>
              <ImageField label="Şəkil" value={img.url} onChange={(url) => update({ url: url ?? "" })} />
              <TextField label="Təsvir (alt)" value={img.alt} onChange={(alt) => update({ alt })} />
            </>
          )}
        />
      </Field>
    </div>
  );
}
