"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function StickyCTA() {
  const t = useTranslations("StickyCTA");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show CTA only after scrolling down 100vh
      if (window.scrollY > window.innerHeight) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.8 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40"
        >
          {/* Using a group and relative position so it doesn't collide with the scroll progress bar which is at right-0 */}
          <Link href="#contact" className="group flex items-center justify-center relative">
            {/* The pulse effect behind */}
            <div className="absolute inset-0 bg-[#d9c2a0] rounded-full blur-md opacity-40 group-hover:opacity-70 animate-pulse transition-opacity"></div>
            
            <div className="relative flex items-center gap-2 bg-[#d9c2a0] text-[#0B0B0C] px-5 py-3 md:px-6 md:py-4 rounded-full shadow-xl hover:shadow-2xl hover:bg-[#0B0B0C] hover:text-[#d9c2a0] transition-all duration-300 transform hover:-translate-y-1">
              <MessageCircle size={20} className="md:w-6 md:h-6" />
              <span className="font-semibold text-sm md:text-base hidden sm:block">{t("text")}</span>
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
