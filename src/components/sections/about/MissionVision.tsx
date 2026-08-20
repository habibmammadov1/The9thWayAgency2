"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Flag, Search } from "lucide-react";
import { AVATARS } from "@/lib/data";

interface RecommendationSnippetItem {
  id?: string;
  type: "quote" | "stat";
  text: string;
  value?: string | null;
  avatarUrl?: string | null;
  order: number;
}

interface MissionVisionProps {
  data?: {
    content: {
      statValue: string;
      statLabel: string;
      statAvatarUrls: any; // string[] or JSON
      statCaption: string;
      missionLabel: string;
      missionText: string;
      visionLabel: string;
      visionText: string;
    } | null;
    snippets: RecommendationSnippetItem[];
  } | null;
}

export default function MissionVision({ data }: MissionVisionProps) {
  const t = useTranslations("AboutPage.MissionVision");

  const statValue = data?.content?.statValue || t("statValue");
  const statLabel = data?.content?.statLabel || t("statLabel");
  const statCaption = data?.content?.statCaption || t("statCaption");

  const missionTitle = data?.content?.missionLabel || t("missionTitle");
  const missionDesc = data?.content?.missionText || t("missionDesc");
  const visionTitle = data?.content?.visionLabel || t("visionTitle");
  const visionDesc = data?.content?.visionText || t("visionDesc");

  let statAvatars: string[] = [];
  try {
    if (data?.content?.statAvatarUrls) {
      statAvatars = typeof data.content.statAvatarUrls === "string"
        ? JSON.parse(data.content.statAvatarUrls)
        : data.content.statAvatarUrls;
    }
  } catch (e) {
    console.error(e);
  }
  if (!statAvatars || statAvatars.length === 0) {
    statAvatars = AVATARS;
  }

  const snippets = data?.snippets && data.snippets.length > 0
    ? data.snippets
    : [
        { type: "quote", text: t("quotes.q1"), avatarUrl: AVATARS[0], value: null, order: 1 },
        { type: "stat", text: t("stats.recommend"), value: null, avatarUrl: null, order: 2 },
        { type: "quote", text: t("quotes.q2"), avatarUrl: AVATARS[1], value: null, order: 3 },
        { type: "stat", text: t("stats.reviews"), value: null, avatarUrl: null, order: 4 },
        { type: "quote", text: t("quotes.q3"), avatarUrl: AVATARS[2], value: null, order: 5 }
      ];

  return (
    <section className="w-full bg-white pt-12 lg:pt-16 pb-4 lg:pb-8 overflow-hidden">
      
      {/* 3-Column Cards Container */}
      <div className="container mx-auto px-6 md:px-12 lg:px-8 xl:px-12 mb-8 md:mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Card 1: Stat Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="w-full bg-gradient-to-br from-ink to-ink-light p-8 md:p-10 rounded-[32px] shadow-[0_0_50px_rgba(217,194,160,0.15)] border border-white/5 flex flex-col justify-between"
          >
            <div>
              <div className="flex flex-col gap-2">
                <span className="text-6xl lg:text-7xl font-display font-bold text-white tracking-tighter block leading-none">
                  {statValue}
                </span>
                <span className="text-[#D9C2A0] text-lg font-bold uppercase tracking-widest block">
                  {statLabel}
                </span>
              </div>
              <div className="h-px w-full bg-white/10 my-8" />
            </div>
            
            <div className="flex flex-col gap-4 mt-auto">
              <div className="flex -space-x-3">
                {statAvatars.map((src, i) => (
                  <div key={i} className="relative w-12 h-12 rounded-full border-2 border-ink overflow-hidden grayscale">
                    <Image src={src} alt="Client Avatar" fill className="object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-gray-400 leading-relaxed text-sm lg:text-base">
                {statCaption}
              </p>
            </div>
          </motion.div>

          {/* Card 2: Mission */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full bg-paper p-8 md:p-10 rounded-[32px] flex flex-col gap-8 border border-gray-200/50 hover:border-[#D9C2A0]/30 transition-colors duration-500"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#D9C2A0]/20 flex items-center justify-center">
              <Flag size={28} className="text-ink" strokeWidth={2} />
            </div>
            
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-black uppercase tracking-widest">
                  {missionTitle}
                </h3>
                <div className="w-8 h-1 bg-[#D9C2A0] rounded-full" />
              </div>
              
              <p className="text-gray-600 leading-relaxed text-base lg:text-lg">
                {missionDesc}
              </p>
            </div>
          </motion.div>

          {/* Card 3: Vision */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full bg-paper p-8 md:p-10 rounded-[32px] flex flex-col gap-8 border border-gray-200/50 hover:border-[#D9C2A0]/30 transition-colors duration-500"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#D9C2A0]/20 flex items-center justify-center">
              <Search size={28} className="text-ink" strokeWidth={2} />
            </div>
            
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-black uppercase tracking-widest">
                  {visionTitle}
                </h3>
                <div className="w-8 h-1 bg-[#D9C2A0] rounded-full" />
              </div>
              
              <p className="text-gray-600 leading-relaxed text-base lg:text-lg">
                {visionDesc}
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
        className="w-full bg-gradient-to-r from-ink to-[#D9C2A0] py-8 md:py-10"
      >
        <div className="w-full overflow-hidden flex flex-col justify-center">
          {/* Marquee Wrapper */}
          <div className="flex whitespace-nowrap animate-marquee">
            
            {/* We duplicate the content a few times to create the infinite scroll effect */}
            {[1, 2, 3].map((set) => (
              <div key={set} className="flex items-center gap-12 md:gap-24 px-6 md:px-12">
                {snippets.map((snip, index) => (
                  snip.type === "quote" ? (
                    <div key={`${index}-${snip.order}`} className="flex items-center gap-6">
                      <div className="relative w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden flex-shrink-0">
                        {snip.avatarUrl ? (
                          <Image src={snip.avatarUrl} alt="Avatar" fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-neutral-200" />
                        )}
                      </div>
                      <span className="text-white md:text-lg font-medium">
                        {snip.text}
                      </span>
                    </div>
                  ) : (
                    <span key={`${index}-${snip.order}`} className="text-2xl md:text-3xl font-display font-bold text-ink">
                      {snip.value ? `${snip.value} ` : ""}{snip.text}
                    </span>
                  )
                ))}
              </div>
            ))}

          </div>
        </div>
      </motion.div>

    </section>
  );
}
