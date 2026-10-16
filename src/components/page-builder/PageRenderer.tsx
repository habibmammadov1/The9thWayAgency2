"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { isBlockType, withDefaults } from "@/lib/page-builder/registry";
import type { SectionData } from "@/lib/page-builder/sectionData";
import Testimonials from "@/components/Testimonials";
import ClientLogosMarquee from "@/components/ClientLogosMarquee";
import TeamMembers from "@/components/TeamMembers";
import ContactSection from "@/components/ContactSection";
import HeroBlock from "./blocks/HeroBlock";
import RichTextBlock from "./blocks/RichTextBlock";
import ImageTextBlock from "./blocks/ImageTextBlock";
import CardsBlock from "./blocks/CardsBlock";
import GalleryBlock from "./blocks/GalleryBlock";
import FaqBlock from "./blocks/FaqBlock";
import CtaBlock from "./blocks/CtaBlock";

export interface RenderableBlock {
  id: string;
  type: string;
  props: Record<string, unknown>;
}

interface PageRendererProps {
  blocks: RenderableBlock[];
  sectionData: SectionData;
  /** Used as the contact form's sourcePage so submissions show which page they came from. */
  slug: string;
}

function renderBlock(block: RenderableBlock, sectionData: SectionData, slug: string): React.ReactNode {
  // Unknown types (e.g. from a newer API version) are skipped instead of breaking the page
  if (!isBlockType(block.type)) return null;

  switch (block.type) {
    case "hero":
      return <HeroBlock props={withDefaults("hero", block.props)} />;
    case "richText":
      return <RichTextBlock props={withDefaults("richText", block.props)} />;
    case "imageText":
      return <ImageTextBlock props={withDefaults("imageText", block.props)} />;
    case "cards":
      return <CardsBlock props={withDefaults("cards", block.props)} />;
    case "gallery":
      return <GalleryBlock props={withDefaults("gallery", block.props)} />;
    case "faq":
      return <FaqBlock props={withDefaults("faq", block.props)} />;
    case "cta":
      return <CtaBlock props={withDefaults("cta", block.props)} />;
    case "testimonials": {
      const props = withDefaults("testimonials", block.props);
      const t = sectionData.testimonials;
      return (
        <Testimonials
          headingOverride={props.heading || undefined}
          initialIntro={t?.intro as never}
          initialHighlight={t?.highlight as never}
          initialList={t?.list as never}
        />
      );
    }
    case "clientLogos":
      return <ClientLogosMarquee logos={(sectionData.clientLogos as never[]) ?? undefined} />;
    case "teamMembers": {
      const props = withDefaults("teamMembers", block.props);
      const team = sectionData.team;
      return (
        <TeamMembers
          teaserSettings={{
            heading: props.heading || team?.teaser?.heading || "",
            viewAllLabel: team?.teaser?.viewAllLabel || "",
            displayCount: props.count,
          }}
          members={(team?.members ?? []).slice(0, props.count) as never}
        />
      );
    }
    case "contactForm":
      return <ContactSection info={(sectionData.contactInfo as never) ?? null} sourcePage={slug} />;
  }
}

export default function PageRenderer({ blocks, sectionData, slug }: PageRendererProps) {
  // The fixed navbar overlaps the top of the page; heroes already reserve space for it.
  const needsTopSpace = blocks.length === 0 || blocks[0].type !== "hero";

  return (
    <main className={cn("w-full flex flex-col min-h-screen bg-paper", needsTopSpace && "pt-28 md:pt-32")}>
      {blocks.map((block) => (
        <React.Fragment key={block.id}>{renderBlock(block, sectionData, slug)}</React.Fragment>
      ))}
    </main>
  );
}
