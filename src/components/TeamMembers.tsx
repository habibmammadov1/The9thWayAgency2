"use client";

import React from "react";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import { TEAM } from "@/lib/data";
import { useTranslations } from "next-intl";
import TeamMemberCard from "./TeamMemberCard";

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

interface TeamMembersProps {
  customTitle?: string;
  teaserSettings?: {
    heading: string;
    viewAllLabel: string;
    displayCount: number;
  } | null;
  members?: {
    id: string;
    name: string;
    role: string;
    photoUrl?: string | null;
    linkedinUrl?: string | null;
    instagramUrl?: string | null;
  }[] | null;
}

export default function TeamMembers({ customTitle, teaserSettings, members }: TeamMembersProps) {
  const t = useTranslations("Team");

  const heading = teaserSettings?.heading || customTitle || t("title");
  const viewAllLabel = teaserSettings?.viewAllLabel || "View All Team";
  
  // If dynamic members list is passed, format and use it. Fall back to static mock TEAM array.
  const finalMembers = members && members.length > 0
    ? members.map((m) => ({
        id: m.id,
        name: m.name,
        role: m.role,
        image: m.photoUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
        linkedinUrl: m.linkedinUrl,
        instagramUrl: m.instagramUrl
      }))
    : TEAM.slice(0, teaserSettings?.displayCount || 4);

  return (
    <section className="w-full bg-white text-[#0B0B0C] pt-8 md:pt-12 pb-24 md:pb-32">
      <div className="container mx-auto px-6 md:px-12">
        
        {/* Top: Overline & Divider */}
        <div className="flex items-center gap-6 mb-6">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#8A8A87] whitespace-nowrap">
            Team Members
          </span>
          <div className="h-[1px] w-full bg-[#E4E2DF]" />
        </div>

        {/* Heading & Button Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
          <h2 className="heading-section max-w-3xl">
            {heading}
          </h2>
          <Link href="/team" className="flex-shrink-0 bg-[#0B0B0C] text-white px-8 py-4 rounded-full text-sm font-bold hover:bg-[#d9c2a0] hover:text-[#0B0B0C] hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg">
            {viewAllLabel}
          </Link>
        </div>

        {/* Team Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16"
        >
          {finalMembers.map((member) => (
            <TeamMemberCard key={member.id} member={member} variants={cardVariants} />
          ))}
        </motion.div>

      </div>
    </section>
  );
}

