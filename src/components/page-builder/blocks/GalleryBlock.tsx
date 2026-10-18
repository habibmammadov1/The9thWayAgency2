"use client";

import React, { useCallback } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BlockProps } from "@/lib/page-builder/types";
import { BlockSection, Reveal, SectionHeading } from "../BlockSection";

const GRID_COLUMNS = { 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-2 lg:grid-cols-4" } as const;
const SLIDE_WIDTH = { 2: "md:flex-[0_0_50%]", 3: "md:flex-[0_0_33.333%]", 4: "md:flex-[0_0_25%]" } as const;

export default function GalleryBlock({ props }: { props: BlockProps<"gallery"> }) {
  const images = props.images.filter((img) => img.url);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > props.columns, align: "start" });
  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <BlockSection settings={props.settings}>
      {props.heading && (
        <Reveal className={cn("mb-12", props.settings.align === "center" && "mx-auto max-w-3xl")}>
          <SectionHeading text={props.heading} />
        </Reveal>
      )}

      {props.layout === "slider" ? (
        <div>
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4">
              {images.map((img) => (
                <div key={img.id} className={cn("min-w-0 pl-4 flex-[0_0_85%]", SLIDE_WIDTH[props.columns])}>
                  <div className="relative aspect-[4/3] rounded-[1.5rem] overflow-hidden bg-black/5">
                    <Image src={img.url} alt={img.alt} fill unoptimized className="object-cover" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 mt-8 justify-end">
              <button onClick={prev} aria-label="Previous" className="w-12 h-12 rounded-full border border-current/20 flex items-center justify-center hover:bg-[#D9C2A0] hover:text-black hover:border-[#D9C2A0] transition-colors">
                <ArrowLeft size={18} />
              </button>
              <button onClick={next} aria-label="Next" className="w-12 h-12 rounded-full border border-current/20 flex items-center justify-center hover:bg-[#D9C2A0] hover:text-black hover:border-[#D9C2A0] transition-colors">
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className={cn("grid grid-cols-1 gap-4", GRID_COLUMNS[props.columns])}>
          {images.map((img, i) => (
            <Reveal key={img.id} delay={Math.min(i, 6) * 0.06}>
              <div className="relative aspect-[4/3] rounded-[1.5rem] overflow-hidden bg-black/5">
                <Image src={img.url} alt={img.alt} fill unoptimized className="object-cover hover:scale-105 transition-transform duration-700" />
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </BlockSection>
  );
}
