"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

interface LetterRevealTextProps {
  text: string;
  className?: string;
  delay?: number;
  triggerKey?: string | number; // Useful for re-triggering (e.g. on slide change)
}

export default function LetterRevealText({ text, className = "", delay = 0, triggerKey }: LetterRevealTextProps) {
  // Split by newlines to support explicit line breaks
  const lines = text.split("\n");

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: delay * i },
    }),
  };

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
    hidden: {
      opacity: 0,
      y: 40,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
  };

  return (
    <motion.div
      key={triggerKey} // Changing this forces a re-render/re-animation
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className={`flex flex-col ${className}`}
    >
      {lines.map((line, lineIdx) => (
        <div key={lineIdx} className="flex flex-wrap">
          {line.split(" ").map((word, wordIdx) => (
            <span key={wordIdx} className="inline-block whitespace-nowrap mr-[0.25em]">
              {word.split("").map((char, charIdx) => (
                <motion.span
                  variants={child}
                  key={charIdx}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
            </span>
          ))}
        </div>
      ))}
    </motion.div>
  );
}
