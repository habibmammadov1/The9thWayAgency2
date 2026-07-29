"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { CARDS } from "@/lib/data";
import { useTranslations } from "next-intl";

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

export default function UniquenessSection() {
  const t = useTranslations("Uniqueness");

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
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6"
          >
            {CARDS.map((card) => (
              <motion.div 
                key={card.id}
                variants={cardVariants}
                className="group relative flex flex-col items-center text-center transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2"
              >
                {/* Photo Top Area */}
                <div className="relative w-full mb-10">
                  <div className="relative w-full aspect-[4/3] rounded-t-2xl overflow-hidden bg-[#F7F6F4] shadow-sm group-hover:shadow-md transition-shadow duration-400">
                    <Image 
                      src={card.image!} 
                      fill 
                      alt={t(`cards.card${card.id}.title`)} 
                      className="object-cover grayscale opacity-90 transition-all duration-400 group-hover:scale-105" 
                      sizes="(max-width: 1024px) 100vw, 25vw" 
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#d9c2a0]/90 to-transparent mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-400 z-0" />
                  </div>
                  
                  {/* Icon Badge with cut-out effect */}
                  <div className="absolute bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2 w-14 h-14 bg-[#FCE5E0] rounded-full flex items-center justify-center border-[6px] border-white group-hover:bg-[#d9c2a0] transition-colors duration-400 z-10 box-content">
                     <div className="text-[#0B0B0C] transition-colors">{card.icon}</div>
                  </div>
                </div>

                <div className="px-4">
                  <h4 className="text-lg font-bold mb-3 text-[#0B0B0C]">{t(`cards.card${card.id}.title`)}</h4>
                  <p className="text-sm text-[#8A8A87] leading-relaxed">{t(`cards.card${card.id}.desc`)}</p>
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
