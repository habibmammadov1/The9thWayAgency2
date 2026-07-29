"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

const svgIcons = [
  // Icon 1
  <svg key="1" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-accent opacity-50"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/><path d="M12 22a10 10 0 0 1-10-10"/></svg>,
  // Icon 2
  <svg key="2" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-accent opacity-50"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>,
  // Icon 3
  <svg key="3" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-accent opacity-50"><polygon points="12 2 2 22 22 22"/><line x1="12" y1="2" x2="12" y2="22"/></svg>,
  // Icon 4
  <svg key="4" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-accent opacity-50"><path d="M12 2L2 12l10 10 10-10L12 2z"/><line x1="12" y1="2" x2="12" y2="22"/></svg>
];

const cardColors = [
  "bg-ink",
  "bg-ink-light",
  "bg-[#1A1A1A]",
  "bg-[#2A2A2A]"
];

export default function CaseStudyShowcase() {
  const t = useTranslations("PortfolioPage.CaseStudies");
  
  const cases = [0, 1, 2, 3];

  return (
    <section className="w-full bg-paper py-24 overflow-hidden">
      <div className="container mx-auto">
        <div className="flex flex-col gap-32">
          {cases.map((idx) => {
            return (
              <CaseStudyRow 
                key={idx}
                idx={idx}
                isReversed={idx % 2 !== 0}
                t={t}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CaseStudyRow({ idx, isReversed, t }: { idx: number, isReversed: boolean, t: any }) {
  const rowRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ["start end", "end start"]
  });
  
  const imgParallax = useTransform(scrollYProgress, [0, 1], [50, -50]);

  const tags: string[] = t.raw(`cases.${idx}.tags`);
  const stats: {value: string, label: string}[] = t.raw(`cases.${idx}.stats`);

  return (
    <motion.div 
      ref={rowRef}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
      className={`flex flex-col gap-12 lg:gap-24 items-center ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}
    >
      {/* Image Side */}
      <div className="w-full lg:w-1/2 relative overflow-hidden rounded-[2rem] aspect-[4/3] flex items-center justify-center">
        <div className={`absolute inset-0 ${cardColors[idx % cardColors.length]}`} />
        <motion.div style={{ y: imgParallax }} className="relative z-10 scale-150">
          {svgIcons[idx % svgIcons.length]}
        </motion.div>
      </div>

      {/* Content Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center">
        {/* Tags */}
        <div className="flex flex-wrap gap-3 mb-8">
          {tags.map((tag: string, i: number) => (
            <span key={i} className="inline-flex items-center px-4 py-1.5 rounded-full border border-accent text-accent text-xs font-semibold tracking-wide uppercase">
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className="text-3xl md:text-5xl font-display font-bold text-ink leading-[1.1] mb-8">
          {t(`cases.${idx}.title`)}
        </h3>

        {/* Divider */}
        <div className="w-full h-px bg-gray-300 mb-8" />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {stats.map((stat, i: number) => (
            <div key={i} className="flex flex-col">
              <span className="text-2xl md:text-4xl font-display font-bold text-ink mb-1">{stat.value}</span>
              <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* View Project Button */}
        <div>
          <Link 
            href="#"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-ink text-white font-semibold hover:bg-accent hover:text-ink transition-colors duration-300"
          >
            {t("viewProject")}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
