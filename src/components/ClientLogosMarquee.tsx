"use client";

import React from "react";
import { LOGOS } from "@/lib/data";
import { useTranslations } from "next-intl";

export default function ClientLogosMarquee() {
  const t = useTranslations("ClientLogos");
  // Duplicate array to ensure seamless infinite scroll
  const duplicatedLogos = [...LOGOS, ...LOGOS, ...LOGOS];

  return (
    <section className="w-full bg-[#0B0B0C] py-8 border-b border-white/5 relative overflow-hidden flex items-center">
      
      {/* Left Static Label */}
      <div className="absolute left-0 top-0 bottom-0 z-20 bg-gradient-to-r from-[#0B0B0C] via-[#0B0B0C] to-transparent w-48 md:w-64 flex items-center px-6 md:px-12 pointer-events-none">
        <p className="text-xs md:text-sm font-medium tracking-widest uppercase text-[#8A8A87]">
          {t("trustedBy")}
        </p>
      </div>

      {/* Marquee Track */}
      <div className="flex animate-marquee group">
        {duplicatedLogos.map((logo, idx) => (
          <div 
            key={`${logo.id}-${idx}`} 
            className="flex-shrink-0 flex items-center justify-center w-40 md:w-56 mx-4"
          >
            <img 
              src={logo.src} 
              alt={logo.name} 
              className="h-6 md:h-8 object-contain filter grayscale opacity-60 transition-all duration-300 group-hover:hover:grayscale-0 group-hover:hover:opacity-100"
              style={{ filter: "brightness(0) invert(1)" }} // Forces logos to white initially for dark bg
            />
          </div>
        ))}
      </div>

      {/* Right Gradient Fade */}
      <div className="absolute right-0 top-0 bottom-0 z-20 bg-gradient-to-l from-[#0B0B0C] to-transparent w-24 md:w-32 pointer-events-none" />

    </section>
  );
}
