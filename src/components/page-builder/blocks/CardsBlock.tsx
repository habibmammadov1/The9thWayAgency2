"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { BlockIcon } from "@/lib/page-builder/icons";
import type { BlockProps, CardItem } from "@/lib/page-builder/types";
import { BlockSection, Paragraph, Reveal, SectionHeading, SmartLink, toneOf, type Tone } from "../BlockSection";

const DESKTOP_COLUMNS = { 2: "md:grid-cols-2", 3: "md:grid-cols-2 lg:grid-cols-3", 4: "md:grid-cols-2 lg:grid-cols-4" } as const;
const MOBILE_COLUMNS = { 1: "grid-cols-1", 2: "grid-cols-2" } as const;

function Card({ item, style, tone }: { item: CardItem; style: BlockProps<"cards">["style"]; tone: Tone }) {
  const dark = tone === "dark";
  const surface =
    style === "plain"
      ? ""
      : cn("rounded-[1.5rem] border", dark ? "bg-white/5 border-white/10" : "bg-white border-gray-200 shadow-sm");

  return (
    <div className={cn("h-full flex flex-col text-left", style !== "plain" && "overflow-hidden", surface)}>
      {style === "image" && (
        <div className="relative aspect-[4/3] bg-black/5">
          {item.imageUrl && <Image src={item.imageUrl} alt={item.title} fill unoptimized className="object-cover" />}
        </div>
      )}
      <div className={cn("flex flex-col flex-1", style !== "plain" && "p-6 md:p-8")}>
        {style === "stat" ? (
          <div className="text-5xl md:text-6xl font-display font-bold text-[#D9C2A0] mb-3">{item.value}</div>
        ) : (
          style !== "image" &&
          item.icon && (
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mb-6",
                dark ? "bg-white/10 text-[#D9C2A0]" : "bg-paper text-ink",
              )}
            >
              <BlockIcon name={item.icon} />
            </div>
          )
        )}
        {item.title && <h3 className="text-xl md:text-2xl font-bold mb-3">{item.title}</h3>}
        {item.text && (
          <p className={cn("leading-relaxed whitespace-pre-line", dark ? "text-gray-400" : "text-ink-light")}>{item.text}</p>
        )}
        {item.href && item.linkLabel && (
          <SmartLink
            href={item.href}
            className={cn(
              "group mt-auto pt-6 inline-flex items-center gap-2 font-bold uppercase tracking-widest text-xs",
              dark ? "text-[#D9C2A0]" : "text-ink",
            )}
          >
            {item.linkLabel}
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </SmartLink>
        )}
      </div>
    </div>
  );
}

export default function CardsBlock({ props }: { props: BlockProps<"cards"> }) {
  const tone = toneOf(props.settings);
  const center = props.settings.align === "center";

  return (
    <BlockSection settings={props.settings}>
      {(props.heading || props.text) && (
        <Reveal className={cn("max-w-3xl mb-12 md:mb-16", center && "mx-auto")}>
          <SectionHeading text={props.heading} className="mb-4" />
          <Paragraph text={props.text} tone={tone} />
        </Reveal>
      )}
      <div className={cn("grid gap-6", MOBILE_COLUMNS[props.mobileColumns], DESKTOP_COLUMNS[props.columns])}>
        {props.items.map((item, i) => (
          <Reveal key={item.id} delay={Math.min(i, 6) * 0.08} className="h-full">
            <Card item={item} style={props.style} tone={tone} />
          </Reveal>
        ))}
      </div>
    </BlockSection>
  );
}
