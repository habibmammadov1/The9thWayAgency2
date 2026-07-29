"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { 
  Users, Target, TrendingUp, LifeBuoy, 
  MessageCircle, Mail 
} from "lucide-react";

const Instagram = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const Linkedin = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);

export default function ContactWhyChooseUs() {
  const t = useTranslations("ContactPage.WhyChooseUs");

  const cardsData = [
    { icon: <Users size={24} className="text-black" />, id: "0" },
    { icon: <Target size={24} className="text-black" />, id: "1" },
    { icon: <TrendingUp size={24} className="text-black" />, id: "2" },
    { icon: <LifeBuoy size={24} className="text-black" />, id: "3" },
  ];

  const socialLinks = [
    { icon: <MessageCircle size={20} />, href: "#" },
    { icon: <Instagram size={20} />, href: "#" },
    { icon: <Linkedin size={20} />, href: "#" },
    { icon: <Mail size={20} />, href: "#" },
  ];

  const [activeCard, setActiveCard] = React.useState<number | null>(null);

  return (
    <section className="relative z-10 w-full pt-32 pb-20 lg:pt-40 lg:pb-32 bg-white overflow-hidden">
      <div className="container mx-auto">
        
        {/* Overline & Divider */}
        <div className="flex flex-col gap-6 mb-12 md:mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-black text-xs md:text-sm font-bold tracking-widest uppercase">
              {t("overline")}
            </span>
          </motion.div>
          <div className="w-full h-px bg-gray-200" />
        </div>

        {/* 2-Column Layout */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column (Dark Card) */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 w-full bg-gradient-to-br from-ink to-ink-light rounded-[32px] p-8 md:p-12 flex flex-col justify-between shadow-xl shadow-black/10 border border-white/5 overflow-hidden h-full min-h-[500px]"
          >
            {/* Chart Widget */}
            <div className="w-full flex flex-col gap-6 mb-16">
              <div className="flex items-end justify-between gap-2 h-40 md:h-48 border-b border-white/10 pb-4">
                {[
                  { id: "l1", height: "40%" },
                  { id: "l2", height: "60%" },
                  { id: "l3", height: "80%" },
                  { id: "l4", height: "100%" },
                ].map((bar, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-3 w-1/4">
                    <div className="w-full h-full flex items-end justify-center relative group">
                      {/* Animated Bar */}
                      <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: bar.height }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1, delay: 0.2 + (idx * 0.1), ease: [0.16, 1, 0.3, 1] }}
                        className="w-10 md:w-14 bg-gradient-to-t from-[#2a2a2a] to-accent rounded-t-lg origin-bottom relative"
                      >
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-accent/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </motion.div>
                    </div>
                    <span className="text-white/60 text-xs md:text-sm font-medium tracking-wide">
                      {t(`chartLabels.${bar.id}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Content */}
            <div className="flex flex-col gap-4">
              <h3 className="text-2xl md:text-3xl font-display font-bold text-white leading-tight">
                {t("chartHeading")}
              </h3>
              <p className="text-gray-400 leading-relaxed text-sm md:text-base max-w-sm">
                {t("chartDesc")}
              </p>
            </div>
          </motion.div>

          {/* Right Column (Content & Cards) */}
          <div className="lg:col-span-7 w-full flex flex-col pt-4 lg:pt-8">
            
            {/* Heading & Paragraph */}
            <div className="flex flex-col gap-6 mb-16 md:mb-24">
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-black uppercase leading-[1.05] tracking-tight"
              >
                {t("heading")}
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-gray-500 text-lg md:text-xl leading-relaxed max-w-2xl"
              >
                {t("paragraph")}
              </motion.p>
            </div>

            {/* Floating Fanned Cards Stack */}
            <div className="relative w-full h-[350px] md:h-[400px] flex items-center justify-center lg:justify-start lg:pl-12">
              {cardsData.map((card, idx) => {
                const isActive = activeCard === idx;
                const isAnyActive = activeCard !== null;

                const rotations = [-12, -4, 4, 12];
                const xOffsets = [-60, -20, 20, 60];
                const yOffsets = [20, 5, 5, 20];

                const targetY = isActive ? -40 : (isAnyActive ? yOffsets[idx] + 20 : yOffsets[idx]);
                const targetX = isActive ? 0 : xOffsets[idx];
                const targetRotate = isActive ? 0 : rotations[idx];
                const targetScale = isActive ? 1.05 : (isAnyActive ? 0.95 : 1);
                const targetZ = isActive ? 50 : idx;

                return (
                  <motion.div
                    key={idx}
                    onClick={() => setActiveCard(isActive ? null : idx)}
                    initial={{ opacity: 0, y: 100, rotate: 0, scale: 0.8 }}
                    whileInView={{ 
                      opacity: 1, 
                      y: targetY, 
                      x: targetX,
                      rotate: targetRotate,
                      scale: targetScale
                    }}
                    whileHover={!isActive ? { y: targetY - 10, scale: targetScale * 1.02 } : {}}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ 
                      type: "spring", 
                      damping: isActive ? 15 : 18, 
                      stiffness: isActive ? 150 : 100, 
                      delay: isAnyActive ? 0 : 0.4 + (idx * 0.1) 
                    }}
                    className={`absolute bg-white border border-gray-200/60 p-6 rounded-3xl shadow-xl w-[260px] md:w-[280px] cursor-pointer transition-colors duration-300 group ${isActive ? 'border-accent/50 shadow-2xl shadow-black/10' : 'hover:border-gray-300'}`}
                    style={{ zIndex: targetZ }}
                  >
                    <div className="flex flex-col gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${isActive ? 'bg-accent' : 'bg-accent/20 group-hover:bg-accent/50'}`}>
                        {card.icon}
                      </div>
                      <h4 className="text-lg font-bold text-black tracking-tight leading-snug">
                        {t(`cards.${card.id}.title`)}
                      </h4>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {t(`cards.${card.id}.desc`)}
                      </p>
                      
                      {/* Close Indicator */}
                      {isActive && (
                        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-black transition-colors">
                          <span className="text-xs font-bold font-sans">✕</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </div>

        {/* Bottom Contact Band */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="w-full mt-20 md:mt-32 bg-paper rounded-[32px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12"
        >
          <span className="text-lg md:text-xl font-bold text-black tracking-wide text-center md:text-left">
            {t("bottomText")}
          </span>
          
          <div className="flex items-center gap-3">
            {socialLinks.map((social, idx) => (
              <a 
                key={idx}
                href={social.href}
                className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-black hover:bg-accent hover:border-transparent hover:scale-110 hover:-rotate-6 transition-all duration-300 shadow-sm"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
