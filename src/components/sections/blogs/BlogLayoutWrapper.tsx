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

  // Extract unique categories
  const categories = Array.from(new Set(posts.map((p) => p.category)));

  // Recent posts (first 3)
  const recentPosts = posts.slice(0, 3);

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
      {/* Main Content (List) ~ 70% */}
      <div className="w-full lg:col-span-8">
        <BlogList posts={posts} selectedCategory={selectedCategory} />
      </div>
      
      {/* Sidebar ~ 30% */}
      <div className="w-full lg:col-span-4 sticky top-32">
        <BlogSidebar 
          categories={categories} 
          recentPosts={recentPosts}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>
    </div>
  );
}
