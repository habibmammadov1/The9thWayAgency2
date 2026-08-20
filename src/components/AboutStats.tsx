"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";
import Image from "next/image";
import { STATS, AVATARS } from "@/lib/data";
import { useTranslations } from "next-intl";

interface AboutStatsProps {
  data?: any;
  locale?: string;
}

export default function AboutStats({ data, locale }: AboutStatsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  // Parallax effect: image moves slightly vertically as you scroll
  const imageY = useTransform(scrollYProgress, [0, 1], [-50, 50]);

  const t = useTranslations("AboutStats");
  const stats = data?.stats && data.stats.length > 0 ? data.stats : STATS;

  return (
    <section className="w-full bg-white text-[#0B0B0C] pt-12 md:pt-16 pb-8 md:pb-12 border-t border-[#E4E2DF]">
      <div className="container mx-auto px-6 md:px-12" ref={containerRef}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Left: Large Image */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            style={{ y: imageY }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
            viewport={{ once: true, margin: "-100px" }}
            className="relative h-[500px] md:h-[700px] w-full rounded-3xl overflow-hidden group"
          >
            <Image 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000&auto=format&fit=crop" 
              alt="Agency Team" 
              fill
              className="object-cover grayscale transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Customer Happiness Overlap */}
            <div className="absolute bottom-8 right-8 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl flex items-center gap-4">
              <div className="flex -space-x-3">
                {AVATARS.map((src, i) => (
                  <div key={i} className="relative w-10 h-10 rounded-full border-2 border-white overflow-hidden flex-shrink-0">
                    <Image src={src} alt={`Client ${i+1}`} fill sizes="40px" className="object-cover" />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider">Customer Happiness</p>
                <div className="flex text-yellow-400 text-xs mt-1">
                  ★★★★★
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Content & Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col"
          >
            <h2 className="heading-section mb-6">{data?.title || t("title")}</h2>
            <p className="text-[#8A8A87] text-lg leading-relaxed mb-12">
              {data?.desc || t("desc")}
            </p>

            <div className="grid grid-cols-2 gap-x-8 gap-y-12">
              {stats.map((stat: any, index: number) => {
                // If it's real data, the value might be "250+", let's split it for the counter.
                const rawVal = String(stat.value || "");
                const numMatch = rawVal.match(/(\d+)/);
                const valStr = numMatch ? numMatch[0] : "0";
                const suffix = rawVal.replace(valStr, "");
                
                return (
                  <div key={stat.id || index}>
                    <div className="text-4xl md:text-5xl lg:text-6xl text-[#0B0B0C] mb-2 font-display">
                      <AnimatedCounter value={parseInt(valStr, 10) || 0} suffix={suffix} />
                    </div>
                    <p className="text-sm font-medium tracking-wide uppercase text-[#8A8A87]">
                      {stat.label || t(`stats.stat${index + 1}`)}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
