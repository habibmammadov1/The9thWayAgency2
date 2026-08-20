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

interface HeroCarouselProps {
  data?: any;
  locale?: string;
}

export default function HeroCarousel({ data, locale }: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, watchDrag: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const t = useTranslations("Hero");

  const slides = data?.slides && data.slides.length > 0 
    ? data.slides.map((s: any, i: number) => ({
        ...s,
        image: s.image || SLIDES[i]?.image || "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2000&auto=format&fit=crop"
      }))
    : SLIDES;

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
    return () => {
      emblaApi.off("select", onSelect);
    };
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
          {slides.map((slide: any, index: number) => <div key={slide.id || index} className="flex-[0_0_100%] h-full min-w-0" />)}
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
              className={`absolute inset-0 w-full h-full ${slides[selectedIndex].image ? 'bg-[#d9c2a0]' : 'bg-[#0B0B0C]'}`}
            >
              {slides[selectedIndex].image && (
                <Image 
                  src={slides[selectedIndex].image} 
                  alt={slides[selectedIndex].headline || t(`slides.slide${selectedIndex + 1}.headline`)} 
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
                {slides[selectedIndex].overline || t(`slides.slide${selectedIndex + 1}.overline`)}
              </motion.p>
              
              <LetterRevealText 
                text={slides[selectedIndex].headline || t(`slides.slide${selectedIndex + 1}.headline`)} 
                className="text-5xl md:text-6xl lg:text-8xl font-display font-bold mb-6 tracking-tight leading-[1.1]"
                triggerKey={selectedIndex}
              />
              
              <motion.p variants={itemVariants} className="text-lg md:text-xl text-[#E4E2DF] mb-10 max-w-2xl">
                {slides[selectedIndex].supporting || t(`slides.slide${selectedIndex + 1}.supporting`)}
              </motion.p>
              
              <motion.div variants={itemVariants}>
                <MagneticButtonWrapper>
                  <Link 
                    href="/portfolio"
                    className="group relative inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full overflow-hidden transition-transform hover:scale-105"
                  >
                    <span className="relative z-10 font-medium">{data?.seePortfolio || t("seePortfolio")}</span>
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
              0{selectedIndex + 1} <span className="text-white/40">—</span> 0{slides.length}
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
                  src={data?.founderImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"} 
                  alt={data?.founderName || "Team Lead"}
                  fill
                  className="rounded-full object-cover grayscale"
                  sizes="48px"
                  unoptimized={data?.founderImage?.includes('localhost')}
                />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{data?.founderName || "Elvin Mammadov"}</p>
                <p className="text-xs text-[#8A8A87] mb-1">{data?.founderTitle || t("founderTitle")}</p>
                <a
                  href="https://wa.me/994507500751"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider hover:text-[#25D366] transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-3.5 h-3.5 shrink-0 group-hover:scale-110 transition-transform duration-300"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span className="relative overflow-hidden">
                    +994 50 750 07 51
                    <span className="absolute bottom-0 left-0 w-full h-[1px] bg-current translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                  </span>
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
