"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import MagneticButtonWrapper from "./MagneticButtonWrapper";
import LetterRevealText from "./LetterRevealText";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { SLIDES } from "@/lib/data";
import { useTranslations } from "next-intl";

export default function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, watchDrag: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const t = useTranslations("Hero");

  const handleMouseMove = (e: React.MouseEvent) => {
    if (window.matchMedia("(pointer: fine)").matches) {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 30; // max shift 15px
      const y = (e.clientY / innerHeight - 0.5) * 30;
      setMousePos({ x, y });
    }
  };

  // Parallax for background
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 1000], [0, 400]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  // Framer Motion variants for text stagger
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 }
    },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } }
  };

  return (
    <section 
      onMouseMove={handleMouseMove}
      className="relative h-screen w-full bg-black text-white overflow-hidden"
    >
      
      {/* Invisible Embla container to power the logic without messing with custom AnimatePresence */}
      <div className="absolute inset-0 opacity-0 pointer-events-none z-[-1]" ref={emblaRef}>
        <div className="flex h-full">
          {SLIDES.map((slide) => <div key={slide.id} className="flex-[0_0_100%] h-full min-w-0" />)}
        </div>
      </div>

      {/* Background Layer with Parallax & Mouse Movement */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 overflow-hidden z-0">
        <motion.div 
          animate={{ x: -mousePos.x, y: -mousePos.y }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Decorative Floating Elements */}
          <motion.div 
            animate={{ y: [0, -30, 0], rotate: [0, 15, -5, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] left-[15%] w-2 h-2 bg-[#d9c2a0] rounded-full z-10 opacity-60"
          />
          <motion.div 
            animate={{ y: [0, 40, 0], x: [0, 20, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[30%] right-[20%] w-16 h-[2px] bg-[#d9c2a0] rotate-45 z-10 opacity-60"
          />
          <motion.div 
            animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[50%] right-[35%] w-4 h-4 border border-[#d9c2a0] rounded-full z-10"
          />

          <AnimatePresence initial={false}>
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 1.05, x: 60 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: -60 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className={`absolute inset-0 w-full h-full ${SLIDES[selectedIndex].image ? 'bg-[#d9c2a0]' : 'bg-[#0B0B0C]'}`}
            >
              {SLIDES[selectedIndex].image && (
                <Image 
                  src={SLIDES[selectedIndex].image} 
                  alt={t(`slides.slide${selectedIndex + 1}.headline`)} 
                  fill
                  priority
                  className="object-cover mix-blend-multiply grayscale opacity-90"
                  sizes="100vw"
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Animated Gradient Stage Lighting (Blobs) */}
          <div className="absolute inset-0 z-10 mix-blend-screen opacity-90 pointer-events-none">
            <motion.div 
              animate={{ x: ['0%', '30%', '0%'], y: ['0%', '40%', '0%'], scale: [1, 1.2, 1] }}
              transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-[30%] -left-[10%] w-[80vw] h-[80vw] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#d9c2a0]/60 via-[#d9c2a0]/10 to-transparent blur-[100px] rounded-full"
            />
            <motion.div 
              animate={{ x: ['0%', '-40%', '0%'], y: ['0%', '-20%', '0%'], scale: [1, 1.5, 1] }}
              transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[20%] -right-[20%] w-[70vw] h-[70vw] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/30 via-white/5 to-transparent blur-[120px] rounded-full"
            />
          </div>

          {/* Heavy Gradient Scrim for text readability */}
          <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0B0B0C] via-[#0B0B0C]/80 to-transparent pointer-events-none" />
        </motion.div>
      </motion.div>

      {/* Decorative Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-display font-bold leading-none tracking-tighter text-white opacity-5 pointer-events-none z-0">
        THE9THWAY
      </div>

      {/* Foreground UI Layer */}
      <div className="relative z-20 h-full container mx-auto px-6 md:px-12 flex flex-col justify-between pt-32 pb-12">
        
        {/* Top Space (Reserved for future Navbar) */}
        <div></div>

        {/* Dynamic Text Content */}
        <div className="flex-1 flex flex-col justify-center items-center lg:items-start text-center lg:text-left mt-16 lg:mt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedIndex}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="max-w-6xl flex flex-col items-center lg:items-start"
            >
              <motion.p variants={itemVariants} className="text-sm md:text-base font-semibold tracking-widest uppercase text-brand-mid-gray mb-6">
                {t(`slides.slide${selectedIndex + 1}.overline`)}
              </motion.p>
              
              <LetterRevealText 
                text={t(`slides.slide${selectedIndex + 1}.headline`)} 
                className="text-5xl md:text-6xl lg:text-8xl font-display font-bold mb-6 tracking-tight leading-[1.1]"
                triggerKey={selectedIndex}
              />
              
              <motion.p variants={itemVariants} className="text-lg md:text-xl text-[#E4E2DF] mb-10 max-w-2xl">
                {t(`slides.slide${selectedIndex + 1}.supporting`)}
              </motion.p>
              
              <motion.div variants={itemVariants}>
                <MagneticButtonWrapper>
                  <Link 
                    href="/portfolio"
                    className="inline-flex bg-[#d9c2a0] text-[#0B0B0C] px-8 py-4 rounded-full font-bold hover:bg-[#0B0B0C] hover:text-[#d9c2a0] transition-colors duration-300 shadow-xl"
                  >
                    {t("seePortfolio")}
                  </Link>
                </MagneticButtonWrapper>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Footer Area */}
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-3 items-center lg:items-end w-full gap-8 lg:gap-0 mt-12 lg:mt-0">
          
          {/* Left: Scroll Indicator (Hidden on mobile for space) */}
          <div className="hidden lg:flex flex-col items-start justify-end gap-6 ml-4">
            <span 
              className="text-[10px] tracking-widest uppercase text-[#8A8A87] font-semibold"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              {t("scroll")}
            </span>
            <div className="w-[1px] h-16 bg-white/20 relative overflow-hidden ml-2">
              <div className="absolute top-0 left-0 w-full h-full bg-white animate-scroll-bounce origin-top" />
            </div>
          </div>

          {/* Center: Controls */}
          <div className="flex items-center justify-center gap-6 w-full lg:w-auto">
            <button onClick={scrollPrev} className="p-3 rounded-full border border-white/20 hover:bg-white hover:text-black transition-colors" aria-label="Previous Slide">
              <ArrowLeft size={18} />
            </button>
            <span className="font-medium tracking-widest">
              0{selectedIndex + 1} <span className="text-white/40">—</span> 0{SLIDES.length}
            </span>
            <button onClick={scrollNext} className="p-3 rounded-full border border-white/20 hover:bg-white hover:text-black transition-colors" aria-label="Next Slide">
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Right: Team Lead Card */}
          <div className="flex lg:justify-end w-full lg:w-auto justify-center">
            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-[20px] w-full max-w-sm lg:w-auto">
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" 
                  alt="Elvin Mammadov"
                  fill
                  className="rounded-full object-cover grayscale"
                  sizes="48px"
                />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Elvin Mammadov</p>
                <p className="text-xs text-[#8A8A87] mb-1">{t("founderTitle")}</p>
                <button 
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider hover:text-[#E4E2DF] transition-colors"
                >
                  <span className="relative overflow-hidden">
                    {t("letsTalk")}
                    <span className="absolute bottom-0 left-0 w-full h-[1px] bg-white translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                  </span>
                  <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
