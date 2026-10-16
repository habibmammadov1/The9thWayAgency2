"use client";

import React, { useState } from "react";
import {
  AlignLeft,
  Columns2,
  HelpCircle,
  Images,
  LayoutGrid,
  Mail,
  Megaphone,
  MessageSquare,
  PanelTop,
  Users,
  BadgeCheck,
  type LucideIcon,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/admin/ui/dialog";
import { cn } from "@/lib/utils";
import { BLOCK_DEFINITIONS, BLOCK_TYPES, type BlockCategory } from "@/lib/page-builder/registry";
import type { BlockType } from "@/lib/page-builder/types";

const ICONS: Record<BlockType, LucideIcon> = {
  hero: PanelTop,
  richText: AlignLeft,
  imageText: Columns2,
  cards: LayoutGrid,
  gallery: Images,
  faq: HelpCircle,
  cta: Megaphone,
  testimonials: MessageSquare,
  clientLogos: BadgeCheck,
  teamMembers: Users,
  contactForm: Mail,
};

const CATEGORIES: { value: BlockCategory | "all"; label: string }[] = [
  { value: "all", label: "Hamısı" },
  { value: "text", label: "Mətn" },
  { value: "media", label: "Media" },
  { value: "sections", label: "Hazır bölmələr" },
];

export function BlockLibraryDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: BlockType) => void;
}) {
  const [category, setCategory] = useState<BlockCategory | "all">("all");
  const types = BLOCK_TYPES.filter((t) => category === "all" || BLOCK_DEFINITIONS[t].category === category);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Blok kitabxanası</DialogTitle>
          <DialogDescription className="text-xs text-[var(--muted-foreground)]">
            Blok səhifənin sonuna əlavə olunacaq. Sonra sürükləyib yerini dəyişə bilərsiniz.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border",
                category === c.value ? "bg-black text-white border-black" : "bg-white border-[var(--border)] hover:bg-gray-50",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto">
          {types.map((type) => {
            const def = BLOCK_DEFINITIONS[type];
            const Icon = ICONS[type];
            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  onSelect(type);
                  onOpenChange(false);
                }}
                className="text-left rounded-xl border border-[var(--border)] p-4 hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
                  <Icon size={20} />
                </div>
                <div className="text-sm font-bold">{def.label}</div>
                <div className="text-[11px] text-[var(--muted-foreground)] mt-1 leading-snug">{def.description}</div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
