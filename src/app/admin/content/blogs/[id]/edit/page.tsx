"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { fetchBlogPostById, updateBlogPost } from "@/lib/api";
import { useToast } from "@/components/admin/ui/use-toast";
import BlogForm from "@/components/admin/content/blogs/BlogForm";
import { FileText, Loader2 } from "lucide-react";

function EditBlogContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const id = params.id as string;
  const locale = searchParams.get("locale") || "az";
  
  const { toast } = useToast();
  const [post, setPost] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadPost() {
      setIsLoading(true);
      try {
        const data = await fetchBlogPostById(id);
        if (data) {
          setPost(data);
        } else {
          toast({
            title: "Xəta",
            description: "Məqalə tapılmadı.",
            variant: "destructive",
          });
          router.push("/admin/content/blogs");
        }
      } catch (err) {
        toast({
          title: "Xəta",
          description: "Məqalə yüklənərkən xəta baş verdi.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    if (id) {
      loadPost();
    }
  }, [id, router, toast]);

  const handleUpdate = async (data: any) => {
    setIsSaving(true);
    try {
      await updateBlogPost(id, data);
      toast({
        title: "Uğurlu",
        description: "Bloq yazısı yeniləndi.",
      });
      router.push("/admin/content/blogs");
    } catch (err: any) {
      toast({
        title: "Xəta",
        description: err.message || "Yadda saxlayarkən xəta baş verdi.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full w-full gap-3">
        <Loader2 className="animate-spin text-[var(--primary)]" size={32} />
        <p className="text-sm text-[var(--muted-foreground)]">Məqalə yüklənir...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 overflow-y-auto h-full w-full">
      <div>
        <h1 className="text-2xl font-display font-bold text-black flex items-center gap-2">
          <FileText className="text-[var(--primary)]" />
          Yazını Redaktə Et
        </h1>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
          Məqalə və müəllif məlumatlarını dəyişdirib yadda saxlayın.
        </p>
      </div>

      {post && (
        <BlogForm 
          locale={locale} 
          initialData={post} 
          onSubmit={handleUpdate} 
          isSaving={isSaving} 
        />
      )}
    </div>
  );
}

export default function EditBlogPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm">Yüklənir...</div>}>
      <EditBlogContent />
    </Suspense>
  );
}
