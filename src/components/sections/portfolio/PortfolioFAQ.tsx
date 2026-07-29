"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function PortfolioFAQ() {
  const t = useTranslations("PortfolioPage.FAQ");
  const [openIndex, setOpenIndex] = useState<number>(0);

  // We have 6 FAQ items
  const faqItems = [0, 1, 2, 3, 4, 5];

  return (
    <section className="w-full py-24 bg-paper">
      <div className="container mx-auto px-6 md:px-12">
        <div className="bg-white rounded-[2rem] p-8 md:p-12 lg:p-16 shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-16">
          
          {/* Left Column */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/3 flex flex-col justify-between"
          >
            <div>
              <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-accent text-accent text-sm font-medium tracking-wide uppercase mb-6">
                {t("pill")}
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-ink leading-[1.1] mb-8">
                {t("heading")}
              </h2>
            </div>

            {/* Dark Callout Card */}
            <div className="bg-ink rounded-3xl p-8 text-white mt-12 lg:mt-0">
              <h3 className="text-2xl font-bold mb-2">{t("calloutHeading")}</h3>
              <p className="text-gray-400 mb-8">{t("calloutDesc")}</p>
              <Link 
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-white text-white font-semibold hover:bg-white hover:text-ink transition-colors duration-300 w-full"
              >
                {t("calloutBtn")}
              </Link>
            </div>
          </motion.div>

          {/* Right Column (Accordion) */}
          <div className="w-full lg:w-2/3 flex flex-col gap-4">
            {faqItems.map((idx) => {
              const question: string = t(`items.${idx}.q`);
              const answer: string = t(`items.${idx}.a`);
              const isOpen = openIndex === idx;

              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-paper rounded-2xl overflow-hidden border border-gray-200"
                >
                  <button 
                    onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                    className="w-full px-6 py-6 flex items-center justify-between text-left focus:outline-none group"
                  >
                    <span className="text-lg md:text-xl font-bold text-ink pr-8">
                      {question}
                    </span>
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center text-ink border border-gray-200 group-hover:border-accent group-hover:text-accent transition-colors">
                      {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                          {answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
