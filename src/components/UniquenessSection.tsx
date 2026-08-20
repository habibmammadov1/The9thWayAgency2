"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  TrendingUp,
  Lightbulb,
  Handshake,
  Search,
  BarChart2,
  Megaphone,
  Globe,
  Target,
  Zap,
  Star,
  Users,
  BrainCircuit,
  Rocket,
  LineChart,
  Award,
  ShieldCheck,
} from "lucide-react";
import { CARDS } from "@/lib/data";
import { useTranslations } from "next-intl";

// Map string icon names (stored in DB) → Lucide components
const ICON_MAP: Record<string, React.ReactNode> = {
  TrendingUp:   <TrendingUp   strokeWidth={1} size={24} />,
  Lightbulb:    <Lightbulb    strokeWidth={1} size={24} />,
  Handshake:    <Handshake    strokeWidth={1} size={24} />,
  Search:       <Search       strokeWidth={1} size={24} />,
  BarChart2:    <BarChart2    strokeWidth={1} size={24} />,
  Megaphone:    <Megaphone    strokeWidth={1} size={24} />,
  Globe:        <Globe        strokeWidth={1} size={24} />,
  Target:       <Target       strokeWidth={1} size={24} />,
  Zap:          <Zap          strokeWidth={1} size={24} />,
  Star:         <Star         strokeWidth={1} size={24} />,
  Users:        <Users        strokeWidth={1} size={24} />,
  BrainCircuit: <BrainCircuit strokeWidth={1} size={24} />,
  Rocket:       <Rocket       strokeWidth={1} size={24} />,
  LineChart:    <LineChart    strokeWidth={1} size={24} />,
  Award:        <Award        strokeWidth={1} size={24} />,
  ShieldCheck:  <ShieldCheck  strokeWidth={1} size={24} />,
};

// Ordered fallback icons for when no matching name is found
const FALLBACK_ICONS = [
  <TrendingUp  key="0" strokeWidth={1} size={24} />,
  <Lightbulb   key="1" strokeWidth={1} size={24} />,
  <Handshake   key="2" strokeWidth={1} size={24} />,
  <Search      key="3" strokeWidth={1} size={24} />,
];

/**
 * Resolves a card's icon value to a React node:
 *   - If it's already a React element (from the static CARDS fallback), return as-is.
 *   - If it's a known string key, look it up in ICON_MAP.
 *   - Otherwise fall back to a position-based icon.
 */
function resolveIcon(icon: any, index: number): React.ReactNode {
  if (React.isValidElement(icon)) return icon;
  if (typeof icon === "string" && ICON_MAP[icon]) return ICON_MAP[icon];
  return FALLBACK_ICONS[index % FALLBACK_ICONS.length];
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } 
  }
};

interface UniquenessSectionProps {
  data?: any;
  locale?: string;
}

export default function UniquenessSection({ data, locale }: UniquenessSectionProps) {
  const t = useTranslations("Uniqueness");
  const cards = data?.cards && data.cards.length > 0 ? data.cards : CARDS;

  return (
    <section className="relative w-full pt-12 md:pt-16 bg-[#F7F6F4] overflow-hidden">

      {/* Massive Background Watermark */}
      <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none select-none z-0">
        <div className="flex animate-marquee whitespace-nowrap opacity-[0.03] text-[#0B0B0C]">
          {[1, 2, 3, 4].map((i) => (
            <span key={i} className="text-[140px] md:text-[280px] font-extrabold tracking-tighter mx-12 uppercase">
              DIFFERENTIATORS •
            </span>
          ))}
        </div>
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-8">
        {/* Outer White Container */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl relative border border-[#E4E2DF]/50">
          
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row items-end justify-between gap-8 mb-12">
            <div className="w-full lg:w-5/12 pr-0 lg:pr-12 relative z-10">
              <h2 className="text-4xl md:text-5xl lg:text-[4.5rem] font-bold text-[#0B0B0C] leading-[1.1] tracking-tight font-belwe">
                {data?.sectionTitle || t("sectionTitle")}
              </h2>
            </div>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6"
          >
            {cards.map((card: any, index: number) => (
              <motion.div 
                key={card.id || index}
                variants={cardVariants}
                className="group relative bg-white rounded-[24px] hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 hover:-translate-y-2 h-full flex flex-col"
              >
                {/* Photo Top Area */}
                <div className="relative w-full mb-10">
                  <div className="relative w-full aspect-[4/3] rounded-t-2xl overflow-hidden bg-[#F7F6F4] shadow-sm group-hover:shadow-md transition-shadow duration-400">
                    <Image 
                      src={card.image || CARDS[index]?.image || 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2000&auto=format&fit=crop'} 
                      fill 
                      alt={card.title || t(`cards.card${index + 1}.title`)} 
                      className="object-cover grayscale opacity-90 transition-all duration-400 group-hover:scale-105" 
                      sizes="(max-width: 1024px) 100vw, 25vw" 
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#d9c2a0]/90 to-transparent mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-400 z-0" />
                  </div>
                  
                  {/* Icon Badge with cut-out effect */}
                  <div className="absolute bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2 w-14 h-14 bg-[#FCE5E0] rounded-full flex items-center justify-center border-[6px] border-white group-hover:bg-[#d9c2a0] transition-colors duration-400 z-10 box-content">
                     <div className="text-[#0B0B0C] transition-colors">{resolveIcon(card.icon, index)}</div>
                  </div>
                </div>

                <div className="flex flex-col flex-1 mt-auto space-y-3 relative z-10 px-2 pt-2 pb-6">
                    <h3 className="text-xl lg:text-2xl font-bold text-[#0B0B0C] group-hover:text-[var(--primary)] transition-colors">
                      {card.title || t(`cards.card${index + 1}.title`)}
                    </h3>
                    <p className="text-[#8A8A87] leading-relaxed text-sm md:text-base">
                      {card.desc || t(`cards.card${index + 1}.desc`)}
                    </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Secondary Keyword Marquee Divider */}
      <div className="relative z-10 mt-24 border-t border-[#E4E2DF] overflow-hidden flex items-center bg-white py-6">
        <div className="flex animate-marquee whitespace-nowrap opacity-60">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <span key={i} className="text-sm font-semibold tracking-widest uppercase text-[#8A8A87] mx-6">
              SEO • Branding • Performance Marketing • Content • Strategy • 
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
