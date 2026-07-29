"use client";

import React, { useRef } from "react";
import { motion, useInView, Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { CheckCircle2, ArrowUpRight, Star } from "lucide-react";
import AnimatedCounter from "../../AnimatedCounter";
import MagneticButtonWrapper from "../../MagneticButtonWrapper";
import { AVATARS } from "@/lib/data";

const ACCENT = "#D9C2A0";

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: "easeOut" } 
  }
};

// --- SUB-COMPONENTS ---
const ChatBubbleUI = () => (
  <div className="flex flex-col gap-3 mt-6">
    <div className="flex items-end gap-2">
      <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0" />
      <div className="bg-paper text-black text-[10px] md:text-xs py-2 px-3 rounded-2xl rounded-bl-none font-medium shadow-sm border border-gray-200/50">
        We need to scale our campaign!
      </div>
    </div>
    <div className="flex items-end gap-2 justify-end">
      <div className="bg-accent text-black text-[10px] md:text-xs py-2 px-3 rounded-2xl rounded-br-none font-medium shadow-[0_4px_15px_rgba(217,194,160,0.3)]">
        On it! Optimizing bids now. 🚀
      </div>
      <div className="w-6 h-6 rounded-full bg-black shrink-0" />
    </div>
    <div className="flex items-end gap-2">
      <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0" />
      <div className="bg-paper text-black text-[10px] md:text-xs py-2 px-3 rounded-2xl rounded-bl-none font-medium shadow-sm border border-gray-200/50 flex items-center gap-2">
        <span className="flex gap-1">
          <span className="w-1 h-1 rounded-full bg-gray-500 animate-bounce" />
          <span className="w-1 h-1 rounded-full bg-gray-500 animate-bounce delay-75" />
          <span className="w-1 h-1 rounded-full bg-gray-500 animate-bounce delay-150" />
        </span>
      </div>
    </div>
  </div>
);

