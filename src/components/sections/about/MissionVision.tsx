"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Flag, Search } from "lucide-react";
import { AVATARS } from "@/lib/data";

export default function MissionVision() {
  const t = useTranslations("AboutPage.MissionVision");

  return (
    <section className="w-full bg-white pt-12 lg:pt-16 pb-4 lg:pb-8 overflow-hidden">
      
      {/* 3-Column Cards Container */}
      <div className="container mx-auto px-6 md:px-12 lg:px-8 xl:px-12 mb-8 md:mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Card 1: Stat Card (Reused style from Phase 2) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="w-full bg-gradient-to-br from-ink to-ink-light p-8 md:p-10 rounded-[32px] shadow-[0_0_50px_rgba(214,255,63,0.1)] border border-white/5 flex flex-col justify-between"
          >
            <div>
              <div className="flex flex-col gap-2">
                <span className="text-6xl lg:text-7xl font-display font-bold text-white tracking-tighter">
                  {t("statValue")}
                </span>
                <span className="text-accent text-lg font-bold uppercase tracking-widest">
                  {t("statLabel")}
                </span>
              </div>
              <div className="h-px w-full bg-white/10 my-8" />
            </div>
            
            <div className="flex flex-col gap-4 mt-auto">
              <div className="flex -space-x-3">
                {AVATARS.map((src, i) => (
                  <div key={i} className="relative w-12 h-12 rounded-full border-2 border-ink overflow-hidden grayscale">
                    <Image src={src} alt="Client Avatar" fill className="object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-gray-400 leading-relaxed text-sm lg:text-base">
                {t("statCaption")}
              </p>
            </div>
          </motion.div>

          {/* Card 2: Mission */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full bg-paper p-8 md:p-10 rounded-[32px] flex flex-col gap-8 border border-gray-200/50 hover:border-accent/30 transition-colors duration-500"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center">
              <Flag size={28} className="text-ink" strokeWidth={2} />
            </div>
            
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-black uppercase tracking-widest">
                  {t("missionTitle")}
                </h3>
                <div className="w-8 h-1 bg-accent rounded-full" />
              </div>
              
              <p className="text-gray-600 leading-relaxed text-base lg:text-lg">
                {t("missionDesc")}
              </p>
            </div>
          </motion.div>

          {/* Card 3: Vision */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full bg-paper p-8 md:p-10 rounded-[32px] flex flex-col gap-8 border border-gray-200/50 hover:border-accent/30 transition-colors duration-500"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center">
              <Search size={28} className="text-ink" strokeWidth={2} />
            </div>
            
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-black uppercase tracking-widest">
                  {t("visionTitle")}
                </h3>
                <div className="w-8 h-1 bg-accent rounded-full" />
              </div>
              
              <p className="text-gray-600 leading-relaxed text-base lg:text-lg">
                {t("visionDesc")}
              </p>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Recommendations Bar */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="w-full bg-gradient-to-r from-ink to-accent py-8 md:py-10"
      >
        <div className="w-full overflow-hidden flex flex-col justify-center">
          {/* Marquee Wrapper */}
          <div className="flex whitespace-nowrap animate-marquee">
            
            {/* We duplicate the content a few times to create the infinite scroll effect */}
            {[1, 2, 3].map((set) => (
              <div key={set} className="flex items-center gap-12 md:gap-24 px-6 md:px-12">
                
                {/* Quote 1 */}
                <div className="flex items-center gap-6">
                  <div className="relative w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden flex-shrink-0">
                    <Image src={AVATARS[0]} alt="Avatar" fill className="object-cover" />
                  </div>
                  <span className="text-white md:text-lg font-medium">
                    {t("quotes.q1")}
                  </span>
                </div>

                {/* Stat 1 */}
                <span className="text-2xl md:text-3xl font-display font-bold text-ink">
                  {t("stats.recommend")}
                </span>

                {/* Quote 2 */}
                <div className="flex items-center gap-6">
                  <div className="relative w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden flex-shrink-0">
                    <Image src={AVATARS[1]} alt="Avatar" fill className="object-cover" />
                  </div>
                  <span className="text-white md:text-lg font-medium">
                    {t("quotes.q2")}
                  </span>
                </div>

                {/* Stat 2 */}
                <span className="text-2xl md:text-3xl font-display font-bold text-ink">
                  {t("stats.reviews")}
                </span>

                {/* Quote 3 */}
                <div className="flex items-center gap-6">
                  <div className="relative w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden flex-shrink-0">
                    <Image src={AVATARS[2]} alt="Avatar" fill className="object-cover" />
                  </div>
                  <span className="text-white md:text-lg font-medium">
                    {t("quotes.q3")}
                  </span>
                </div>

              </div>
            ))}

          </div>
        </div>
      </motion.div>

    </section>
  );
}
