"use client";

import React, { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { LOGOS } from "@/lib/data";

const TESTIMONIAL_IMAGES = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop"
];

export default function PortfolioTestimonials() {
  const t = useTranslations("PortfolioPage.Testimonials");
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const reviews = [0, 1, 2];

  return (
    <section className="w-full bg-paper py-24">
      <div className="container mx-auto px-6 md:px-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold text-ink mb-6">
            {t("heading")}
          </h2>
          <div className="w-full h-px bg-gray-300" />
        </motion.div>

        {/* Testimonials Carousel */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative overflow-hidden" 
          ref={emblaRef}
        >
          <div className="flex">
            {reviews.map((idx) => {
              const name: string = t.raw(`reviews.${idx}.name`);
              const role: string = t.raw(`reviews.${idx}.role`);
              const quote: string = t.raw(`reviews.${idx}.quote`);
              
              return (
                <div key={idx} className="flex-[0_0_100%] min-w-0">
                  <div className="flex flex-col md:flex-row gap-12 lg:gap-24 items-center">
                    {/* Left: Duotone Photo */}
                    <div className="w-full md:w-5/12 aspect-[4/5] relative rounded-[2rem] overflow-hidden bg-accent group">
                      <Image 
                        src={TESTIMONIAL_IMAGES[idx]}
                        alt={name}
                        fill
                        className="object-cover grayscale mix-blend-multiply opacity-90 transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>

                    {/* Right: Quote Content */}
                    <div className="w-full md:w-7/12 flex flex-col justify-center py-8">
                      <Quote className="text-accent fill-accent mb-8" size={48} />
                      <p className="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-ink leading-tight mb-12">
                        "{quote}"
                      </p>
                      
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xl font-bold text-ink mb-1">{name}</p>
                          <p className="text-gray-500 font-medium">{role}</p>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex gap-4">
                          <button 
                            onClick={scrollPrev}
                            className="w-14 h-14 rounded-full border border-accent text-accent flex items-center justify-center hover:bg-accent hover:text-ink transition-colors"
                          >
                            <ArrowLeft size={24} />
                          </button>
                          <button 
                            onClick={scrollNext}
                            className="w-14 h-14 rounded-full border border-accent text-accent flex items-center justify-center hover:bg-accent hover:text-ink transition-colors"
                          >
                            <ArrowRight size={24} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Dark Logo Strip Band */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.4 }}
        className="mt-24 w-full bg-ink border-t border-b border-ink flex overflow-hidden flex-wrap md:flex-nowrap"
      >
        {LOGOS.slice(0, 4).map((logo, idx) => (
          <div key={idx} className="flex-1 min-w-[50%] md:min-w-0 flex items-center justify-center py-12 border-b md:border-b-0 border-r border-white/10 [&:nth-child(even)]:border-r-0 md:[&:nth-child(even)]:border-r md:last:border-r-0">
            <img 
              src={logo.src} 
              alt={logo.name} 
              className="h-8 md:h-12 object-contain filter grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all duration-300"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </div>
        ))}
      </motion.div>
    </section>
  );
}
