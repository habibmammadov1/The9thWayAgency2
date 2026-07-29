"use client";

import React, { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import LetterRevealText from "./LetterRevealText";
import { REVIEWS } from "@/lib/data";
import { useTranslations } from "next-intl";

export default function Testimonials({ titleKey = "title" }: { titleKey?: string }) {
  const t = useTranslations("Testimonials");
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", slidesToScroll: 1 },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section className="w-full bg-[#F7F6F4] text-[#0B0B0C] pt-0 md:pt-4 pb-8 md:pb-12">
      <div className="container mx-auto px-6 md:px-12">

        {/* Section Heading */}
        <div className="mb-8 lg:mb-12">
          <LetterRevealText text={t(titleKey as any)} className="heading-section max-w-4xl" />
        </div>

        {/* 3-Column Layout */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >

          {/* Static Hero Card (Column 1) */}
          <div className="bg-white rounded-3xl p-8 lg:p-12 flex flex-col justify-between border border-[#E4E2DF] shadow-sm">
            <div>
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-6xl font-bold">4.9</span>
                <div className="flex flex-col">
                  <div className="flex text-yellow-400 text-lg">
                    ★★★★★
                  </div>
                  <span className="text-xs text-[#8A8A87] font-medium tracking-wide">(40+ reviews)</span>
                </div>
              </div>
              <p className="text-lg text-[#0B0B0C] leading-relaxed mt-6">
                Helping world-class brands dominate their markets with fearless creative design and robust engineering.
              </p>
            </div>

            {/* Manual Navigation Controls */}
            <div className="flex items-center gap-4 mt-12">
              <button
                onClick={scrollPrev}
                className="w-12 h-12 rounded-full border border-[#0B0B0C]/20 flex items-center justify-center hover:bg-[#0B0B0C] hover:text-white transition-colors"
                aria-label="Previous Testimonial"
              >
                <ArrowLeft size={20} />
              </button>
              <button
                onClick={scrollNext}
                className="w-12 h-12 rounded-full border border-[#0B0B0C]/20 flex items-center justify-center hover:bg-[#0B0B0C] hover:text-white transition-colors"
                aria-label="Next Testimonial"
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {/* Carousel Cards (Columns 2 & 3) */}
          <div className="col-span-1 lg:col-span-2 overflow-hidden bg-white rounded-3xl border border-[#E4E2DF] shadow-sm" ref={emblaRef}>
            <div className="flex h-full">
              {REVIEWS.map((review, index) => (
                <div
                  key={review.id}
                  className={`relative flex-[0_0_100%] md:flex-[0_0_50%] h-full p-8 lg:p-12 flex flex-col justify-between ${index !== REVIEWS.length - 1 ? 'md:border-r border-[#E4E2DF]' : ''
                    }`}
                >
                  {/* Top: Quote Icon & Text */}
                  <div>
                    <Quote className="text-[#E4E2DF] fill-[#E4E2DF] mb-8" size={40} />
                    <p className="text-lg md:text-xl text-[#8A8A87] leading-relaxed mb-12">
                      "{t(`reviews.rev${review.id}.quote`)}"
                    </p>
                  </div>

                  {/* Bottom: Author & Badge */}
                  <div className="flex items-center justify-between mt-auto">
                    <div>
                      <p className="font-semibold text-[#0B0B0C]">{review.name}</p>
                      <p className="text-sm text-[#8A8A87]">{t(`reviews.rev${review.id}.role`)}</p>
                    </div>
                    {/* Trust Badge */}
                    <div className="flex items-center gap-1 bg-[#F7F6F4] px-3 py-1.5 rounded-full border border-[#E4E2DF]">
                      <span className="text-xs font-semibold text-[#0B0B0C]">Google Reviews</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
