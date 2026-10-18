"use client";

import React from "react";
import type { BlockProps, BlockType, PageBlock } from "@/lib/page-builder/types";
import HeroEditor from "./HeroEditor";
import RichTextEditor from "./RichTextEditor";
import ImageTextEditor from "./ImageTextEditor";
import CardsEditor from "./CardsEditor";
import GalleryEditor from "./GalleryEditor";
import FaqEditor from "./FaqEditor";
import CtaEditor from "./CtaEditor";
import FormBlockEditor from "./FormBlockEditor";
import { ClientLogosEditor, ContactFormEditor, TeamMembersEditor, TestimonialsEditor } from "./SectionEditors";

type AnyPatch = Partial<BlockProps<BlockType>>;

export function BlockEditor({ block, onChange }: { block: PageBlock; onChange: (patch: AnyPatch) => void }) {
  // Each case narrows the props to the block's own type
  const p = block.props as never;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = onChange as (patch: any) => void;
  switch (block.type) {
    case "hero":
      return <HeroEditor props={p} onChange={set} />;
    case "richText":
      return <RichTextEditor props={p} onChange={set} />;
    case "imageText":
      return <ImageTextEditor props={p} onChange={set} />;
    case "cards":
      return <CardsEditor props={p} onChange={set} />;
    case "gallery":
      return <GalleryEditor props={p} onChange={set} />;
    case "faq":
      return <FaqEditor props={p} onChange={set} />;
    case "cta":
      return <CtaEditor props={p} onChange={set} />;
    case "testimonials":
      return <TestimonialsEditor props={p} onChange={set} />;
    case "teamMembers":
      return <TeamMembersEditor props={p} onChange={set} />;
    case "clientLogos":
      return <ClientLogosEditor />;
    case "contactForm":
      return <ContactFormEditor />;
    case "form":
      return <FormBlockEditor props={p} onChange={set} />;
    default:
      return <p className="text-xs text-red-600">Naməlum blok növü</p>;
  }
}
