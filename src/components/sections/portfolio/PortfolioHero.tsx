"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import LetterRevealText from "@/components/LetterRevealText";
import ClientLogosMarquee from "@/components/ClientLogosMarquee";
import MagneticButtonWrapper from "@/components/MagneticButtonWrapper";

interface HeroData {
  pillLabel: string;
  heading: string;
  paragraph: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  backgroundImageUrl?: string | null;
}

export default function PortfolioHero({ logos, initialData }: { logos?: any[]; initialData?: HeroData | null }) {
  const t = useTranslations("PortfolioPage.Hero");

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } }
  };

  const pillLabel = initialData?.pillLabel || t("pill");
  const heading = initialData?.heading || t("heading");
  const paragraph = initialData?.paragraph || t("paragraph");
  const primaryCtaLabel = initialData?.primaryCtaLabel || t("primaryBtn");
  const secondaryCtaLabel = initialData?.secondaryCtaLabel || t("secondaryBtn");
  const backgroundImageUrl = initialData?.backgroundImageUrl || null;

  return (
    <section className="relative w-full bg-ink text-white pt-40 pb-16 overflow-hidden flex flex-col items-center">
      {/* Background Image with duotone treatment */}
      {backgroundImageUrl && (
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0 bg-[#0B0B0C]">
          <Image 
            src={backgroundImageUrl}
            alt={heading}
            fill
            priority
            className="object-cover mix-blend-multiply grayscale opacity-45"
          />
          {/* Scrim Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-transparent pointer-events-none" />
        </div>
      )}

      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-[radial-gradient(circle_at_center,_var(--color-accent)_0%,_transparent_60%)] opacity-10 pointer-events-none blur-[100px] z-10" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="container relative z-10 mx-auto px-6 md:px-12 flex flex-col items-center text-center max-w-4xl"
      >
        {/* Pill Label */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-accent text-accent text-sm font-medium tracking-wide uppercase">
            {pillLabel}
          </div>
        </motion.div>

        {/* Heading */}
        <div className="mb-6">
          <LetterRevealText 
            text={heading} 
            className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight leading-[1.1] text-white"
          />
        </div>

        {/* Paragraph */}
        <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
          {paragraph}
        </motion.p>

        {/* Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
          <MagneticButtonWrapper>
            <Link 
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-accent text-ink font-bold hover:bg-white transition-colors duration-300"
            >
              {primaryCtaLabel}
            </Link>
          </MagneticButtonWrapper>
          <MagneticButtonWrapper>
            <Link 
              href="/about"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-ink-light text-white font-bold hover:bg-white hover:text-ink transition-colors duration-300"
            >
              {secondaryCtaLabel}
            </Link>
          </MagneticButtonWrapper>
        </motion.div>

      </motion.div>

      {/* Trusted By Banner */}
      <div className="w-full relative z-20 bg-[#0B0B0C] border-y border-white/5 mt-16">
        <ClientLogosMarquee logos={logos} />
      </div>
    </section>
  );
}
