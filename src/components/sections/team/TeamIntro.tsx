"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function TeamIntro() {
  const t = useTranslations("TeamPage.Intro");

  return (
    <section className="relative w-full pt-32 pb-16 md:pt-40 md:pb-24 bg-paper overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 text-center flex flex-col items-center">
        
        {/* Pill Label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 px-4 py-2 rounded-full mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#cbf536]" />
          <span className="text-black text-xs md:text-sm font-bold tracking-widest uppercase">
            {t("pill")}
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-black uppercase leading-[1.1] tracking-tight max-w-4xl mb-6"
        >
          {t("heading")}
        </motion.h1>

        {/* Paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-2xl"
        >
          {t("paragraph")}
        </motion.p>

      </div>
    </section>
  );
}
