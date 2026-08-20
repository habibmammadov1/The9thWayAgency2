"use client";

import React, { useState, useEffect } from "react";
import { fetchBlogPosts, deleteBlogPost, updateBlogPost } from "@/lib/api";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Switch } from "@/components/admin/ui/switch";
import { useToast } from "@/components/admin/ui/use-toast";
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Settings, 
  Globe, 
  Layers, 
  Eye, 
  EyeOff, 
  MessageSquare,
  FileText
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/admin/ui/tabs";
import { ModuleHeader } from "@/components/admin/layout/ModuleHeader";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/admin/ui/alert-dialog";
import CategoryManager from "@/components/admin/content/blogs/CategoryManager";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function BlogsAdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [locale, setLocale] = useState("az");
  const [posts, setPosts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Pagination parameters (admin list fetch all or large page)
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadPosts();
  }, [locale, search, refreshTrigger, page]);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetchBlogPosts(locale, page, "", search, 20);
      if (res) {
        setPosts(res.posts || []);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      toast({
        title: "Xəta",
        description: "Yazıları yükləyərkən xəta baş verdi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBlogPost(id);
      toast({
        title: "Uğurlu",
        description: "Məqalə silindi.",
      });
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: any) {
      toast({
        title: "Xəta",
        description: err.message || "Məqaləni silərkən xəta baş verdi.",
        variant: "destructive",
      });
    }
  };

  const handleStatusToggle = async (post: any) => {
    const updatedStatus = !post.isPublished;
    try {
      await updateBlogPost(post.id, { isPublished: updatedStatus });
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, isPublished: updatedStatus } : p))
      );
      toast({
        title: "Uğurlu",
        description: updatedStatus ? "Məqalə dərc edildi." : "Məqalə qaralamaya keçirildi.",
      });
    } catch (err: any) {
      toast({
        title: "Xəta",
        description: err.message || "Məqalə statusunu dəyişərkən xəta baş verdi.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("az-AZ", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="flex h-full w-full relative overflow-hidden">
      {/* Left panel: main post listing */}
      <div className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-black flex items-center gap-2">
              <FileText className="text-[var(--primary)]" />
              Bloq Yazıları
            </h1>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              Saytın bloq bölməsindəki yazıları və kateqoriyaları idarə edin.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCategoryManagerOpen(true)}
              className="border-[var(--border)] hover:bg-neutral-50 text-black font-semibold h-11"
            >
              <Layers size={16} className="mr-2" /> Kateqoriyalar
            </Button>
            <Button
              onClick={() => router.push(`/admin/content/blogs/new?locale=${locale}`)}
              className="bg-[var(--primary)] text-black hover:bg-[var(--primary)]/90 font-bold h-11"
            >
              <Plus size={18} className="mr-1" /> Yeni Yazı
            </Button>
          </div>
        </div>

        {/* Filters and search tools */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 border border-[var(--border)] rounded-2xl shadow-sm">
          {/* Search bar */}
          <div className="relative w-full md:max-w-md group">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Yazı adı və ya müəllif ilə axtar..."
              className="pl-10 h-10 w-full"
            />
          </div>

          {/* Locale tab switcher */}
          <Tabs value={locale} onValueChange={(val) => {
            setLocale(val);
            setPage(1);
          }}>
            <TabsList className="bg-neutral-100 rounded-xl p-1 border">
              <TabsTrigger value="az" className="rounded-lg px-4 py-1.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-black">
                AZ
              </TabsTrigger>
              <TabsTrigger value="en" className="rounded-lg px-4 py-1.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-black">
                EN
              </TabsTrigger>
              <TabsTrigger value="ru" className="rounded-lg px-4 py-1.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-black">
                RU
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Post Grid/List View */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[var(--muted-foreground)]">Bloq yazıları yüklənir...</p>
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            title="Heç bir məqalə tapılmadı"
            description={search ? "Axtarış sorğunuza uyğun məqalə yoxdur." : "Hələ heç bir məqalə əlavə edilməyib."}
            icon={FileText}
          />
        ) : (
          <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b text-[var(--muted-foreground)] text-xs uppercase tracking-wider font-semibold">
                    <th className="py-4 px-6">Şəkil</th>
                    <th className="py-4 px-6">Məqalə Başlığı</th>
                    <th className="py-4 px-6">Kateqoriya</th>
                    <th className="py-4 px-6">Müəllif</th>
                    <th className="py-4 px-6">Tarix</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Əməliyyatlar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-black">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-neutral-50/50 transition-colors">
                      {/* Image Thumbnail */}
                      <td className="py-4 px-6">
                        <div className="relative w-16 h-10 rounded overflow-hidden bg-neutral-100 border border-gray-200 shrink-0">
                          {post.featuredImageUrl ? (
                            <img
                              src={post.featuredImageUrl}
                              alt={post.title}
                              className="object-cover w-full h-full grayscale"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <FileText size={16} />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Title & Slug */}
                      <td className="py-4 px-6 font-medium">
                        <div className="max-w-xs md:max-w-md truncate" title={post.title}>
                          {post.title}
                        </div>
                        <div className="text-xs text-[var(--muted-foreground)] font-mono truncate max-w-xs mt-0.5">
                          /{post.slug}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6">
                        {post.category ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-800 border">
                            {post.category.name}
                          </span>
                        ) : (
                          <span className="text-xs text-neutral-400">Yoxdur</span>
                        )}
                      </td>

                      {/* Author */}
                      <td className="py-4 px-6 text-gray-600">
                        {post.authorName}
                      </td>

                      {/* Publish Date */}
                      <td className="py-4 px-6 text-gray-600 whitespace-nowrap">
                        {formatDate(post.publishedAt)}
                      </td>

                      {/* Status Toggle Switch */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Switch
                            checked={post.isPublished}
                            onCheckedChange={() => handleStatusToggle(post)}
                          />
                          <span className="text-xs font-medium w-16 text-left">
                            {post.isPublished ? (
                              <span className="text-[#8B6C3E] flex items-center gap-1"><Eye size={12} /> Aktiv</span>
                            ) : (
                              <span className="text-neutral-400 flex items-center gap-1"><EyeOff size={12} /> Qaralama</span>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => router.push(`/admin/content/blogs/${post.id}/edit?locale=${locale}`)}
                          >
                            <Pencil size={14} />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Məqaləni silmək istədiyinizə əminsiniz?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bu yazını ("{post.title}") silmək geri qaytarıla bilməz.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(post.id)}
                                  className="bg-red-500 hover:bg-red-600 text-white font-bold"
                                >
                                  Sil
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="bg-neutral-50 px-6 py-4 border-t flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                >
                  Əvvəlki
                </Button>
                <span className="text-xs text-gray-500 font-semibold">
                  Səhifə {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                >
                  Növbəti
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Slide-over Category Manager Drawer */}
      {isCategoryManagerOpen && (
        <div className="absolute inset-0 bg-black/40 z-50 flex justify-end">
          <div className="w-full max-w-md h-full flex animate-slide-in">
            <CategoryManager
              locale={locale}
              onClose={() => setIsCategoryManagerOpen(false)}
              onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
