"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { BarChart, Target, Users, Award, Settings } from "lucide-react";

interface WhatWeBuildFeatureItem {
  id?: string;
  icon: string;
  title: string;
  description: string;
  order: number;
}

interface WhatWeBuildProps {
  data?: {
    content: {
      mainImageUrl?: string | null;
      statValue: string;
      statLabel: string;
      statAvatarUrls: any; // string[] or JSON
      statCaption: string;
      heading: string;
      paragraph: string;
      ctaLabel: string;
    } | null;
    features: WhatWeBuildFeatureItem[];
  } | null;
}

const iconMap: { [key: string]: React.ReactNode } = {
  BarChart: <BarChart className="w-5 h-5 text-black" strokeWidth={2} />,
  Target: <Target className="w-5 h-5 text-black" strokeWidth={2} />,
  Users: <Users className="w-5 h-5 text-black" strokeWidth={2} />,
  Award: <Award className="w-5 h-5 text-black" strokeWidth={2} />,
  Settings: <Settings className="w-5 h-5 text-black" strokeWidth={2} />,
};

export default function WhatWeBuild({ data }: WhatWeBuildProps) {
  const t = useTranslations("AboutPage.WhatWeBuild");

  const heading = data?.content?.heading || t("heading");
  const paragraph = data?.content?.paragraph || t("paragraph");
  const ctaLabel = data?.content?.ctaLabel || t("buttonLabel");
  const mainImage = data?.content?.mainImageUrl || "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2000&auto=format&fit=crop";

  const statValue = data?.content?.statValue || t("statValue") || "100%";
  const statLabel = data?.content?.statLabel || t("statLabel") || "Məmnun Müştəri";
  const statCaption = data?.content?.statCaption || t("statCaption") || "Davamlı əməkdaşlıqlar";

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
    statAvatars = [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&q=80"
    ];
  }

  const features = data?.features && data.features.length > 0
    ? data.features
    : [
        { title: t("features.0.title"), description: t("features.0.description"), icon: "BarChart" },
        { title: t("features.1.title"), description: t("features.1.description"), icon: "Target" },
        { title: t("features.2.title"), description: t("features.2.description"), icon: "Users" },
      ];

  return (
    <section className="relative w-full pt-4 pb-12 lg:pt-4 lg:pb-16 bg-paper overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 lg:px-8 xl:px-12">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          
          {/* Left Column: Image with Stats Overlay */}
          <div className="relative w-full max-w-xl mx-auto lg:max-w-none h-full min-h-[450px] lg:min-h-[600px] flex items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative w-full min-h-[400px] rounded-3xl overflow-hidden shadow-sm flex-1"
            >
              <Image
                src={mainImage}
                alt="Team Collaborating"
                fill
                className="object-cover grayscale"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Brand overlay on image */}
              <div className="absolute inset-0 bg-[#D9C2A0] mix-blend-overlay opacity-10" />

              {/* Floating Premium Stat Card Overlay */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="absolute bottom-6 left-6 right-6 md:right-auto md:w-80 bg-ink p-6 rounded-[24px] shadow-xl border border-white/5 flex flex-col gap-4 z-10"
              >
                <div>
                  <span className="text-4xl font-display font-bold text-white tracking-tighter block leading-none mb-1">
                    {statValue}
                  </span>
                  <span className="text-[#D9C2A0] text-xs font-bold uppercase tracking-widest block">
                    {statLabel}
                  </span>
                </div>
                <div className="h-px w-full bg-white/10" />
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {statAvatars.map((src, i) => (
                      <div key={i} className="relative w-8 h-8 rounded-full border border-ink overflow-hidden grayscale">
                        <Image src={src} alt="Client Avatar" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                  <p className="text-gray-400 leading-normal text-xs">
                    {statCaption}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Column: Content */}
          <div className="flex flex-col pt-8 lg:pt-0">
            
            {/* Header Block */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-6 mb-12"
            >
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-black uppercase leading-[1.1] tracking-tight">
                {heading}
              </h2>
              <p className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-xl">
                {paragraph}
              </p>
            </motion.div>

            {/* Lime Dot Divider */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex items-center gap-4 mb-12 origin-left"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#D9C2A0] flex-shrink-0" />
              <div className="h-px w-full bg-gray-200" />
            </motion.div>

            {/* Features List */}
            <div className="flex flex-col gap-8 mb-12">
              {features.map((feat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: 0.3 + (idx * 0.15) }}
                  className="flex items-start gap-6 group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#D9C2A0] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    {iconMap[feat.icon] || iconMap.BarChart}
                  </div>
                  <div className="flex flex-col gap-2 pt-1">
                    <h3 className="text-xl md:text-2xl font-display font-bold text-black group-hover:text-ink transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-gray-500 leading-relaxed max-w-md">
                      {feat.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom Divider & CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-col gap-8"
            >
              <div className="h-px w-full bg-gray-200" />
              <div>
                <Link
                  href="#more"
                  className="inline-flex items-center justify-center px-8 py-4 bg-[#D9C2A0] text-black rounded-full font-bold uppercase tracking-widest text-sm hover:scale-105 hover:bg-[#e3d1b8] transition-all duration-300 shadow-sm"
                >
                  {ctaLabel}
                </Link>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
