"use client";

import React from "react";
import { motion } from "framer-motion";
import { TEAM } from "@/lib/data";
import TeamMemberCard from "@/components/TeamMemberCard";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } }
};

export default function TeamGrid() {
  return (
    <section className="w-full bg-white pb-24 md:pb-32 pt-8">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16"
        >
          {TEAM.map((member) => (
            <TeamMemberCard key={member.id} member={member} variants={cardVariants} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
