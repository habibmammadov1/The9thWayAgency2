"use client";

import React from "react";
import { cn } from "@/lib/utils";
import BookingWidget from "@/components/booking/BookingWidget";
import type { PublicBookingType } from "@/lib/booking/types";
import type { BlockProps } from "@/lib/page-builder/types";
import { BlockSection, Paragraph, Reveal, SectionHeading, toneOf } from "../BlockSection";

interface BookingBlockProps {
  props: BlockProps<"booking">;
  types: PublicBookingType[] | undefined;
  locale: string;
  isPreview?: boolean;
}

export default function BookingBlock({ props, types, locale, isPreview }: BookingBlockProps) {
  // No active meeting type in this language: show nothing instead of an empty widget
  const available = props.typeId ? (types ?? []).filter((t) => t.id === props.typeId) : (types ?? []);
  if (available.length === 0) return null;

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
      <Reveal className="max-w-5xl mx-auto">
        <BookingWidget types={available} typeId={props.typeId || undefined} locale={locale} isPreview={isPreview} />
      </Reveal>
    </BlockSection>
  );
}
