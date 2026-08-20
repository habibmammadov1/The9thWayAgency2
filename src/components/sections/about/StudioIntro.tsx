"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Maximize2, X } from "lucide-react";

interface StudioIntroProps {
  data?: {
    overline: string;
    heading: string;
    paragraph: string;
    image1Url?: string | null;
    image2Url?: string | null;
  } | null;
}

export default function StudioIntro({ data }: StudioIntroProps) {
  const t = useTranslations("AboutPage");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const overline = data?.overline || t("overline");
  const heading = data?.heading || t("heading");
  const paragraph = data?.paragraph || t("paragraph");

  // Images for the studio intro
  const images = [
    data?.image1Url || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000&auto=format&fit=crop", // Left image (creative collaboration)
    data?.image2Url || "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2000&auto=format&fit=crop", // Right image (team strategy)
  ];

  return (
    <section className="relative w-full pt-12 pb-12 md:pt-16 md:pb-16 bg-paper">
      <div className="container mx-auto px-6 md:px-12 lg:px-8 xl:px-12">
        
        {/* Top Text Content */}
        <div className="flex flex-col items-center text-center gap-6 lg:gap-8 mb-16 md:mb-24 max-w-5xl mx-auto">
          
          {/* Overline */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/50 border border-gray-200 px-4 py-2 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D9C2A0]" />
              <span className="text-black text-xs md:text-sm font-bold tracking-widest uppercase">
                {overline}
              </span>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-black uppercase leading-[1.1] tracking-tight"
          >
            {heading}
          </motion.h2>

          {/* Paragraph */}
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-500 text-base md:text-lg lg:text-xl leading-relaxed max-w-3xl"
          >
            {paragraph}
          </motion.p>
        </div>

        {/* Bottom Images Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          
          {/* Left Image (Interactive Lightbox) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative w-full h-[400px] md:h-[600px] rounded-2xl overflow-hidden group cursor-pointer"
            onClick={() => setIsFullscreen(true)}
          >
            <Image
              src={images[0]}
              alt="Studio Workspace"
              fill
              className="object-cover grayscale group-hover:scale-105 transition-transform duration-700 ease-out"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Subtle Brand Overlay */}
            <div className="absolute inset-0 bg-[#D9C2A0] mix-blend-overlay opacity-10 group-hover:opacity-20 transition-opacity duration-500" />
            
            {/* Expand Button (Bottom Right) */}
            <div className="absolute bottom-6 right-6 w-12 h-12 md:w-14 md:h-14 bg-[#D9C2A0] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Maximize2 size={24} className="text-black" />
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative w-full h-[400px] md:h-[600px] rounded-2xl overflow-hidden group"
          >
            <Image
              src={images[1]}
              alt="Studio Team"
              fill
              className="object-cover grayscale group-hover:scale-105 transition-transform duration-700 ease-out"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Subtle Brand Overlay */}
            <div className="absolute inset-0 bg-[#D9C2A0] mix-blend-overlay opacity-10 group-hover:opacity-20 transition-opacity duration-500" />
          </motion.div>

        </div>
      </div>

      {/* Lightbox Overlay */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
            onClick={() => setIsFullscreen(false)}
          >
            {/* Close Button */}
            <button 
              className="absolute top-6 right-6 md:top-10 md:right-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors z-50 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsFullscreen(false);
              }}
            >
              <X size={24} />
            </button>

            {/* Fullscreen Image */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full h-full max-w-6xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl cursor-default"
              onClick={(e) => e.stopPropagation()} // Prevent click inside from closing
            >
              <Image
                src={images[0]}
                alt="Studio Workspace Fullscreen"
                fill
                className="object-contain"
                sizes="100vw"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
