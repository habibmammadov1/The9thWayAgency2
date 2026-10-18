"use client";

import React, { useEffect, useRef, useState } from "react";
import PageRenderer, { type RenderableBlock } from "@/components/page-builder/PageRenderer";
import { loadSectionData, type SectionData } from "@/lib/page-builder/sectionData";
import { PREVIEW_MESSAGE, PREVIEW_READY } from "@/lib/page-builder/preview";

export default function PreviewClient({ locale }: { locale: string }) {
  const [blocks, setBlocks] = useState<RenderableBlock[] | null>(null);
  const [slug, setSlug] = useState("preview");
  const [sectionData, setSectionData] = useState<SectionData>({});
  const loadedTypes = useRef<string>("");

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      // Only the admin editor on this same origin may drive the preview
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data || data.type !== PREVIEW_MESSAGE || !Array.isArray(data.blocks)) return;
      setBlocks(data.blocks);
      if (typeof data.slug === "string" && data.slug) setSlug(data.slug);
    }
    window.addEventListener("message", onMessage);
    // Tell the editor we're ready so it sends the current state
    window.parent?.postMessage({ type: PREVIEW_READY }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Load data for "existing section" blocks only when the set of block types changes
  useEffect(() => {
    if (!blocks) return;
    const key = blocks
      .map((b) =>
        b.type === "teamMembers" ? `${b.type}:${b.props?.count}` : b.type === "form" ? `${b.type}:${b.props?.formId}` : b.type,
      )
      .sort()
      .join(",");
    if (key === loadedTypes.current) return;
    loadedTypes.current = key;
    loadSectionData(locale, blocks).then(setSectionData);
  }, [blocks, locale]);

  if (!blocks) {
    return <main className="min-h-screen bg-paper" />;
  }

  if (blocks.length === 0) {
    return (
      <main className="min-h-screen bg-paper flex items-center justify-center text-gray-500 pt-28">
        Səhifədə hələ blok yoxdur
      </main>
    );
  }

  return <PageRenderer blocks={blocks} sectionData={sectionData} slug={slug} locale={locale} isPreview />;
}
