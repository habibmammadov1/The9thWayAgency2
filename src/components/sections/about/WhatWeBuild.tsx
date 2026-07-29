"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { BarChart, Target, Users } from "lucide-react";

export default function WhatWeBuild() {
  const t = useTranslations("AboutPage.WhatWeBuild");

  // Icon mapping for features
  const featureIcons = [
    <BarChart key="0" className="w-5 h-5 text-black" strokeWidth={2} />,
    <Target key="1" className="w-5 h-5 text-black" strokeWidth={2} />,
    <Users key="2" className="w-5 h-5 text-black" strokeWidth={2} />,
  ];

  return (
    <section className="relative w-full pt-4 pb-12 lg:pt-4 lg:pb-16 bg-paper overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 lg:px-8 xl:px-12">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          
          {/* Left Column: Image */}
          <div className="relative w-full max-w-xl mx-auto lg:max-w-none h-full min-h-[400px] lg:min-h-[600px]">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative w-full h-full aspect-square lg:aspect-auto lg:absolute lg:inset-0 rounded-3xl overflow-hidden shadow-sm"
            >
              <Image
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2000&auto=format&fit=crop"
                alt="Team Collaborating"
                fill
                className="object-cover grayscale"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Brand overlay on image */}
              <div className="absolute inset-0 bg-accent mix-blend-overlay opacity-10" />
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
                {t("heading")}
              </h2>
              <p className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-xl">
                {t("paragraph")}
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
              <span className="w-2.5 h-2.5 rounded-full bg-accent flex-shrink-0" />
              <div className="h-px w-full bg-gray-200" />
            </motion.div>

            {/* Features List */}
            <div className="flex flex-col gap-8 mb-12">
              {[0, 1, 2].map((idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: 0.3 + (idx * 0.15) }}
                  className="flex items-start gap-6 group"
                >
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    {featureIcons[idx]}
                  </div>
                  <div className="flex flex-col gap-2 pt-1">
                    <h3 className="text-xl md:text-2xl font-display font-bold text-black group-hover:text-ink transition-colors">
                      {t(`features.${idx}.title`)}
                    </h3>
                    <p className="text-gray-500 leading-relaxed max-w-md">
                      {t(`features.${idx}.description`)}
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
                  className="inline-flex items-center justify-center px-8 py-4 bg-accent text-black rounded-full font-bold uppercase tracking-widest text-sm hover:scale-105 hover:bg-[#cbf536] transition-all duration-300 shadow-sm"
                >
                  {t("buttonLabel")}
                </Link>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
