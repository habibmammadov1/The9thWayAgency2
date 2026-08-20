"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { ArrowRight, MessageSquare, Heart, ArrowUpRight } from "lucide-react";
import { SERVICES_PAGE_DATA } from "@/lib/data";

const ACCENT = "#D9C2A0";

// Floating UI components for the right image column
const FloatingElements = ({ activeIndex }: { activeIndex: number }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {/* Floating Chat Bubble */}
      <motion.div 
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] left-[10%] bg-white rounded-2xl p-3 shadow-2xl flex items-center gap-3 border border-white/20 backdrop-blur-md"
      >
        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
          <MessageSquare size={14} className="text-accent" />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="w-16 h-2 bg-gray-200 rounded-full" />
          <div className="w-10 h-2 bg-gray-200 rounded-full" />
        </div>
      </motion.div>

      {/* Floating Heart */}
      <motion.div 
        animate={{ y: [0, 20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-[40%] right-[10%] w-12 h-12 bg-accent rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(217,194,160,0.4)]"
      >
        <Heart size={20} fill="var(--color-black)" className="text-black" />
      </motion.div>

      {/* Floating Notification */}
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[20%] left-[20%] bg-black rounded-xl p-3 shadow-xl flex items-center gap-3 border border-gray-500"
      >
        <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
          <ArrowUpRight size={12} className="text-black" />
        </div>
        <span className="text-white text-xs font-bold">+120%</span>
      </motion.div>
    </div>
  );
};

