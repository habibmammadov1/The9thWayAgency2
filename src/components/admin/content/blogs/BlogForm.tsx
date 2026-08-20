"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Textarea } from "@/components/admin/ui/textarea";
import { Label } from "@/components/admin/ui/label";
import { Switch } from "@/components/admin/ui/switch";
import { useToast } from "@/components/admin/ui/use-toast";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/admin/ui/form";
import { ImageUploadField } from "@/components/admin/ui/ImageUploadField";
import { fetchBlogCategories } from "@/lib/api";
import { blocksToHtml, htmlToBlocks } from "@/lib/blog-parser";
import TipTapEditor from "./TipTapEditor";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { cn, slugify } from "@/lib/utils";

const blogPostFormSchema = z.object({
  title: z.string().min(1, "Başlıq boş ola bilməz"),
  slug: z.string().min(1, "Slaq / Slug boş ola bilməz"),
  excerpt: z.string().min(1, "Qısa mətn boş ola bilməz"),
  categoryId: z.string().nullable().optional(),
  featuredImageUrl: z.string().nullable().optional(),
  authorName: z.string().min(1, "Müəllif adı boş ola bilməz"),
  authorAvatarUrl: z.string().nullable().optional(),
  authorBio: z.string().nullable().optional(),
  isPublished: z.boolean().default(true),
  publishedAt: z.string().optional(),
});

type BlogPostFormValues = z.infer<typeof blogPostFormSchema>;

interface BlogFormProps {
  initialData?: any;
  locale: string;
  onSubmit: (data: any) => Promise<void>;
  isSaving: boolean;
}

