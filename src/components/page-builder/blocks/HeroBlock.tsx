"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { BlockProps } from "@/lib/page-builder/types";
import { BlockSection, ButtonRow, Overline, Paragraph, Reveal, toneOf } from "../BlockSection";

export default function HeroBlock({ props }: { props: BlockProps<"hero"> }) {
  const { settings, variant, overline, heading, text, imageUrl, buttons } = props;
  const center = settings.align === "center";

  // Full-bleed image: always light text over a darkened photo
  if (variant === "image" && imageUrl) {
    return (
      <BlockSection
        settings={{ ...settings, background: "dark" }}
        className="min-h-[70vh] flex items-center pt-36 md:pt-44"
      >
        <Image src={imageUrl} alt="" fill unoptimized priority className="object-cover -z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
        <Reveal className={cn("relative z-10 max-w-4xl", center && "mx-auto")}>
          <Overline text={overline} tone="dark" />
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold uppercase leading-[1.05] tracking-tight mb-6">
            {heading}
          </h1>
          <Paragraph text={text} tone="dark" className={cn("max-w-2xl text-gray-300", center && "mx-auto")} />
          <ButtonRow buttons={buttons} tone="dark" center={center} />
        </Reveal>
      </BlockSection>
    );
  }

  const tone = toneOf(settings);
  const textColumn = (
    <Reveal className={cn("max-w-4xl", center && variant !== "split" && "mx-auto")}>
      <Overline text={overline} tone={tone} />
      <h1 className="text-4xl md:text-6xl font-display font-bold uppercase leading-[1.05] tracking-tight mb-6">{heading}</h1>
      <Paragraph text={text} tone={tone} className={cn("max-w-2xl", center && variant !== "split" && "mx-auto")} />
      <ButtonRow buttons={buttons} tone={tone} center={center && variant !== "split"} />
    </Reveal>
  );

  if (variant === "split" && imageUrl) {
    return (
      <BlockSection settings={settings} className="pt-36 md:pt-44">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
          {textColumn}
          <Reveal delay={0.15} className="relative aspect-[4/3] rounded-[2rem] overflow-hidden">
            <Image src={imageUrl} alt="" fill unoptimized className="object-cover" />
          </Reveal>
        </div>
      </BlockSection>
    );
  }

  return (
    <BlockSection settings={settings} className="pt-36 md:pt-44">
      {textColumn}
    </BlockSection>
  );
}
