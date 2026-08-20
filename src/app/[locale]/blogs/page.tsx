import React from "react";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

import BlogLayoutWrapper from "@/components/sections/blogs/BlogLayoutWrapper";
import { fetchBlogPosts } from "@/lib/api";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function BlogsPage({ params }: PageProps) {
  const { locale } = await params;
  // Enable static rendering
  setRequestLocale(locale);

  const t = await getTranslations("BlogsPage");

  // Fetch posts dynamically from database API (retrieve up to 100 for the list)
  const dbData = await fetchBlogPosts(locale, 1, "", "", 100);
  const dbPosts = dbData?.posts || [];

  // Map database posts to public BlogPost format
  const posts = dbPosts.map((post: any) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    author: post.authorName,
    role: post.authorBio || "",
    date: post.publishedAt 
      ? new Date(post.publishedAt).toLocaleDateString(
          locale === "en" ? "en-US" : locale === "ru" ? "ru-RU" : "az-AZ",
          { year: "numeric", month: "long", day: "numeric" }
        )
      : "",
    category: post.category ? post.category.name : "",
    comments: 0,
    image: post.featuredImageUrl || "",
    content: "", // HTML content is only parsed on details page
    authorAvatarUrl: post.authorAvatarUrl || "",
  }));

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
