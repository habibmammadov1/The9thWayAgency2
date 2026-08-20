"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Calendar, MessageSquare, Tag, ArrowRight } from "lucide-react";
import { BlogPost } from "@/lib/data";

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: (idx: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: (idx % 10) * 0.15,
      ease: "easeOut",
    },
  }),
};

interface BlogListProps {
  posts: BlogPost[];
  selectedCategory: string | null;
  searchQuery?: string;
}

export default function BlogList({ posts, selectedCategory, searchQuery }: BlogListProps) {
  const t = useTranslations("BlogsPage");
  const [visiblePosts, setVisiblePosts] = useState(3);
  
  // Wrapper already filters posts based on category and search query
  const filteredPosts = posts;

  // Reset pagination when category or search query changes
  useEffect(() => {
    setVisiblePosts(3);
  }, [selectedCategory, searchQuery]);

  const handleLoadMore = () => {
    setVisiblePosts((prev) => Math.min(prev + 2, filteredPosts.length));
  };

  return (
    <div className="w-full flex flex-col gap-10">
      <div className="flex flex-col gap-10">
        <AnimatePresence mode="popLayout">
          {filteredPosts.slice(0, visiblePosts).map((post, idx) => (
            <motion.article
              key={post.slug}
              custom={idx}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.95 }}
              layout
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group transition-shadow duration-500 hover:shadow-xl"
            >
              {/* Image Container */}
              <Link href={`/blogs/${post.slug}`} className="relative w-full h-[300px] md:h-[400px] overflow-hidden block cursor-pointer bg-gray-100">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover grayscale group-hover:scale-105 transition-transform duration-700 ease-out"
                  sizes="(max-width: 1024px) 100vw, 70vw"
                />
                {/* Subtle duotone/tint overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-[#D9C2A0] mix-blend-overlay opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
              </Link>

              {/* Content Container */}
              <div className="p-6 md:p-8 flex flex-col flex-1">
                
                {/* Meta Row */}
                <div className="flex flex-wrap items-center gap-y-3 gap-x-5 text-gray-500 text-xs md:text-sm font-medium mb-5">
                  {/* Author */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden relative border border-gray-300">
                      <Image 
                        src={post.authorAvatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop"} 
                        alt="Author" 
                        fill 
                        className="object-cover grayscale" 
                      />
                    </div>
                    <span className="text-black font-semibold">{post.author}</span>
                  </div>
                  
                  <div className="w-1 h-1 rounded-full bg-gray-300 hidden md:block" />
                  
                  {/* Date */}
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-gray-500" />
                    <span>{post.date}</span>
                  </div>
                  
                  <div className="w-1 h-1 rounded-full bg-gray-300 hidden md:block" />

                  {/* Category */}
                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-[#A38B68] transition-colors">
                    <Tag size={14} className="text-current" />
                    <span>{post.category}</span>
                  </div>

                  <div className="w-1 h-1 rounded-full bg-gray-300 hidden md:block" />

                  {/* Comments */}
                  <div className="flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-gray-500" />
                    <span>{post.comments === 0 ? t("noComments") : `${post.comments} ${t("comments")}`}</span>
                  </div>
                </div>

                {/* Title & Excerpt */}
                <Link href={`/blogs/${post.slug}`} className="group/title">
                  <h3 className="text-2xl md:text-3xl font-display font-bold text-black leading-[1.2] mb-4 group-hover/title:text-[#A38B68] transition-colors duration-300 line-clamp-2">
                    {post.title}
                  </h3>
                </Link>
                <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-8 line-clamp-2">
                  {post.excerpt}
                </p>

                {/* Action Button */}
                <div className="mt-auto">
                  <Link href={`/blogs/${post.slug}`} className="inline-flex items-center gap-4 group/btn">
                    <span className="text-black text-sm font-bold tracking-widest uppercase">{t("exploreMore")}</span>
                    <div className="w-10 h-10 rounded-full bg-[#D9C2A0] flex items-center justify-center shadow-sm group-hover/btn:translate-x-1.5 transition-transform duration-300">
                      <ArrowRight size={18} className="text-black" />
                    </div>
                  </Link>
                </div>

              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>

      {/* Pagination / Load More */}
      {visiblePosts < filteredPosts.length && (
        <div className="flex justify-center mt-4">
          <button 
            onClick={handleLoadMore}
            className="px-8 py-4 rounded-full bg-ink text-white font-bold text-sm tracking-widest uppercase hover:bg-black transition-colors shadow-lg"
          >
            {t("loadMore")}
          </button>
        </div>
      )}
      
      {filteredPosts.length === 0 && (
        <div className="w-full py-12 text-center text-gray-500">
          No posts found in this category.
        </div>
      )}
    </div>
  );
}
