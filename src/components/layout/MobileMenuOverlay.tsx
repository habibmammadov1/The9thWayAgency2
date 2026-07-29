"use client";

import React from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

const SOCIAL_LINKS = [
  { name: "Instagram", href: "#" },
  { name: "LinkedIn", href: "#" },
  { name: "Twitter", href: "#" },
  { name: "Dribbble", href: "#" },
];

interface MobileMenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenuOverlay({ isOpen, onClose }: MobileMenuOverlayProps) {
  const t = useTranslations("Navbar");

  const NAV_LINKS = [
    { num: "01", label: t("home"), href: "/" },
    { num: "02", label: t("services"), href: "/services" },
    { num: "03", label: t("portfolio"), href: "/portfolio" },
    { num: "04", label: t("blogs"), href: "/blogs" },
    { num: "05", label: t("about"), href: "/about" },
    { num: "06", label: t("contact"), href: "/contact" },
    { num: "07", label: t("getConsultation"), href: "/contact" },
  ];

  // Prevent scrolling when overlay is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const menuVariants: Variants = {
    closed: { y: "-100%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } },
    open: { y: "0%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }
  };

  const linkVariants: Variants = {
    closed: { y: 50, opacity: 0 },
    open: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: { delay: 0.3 + i * 0.1, duration: 0.5, ease: [0.76, 0, 0.24, 1] }
    })
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="closed"
          animate="open"
          exit="closed"
          variants={menuVariants}
          className="fixed inset-0 z-[100] bg-[#0B0B0C] text-[#F7F6F4] flex flex-col px-6 md:px-12 py-8 overflow-hidden"
        >
          {/* Top Header */}
          <div className="flex justify-between items-center mb-12">
            <span className="text-xl font-bold tracking-tight">THE9THWAY</span>
            <button 
              onClick={onClose}
              className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto">
            {/* Links List */}
            <div className="flex-1 flex flex-col justify-center">
              <ul className="flex flex-col gap-4 md:gap-6">
                {NAV_LINKS.map((link, i) => (
                  <motion.li 
                    key={link.label}
                    custom={i}
                    variants={linkVariants}
                    className="group"
                  >
                    <Link 
                      href={link.href} 
                      onClick={onClose}
                      className="flex items-center gap-6"
                    >
                      <span className="text-sm font-semibold text-[#8A8A87] w-6 group-hover:text-white transition-colors">{link.num}/</span>
                      <span className="text-4xl md:text-6xl lg:text-7xl font-medium text-white group-hover:translate-x-4 group-hover:text-[#d9c2a0] transition-all duration-500 ease-out">
                        {link.label}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Bottom/Right Content */}
            <div className="w-full lg:w-1/3 flex flex-col justify-end mt-16 lg:mt-0 pb-8 lg:pb-0 gap-12">
              {/* About Blurb & Thumbnails */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="flex flex-col gap-6"
              >
                <div className="text-[#8A8A87] font-medium leading-relaxed max-w-sm">
                  We are a creative agency focused on building fearless brands with strategy and passion. Let's create something extraordinary.
                </div>
                {/* Thumbnails placeholder */}
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-white/10 rounded-xl overflow-hidden shadow-inner"></div>
                  <div className="w-24 h-24 bg-white/10 rounded-xl overflow-hidden shadow-inner"></div>
                </div>
              </motion.div>

              {/* Social Links */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="flex flex-col gap-4"
              >
                <span className="text-xs uppercase tracking-widest text-[#8A8A87] font-semibold">Socials</span>
                <div className="flex flex-wrap gap-x-8 gap-y-4">
                  {SOCIAL_LINKS.map((social) => (
                    <a key={social.name} href={social.href} className="text-sm font-medium hover:text-[#d9c2a0] transition-colors relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-px after:bottom-0 after:left-0 after:bg-[#d9c2a0] after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">
                      {social.name}
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
