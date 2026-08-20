"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Search, ChevronRight, Calendar } from "lucide-react";
import { BlogPost } from "@/lib/data";

interface BlogSidebarProps {
  categories: string[];
  recentPosts: BlogPost[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

const widgetVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (idx: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: idx * 0.15,
      ease: "easeOut",
    },
  }),
};

export default function BlogSidebar({ 
  categories, 
  recentPosts, 
  selectedCategory, 
  onSelectCategory,
  searchQuery,
  onSearchQueryChange
}: BlogSidebarProps) {
  const t = useTranslations("BlogsPage");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <aside className="w-full flex flex-col gap-8">
      
      {/* Widget 1: Search */}
      <motion.div 
        custom={0}
        variants={widgetVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200"
      >
        <h3 className="text-xl font-bold text-black mb-5 font-display">{t("searchLabel")}</h3>
        <form onSubmit={handleSearch} className="relative flex items-center group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full h-12 bg-paper rounded-xl pl-4 pr-14 text-sm font-medium text-black placeholder:text-gray-500 border border-transparent focus:outline-none transition-all duration-300"
          />
          {/* Animated bottom border on focus/hover for input */}
          <div className="absolute left-0 bottom-0 w-full h-[2px] bg-[#D9C2A0] scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-left rounded-b-xl" />
          
          <button 
            type="submit" 
            className="absolute right-1 top-1 bottom-1 w-10 bg-[#D9C2A0] rounded-lg flex items-center justify-center hover:scale-[1.05] transition-transform shadow-sm"
          >
            <Search size={18} className="text-black" />
          </button>
        </form>
      </motion.div>

      {/* Widget 2: Categories */}
      <motion.div 
        custom={1}
        variants={widgetVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200"
      >
        <h3 className="text-xl font-bold text-black mb-5 font-display">{t("topCategoriesLabel")}</h3>
        <div className="flex flex-col gap-3">
          
          <button
            onClick={() => onSelectCategory(null)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300 group ${
              selectedCategory === null 
                ? "border-[#D9C2A0] bg-[#D9C2A0]/15" 
                : "border-gray-200 bg-white hover:border-[#D9C2A0] hover:bg-[#D9C2A0]/5"
            }`}
          >
            <span className={`text-sm font-semibold transition-colors ${selectedCategory === null ? "text-black" : "text-gray-500 group-hover:text-black"}`}>
              {t("allCategories")}
            </span>
            <ChevronRight size={16} className={`transition-all duration-300 ${selectedCategory === null ? "text-[#A38B68] opacity-100 translate-x-0" : "text-[#A38B68] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"}`} />
          </button>

          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => onSelectCategory(cat)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300 group ${
                selectedCategory === cat 
                  ? "border-[#D9C2A0] bg-[#D9C2A0]/15" 
                  : "border-gray-200 bg-white hover:border-[#D9C2A0] hover:bg-[#D9C2A0]/5"
              }`}
            >
              <span className={`text-sm font-semibold transition-colors ${selectedCategory === cat ? "text-black" : "text-gray-500 group-hover:text-black"}`}>
                {cat}
              </span>
              <ChevronRight size={16} className={`transition-all duration-300 ${selectedCategory === cat ? "text-[#A38B68] opacity-100 translate-x-0" : "text-[#A38B68] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"}`} />
            </button>
          ))}
        </div>
      </motion.div>

      {/* Widget 3: Recent Posts */}
      <motion.div 
        custom={2}
        variants={widgetVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200"
      >
        <h3 className="text-xl font-bold text-black mb-5 font-display">{t("recentPostsLabel")}</h3>
        <div className="flex flex-col gap-6">
          {recentPosts.map((post, i) => (
            <Link key={i} href={`/blogs/${post.slug}`} className="flex items-center gap-4 group">
              <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                <Image 
                  src={post.image} 
                  alt={post.title} 
                  fill 
                  className="object-cover grayscale group-hover:scale-110 group-hover:grayscale-0 transition-all duration-500 ease-out" 
                  sizes="80px"
                />
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-2">
                  <Calendar size={12} className="text-[#A38B68]" />
                  <span>{post.date}</span>
                </div>
                <h4 className="text-sm font-bold text-black leading-tight line-clamp-2 group-hover:text-[#A38B68] transition-colors">
                  {post.title}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

    </aside>
  );
}
