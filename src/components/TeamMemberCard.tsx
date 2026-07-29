"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

interface TeamMemberCardProps {
  member: {
    id: number;
    name: string;
    image: string;
  };
  variants?: any;
}

export default function TeamMemberCard({ member, variants }: TeamMemberCardProps) {
  const t = useTranslations("Team");

  const content = (
    <div className="group cursor-pointer">
      {/* Photo & Hover Overlay */}
      <div className="relative overflow-hidden mb-6 aspect-[3/4] bg-[#F7F6F4]">
        <div className="absolute inset-0 w-full h-full rounded-tl-[60px] rounded-br-[60px] rounded-bl-[60px] rounded-tr-[10px] overflow-hidden">
          
          {/* The Image */}
          <Image 
            src={member.image} 
            alt={member.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          
          {/* The Dark Overlay */}
          <div className="absolute inset-0 bg-[#0B0B0C]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-4">
            <div className="translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
              <a href="#" className="w-10 h-10 rounded-full bg-white text-[#0B0B0C] flex items-center justify-center hover:bg-[#E4E2DF] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
            </div>
            <div className="translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-150">
              <a href="#" className="w-10 h-10 rounded-full bg-white text-[#0B0B0C] flex items-center justify-center hover:bg-[#E4E2DF] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Text Info */}
      <div className="text-center md:text-left">
        <h4 className="text-xl font-semibold mb-1">{member.name}</h4>
        <p className="text-[#8A8A87] text-sm">{t(`roles.role${member.id}`)}</p>
      </div>
    </div>
  );

  if (variants) {
    return <motion.div variants={variants}>{content}</motion.div>;
  }

  return content;
}
