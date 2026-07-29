import React from "react";
import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";

import BlogLayoutWrapper from "@/components/sections/blogs/BlogLayoutWrapper";
import { getBlogPosts } from "@/lib/data";

export default function BlogsPage({ params: { locale } }: { params: { locale: string } }) {
  // Enable static rendering
  setRequestLocale(locale);

  const t = useTranslations("BlogsPage");

  // Fetch posts dynamically using translated keys, centralized in lib/data
  const posts = getBlogPosts(t);

  return (
    <main className="w-full bg-paper min-h-screen pt-24 pb-32">
      <div className="container mx-auto px-6 md:px-12 lg:px-8 xl:px-12">
        
        {/* Page Header */}
        <div className="flex flex-col items-center mb-16 lg:mb-24 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-bold text-black leading-[1.1] max-w-4xl tracking-tight mt-8 lg:mt-12">
            {t("heading")}
          </h1>
        </div>

        {/* 2-Column Layout */}
        <BlogLayoutWrapper posts={posts} />
      </div>
    </main>
  );
}