export default function WhyChooseUs() {
  const t = useTranslations("WhyChooseUs");
  const gridRef = useRef<HTMLDivElement>(null);
  
  // Convert industries translation back to an array
  const industries = [0,1,2,3,4,5,6].map(i => t(`card1.industries.${i}`));
  const checklist = [0,1,2,3,4].map(i => t(`card3.list.${i}`));

  return (
    <section className="relative w-full bg-paper pt-12 pb-24 lg:pt-16 lg:pb-32 overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 lg:px-8 xl:px-12">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-start max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-black text-xs font-bold tracking-widest uppercase mb-6 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-black" />
              {t("pill")}
              <span className="w-1.5 h-1.5 rounded-full bg-black" />
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-black leading-[1.1] tracking-tight">
              {t("heading")}
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-md"
          >
            <p className="text-gray-500 text-lg font-medium leading-relaxed">
              {t("supporting")}
            </p>
          </motion.div>
        </div>

        {/* Bento Grid */}
        <motion.div 
          ref={gridRef}
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-[auto]"
        >
          
          {/* Card 1: Industries (Col 1, Row 1) */}
          <motion.div variants={cardVariants} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200 flex flex-col justify-between overflow-hidden relative group transition-all duration-500 hover:-translate-y-1 hover:shadow-xl h-full min-h-[320px]">
            <h3 className="text-xl font-bold text-black mb-8 relative z-10">Industries We Help</h3>
            
            <div className="relative w-[120%] -ml-[10%] flex-1 flex flex-col justify-center overflow-hidden">
              {/* Fade Masks */}
              <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent z-10" />
              <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent z-10" />
              
              {/* Marquee Row 1 */}
              <div className="flex animate-marquee whitespace-nowrap mb-3 opacity-90">
                {[...industries, ...industries].map((ind, i) => (
                  <span key={`r1-${i}`} className="px-5 py-2.5 rounded-full bg-paper text-black text-sm font-semibold mx-2 border border-gray-200/50">
                    {ind}
                  </span>
                ))}
              </div>
              {/* Marquee Row 2 (Reverse) */}
              <div className="flex animate-marquee-reverse whitespace-nowrap opacity-90">
                {[...industries, ...industries].reverse().map((ind, i) => (
                  <span key={`r2-${i}`} className="px-5 py-2.5 rounded-full bg-paper text-black text-sm font-semibold mx-2 border border-gray-200/50">
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Card 2: Stat Highlight (Col 2, Row 1) */}
          <motion.div variants={cardVariants} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200 flex flex-col justify-between relative overflow-hidden group transition-all duration-500 hover:-translate-y-1 hover:shadow-xl h-full min-h-[320px]">
            {/* Background Image / Texture */}
            <div className="absolute top-0 right-0 w-2/3 h-2/3 opacity-[0.05] grayscale group-hover:scale-110 transition-transform duration-700 pointer-events-none origin-top-right">
              <Image 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop"
                alt="Dashboard"
                fill
                className="object-cover rounded-bl-full"
              />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-6xl md:text-7xl font-display font-bold text-black tracking-tighter mb-2">
                {t("card2.stat")}
              </h3>
              <p className="text-gray-500 font-semibold text-sm tracking-widest uppercase">
                {t("card2.label")}
              </p>
            </div>

            <div className="relative z-10 mt-auto pt-12">
              <p className="text-black font-bold text-lg mb-4">{t("card2.ctaText")}</p>
              <div className="flex items-center gap-4">
                <button className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shadow-[0_4px_15px_rgba(217,194,160,0.3)] hover:scale-110 transition-transform">
                  <ArrowUpRight size={20} className="text-black" />
                </button>
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider group-hover:text-black transition-colors">{t("card2.linkText")}</span>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Checklist (Col 3, Row 1 + 2) */}
          <motion.div variants={cardVariants} className="bg-gradient-to-br from-[var(--color-ink)] to-[var(--color-ink-light)] rounded-3xl p-8 shadow-2xl flex flex-col relative overflow-hidden group transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] lg:row-span-2 min-h-[500px]">
            {/* Moody Image Background */}
            <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay grayscale group-hover:scale-105 group-hover:opacity-50 transition-all duration-700">
              <Image 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop"
                alt="Team working"
                fill
                className="object-cover"
              />
              {/* Duotone effect via gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-accent/10 mix-blend-multiply" />
            </div>

            <div className="relative z-10 flex-1 flex flex-col">
              <div className="w-12 h-12 rounded-full bg-ink border border-white/10 flex items-center justify-center mb-6">
                <CheckCircle2 size={24} className="text-accent" />
              </div>
              <h3 className="text-3xl font-display font-bold text-white mb-4">{t("card3.title")}</h3>
              <p className="text-gray-200 text-sm leading-relaxed mb-10">
                {t("card3.desc")}
              </p>

              <ul className="flex flex-col gap-5 flex-1">
                {checklist.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <span className="mt-1 flex items-center justify-center w-5 h-5 rounded-full bg-accent/20 text-accent shrink-0">
                      <CheckCircle2 size={12} strokeWidth={3} />
                    </span>
                    <span className="text-white font-medium text-sm leading-tight">{item}</span>
                  </li>
                ))}
              </ul>

              <MagneticButtonWrapper pullStrength={0.1}>
                <button className="w-full mt-10 bg-accent text-black py-4 rounded-xl font-bold hover:bg-white transition-colors duration-300 shadow-[0_0_20px_rgba(217,194,160,0.2)]">
                  {t("card3.button")}
                </button>
              </MagneticButtonWrapper>
            </div>
          </motion.div>

          {/* Card 4: Clients (Col 1, Row 2) */}
          <motion.div variants={cardVariants} className="bg-gradient-to-br from-[var(--color-ink)] to-[var(--color-ink-light)] rounded-3xl p-8 shadow-xl flex flex-col justify-between relative overflow-hidden group transition-all duration-500 hover:-translate-y-1 h-full min-h-[320px]">
            <div>
              {/* Avatars */}
              <div className="flex items-center mb-8">
                {AVATARS.map((src, i) => (
                  <div key={i} className="relative w-12 h-12 rounded-full border-2 border-ink overflow-hidden -ml-3 first:ml-0 shadow-sm z-[4-i]">
                    <Image src={src} alt="Client" fill className="object-cover grayscale" sizes="48px" />
                  </div>
                ))}
                <div className="relative w-12 h-12 rounded-full border-2 border-ink bg-gray-500 flex items-center justify-center text-white text-xs font-bold -ml-3 z-0">
                  +3k
                </div>
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4 text-accent">
                {[1,2,3,4,5].map(i => <Star key={i} size={18} fill="currentColor" />)}
              </div>
            </div>

            <div>
              <div className="text-6xl font-display font-bold text-white mb-2 flex items-baseline">
                <AnimatedCounter value={parseInt(t("card4.stat")) || 98} />
                <span className="text-4xl text-accent">%</span>
              </div>
              <p className="text-gray-500 text-sm font-medium pr-8">
                {t("card4.label")}
              </p>
            </div>
          </motion.div>

          {/* Card 5: 24/7 (Col 2, Row 2) */}
          <motion.div variants={cardVariants} className="bg-gray-200 rounded-3xl p-8 shadow-sm flex flex-col relative overflow-hidden group transition-all duration-500 hover:-translate-y-1 hover:shadow-xl h-full min-h-[320px]">
            <div className="relative z-10 flex flex-col h-full">
              <div>
                <h3 className="text-4xl font-display font-bold text-black mb-2">{t("card5.title")}</h3>
                <p className="text-gray-500 font-medium text-sm w-2/3">
                  {t("card5.desc")}
                </p>
              </div>

              {/* Mock Chat UI */}
              <div className="mt-auto">
                <ChatBubbleUI />
              </div>
            </div>
            {/* Subtle graphic element */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white rounded-full opacity-50 blur-2xl pointer-events-none" />
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
