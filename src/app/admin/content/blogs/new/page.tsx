"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createBlogPost } from "@/lib/api";
import { useToast } from "@/components/admin/ui/use-toast";
import BlogForm from "@/components/admin/content/blogs/BlogForm";
import { FileText } from "lucide-react";

function NewBlogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = searchParams.get("locale") || "az";
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async (data: any) => {
    setIsSaving(true);
    try {
      await createBlogPost(data);
      toast({
        title: "Uğurlu",
        description: "Yeni bloq yazısı yaradıldı.",
      });
      router.push("/admin/content/blogs");
    } catch (err: any) {
      toast({
        title: "Xəta",
        description: err.message || "Bloq yazısı yaradılarkən xəta baş verdi.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 overflow-y-auto h-full w-full">
      <div>
        <h1 className="text-2xl font-display font-bold text-black flex items-center gap-2">
          <FileText className="text-[var(--primary)]" />
          Yeni Bloq Yazısı
        </h1>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
          Saytda dərc etmək üçün yeni məqalə və müəllif məlumatlarını daxil edin.
        </p>
      </div>

      <BlogForm locale={locale} onSubmit={handleCreate} isSaving={isSaving} />
    </div>
  );
}

export default function NewBlogPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm">Yüklənir...</div>}>
      <NewBlogContent />
    </Suspense>
  );
}
