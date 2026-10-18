"use client";

import React from "react";
import { cn } from "@/lib/utils";
import FormView from "@/components/forms/FormView";
import type { PublicForm } from "@/lib/forms/types";
import type { BlockProps } from "@/lib/page-builder/types";
import { BlockSection, Paragraph, Reveal, SectionHeading, toneOf } from "../BlockSection";

interface FormBlockProps {
  props: BlockProps<"form">;
  form: PublicForm | null | undefined;
  locale: string;
  slug: string;
  isPreview?: boolean;
}

export default function FormBlock({ props, form, locale, slug, isPreview }: FormBlockProps) {
  // Deleted, deactivated or not available in this language: show nothing instead of breaking the page
  if (!form || form.fields.length === 0) return null;

  const tone = toneOf(props.settings);
  const center = props.settings.align === "center";

  return (
    <BlockSection settings={props.settings}>
      {(props.heading || props.text) && (
        <Reveal className={cn("max-w-3xl mb-10", center && "mx-auto")}>
          <SectionHeading text={props.heading} className="mb-4" />
          <Paragraph text={props.text} tone={tone} />
        </Reveal>
      )}
      <Reveal className="max-w-2xl mx-auto rounded-[2rem] bg-white p-8 md:p-12 shadow-sm border border-gray-100">
        <FormView formId={form.id} form={form} locale={locale} sourcePage={slug} isPreview={isPreview} />
      </Reveal>
    </BlockSection>
  );
}
