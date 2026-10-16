"use client";

import React from "react";
import { newId } from "@/lib/page-builder/registry";
import type { CardItem } from "@/lib/page-builder/types";
import { RepeatableList } from "../RepeatableList";
import { Field, IconPicker, ImageField, Segmented, TextAreaField, TextField } from "../fields";
import type { EditorProps } from "./types";

export default function CardsEditor({ props, onChange }: EditorProps<"cards">) {
  return (
    <div className="space-y-4">
      <TextField label="Başlıq" value={props.heading} onChange={(heading) => onChange({ heading })} />
      <TextAreaField label="Alt mətn" rows={2} value={props.text} onChange={(text) => onChange({ text })} />
      <Segmented
        label="Kart stili"
        value={props.style}
        options={[
          { value: "plain", label: "Sadə" },
          { value: "bordered", label: "Çərçivəli" },
          { value: "image", label: "Şəkilli" },
          { value: "stat", label: "Rəqəm" },
        ]}
        onChange={(style) => onChange({ style })}
      />
      <div className="flex flex-wrap gap-4">
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
        <Segmented
          label="Mobildə"
          value={props.mobileColumns}
          options={[
            { value: 1, label: "1" },
            { value: 2, label: "2" },
          ]}
          onChange={(mobileColumns) => onChange({ mobileColumns })}
        />
      </div>
      <Field label={`Kartlar (${props.items.length})`}>
        <RepeatableList<CardItem>
          items={props.items}
          onChange={(items) => onChange({ items })}
          addLabel="Kart əlavə et"
          itemTitle={(item, i) => item.title || item.value || `Kart ${i + 1}`}
          createItem={() => ({ id: newId(), icon: "Star", imageUrl: null, value: "", title: "Yeni kart", text: "", href: "", linkLabel: "" })}
          renderItem={(item, update) => (
            <>
              {props.style === "stat" && <TextField label="Rəqəm" value={item.value} onChange={(value) => update({ value })} placeholder="120+" />}
              {props.style === "image" && <ImageField label="Şəkil" value={item.imageUrl} onChange={(imageUrl) => update({ imageUrl })} />}
              {(props.style === "plain" || props.style === "bordered") && <IconPicker value={item.icon} onChange={(icon) => update({ icon })} />}
              <TextField label="Başlıq" value={item.title} onChange={(title) => update({ title })} />
              <TextAreaField label="Mətn" value={item.text} onChange={(text) => update({ text })} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextField label="Link (istəyə görə)" value={item.href} onChange={(href) => update({ href })} placeholder="/services" />
                <TextField label="Link mətni" value={item.linkLabel} onChange={(linkLabel) => update({ linkLabel })} placeholder="Ətraflı" />
              </div>
            </>
          )}
        />
      </Field>
    </div>
  );
}