export default function BlogForm({ initialData, locale, onSubmit, isSaving }: BlogFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [contentHtml, setContentHtml] = useState("");

  const form = useForm<any>({
    resolver: zodResolver(blogPostFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      excerpt: initialData?.excerpt || "",
      categoryId: initialData?.categoryId || null,
      featuredImageUrl: initialData?.featuredImageUrl || "",
      authorName: initialData?.authorName || "",
      authorAvatarUrl: initialData?.authorAvatarUrl || "",
      authorBio: initialData?.authorBio || "",
      isPublished: initialData?.isPublished ?? true,
      publishedAt: initialData?.publishedAt ? new Date(initialData.publishedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    },
  });

  // Load Categories on mount or locale change
  useEffect(() => {
    async function loadCategories() {
      setIsLoadingCategories(true);
      try {
        const data = await fetchBlogCategories(locale);
        setCategories(data || []);
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        setIsLoadingCategories(false);
      }
    }
    loadCategories();
  }, [locale]);

  // Load content blocks into editor HTML representation
  useEffect(() => {
    if (initialData?.content) {
      setContentHtml(blocksToHtml(initialData.content));
    } else {
      setContentHtml("<p></p>");
    }
  }, [initialData]);

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const titleVal = e.target.value;
    form.setValue("title", titleVal);
    
    // Auto-generate slug if not manually editing an existing post
    if (!initialData) {
      const generatedSlug = slugify(titleVal);
      form.setValue("slug", generatedSlug);
    }
  };

  const handleFormSubmit = async (values: any) => {
    // Convert TipTap editor HTML content to block JSON structure for DB
    const contentBlocks = htmlToBlocks(contentHtml);

    if (contentBlocks.length === 0 || (contentBlocks.length === 1 && contentBlocks[0].value === "")) {
      toast({
        title: "Xəta",
        description: "Məqalə mətni boş ola bilməz.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      ...values,
      locale,
      content: contentBlocks,
    };

    await onSubmit(payload);
  };

  return (
    <Form {...(form as any)}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8 max-w-5xl">
        
        {/* Editor Layout: Grid Column */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Fields Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 bg-white border border-[var(--border)] rounded-2xl shadow-sm">
              <div className="space-y-4">
                {/* Title */}
                <FormField
                  control={form.control as any}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-black">Başlıq</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Məqalə başlığı daxil edin..." 
                          {...field} 
                          onChange={handleTitleChange}
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Slug */}
                <FormField
                  control={form.control as any}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-black">Slaq / Slug (URL yolu)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="məs. reqemsal-marketinq-strategiyalari" 
                          {...field} 
                          className="h-11 font-mono text-xs"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Excerpt */}
                <FormField
                  control={form.control as any}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-black">Qısa Məzmun (Excerpt)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Məqalənin qısa xülasəsini bura daxil edin..." 
                          {...field} 
                          rows={3}
                          className="resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* TipTap Rich Text Editor Container */}
            <Card className="p-6 bg-white border border-[var(--border)] rounded-2xl shadow-sm space-y-4">
              <Label className="font-semibold text-black text-sm">Məqalə Mətni (Rich Text Body)</Label>
              <TipTapEditor content={contentHtml} onChange={setContentHtml} />
            </Card>
          </div>

          {/* Sidebar Settings Column */}
          <div className="space-y-6">
            
            {/* Metadata and Settings Card */}
            <Card className="p-6 bg-white border border-[var(--border)] rounded-2xl shadow-sm space-y-6">
              <h3 className="font-bold text-black border-b pb-2 text-sm uppercase tracking-wider text-neutral-500">Məqalə Ayarları</h3>
              
              {/* Category selector */}
              <FormField
                control={form.control as any}
                name="categoryId"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1.5">
                    <FormLabel className="font-semibold text-black">Kateqoriya</FormLabel>
                    <FormControl>
                      {isLoadingCategories ? (
                        <div className="text-xs text-neutral-400 py-2">Yüklənir...</div>
                      ) : (
                        <select
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value || null)}
                          className="flex h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-black font-medium"
                        >
                          <option value="">Kateqoriya seçin</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Publish Date */}
              <FormField
                control={form.control as any}
                name="publishedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-black">Dərc Tarixi</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="h-11 text-black font-medium" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Published Toggle status */}
              <FormField
                control={form.control as any}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl border p-4 bg-neutral-50">
                    <div className="space-y-0.5">
                      <FormLabel className="font-semibold text-black text-sm">Status</FormLabel>
                      <div className="text-xs text-neutral-400">
                        {field.value ? "Saytda Görünür (Dərc edilib)" : "Qaralama (Saytda görünmür)"}
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Featured Image upload */}
              <div className="space-y-2">
                <Label className="font-semibold text-black text-sm">Kaver Şəkli</Label>
                <ImageUploadField
                  value={form.watch("featuredImageUrl") || ""}
                  onChange={(url) => form.setValue("featuredImageUrl", url)}
                />
              </div>
            </Card>

            {/* Author Block settings Card */}
            <Card className="p-6 bg-white border border-[var(--border)] rounded-2xl shadow-sm space-y-6">
              <h3 className="font-bold text-black border-b pb-2 text-sm uppercase tracking-wider text-neutral-500">Müəllif Məlumatları</h3>
              
              {/* Author name */}
              <FormField
                control={form.control as any}
                name="authorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-black">Ad, Soyad</FormLabel>
                    <FormControl>
                      <Input placeholder="Məs. Elçin Quliyev" {...field} value={field.value || ""} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Author bio */}
              <FormField
                control={form.control as any}
                name="authorBio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-black">Qısa Bio (Vəzifə / Təsvir)</FormLabel>
                    <FormControl>
                      <Input placeholder="Məs. SEO Mütəxəssisi" {...field} value={field.value || ""} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Author avatar */}
              <div className="space-y-2">
                <Label className="font-semibold text-black text-sm">Müəllif Avatarı</Label>
                <ImageUploadField
                  value={form.watch("authorAvatarUrl") || ""}
                  onChange={(url) => form.setValue("authorAvatarUrl", url)}
                />
              </div>
            </Card>
          </div>
        </div>

        {/* Buttons Action bar */}
        <div className="border-t pt-6 flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/content/blogs")}
            disabled={isSaving}
          >
            <ArrowLeft size={16} className="mr-2" /> Geri qayıt
          </Button>

          <Button
            type="submit"
            disabled={isSaving}
            className="bg-[var(--primary)] text-black hover:bg-[var(--primary)]/90 font-bold px-8 h-12"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" /> Saxlanılır...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" /> Yadda Saxla
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Simple local Card wrapper helper in case it is not imported
function Card({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("bg-white border rounded-2xl p-6", className)} {...props}>
      {children}
    </div>
  );
}
