"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import type { BlockButton, BlockSettings } from "@/lib/page-builder/types";

// Shared building pieces for page-builder block renderers.

export type Tone = "light" | "dark"; // "dark" = light text on a dark background

export function toneOf(settings: BlockSettings): Tone {
  return settings.background === "dark" ? "dark" : "light";
}

const BACKGROUNDS: Record<BlockSettings["background"], string> = {
  dark: "bg-[#0B0B0C] text-white",
  paper: "bg-paper text-ink",
  white: "bg-white text-ink",
  accent: "bg-[#D9C2A0] text-ink",
};

const SPACING: Record<BlockSettings["spacing"], string> = {
  sm: "py-10 md:py-12",
  md: "py-16 md:py-24",
  lg: "py-24 md:py-32",
};

export function BlockSection({
  settings,
  className,
  containerClassName,
  children,
}: {
  settings: BlockSettings;
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={settings.anchorId || undefined}
      className={cn("relative w-full overflow-hidden", BACKGROUNDS[settings.background], SPACING[settings.spacing], className)}
    >
      <div
        className={cn(
          "container mx-auto px-6 md:px-12",
          settings.align === "center" && "text-center",
          containerClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Overline({ text, tone }: { text: string; tone: Tone }) {
  if (!text) return null;
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs md:text-sm font-bold tracking-widest uppercase mb-6",
        tone === "dark" ? "border-white/20 text-white/80" : "border-black/10 bg-white/50 text-black",
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#D9C2A0]" />
      {text}
    </div>
  );
}

export function SectionHeading({ text, className }: { text: string; className?: string }) {
  if (!text) return null;
  return (
    <h2 className={cn("text-3xl md:text-5xl font-display font-bold leading-[1.1] tracking-tight", className)}>{text}</h2>
  );
}

export function Paragraph({ text, tone, className }: { text: string; tone: Tone; className?: string }) {
  if (!text) return null;
  return (
    <p
      className={cn(
        "text-lg leading-relaxed whitespace-pre-line",
        tone === "dark" ? "text-gray-400" : "text-ink-light",
        className,
      )}
    >
      {text}
    </p>
  );
}

function isInternal(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

export function SmartLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (isInternal(href)) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  const external = /^https?:\/\//i.test(href);
  return (
    <a href={href || "#"} className={className} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {children}
    </a>
  );
}

export function ButtonLink({ button, tone }: { button: BlockButton; tone: Tone }) {
  if (!button.label) return null;

  if (button.style === "link") {
    return (
      <SmartLink
        href={button.href}
        className={cn(
          "group inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm underline-offset-4 hover:underline",
          tone === "dark" ? "text-[#D9C2A0]" : "text-ink",
        )}
      >
        {button.label}
        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </SmartLink>
    );
  }

  const primary = button.style === "primary";
  return (
    <SmartLink
      href={button.href}
      className={cn(
        "group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm overflow-hidden transition-transform hover:scale-105",
        primary && "bg-[#D9C2A0] text-black",
        !primary && (tone === "dark" ? "border border-white text-white" : "border border-ink text-ink"),
      )}
    >
      <span className="relative z-10">{button.label}</span>
      <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
    </SmartLink>
  );
}

export function ButtonRow({ buttons, tone, center }: { buttons: BlockButton[]; tone: Tone; center?: boolean }) {
  const visible = buttons.filter((b) => b.label);
  if (visible.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-4 mt-10", center && "justify-center")}>
      {visible.map((b, i) => (
        <ButtonLink key={i} button={b} tone={tone} />
      ))}
    </div>
  );
}
