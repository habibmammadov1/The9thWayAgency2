"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { BlockProps } from "@/lib/page-builder/types";
import { BlockSection, toneOf } from "../BlockSection";

// HTML is sanitised by the API on save (server/src/lib/pageBlocks.ts).
export default function RichTextBlock({ props }: { props: BlockProps<"richText"> }) {
  const tone = toneOf(props.settings);
  return (
    <BlockSection settings={props.settings}>
      <div
        className={cn(
          "mx-auto text-lg leading-relaxed",
          props.width === "narrow" ? "max-w-3xl" : "max-w-5xl",
          props.settings.align === "center" ? "text-center" : "text-left",
          tone === "dark" ? "text-gray-300" : "text-ink-light",
          "[&_h2]:font-display [&_h2]:font-bold [&_h2]:text-3xl [&_h2]:md:text-4xl [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:leading-tight",
          "[&_h3]:font-bold [&_h3]:text-2xl [&_h3]:mt-8 [&_h3]:mb-3",
          tone === "dark" ? "[&_h2]:text-white [&_h3]:text-white" : "[&_h2]:text-ink [&_h3]:text-ink",
          "[&_p]:mb-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-5 [&_li]:mb-1",
          "[&_a]:underline [&_a]:underline-offset-4 [&_a]:text-[#A38B68]",
          "[&_blockquote]:border-l-4 [&_blockquote]:border-[#D9C2A0] [&_blockquote]:pl-6 [&_blockquote]:py-2 [&_blockquote]:my-8 [&_blockquote]:italic [&_blockquote]:text-xl",
          "[&_img]:rounded-2xl [&_img]:my-8 [&_img]:mx-auto [&_img]:max-h-[500px] [&_img]:object-cover",
          "[&_hr]:my-10 [&_hr]:border-current/20",
          "[&>*:first-child]:mt-0",
        )}
        dangerouslySetInnerHTML={{ __html: props.html }}
      />
    </BlockSection>
  );
}
