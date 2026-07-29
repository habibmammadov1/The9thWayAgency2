"use client";

import React from "react";
import { motion, useScroll } from "framer-motion";

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();

  return (
    <div className="fixed top-0 left-0 w-full h-[3px] bg-transparent z-[100] pointer-events-none">
      <motion.div 
        className="h-full bg-[#d9c2a0] origin-left shadow-[0_2px_10px_rgba(217,194,160,0.6)]"
        style={{ scaleX: scrollYProgress, width: '100%' }}
      />
    </div>
  );
}
