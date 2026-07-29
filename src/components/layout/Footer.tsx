"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { ArrowRight, ArrowUp } from "lucide-react";
import MagneticButtonWrapper from "../MagneticButtonWrapper";

const Instagram = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const Linkedin = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);

const Twitter = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5 5 9.2 5 9.2s1.5.8 3 .5C3 8.3 4 4 4 4s1.7 1.5 3.5 2C10.5 1 17 2 17 6c1.5-.5 3-1.5 3-1.5z"/></svg>
);

const Dribbble = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94"/><path d="M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32"/><path d="M8.56 2.75c4.37 6 6 9.42 8 17.72"/></svg>
);

const SOCIAL_LINKS = [
  { icon: Instagram, href: "#" },
  { icon: Linkedin, href: "#" },
  { icon: Dribbble, href: "#" },
  { icon: Twitter, href: "#" },
];

export default function Footer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"],
  });

  const wordmarkY = useTransform(scrollYProgress, [0, 1], [100, 0]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const tFooter = useTranslations("Footer");
  const tNav = useTranslations("Navbar");

  const NAV_LINKS = [
    { num: "01", label: tNav("home"), href: "/" },
    { num: "02", label: tNav("services"), href: "/services" },
    { num: "03", label: tNav("blogs"), href: "/blogs" },
    { num: "04", label: tNav("about"), href: "/about" },
    { num: "05", label: tNav("contact"), href: "/contact" },
  ];

  return (
    <footer ref={containerRef} className="bg-[#F7F6F4] text-[#0B0B0C] pt-24 px-6 md:px-12 lg:px-24 overflow-hidden relative z-10">
      <div className="w-full mx-auto flex flex-col">
        
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-20 lg:gap-8 overflow-hidden py-4">
          {/* Top Left */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex-1 flex flex-col items-start w-full"
          >
            <h4 className="text-[#8A8A87] font-medium tracking-wide flex items-center gap-1 mb-8 text-xl">
              {tFooter("stayConnected")} <sup className="text-sm -mt-2">®</sup>
            </h4>
            
            <a 
              href="mailto:hello@the9thway.com" 
              className="text-4xl md:text-5xl lg:text-[5rem] font-bold underline decoration-[3px] underline-offset-[12px] decoration-black/20 hover:decoration-black transition-colors duration-300 mb-8 w-full truncate"
            >
              hello@the9thway.com
            </a>
            
            <p className="text-lg md:text-xl text-[#8A8A87] font-medium max-w-md leading-relaxed mb-12">
              {tFooter("desc")}
            </p>
            <MagneticButtonWrapper pullStrength={0.15}>
              <Link href="/contact" className="group relative flex items-center gap-4 rounded-full bg-[#0B0B0C] pl-2 pr-6 py-2 text-white overflow-hidden transition-colors duration-300">
                <span className="absolute inset-0 w-full h-full bg-[#1A1A1A] translate-y-[100%] rounded-full transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-y-0 z-0" />
                <div className="relative z-10 w-10 h-10 bg-[#d9c2a0] rounded-full flex items-center justify-center text-black">
                  <ArrowRight size={18} className="group-hover:-rotate-45 transition-transform duration-300" />
                </div>
                <span className="relative z-10 font-semibold tracking-wide text-sm">{tFooter("contactNow")}</span>
              </Link>
            </MagneticButtonWrapper>
          </motion.div>

          {/* Top Right */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
            viewport={{ once: true, margin: "-100px" }}
            className="w-full lg:w-[45%] flex flex-col relative mt-12 lg:mt-0"
          >
            {/* Badge */}
            <div className="lg:absolute lg:-top-4 lg:right-0 mb-8 lg:mb-0 flex justify-start lg:justify-end">
              <div className="inline-flex items-center justify-center px-5 py-2 border border-[#E4E2DF] rounded-full text-xs font-semibold uppercase tracking-widest bg-white shadow-sm text-[#0B0B0C]">
                {tFooter("certified")}
              </div>
            </div>

            <ul className="flex flex-col w-full mt-4 lg:mt-16">
              {NAV_LINKS.map((link, idx) => (
                <li key={idx} className="border-t border-[#E4E2DF] last:border-b group cursor-pointer relative overflow-hidden">
                  <div className="absolute inset-0 bg-white w-full h-full -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-0"></div>
                  
                  <Link href={link.href} className="relative z-10 py-6 md:py-8 flex items-center justify-between px-2">
                    <div className="flex items-center gap-6 md:gap-12">
                      <span className="text-sm font-semibold text-[#8A8A87] w-6">{link.num}/</span>
                      <span className="text-2xl md:text-4xl font-semibold group-hover:translate-x-4 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]">{link.label}</span>
                    </div>
                    <ArrowRight className="text-[#8A8A87] group-hover:text-[#0B0B0C] group-hover:translate-x-2 transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Divider line */}
        <div className="w-full h-px bg-[#E4E2DF] my-16 lg:my-24"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-12 pb-16 relative">
          {/* Wordmark */}
          <div className="flex-1 w-full overflow-hidden flex items-end">
            <motion.h1 
              style={{ y: wordmarkY }}
              className="text-[14vw] md:text-[15.5vw] font-display font-bold leading-[0.8] tracking-tighter text-[#0B0B0C] -ml-[0.5vw]"
            >
              THE9THWAY
            </motion.h1>
          </div>

          {/* Social Links Block */}
          <div className="bg-white rounded-3xl p-2.5 flex gap-2 shadow-sm shrink-0 mb-2 md:mb-6 z-10">
            {SOCIAL_LINKS.map((social, idx) => {
              const Icon = social.icon;
              return (
                <a 
                  key={idx}
                  href={social.href}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-[#E4E2DF] flex items-center justify-center text-[#0B0B0C] transition-all duration-300 hover:bg-[#d9c2a0] hover:scale-110 hover:border-transparent group"
                >
                  <Icon size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center py-8 border-t border-[#E4E2DF] text-sm text-[#8A8A87] font-medium">
          <p>{tFooter("copyright")}</p>
          <button 
            onClick={scrollToTop}
            className="flex items-center gap-2 text-[#0B0B0C] hover:text-[#8A8A87] transition-colors mt-6 sm:mt-0 group uppercase font-bold tracking-widest text-[11px]"
          >
            {tFooter("backToTop")}
            <ArrowUp size={16} className="group-hover:-translate-y-1.5 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </footer>
  );
}
