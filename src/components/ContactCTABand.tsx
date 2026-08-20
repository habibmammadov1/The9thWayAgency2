"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";

export default function ContactCTABand() {
  const t = useTranslations("AboutPage.AboutContactCTA");

  return (
    <section className="relative w-full py-12 md:py-16 bg-ink overflow-hidden">
      
      {/* Background Subtle Gradient Blobs (reusing hero-style treatment) */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute -top-1/2 -left-1/4 w-[1000px] h-[1000px] bg-[#D9C2A0]/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute -bottom-1/2 -right-1/4 w-[800px] h-[800px] bg-[#D9C2A0]/10 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      <div className="container relative z-10 mx-auto px-6 md:px-12 text-center flex flex-col items-center">
        
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white uppercase leading-[1.1] tracking-tight max-w-4xl mb-6"
        >
          {t("heading")}
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-2xl mb-12"
        >
          {t("paragraph")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link
            href="/contact"
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#D9C2A0] text-black rounded-full font-bold uppercase tracking-widest text-sm overflow-hidden transition-transform hover:scale-105 shadow-[0_0_40px_rgba(217,194,160,0.15)]"
          >
            {/* Magnetic Hover Background Effect */}
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            
            <span className="relative z-10">{t("buttonLabel")}</span>
            <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
