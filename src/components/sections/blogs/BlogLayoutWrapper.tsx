"use client";

import React, { useState } from "react";
import BlogList from "./BlogList";
import BlogSidebar from "./BlogSidebar";
import { BlogPost } from "@/lib/data";

interface BlogLayoutWrapperProps {
  posts: BlogPost[];
}

export default function BlogLayoutWrapper({ posts }: BlogLayoutWrapperProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Extract unique categories (filter out empty strings/falsy values)
  const categories = Array.from(new Set(posts.map((p) => p.category).filter(Boolean)));

  // Filter posts based on category and search query
  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory ? post.category === selectedCategory : true;
    const matchesSearch = searchQuery
      ? post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  // Recent posts (first 3 from original posts list)
  const recentPosts = posts.slice(0, 3);

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
      {/* Main Content (List) ~ 70% */}
      <div className="w-full lg:col-span-8">
        <BlogList 
          posts={filteredPosts} 
          selectedCategory={selectedCategory} 
          searchQuery={searchQuery}
        />
      </div>
      
      {/* Sidebar ~ 30% */}
      <div className="w-full lg:col-span-4 sticky top-32">
        <BlogSidebar 
          categories={categories} 
          recentPosts={recentPosts}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
      </div>
    </div>
  );
}
