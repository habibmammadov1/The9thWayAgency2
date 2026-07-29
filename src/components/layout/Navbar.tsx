"use client";

import React, { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import MobileMenuOverlay from "./MobileMenuOverlay";
import MagneticButtonWrapper from "../MagneticButtonWrapper";
import LanguageSwitcher from "../ui/LanguageSwitcher";

// A simple 3x3 grid dots icon component
const GridDotsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <circle cx="5" cy="5" r="2" />
    <circle cx="12" cy="5" r="2" />
    <circle cx="19" cy="5" r="2" />
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
    <circle cx="5" cy="19" r="2" />
    <circle cx="12" cy="19" r="2" />
    <circle cx="19" cy="19" r="2" />
  </svg>
);

export default function Navbar() {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const t = useTranslations("Navbar");

  const NAV_LINKS = [
    { label: t("home"), href: "/" },
    { label: t("services"), href: "/services" },
    { label: t("portfolio"), href: "/portfolio" },
    { label: t("blogs"), href: "/blogs" },
    { label: t("about"), href: "/about" },
    { label: t("contact"), href: "/contact" },
  ];

  // Dynamic shadow to lift it further when scrolled
  const shadowValue = useTransform(
    scrollY,
    [0, 50],
    [
      "0px 4px 16px rgba(0, 0, 0, 0.04)",
      "0px 12px 32px rgba(0, 0, 0, 0.1)"
    ]
  );

  return (
    <>
      <div className="fixed top-4 md:top-6 left-0 right-0 z-50 px-4 md:px-12 lg:px-24 pointer-events-none flex justify-center">
        <div className="w-full flex items-center justify-between">
          
          {/* Left Container */}
          <motion.div 
            style={{ boxShadow: shadowValue }}
            className="pointer-events-auto bg-white rounded-2xl px-6 md:px-8 py-4 flex-1 flex items-center justify-between border border-black/5"
          >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-extrabold text-2xl tracking-tighter text-[#0B0B0C]">
              <div className="w-3.5 h-3.5 rounded-full bg-[#d9c2a0]"></div>
              THE9THWAY
            </Link>

            {/* Desktop Links */}
            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link 
                    key={link.label} 
                    href={link.href}
                    className={`relative text-[15px] transition-colors duration-300 group ${isActive ? 'font-bold text-[#0B0B0C]' : 'font-medium text-[#8A8A87] hover:text-[#0B0B0C]'}`}
                  >
                    {link.label}
                    
                    {/* Hover underline */}
                    <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#d9c2a0] scale-x-0 origin-left transition-transform duration-300 ease-out group-hover:scale-x-100"></span>

                    {/* Active dot */}
                    {isActive && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#d9c2a0]"></span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </motion.div>

          {/* Connector Bridge */}
          <div className="hidden sm:flex items-center justify-center px-1.5 md:px-2 pointer-events-auto">
            <div className="w-6 md:w-8 h-1 rounded-full bg-[#d9c2a0]"></div>
          </div>

          {/* Right Container */}
          <motion.div 
            style={{ boxShadow: shadowValue }}
            className="pointer-events-auto bg-white rounded-2xl p-2 flex items-center gap-2 border border-black/5"
          >
            <LanguageSwitcher />

            {/* CTA Button */}
            <div className="hidden sm:block">
              <MagneticButtonWrapper pullStrength={0.15}>
                <Link 
                  href="/contact"
                  className="flex bg-[#d9c2a0] text-[#0B0B0C] px-6 py-3 text-[14px] font-bold hover:bg-[#0B0B0C] hover:text-[#d9c2a0] transition-colors duration-300 items-center justify-center rounded-[14px]"
                >
                  {t("getConsultation")}
                </Link>
              </MagneticButtonWrapper>
            </div>

            {/* Dots Menu Button */}
            <button 
              onClick={() => setIsOverlayOpen(true)}
              className="w-[46px] h-[46px] flex items-center justify-center rounded-[14px] border border-dashed border-gray-300 text-[#0B0B0C] hover:border-solid hover:bg-gray-100 hover:border-gray-400 transition-all duration-300 group"
              aria-label="Open Menu"
            >
              <span className="group-hover:rotate-90 group-hover:scale-110 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]">
                <GridDotsIcon />
              </span>
            </button>
          </motion.div>

        </div>
      </div>

      <MobileMenuOverlay 
        isOpen={isOverlayOpen} 
        onClose={() => setIsOverlayOpen(false)} 
      />
    </>
  );
}
