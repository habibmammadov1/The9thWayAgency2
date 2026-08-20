"use client"

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const svgIcons = [
  <svg key="1" width="160" height="160" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-accent opacity-40"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/><path d="M12 22a10 10 0 0 1-10-10"/></svg>,
  <svg key="2" width="160" height="160" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-accent opacity-40"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>,
  <svg key="3" width="160" height="160" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-accent opacity-40"><polygon points="12 2 2 22 22 22"/><line x1="12" y1="2" x2="12" y2="22"/></svg>,
  <svg key="4" width="160" height="160" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-accent opacity-40"><path d="M12 2L2 12l10 10 10-10L12 2z"/><line x1="12" y1="2" x2="12" y2="22"/></svg>
];

const smallIcons = [
  <svg key="1" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-accent opacity-40"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/><path d="M12 22a10 10 0 0 1-10-10"/></svg>,
  <svg key="2" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-accent opacity-40"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>,
  <svg key="3" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-accent opacity-40"><polygon points="12 2 2 22 22 22"/><line x1="12" y1="2" x2="12" y2="22"/></svg>,
  <svg key="4" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-accent opacity-40"><path d="M12 2L2 12l10 10 10-10L12 2z"/><line x1="12" y1="2" x2="12" y2="22"/></svg>
];

function getIconForCase(slug: string, isSmall = false) {
  const icons = isSmall ? smallIcons : svgIcons;
  if (slug.includes("aurora")) return icons[0];
  if (slug.includes("nexus")) return icons[1];
  if (slug.includes("zenith")) return icons[2];
  if (slug.includes("lumina")) return icons[3];
  return icons[0];
}

function getCardColor(colorTheme: string) {
  if (colorTheme === "ink") return "bg-ink";
  if (colorTheme === "lime-dark") return "bg-[#8DE45F]";
  if (colorTheme === "ink-light") return "bg-ink-light";
  return "bg-ink";
}

interface CaseStudy {
  id: string;
  slug: string;
  tags: any;
  title: string;
  colorTheme: string;
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;
  challenge: string;
  approach: string;
  result: string;
  galleryImageUrls: any;
}

interface DetailsProps {
  caseStudy: CaseStudy;
  otherProjects: CaseStudy[];
}