// Middle column Icon Graphic
const ConcentricIcon = () => (
  <div className="relative w-20 h-20 mb-8 flex items-center justify-center">
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute inset-0 border border-accent rounded-full opacity-30"
    />
    <motion.div 
      animate={{ rotate: -360 }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      className="absolute inset-2 border border-white rounded-full opacity-30"
    />
    <div className="absolute inset-4 border border-accent rounded-full opacity-60" />
    <div className="w-4 h-4 bg-accent rounded-full shadow-[0_0_15px_rgba(217,194,160,0.8)]" />
  </div>
);

export default function ServicesList({ initialData }: { initialData?: any }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const data = initialData || { intro: {}, services: [] };
  const servicesList = data.services.length > 0 ? data.services : [0, 1, 2, 3, 4].map(idx => ({
    id: idx,
    title: `Service ${idx}`,
    desc: `Description for service ${idx}`,
    bullets: ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
    image: SERVICES_PAGE_DATA[idx]?.image || SERVICES_PAGE_DATA[0].image
  }));

  const activeData = servicesList[activeIndex] || servicesList[0];

  return (
    <section className="relative w-full bg-paper pt-24 pb-32">
      <div className="container mx-auto px-6 md:px-12 lg:px-8 xl:px-12">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center mb-16 lg:mb-24 text-center"
        >
          {/* Pill removed per request */}
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-display font-bold text-black leading-[1.1] max-w-4xl tracking-tight mt-8 lg:mt-12">
            {data.intro?.heading || "Böyüməni Təmin Edən Marketinq Xidmətlərimiz."}
          </h2>
        </motion.div>

        {/* Desktop 3-Column Layout */}
        {!isMobile && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-12 gap-6 bg-gradient-to-br from-[var(--color-ink)] to-[var(--color-ink-light)] rounded-[2rem] p-6 shadow-2xl"
          >
            {/* Column 1: List */}
            <div className="col-span-4 flex flex-col gap-4 relative">
              <div className="flex flex-col gap-3">
                {servicesList.map((service: any, idx: number) => {
                  const isActive = activeIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveIndex(idx)}
                      className={`relative w-full text-left px-6 py-6 rounded-2xl transition-all duration-500 overflow-hidden group ${
                        isActive ? "bg-white/5" : "bg-transparent hover:bg-white/5"
                      }`}
                    >
                      {/* Active Border Glow */}
                      {isActive && (
                        <div className="absolute inset-0 rounded-2xl border border-accent/50 shadow-[inset_0_0_20px_rgba(217,194,160,0.15)] pointer-events-none" />
                      )}
                      
                      <div className="relative z-10 flex items-center gap-6">
                        <span className={`text-lg font-semibold transition-colors duration-500 ${isActive ? "text-accent" : "text-gray-500"}`}>
                          0{idx + 1}
                        </span>
                        <span className={`text-xl font-bold transition-colors duration-500 ${isActive ? "text-accent" : "text-white"}`}>
                          {service.title}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button className="mt-4 w-full relative overflow-hidden rounded-2xl p-[2px] group">
                <span className="absolute inset-0 bg-gradient-to-r from-ink via-accent to-ink bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]" />
                <div className="relative bg-black px-6 py-6 rounded-2xl flex items-center justify-between group-hover:bg-transparent transition-colors duration-500">
                  <span className="text-white font-bold group-hover:text-black transition-colors">{data.intro?.ctaLabel || "Bütün Xidmətlərə Bax"}</span>
                  <ArrowRight className="text-accent group-hover:text-black transition-colors" />
                </div>
              </button>
            </div>

            {/* Column 2: Content (Crossfade) */}
            <div className="col-span-4 rounded-2xl p-10 flex flex-col justify-between overflow-hidden relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="flex flex-col h-full"
                >
                  <ConcentricIcon />
                  
                  <p className="text-gray-600 text-lg leading-relaxed mb-10 min-h-[120px]">
                    {activeData.description || activeData.desc}
                  </p>

                  <ul className="space-y-4 mb-10 w-full">
                    {(activeData.bullets || activeData.features || []).map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-4 border-b border-black/5 pb-3 w-full group">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent group-hover:scale-150 transition-transform" />
                        <span className="text-black font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>

              {/* Bottom Read More Action */}
              <div className="flex items-center gap-4 mt-auto">
                <span className="text-gray-500 text-sm font-semibold tracking-wide">Daha Ətraflı</span>
                <div className="flex-1 h-[1px] bg-gray-500" />
                <button className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center hover:bg-accent hover:text-black text-white transition-colors duration-300">
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Column 3: Image (Crossfade) */}
            <div className="col-span-4 rounded-2xl overflow-hidden relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <Image 
                    src={activeData.imageUrl || activeData.image || SERVICES_PAGE_DATA[0].image}
                    alt={activeData.title || "Service image"}
                    fill
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                    sizes="(max-width: 1280px) 33vw, 400px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                  
                  <FloatingElements activeIndex={activeIndex} />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Mobile Accordion Layout */}
        {isMobile && (
          <div className="flex flex-col gap-4 bg-gradient-to-br from-[var(--color-ink)] to-[var(--color-ink-light)] rounded-3xl p-4 shadow-2xl">
            {servicesList.map((service: any, idx: number) => {
              const isActive = activeIndex === idx;
              return (
                <div key={idx} className="flex flex-col">
                  <button
                    onClick={() => setActiveIndex(isActive ? -1 : idx)}
                    className={`relative w-full text-left px-5 py-5 rounded-2xl transition-all duration-300 ${
                      isActive ? "bg-ink border border-accent/50 shadow-[inset_0_0_15px_rgba(217,194,160,0.1)]" : "bg-ink"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className={`text-sm font-semibold ${isActive ? "text-accent" : "text-gray-500"}`}>
                          0{idx + 1}
                        </span>
                        <span className={`text-lg font-bold pr-2 ${isActive ? "text-accent" : "text-white"}`}>
                          {service.title}
                        </span>
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-colors ${isActive ? "border-accent text-accent" : "border-gray-500 text-white"}`}>
                         {isActive ? <span className="mb-1">-</span> : <span className="mb-1">+</span>}
                      </div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 flex flex-col gap-6">
                          <ConcentricIcon />
                          <p className="text-gray-200 text-sm leading-relaxed">
                            {service.description || service.desc}
                          </p>
                          <ul className="flex flex-col gap-3">
                            {(service.bullets || service.features || []).map((feature: string, i: number) => (
                              <li key={i} className="flex items-center gap-3 text-xs font-medium text-gray-500">
                                <span className="w-1 h-1 rounded-full bg-accent shadow-[0_0_5px_rgba(217,194,160,0.5)] shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                          
                          <div className="relative w-full h-[250px] rounded-xl overflow-hidden mt-4">
                            <Image 
                              src={service.imageUrl || service.image || SERVICES_PAGE_DATA[idx]?.image || SERVICES_PAGE_DATA[0].image}
                              alt={service.title || "Service image"}
                              fill
                              className="object-cover grayscale"
                              sizes="100vw"
                            />
                            <div className="absolute inset-0 bg-black/20" />
                          </div>

                          <button className="flex items-center justify-center gap-3 w-full py-4 mt-2 bg-gray-500 rounded-xl hover:bg-accent hover:text-black text-white transition-colors font-semibold text-sm">
                            Daha Ətraflı
                            <ArrowRight size={16} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
            
            <button className="mt-2 w-full relative overflow-hidden rounded-2xl p-[1px] group">
              <span className="absolute inset-0 bg-gradient-to-r from-ink via-accent to-ink bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]" />
              <div className="relative bg-black px-5 py-5 rounded-2xl flex items-center justify-between group-hover:bg-transparent transition-colors duration-500">
                <span className="text-white font-bold text-sm group-hover:text-black transition-colors">{data.intro?.ctaLabel || "Bütün Xidmətlərə Bax"}</span>
                <ArrowRight size={18} className="text-accent group-hover:text-black transition-colors" />
              </div>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
