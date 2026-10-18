"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { BlockProps } from "@/lib/page-builder/types";
import { BlockSection, ButtonRow, Overline, Paragraph, Reveal, SectionHeading, toneOf } from "../BlockSection";

export default function ImageTextBlock({ props }: { props: BlockProps<"imageText"> }) {
  const { settings, imageUrl, imageAlt, overline, heading, text, imagePosition, ratio, buttons } = props;
  const tone = toneOf(settings);
  const imageRight = imagePosition === "right";

  return (
    <BlockSection settings={settings} containerClassName="text-left">
      <div className={cn("grid grid-cols-1 gap-12 lg:gap-16 items-center", ratio === "50-50" ? "lg:grid-cols-2" : "lg:grid-cols-5")}>
        <Reveal
          className={cn(
            "relative aspect-[4/3] rounded-[2rem] overflow-hidden bg-black/5",
            ratio === "40-60" && "lg:col-span-2",
            imageRight && "lg:order-2",
          )}
        >
          {imageUrl && <Image src={imageUrl} alt={imageAlt} fill unoptimized className="object-cover" />}
        </Reveal>
        <Reveal delay={0.1} className={cn(ratio === "40-60" && "lg:col-span-3", imageRight && "lg:order-1")}>
          <Overline text={overline} tone={tone} />
          <SectionHeading text={heading} className="mb-6" />
          <Paragraph text={text} tone={tone} />
          <ButtonRow buttons={buttons} tone={tone} />
        </Reveal>
      </div>
    </BlockSection>
  );
}
