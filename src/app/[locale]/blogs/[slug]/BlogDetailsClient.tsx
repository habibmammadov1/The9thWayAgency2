"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Calendar, MessageSquare, Tag, ArrowRight, Link as LinkIcon, Check } from "lucide-react";
import { BlogPost } from "@/lib/data";
import ContactCTABand from "@/components/ContactCTABand";

// Custom SVG components for social media icons matching the Footer's theme
const Linkedin = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);

const Twitter = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5 5 9.2 5 9.2s1.5.8 3 .5C3 8.3 4 4 4 4s1.7 1.5 3.5 2C10.5 1 17 2 17 6c1.5-.5 3-1.5 3-1.5z"/></svg>
);

interface BlogDetailsClientProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
  locale: string;
}

export default function BlogDetailsClient({ post, relatedPosts, locale }: BlogDetailsClientProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Calculate dynamic reading time based on ~200 words per minute
  const wordsCount = post.content ? post.content.replace(/<[^>]*>/g, "").split(/\s+/).length : 0;
  const readingTimeVal = Math.max(1, Math.ceil(wordsCount / 200));

  // Inline locale values
  const relatedTitle = locale === "az" ? "Oxşar Məqalələr" : locale === "ru" ? "Похожие Статьи" : "Related Posts";
  const authorBioTitle = locale === "az" ? "Müəllif Haqqında" : locale === "ru" ? "Об Авторе" : "About The Author";
  const shareTitle = locale === "az" ? "Paylaş:" : locale === "ru" ? "Поделиться:" : "Share:";
  const copiedText = locale === "az" ? "Kopyalandı!" : locale === "ru" ? "Скопировано!" : "Copied!";
  const copyLinkText = locale === "az" ? "Linki kopyala" : locale === "ru" ? "Копировать ссылку" : "Copy Link";
  const readingTimeText = locale === "az" ? `${readingTimeVal} dəqiqəlik oxu` : locale === "ru" ? `${readingTimeVal} мин. чтения` : `${readingTimeVal} min read`;
  const commentsText = locale === "az" ? "Rəy" : locale === "ru" ? "Комментарии" : "Comments";
  const noCommentsText = locale === "az" ? "Rəy yoxdur" : locale === "ru" ? "Нет комментариев" : "No Comments";
  const exploreMoreText = locale === "az" ? "DAHA ƏTRAFLI" : locale === "ru" ? "ПОДРОБНЕЕ" : "EXPLORE MORE";

  return (
    <div className="w-full text-black">
      {/* 1. Article Header Section */}
      <section className="container mx-auto px-6 md:px-12 lg:px-8 xl:px-12 max-w-5xl mb-12">
        <div className="flex flex-col gap-6 text-center md:text-left">
          {/* Category, Date & Reading Time */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-semibold text-gray-500">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D9C2A0]/15 text-[#A38B68] border border-[#D9C2A0]/30 font-bold uppercase tracking-wider text-xs">
              <Tag size={10} className="text-[#A38B68]" />
              {post.category}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={14} />
              {post.date}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            <span>{readingTimeText}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold leading-[1.1] tracking-tight">
            {post.title}
          </h1>

          {/* Author Block */}
          <div className="flex items-center justify-center md:justify-start gap-3 mt-2">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-300 bg-gray-100">
              <Image
                src={post.authorAvatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop"}
                alt={post.author}
                fill
                className="object-cover grayscale"
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-black text-base">{post.author}</span>
              <span className="text-gray-500 text-xs font-medium">{post.role}</span>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="relative w-full h-[350px] md:h-[550px] mt-10 rounded-2xl overflow-hidden shadow-md group bg-gray-100">
          <Image
            src={post.image}
            alt={post.title}
            fill
            priority
            className="object-cover grayscale"
            sizes="(max-width: 1200px) 100vw, 1200px"
          />
          {/* Grayscale hover treatment overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
          <div className="absolute inset-0 bg-[#D9C2A0] mix-blend-overlay opacity-15" />
        </div>
      </section>

      {/* 2. Article Content Section */}
      <section className="container mx-auto px-6 md:px-12 lg:px-8 xl:px-12 max-w-5xl mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Share Buttons Column (Sticky on Desktop) */}
          <div className="lg:col-span-2 flex lg:flex-col items-center lg:items-start gap-4 lg:sticky lg:top-32 h-fit border-b lg:border-b-0 pb-6 lg:pb-0 border-gray-200">
            <span className="text-sm font-bold tracking-widest text-gray-400 uppercase">{shareTitle}</span>
            <div className="flex lg:flex-col gap-3">
              {/* LinkedIn share */}
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${mounted ? encodeURIComponent(window.location.href) : ""}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black hover:border-black transition-colors"
                title="Share on LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              {/* Twitter/X share */}
              <a
                href={`https://twitter.com/intent/tweet?url=${mounted ? encodeURIComponent(window.location.href) : ""}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black hover:border-black transition-colors"
                title="Share on X"
              >
                <Twitter size={18} />
              </a>
              {/* Copy link */}
              <button
                onClick={handleCopyLink}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black hover:border-black transition-colors relative"
                title={copyLinkText}
              >
                {copied ? <Check size={18} className="text-[#A38B68] animate-scale" /> : <LinkIcon size={18} />}
                {copied && (
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 text-xs font-bold text-white bg-black rounded shadow-md whitespace-nowrap">
                    {copiedText}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Article Main Body */}
          <div className="lg:col-span-10 max-w-3xl mx-auto lg:mx-0">
            {/* Typographical Wrapper */}
            <article 
              className="prose prose-lg max-w-none font-sans text-gray-800 leading-relaxed 
                         prose-headings:font-display prose-headings:font-bold prose-headings:text-black
                         prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-4
                         prose-p:mb-6 prose-p:text-lg prose-p:leading-relaxed
                         prose-blockquote:border-l-4 prose-blockquote:border-[#D9C2A0] prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:my-8 prose-blockquote:italic prose-blockquote:text-xl prose-blockquote:text-gray-600 prose-blockquote:bg-[#D9C2A0]/8 prose-blockquote:rounded-r-md"
              dangerouslySetInnerHTML={{ __html: post.content || "" }}
            />

            {/* 3. Author Bio Card */}
            <div className="mt-16 p-8 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border border-gray-300 bg-gray-100 shrink-0">
                <Image
                  src={post.authorAvatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop"}
                  alt={post.author}
                  fill
                  className="object-cover grayscale"
                />
              </div>
              <div className="flex flex-col text-center md:text-left">
                <span className="text-xs font-bold uppercase tracking-widest text-[#A38B68] mb-1">{authorBioTitle}</span>
                <h4 className="text-xl font-display font-bold text-black mb-2">{post.author}</h4>
                <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-4">
                  {post.role} olaraq rəqəmsal trendləri, marka strategiyalarını və müasir reklam texnologiyalarını təhlil edir, bizneslərin inkişafı üçün faydalı həllər hazırlayır.
                </p>
                {/* Micro social icons */}
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <a href="#" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black hover:border-black transition-colors">
                    <Twitter size={14} />
                  </a>
                  <a href="#" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black hover:border-black transition-colors">
                    <Linkedin size={14} />
                  </a>
                </div>
              </div>
            </div>

            {/* 4. Related Posts Section */}
            {relatedPosts.length > 0 && (
              <div className="mt-24 pt-16 border-t border-gray-200">
                <h3 className="text-3xl font-display font-bold text-black mb-10 tracking-tight">
                  {relatedTitle}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {relatedPosts.map((relatedPost) => (
                    <motion.div
                      key={relatedPost.slug}
                      whileHover={{ y: -6 }}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group transition-all duration-300"
                    >
                      {/* Image */}
                      <Link href={`/blogs/${relatedPost.slug}`} className="relative w-full h-[180px] overflow-hidden block bg-gray-100">
                        <Image
                          src={relatedPost.image}
                          alt={relatedPost.title}
                          fill
                          className="object-cover grayscale group-hover:scale-105 transition-transform duration-500 ease-out"
                          sizes="(max-width: 768px) 100vw, 30vw"
                        />
                        <div className="absolute inset-0 bg-[#D9C2A0] mix-blend-overlay opacity-10 group-hover:opacity-20 transition-opacity duration-300" />
                      </Link>
                      
                      {/* Details */}
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                          <span>{relatedPost.category}</span>
                          <span>•</span>
                          <span>{relatedPost.date}</span>
                        </div>
                        <Link href={`/blogs/${relatedPost.slug}`}>
                          <h4 className="text-base font-display font-bold text-black mb-2 line-clamp-2 leading-[1.3] group-hover:text-[#A38B68] transition-colors">
                            {relatedPost.title}
                          </h4>
                        </Link>
                        <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                        
                        <Link href={`/blogs/${relatedPost.slug}`} className="mt-auto inline-flex items-center gap-2 group/btn text-[11px] font-bold uppercase tracking-wider text-black">
                          <span>{exploreMoreText}</span>
                          <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. Contact CTA Band */}
      <div className="w-full bg-[#0B0B0C]">
        <ContactCTABand />
      </div>
    </div>
  );
}
