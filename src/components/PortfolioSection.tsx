"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowUpRight } from "lucide-react";
import { PORTFOLIO_PROJECTS } from "@/lib/data";
import { useTranslations } from "next-intl";

export default function PortfolioSection() {
  const t = useTranslations("Portfolio");
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: "center",
    skipSnaps: false
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, setScrollSnaps, onSelect]);

  return (
    <section id="projects" className="w-full pt-12 md:pt-16 pb-0 bg-[#F7F6F4] overflow-hidden">
      <div className="container mx-auto px-4 md:px-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E4E2DF] bg-white text-[#8A8A87] text-xs font-bold tracking-widest uppercase mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d9c2a0]" />
              {t("caseStudies")}
              <span className="w-1.5 h-1.5 rounded-full bg-[#d9c2a0]" />
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-[#0B0B0C] leading-tight tracking-tighter">
              {t("title")}
            </h2>
          </div>
          
          <button className="group inline-flex items-center gap-4 bg-[#0B0B0C] text-white px-8 py-4 rounded-full font-bold hover:shadow-xl hover:bg-[#d9c2a0] hover:text-[#0B0B0C] transition-all hover:scale-105 shrink-0">
            {t("viewAll")}
            <span className="bg-white text-[#0B0B0C] rounded-full p-1.5 group-hover:bg-[#0B0B0C] group-hover:text-white transition-colors duration-300">
              <ArrowUpRight size={18} strokeWidth={2.5} />
            </span>
          </button>
          
        </div>
      </div>

      {/* Carousel */}
      <div className="w-full relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y" style={{ marginLeft: "calc(50% - 40vw)" /* Fallback alignment for responsive */ }}>
            {PORTFOLIO_PROJECTS.map((project, index) => {
              return (
                <div 
                  key={project.id} 
                  className="group relative flex-[0_0_85vw] md:flex-[0_0_50vw] lg:flex-[0_0_35vw] min-w-0 pl-4 md:pl-8 cursor-pointer"
                >
                  <div className="relative w-full h-[450px] md:h-[500px]">
                    
                    {/* The Image Container */}
                    <div 
                      className="absolute top-0 left-0 w-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden rounded-3xl h-[60%] shadow-md group-hover:h-full group-hover:shadow-2xl"
                    >
                      <Image 
                        src={project.image} 
                        fill 
                        alt={t(`projects.proj${project.id}.title`)} 
                        className="object-cover" 
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      
                      {/* Tags */}
                      <div className="absolute top-5 left-5 bg-[#0B0B0C]/80 backdrop-blur-md text-white text-[10px] uppercase tracking-wider font-semibold px-3 py-1.5 rounded z-20">
                        {t(`projects.proj${project.id}.tags`)}
                      </div>
                      
                      {/* Dark Gradient Overlay for Active State */}
                      <div 
                        className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-700 z-10 opacity-0 group-hover:opacity-100" 
                      />
                    </div>

                    {/* Unified Text Container that sits below the image and slides up over it */}
                    <div 
                      className="absolute left-0 w-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-20 top-[60%] pt-6 px-0 group-hover:top-[100%] group-hover:-translate-y-[100%] group-hover:pt-0 group-hover:px-6 group-hover:pb-6 pointer-events-none group-hover:pointer-events-auto"
                    >
                      <h4 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 transition-colors duration-700 text-[#0B0B0C] group-hover:text-white">{t(`projects.proj${project.id}.title`)}</h4>
                      <p className="text-sm leading-relaxed line-clamp-3 transition-all duration-700 text-[#8A8A87] group-hover:text-white/80 pr-0 group-hover:pr-14">{t(`projects.proj${project.id}.description`)}</p>
                      
                      {/* Arrow Link Button inside image */}
                      <button className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white hover:text-[#0B0B0C] transition-all opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto duration-700 delay-100">
                        <ArrowUpRight size={18} strokeWidth={2} className="text-white group-hover:text-[#0B0B0C]" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-2 mt-16">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`transition-all duration-500 rounded-full ${
                index === selectedIndex 
                  ? 'w-10 h-2 bg-[#0B0B0C]' 
                  : 'w-2 h-2 bg-[#E4E2DF] hover:bg-[#8A8A87]'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