export default function CaseStudyDetailsClient({ caseStudy, otherProjects }: DetailsProps) {
  // Parse tags and galleryImageUrls
  const tags: string[] = Array.isArray(caseStudy.tags) 
    ? caseStudy.tags 
    : typeof caseStudy.tags === "string" 
      ? JSON.parse(caseStudy.tags) 
      : [];

  const gallery: string[] = Array.isArray(caseStudy.galleryImageUrls)
    ? caseStudy.galleryImageUrls
    : typeof caseStudy.galleryImageUrls === "string"
      ? JSON.parse(caseStudy.galleryImageUrls)
      : [];

  const cardBg = getCardColor(caseStudy.colorTheme);
  const isLime = caseStudy.colorTheme === "lime-dark";

  return (
    <div className="w-full bg-[#0B0B0C] text-[#E4E2DF] pt-32 pb-24 font-sans">
      <div className="container mx-auto px-6 md:px-12">
        
        {/* HERO SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={cn(
            "rounded-[2.5rem] p-8 md:p-16 flex flex-col lg:flex-row gap-12 items-center justify-between relative overflow-hidden mb-20",
            cardBg,
            isLime ? "text-ink" : "text-white"
          )}
        >
          {/* Background Geometric Mark */}
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 select-none pointer-events-none opacity-80 scale-125 lg:scale-150">
            {getIconForCase(caseStudy.slug)}
          </div>

          <div className="relative z-10 max-w-2xl space-y-6">
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, idx) => (
                <span 
                  key={idx} 
                  className={cn(
                    "inline-flex items-center px-4 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wide",
                    isLime ? "border-ink text-ink bg-white/40" : "border-accent text-accent bg-white/5"
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-display font-bold leading-[1.1] tracking-tight">
              {caseStudy.title}
            </h1>
          </div>

          {/* 3 Stats Panel */}
          <div className="relative z-10 grid grid-cols-3 gap-6 md:gap-12 shrink-0 bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-3xl w-full lg:w-auto">
            <div className="flex flex-col">
              <span className={cn("text-3xl md:text-4xl font-display font-bold", isLime ? "text-ink" : "text-accent")}>
                {caseStudy.stat1Value}
              </span>
              <span className="text-xs uppercase font-medium tracking-wide opacity-80 mt-1">
                {caseStudy.stat1Label}
              </span>
            </div>
            <div className="flex flex-col">
              <span className={cn("text-3xl md:text-4xl font-display font-bold", isLime ? "text-ink" : "text-accent")}>
                {caseStudy.stat2Value}
              </span>
              <span className="text-xs uppercase font-medium tracking-wide opacity-80 mt-1">
                {caseStudy.stat2Label}
              </span>
            </div>
            <div className="flex flex-col">
              <span className={cn("text-3xl md:text-4xl font-display font-bold", isLime ? "text-ink" : "text-accent")}>
                {caseStudy.stat3Value}
              </span>
              <span className="text-xs uppercase font-medium tracking-wide opacity-80 mt-1">
                {caseStudy.stat3Label}
              </span>
            </div>
          </div>
        </motion.div>

        {/* LONG FORM DETAILS (Challenge, Approach, Result) */}
        <div className="grid gap-16 lg:grid-cols-3 mb-24 border-b border-white/10 pb-20">
          
          {/* Challenge */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <span className="text-xs uppercase tracking-widest text-accent font-semibold">01 / Problem (Challenge)</span>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white">Çətinliklər</h2>
            <p className="text-gray-400 leading-relaxed text-base font-light">
              {caseStudy.challenge}
            </p>
          </motion.div>

          {/* Approach */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <span className="text-xs uppercase tracking-widest text-accent font-semibold">02 / Strateji (Approach)</span>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white">Bizim Yanaşma</h2>
            <p className="text-gray-400 leading-relaxed text-base font-light">
              {caseStudy.approach}
            </p>
          </motion.div>

          {/* Result */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <span className="text-xs uppercase tracking-widest text-accent font-semibold">03 / Nəticə (Result)</span>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white">Uğurlarımız</h2>
            <p className="text-gray-400 leading-relaxed text-base font-light">
              {caseStudy.result}
            </p>
          </motion.div>
        </div>

        {/* IMAGE GALLERY GRID */}
        {gallery.length > 0 && (
          <div className="space-y-8 mb-32">
            <h3 className="text-3xl font-display font-bold text-white mb-6">Layihə Qalereyası</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {gallery.map((imgUrl, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="relative aspect-video rounded-3xl overflow-hidden bg-white/5 border border-white/10 group"
                >
                  <Image 
                    src={imgUrl}
                    alt={`Gallery Image ${idx + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-750 group-hover:scale-105"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* MORE PROJECTS SECTION */}
        {otherProjects.length > 0 && (
          <div className="space-y-12 border-t border-white/10 pt-20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h3 className="text-3xl md:text-4xl font-display font-bold text-white">Digər Layihələr</h3>
              <Link 
                href="/portfolio" 
                className="text-accent hover:text-white font-semibold flex items-center gap-2 group transition-colors"
              >
                Bütün Portfolio <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {otherProjects.map((proj, idx) => {
                const otherBg = getCardColor(proj.colorTheme);
                const isOtherLime = proj.colorTheme === "lime-dark";
                return (
                  <motion.div 
                    key={proj.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    className={cn(
                      "rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between aspect-[4/3] group border border-white/5 shadow-md",
                      otherBg
                    )}
                  >
                    {/* Background Icon Mark */}
                    <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-30 pointer-events-none scale-100 group-hover:scale-110 transition-transform duration-500">
                      {getIconForCase(proj.slug, true)}
                    </div>

                    <div className="space-y-4">
                      {/* Title */}
                      <h4 className={cn(
                        "text-xl md:text-2xl font-display font-bold leading-tight",
                        isOtherLime ? "text-ink" : "text-white"
                      )}>
                        {proj.title}
                      </h4>
                    </div>

                    <div className="relative z-10 mt-auto">
                      <Link 
                        href={`/portfolio/${proj.slug}`}
                        className={cn(
                          "inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold transition-colors",
                          isOtherLime 
                            ? "bg-ink text-white hover:bg-white hover:text-ink" 
                            : "bg-white text-ink hover:bg-accent hover:text-ink"
                        )}
                      >
                        Layihəyə Bax
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Arrow icon helper
function ArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={2} 
      stroke="currentColor" 
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}
