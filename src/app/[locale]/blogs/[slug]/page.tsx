import React from "react";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { fetchBlogPostBySlug, fetchBlogPosts } from "@/lib/api";
import { blocksToHtml } from "@/lib/blog-parser";
import BlogDetailsClient from "./BlogDetailsClient";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  try {
    const post = await fetchBlogPostBySlug(locale, slug);
    if (!post) {
      return {
        title: "Məqalə Tapılmadı | The9thWay Agency",
      };
    }
    return {
      title: `${post.title} | The9thWay Agency`,
      description: post.excerpt,
    };
  } catch (error) {
    return {
      title: "Məqalə | The9thWay Agency",
    };
  }
}

export default async function BlogDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  // Fetch single post details by slug
  const dbPost = await fetchBlogPostBySlug(locale, slug);
  if (!dbPost) {
    notFound();
  }

  // Convert database post to public BlogPost shape
  const post = {
    slug: dbPost.slug,
    title: dbPost.title,
    excerpt: dbPost.excerpt,
    author: dbPost.authorName,
    role: dbPost.authorBio || "",
    date: dbPost.publishedAt 
      ? new Date(dbPost.publishedAt).toLocaleDateString(
          locale === "en" ? "en-US" : locale === "ru" ? "ru-RU" : "az-AZ",
          { year: "numeric", month: "long", day: "numeric" }
        )
      : "",
    category: dbPost.category ? dbPost.category.name : "",
    comments: 0,
    image: dbPost.featuredImageUrl || "",
    content: blocksToHtml(dbPost.content), // convert JSON blocks back to HTML for rendering
    authorAvatarUrl: dbPost.authorAvatarUrl || "",
  };

  // Fetch list of posts to select related posts (excluding current slug)
  const dbData = await fetchBlogPosts(locale, 1, "", "", 10);
  const relatedPosts = (dbData?.posts || [])
    .filter((p: any) => p.slug !== slug)
    .slice(0, 3)
    .map((p: any) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      author: p.authorName,
      role: p.authorBio || "",
      date: p.publishedAt 
        ? new Date(p.publishedAt).toLocaleDateString(
            locale === "en" ? "en-US" : locale === "ru" ? "ru-RU" : "az-AZ",
            { year: "numeric", month: "long", day: "numeric" }
          )
        : "",
      category: p.category ? p.category.name : "",
      comments: 0,
      image: p.featuredImageUrl || "",
      content: "", // related card summaries do not need article body
    }));

  return (
    <main className="min-h-screen w-full bg-paper pt-24 pb-0">
      <BlogDetailsClient post={post} relatedPosts={relatedPosts} locale={locale} />
    </main>
  );
}
