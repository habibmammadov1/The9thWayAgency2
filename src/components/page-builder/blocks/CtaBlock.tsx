"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { BlockProps } from "@/lib/page-builder/types";
import { BlockSection, ButtonLink, Paragraph, Reveal, toneOf } from "../BlockSection";

export default function CtaBlock({ props }: { props: BlockProps<"cta"> }) {
  const tone = toneOf(props.settings);
  const center = props.settings.align === "center";

  return (
    <BlockSection settings={props.settings}>
      {tone === "dark" && (
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute -top-1/2 -left-1/4 w-[1000px] h-[1000px] bg-[#D9C2A0]/20 rounded-full blur-[120px]" />
        </div>
      )}
      <Reveal className={cn("relative z-10 flex flex-col", center ? "items-center" : "items-start")}>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold uppercase leading-[1.1] tracking-tight max-w-4xl mb-6">
          {props.heading}
        </h2>
        <Paragraph text={props.text} tone={tone} className="max-w-2xl mb-10" />
        <ButtonLink button={props.button} tone={tone} />
      </Reveal>
    </BlockSection>
  );
}
