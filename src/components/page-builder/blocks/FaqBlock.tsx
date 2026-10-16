"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BlockProps } from "@/lib/page-builder/types";
import { BlockSection, Reveal, SectionHeading, toneOf } from "../BlockSection";

export default function FaqBlock({ props }: { props: BlockProps<"faq"> }) {
  const [open, setOpen] = useState<string | null>(props.items[0]?.id ?? null);
  const dark = toneOf(props.settings) === "dark";

  return (
    <BlockSection settings={props.settings}>
      <div className="max-w-4xl mx-auto">
        {props.heading && (
          <Reveal className="mb-12">
            <SectionHeading text={props.heading} />
          </Reveal>
        )}
        <div className="flex flex-col gap-4 text-left">
          {props.items.map((item) => {
            const isOpen = open === item.id;
            return (
              <div
                key={item.id}
                className={cn("rounded-2xl overflow-hidden border", dark ? "bg-white/5 border-white/10" : "bg-white border-gray-200")}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : item.id)}
                  className="w-full px-6 py-6 flex items-center justify-between text-left focus:outline-none group"
                  aria-expanded={isOpen}
                >
                  <span className="text-lg md:text-xl font-bold pr-8">{item.question}</span>
                  <span
                    className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border transition-transform",
                      dark ? "border-white/20" : "border-gray-200",
                      isOpen && "rotate-45",
                    )}
                  >
                    <Plus size={16} />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={cn("px-6 pb-6 leading-relaxed whitespace-pre-line", dark ? "text-gray-400" : "text-gray-600")}>
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </BlockSection>
  );
}
