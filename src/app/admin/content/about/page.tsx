"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Textarea } from "@/components/admin/ui/textarea";
import { Label } from "@/components/admin/ui/label";
import { useToast } from "@/components/admin/ui/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/admin/ui/accordion";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/admin/ui/form";
import { ImageUploadField } from "@/components/admin/ui/ImageUploadField";
import { Tabs, TabsList, TabsTrigger } from "@/components/admin/ui/tabs";
import { 
  fetchAboutStudioIntro, 
  updateAboutStudioIntro, 
  fetchAboutWhatWeBuild, 
  updateAboutWhatWeBuild, 
  fetchAboutMissionVision, 
  updateAboutMissionVision 
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { GripVertical, Plus, Trash2, Save, Loader2, Info, Star, ShieldAlert } from "lucide-react";

// Form Validation Schema
const aboutFormSchema = z.object({
  studioIntro: z.object({
    overline: z.string().min(1, "Sahə boş ola bilməz"),
    heading: z.string().min(1, "Sahə boş ola bilməz"),
    paragraph: z.string().min(1, "Sahə boş ola bilməz"),
    image1Url: z.string().nullable().optional(),
    image2Url: z.string().nullable().optional(),
  }),
  whatWeBuild: z.object({
    content: z.object({
      mainImageUrl: z.string().nullable().optional(),
      statValue: z.string().min(1, "Sahə boş ola bilməz"),
      statLabel: z.string().min(1, "Sahə boş ola bilməz"),
      statAvatarUrls: z.array(z.string()),
      statCaption: z.string().min(1, "Sahə boş ola bilməz"),
      heading: z.string().min(1, "Sahə boş ola bilməz"),
      paragraph: z.string().min(1, "Sahə boş ola bilməz"),
      ctaLabel: z.string().min(1, "Sahə boş ola bilməz"),
    }),
    features: z.array(z.object({
      id: z.string().optional(),
      icon: z.string().min(1, "Sahə boş ola bilməz"),
      title: z.string().min(1, "Sahə boş ola bilməz"),
      description: z.string().min(1, "Sahə boş ola bilməz"),
      order: z.number(),
    })),
  }),
  missionVision: z.object({
    content: z.object({
      statValue: z.string().min(1, "Sahə boş ola bilməz"),
      statLabel: z.string().min(1, "Sahə boş ola bilməz"),
      statAvatarUrls: z.array(z.string()),
      statCaption: z.string().min(1, "Sahə boş ola bilməz"),
      missionLabel: z.string().min(1, "Sahə boş ola bilməz"),
      missionText: z.string().min(1, "Sahə boş ola bilməz"),
      visionLabel: z.string().min(1, "Sahə boş ola bilməz"),
      visionText: z.string().min(1, "Sahə boş ola bilməz"),
    }),
    snippets: z.array(z.object({
      id: z.string().optional(),
      type: z.enum(['quote', 'stat']),
      text: z.string().min(1, "Sahə boş ola bilməz"),
      value: z.string().nullable().optional(),
      avatarUrl: z.string().nullable().optional(),
      order: z.number(),
    })),
  }),
});

type AboutFormValues = z.infer<typeof aboutFormSchema>;

// Draggable Feature Item
function SortableFeatureItem({ id, index, control, remove }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, ...(isDragging ? { zIndex: 50 } : {}) };

  return (
    <div ref={setNodeRef} style={style} className="bg-white border rounded-2xl p-4 flex gap-4 items-start shadow-sm mb-3">
      <button type="button" className="cursor-grab p-1 text-gray-400 mt-2" {...attributes} {...listeners}>
        <GripVertical size={18} />
      </button>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1">
        <div className="md:col-span-3">
          <FormField
            control={control}
            name={`whatWeBuild.features.${index}.icon`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-neutral-500">İkon</FormLabel>
                <FormControl>
                  <select {...field} className="flex h-10 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-black">
                    <option value="BarChart">BarChart (Statistika)</option>
                    <option value="Target">Target (Hədəf)</option>
                    <option value="Users">Users (Komanda)</option>
                    <option value="Award">Award (Mükafat)</option>
                    <option value="Settings">Settings (Parametrlər)</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="md:col-span-9">
          <FormField
            control={control}
            name={`whatWeBuild.features.${index}.title`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-neutral-500">Başlıq</FormLabel>
                <FormControl>
                  <Input placeholder="Özəllik başlığı..." {...field} className="h-10" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="md:col-span-12">
          <FormField
            control={control}
            name={`whatWeBuild.features.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-neutral-500">Açıqlama</FormLabel>
                <FormControl>
                  <Textarea placeholder="Özəllik açıqlaması..." {...field} rows={2} className="resize-none" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => remove(index)}
        className="text-red-500 hover:text-red-600 hover:bg-red-50 mt-6"
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
}

// Draggable Recommendation Snippet Item
function SortableSnippetItem({ id, index, control, watch, remove }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, ...(isDragging ? { zIndex: 50 } : {}) };

  const snippetType = watch(`missionVision.snippets.${index}.type`);

  return (
    <div ref={setNodeRef} style={style} className="bg-white border rounded-2xl p-4 flex gap-4 items-start shadow-sm mb-3">
      <button type="button" className="cursor-grab p-1 text-gray-400 mt-2" {...attributes} {...listeners}>
        <GripVertical size={18} />
      </button>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1">
        <div className="md:col-span-3">
          <FormField
            control={control}
            name={`missionVision.snippets.${index}.type`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-neutral-500">Tip</FormLabel>
                <FormControl>
                  <select {...field} className="flex h-10 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-black">
                    <option value="quote">Sitat (Quote)</option>
                    <option value="stat">Statistika (Stat)</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {snippetType === "quote" ? (
          <>
            <div className="md:col-span-9">
              <FormField
                control={control}
                name={`missionVision.snippets.${index}.text`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-neutral-500">Sitat Mətni</FormLabel>
                    <FormControl>
                      <Input placeholder="Sitat mətni..." {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="md:col-span-12">
              <FormField
                control={control}
                name={`missionVision.snippets.${index}.avatarUrl`}
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold text-neutral-500">Sitat Avatarı</FormLabel>
                    <ImageUploadField value={field.value || ""} onChange={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        ) : (
          <>
            <div className="md:col-span-4">
              <FormField
                control={control}
                name={`missionVision.snippets.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-neutral-500">Statistika Dəyəri (məs. 99%)</FormLabel>
                    <FormControl>
                      <Input placeholder="Statistika dəyəri..." {...field} value={field.value || ""} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="md:col-span-5">
              <FormField
                control={control}
                name={`missionVision.snippets.${index}.text`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-neutral-500">Statistika Etiketi</FormLabel>
                    <FormControl>
                      <Input placeholder="Statistika etiketi..." {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => remove(index)}
        className="text-red-500 hover:text-red-600 hover:bg-red-50 mt-6"
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
}

// Repeatable Image List for Stats Avatars
function RepeatableAvatarList({ value, onChange, label }: { value: string[]; onChange: (val: string[]) => void; label: string }) {
  const handleAdd = () => {
    onChange([...value, ""]);
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, idx) => idx !== index));
  };

  const handleUrlChange = (index: number, url: string) => {
    onChange(value.map((v, idx) => (idx === index ? url : v)));
  };

  return (
    <div className="space-y-3 bg-neutral-50 border p-4 rounded-2xl">
      <div className="flex justify-between items-center">
        <Label className="font-semibold text-black text-sm">{label}</Label>
        <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
          <Plus size={14} className="mr-1" /> Avatər Əlavə et
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {value.map((url, index) => (
          <div key={index} className="relative border p-3 rounded-xl bg-white flex flex-col gap-2 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-neutral-500">Avatar #{index + 1}</span>
              <Button type="button" variant="ghost" size="icon" onClick={() => handleRemove(index)} className="h-6 w-6 text-red-500">
                <Trash2 size={12} />
              </Button>
            </div>
            <ImageUploadField value={url} onChange={(newUrl) => handleUrlChange(index, newUrl)} />
          </div>
        ))}
        {value.length === 0 && (
          <div className="col-span-3 text-center py-4 text-xs text-neutral-400 border-2 border-dashed border-gray-200 rounded-xl">
            Heç bir avatar yoxdur.
          </div>
        )}
      </div>
    </div>
  );
}

export default function AboutAdminPage() {
  const { toast } = useToast();
  const [locale, setLocale] = useState("az");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<any>({
    resolver: zodResolver(aboutFormSchema),
    defaultValues: {
      studioIntro: { overline: "", heading: "", paragraph: "", image1Url: "", image2Url: "" },
      whatWeBuild: {
        content: { mainImageUrl: "", statValue: "", statLabel: "", statAvatarUrls: [], statCaption: "", heading: "", paragraph: "", ctaLabel: "" },
        features: [],
      },
      missionVision: {
        content: { statValue: "", statLabel: "", statAvatarUrls: [], statCaption: "", missionLabel: "", missionText: "", visionLabel: "", visionText: "" },
        snippets: [],
      },
    },
  });

  const { fields: featureFields, append: appendFeature, remove: removeFeature, move: moveFeature } = useFieldArray({
    control: form.control,
    name: "whatWeBuild.features",
  });

  const { fields: snippetFields, append: appendSnippet, remove: removeSnippet, move: moveSnippet } = useFieldArray({
    control: form.control,
    name: "missionVision.snippets",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    loadAllContent();
  }, [locale]);

  const loadAllContent = async () => {
    setIsLoading(true);
    try {
      const [studio, wwb, mv] = await Promise.all([
        fetchAboutStudioIntro(locale),
        fetchAboutWhatWeBuild(locale),
        fetchAboutMissionVision(locale),
      ]);

      form.reset({
        studioIntro: studio || { overline: "STUDİYA", heading: "", paragraph: "", image1Url: "", image2Url: "" },
        whatWeBuild: {
          content: wwb?.content || { mainImageUrl: "", statValue: "100%", statLabel: "", statAvatarUrls: [], statCaption: "", heading: "", paragraph: "", ctaLabel: "" },
          features: wwb?.features || [],
        },
        missionVision: {
          content: mv?.content || { statValue: "100%", statLabel: "", statAvatarUrls: [], statCaption: "", missionLabel: "", missionText: "", visionLabel: "", visionText: "" },
          snippets: mv?.snippets || [],
        },
      });
    } catch (err) {
      toast({
        title: "Xəta",
        description: "Məlumatları yükləyərkən xəta baş verdi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeatureDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = featureFields.findIndex((f) => f.id === active.id);
    const newIndex = featureFields.findIndex((f) => f.id === over.id);

    moveFeature(oldIndex, newIndex);
    
    // Auto-update order indexes
    const updatedFeatures = form.getValues("whatWeBuild.features");
    updatedFeatures.forEach((feat: any, idx: number) => {
      form.setValue(`whatWeBuild.features.${idx}.order`, idx + 1);
    });
  };

  const handleSnippetDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = snippetFields.findIndex((s) => s.id === active.id);
    const newIndex = snippetFields.findIndex((s) => s.id === over.id);

    moveSnippet(oldIndex, newIndex);

    // Auto-update order indexes
    const updatedSnippets = form.getValues("missionVision.snippets");
    updatedSnippets.forEach((snip: any, idx: number) => {
      form.setValue(`missionVision.snippets.${idx}.order`, idx + 1);
    });
  };

  const handleFormSubmit = async (values: AboutFormValues) => {
    setIsSaving(true);
    try {
      await Promise.all([
        updateAboutStudioIntro(locale, values.studioIntro),
        updateAboutWhatWeBuild(locale, values.whatWeBuild),
        updateAboutMissionVision(locale, values.missionVision),
      ]);

      toast({
        title: "Uğurlu",
        description: "Haqqımızda səhifəsinin məzmunu yadda saxlanıldı.",
      });
      loadAllContent(); // Reload structure
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

  return (
    <div className="p-6 md:p-8 space-y-6 overflow-y-auto h-full w-full">
      
      {/* Shell Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-black flex items-center gap-2">
            <Info className="text-[var(--primary)]" />
            Haqqımızda Səhifəsi
          </h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            About (Haqqımızda) səhifəsinin hekayə, vizyon, özəlliklər və rəylər bölməsini idarə edin.
          </p>
        </div>

        <Tabs value={locale} onValueChange={setLocale}>
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

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 className="animate-spin text-[var(--primary)]" size={36} />
          <p className="text-sm text-[var(--muted-foreground)]">Haqqımızda səhifə məzmunu yüklənir...</p>
        </div>
      ) : (
        <Form {...(form as any)}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8 max-w-5xl">
            
            <Accordion type="single" collapsible defaultValue="studio" className="w-full space-y-4">
              
              {/* PANEL 1: STUDIO INTRO */}
              <AccordionItem value="studio" className="border rounded-2xl bg-white shadow-sm overflow-hidden px-1">
                <AccordionTrigger className="px-6 py-4 font-bold text-black hover:no-underline text-base md:text-lg">
                  1. Studiya Giriş Bölməsi (Studio Intro)
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control as any}
                      name="studioIntro.overline"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="font-semibold text-black">Üst Başlıq (Overline)</FormLabel>
                          <FormControl>
                            <Input placeholder="Məs. STUDİYA" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as any}
                      name="studioIntro.heading"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="font-semibold text-black">Başlıq</FormLabel>
                          <FormControl>
                            <Input placeholder="Məqalə başlığı..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as any}
                      name="studioIntro.paragraph"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="font-semibold text-black">Açıqlama Mətni</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Açıqlama mətni bura daxil edin..." {...field} rows={4} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <Label className="font-semibold text-black text-sm">Giriş Şəkli #1</Label>
                      <ImageUploadField
                        value={form.watch("studioIntro.image1Url") || ""}
                        onChange={(url) => form.setValue("studioIntro.image1Url", url)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-semibold text-black text-sm">Giriş Şəkli #2</Label>
                      <ImageUploadField
                        value={form.watch("studioIntro.image2Url") || ""}
                        onChange={(url) => form.setValue("studioIntro.image2Url", url)}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* PANEL 2: WHAT WE BUILD */}
              <AccordionItem value="whatwebuild" className="border rounded-2xl bg-white shadow-sm overflow-hidden px-1">
                <AccordionTrigger className="px-6 py-4 font-bold text-black hover:no-underline text-base md:text-lg">
                  2. "Nə Qururuq" Bölməsi (What We Build)
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2 space-y-6">
                  
                  {/* Image and Header content */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control as any}
                      name="whatWeBuild.content.heading"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="font-semibold text-black">Bölmə Başlığı</FormLabel>
                          <FormControl>
                            <Input placeholder="Məs. Biz Real Biznes Nəticələri Yaradırıq..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as any}
                      name="whatWeBuild.content.paragraph"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="font-semibold text-black">Açıqlama</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Biznes açıqlama mətni..." {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as any}
                      name="whatWeBuild.content.ctaLabel"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="font-semibold text-black">CTA Düymə Etiketi</FormLabel>
                          <FormControl>
                            <Input placeholder="Məs. Haqqımızda Daha Çox Öyrən" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <Label className="font-semibold text-black text-sm">Bölmənin Əsas Şəkli</Label>
                      <ImageUploadField
                        value={form.watch("whatWeBuild.content.mainImageUrl") || ""}
                        onChange={(url) => form.setValue("whatWeBuild.content.mainImageUrl", url)}
                      />
                    </div>

                    {/* Stats Box Configuration */}
                    <div className="border p-5 rounded-2xl bg-neutral-50/50 space-y-4">
                      <h4 className="font-bold text-black border-b pb-1 text-xs uppercase tracking-wider text-neutral-500">Statistika Kartı (Şəkil Üzərində)</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control as any}
                          name="whatWeBuild.content.statValue"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold text-neutral-500">Statistika Dəyəri</FormLabel>
                              <FormControl>
                                <Input placeholder="Məs. 100%" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control as any}
                          name="whatWeBuild.content.statLabel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold text-neutral-500">Statistika Etiketi</FormLabel>
                              <FormControl>
                                <Input placeholder="Məs. Məmnun Müştəri" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control as any}
                        name="whatWeBuild.content.statCaption"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-neutral-500">Statistika Təsviri</FormLabel>
                            <FormControl>
                              <Input placeholder="Məs. Davamlı əməkdaşlıqlar" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Stats avatar URLs repeatable */}
                      <RepeatableAvatarList
                        value={form.watch("whatWeBuild.content.statAvatarUrls") || []}
                        onChange={(urls) => form.setValue("whatWeBuild.content.statAvatarUrls", urls)}
                        label="Kartın Müştəri Avatarları"
                      />
                    </div>
                  </div>

                  {/* Drag and drop feature lists */}
                  <div className="border-t pt-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-black text-sm">Bölmənin Özəllikləri</h4>
                        <p className="text-xs text-[var(--muted-foreground)]">Biz nə qururuq bölməsindəki 3 özəllik kartını idarə edin.</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendFeature({ icon: "BarChart", title: "", description: "", order: featureFields.length + 1 })}
                      >
                        <Plus size={14} className="mr-1" /> Özəllik Əlavə et
                      </Button>
                    </div>

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleFeatureDragEnd}>
                      <SortableContext items={featureFields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                        <div className="flex flex-col">
                          {featureFields.map((feat, idx) => (
                            <SortableFeatureItem
                              key={feat.id}
                              id={feat.id}
                              index={idx}
                              control={form.control}
                              remove={removeFeature}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* PANEL 3: MISSION, VISION & RECOMMENDATIONS */}
              <AccordionItem value="mission" className="border rounded-2xl bg-white shadow-sm overflow-hidden px-1">
                <AccordionTrigger className="px-6 py-4 font-bold text-black hover:no-underline text-base md:text-lg">
                  3. Missiya, Vizyon və Rəylər (Mission/Vision & Marquee)
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2 space-y-6">
                  
                  {/* Mission fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border p-5 rounded-2xl bg-neutral-50/50 space-y-4">
                      <h4 className="font-bold text-black text-sm border-b pb-1 text-neutral-500">Missiya Kartı</h4>
                      <FormField
                        control={form.control as any}
                        name="missionVision.content.missionLabel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-neutral-500">Kart Etiketi</FormLabel>
                            <FormControl>
                              <Input placeholder="Məs. BİZİM MİSSİYAMIZ" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control as any}
                        name="missionVision.content.missionText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-neutral-500">Missiya Mətni</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Missiya mətni..." {...field} rows={3} className="resize-none" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Vision fields */}
                    <div className="border p-5 rounded-2xl bg-neutral-50/50 space-y-4">
                      <h4 className="font-bold text-black text-sm border-b pb-1 text-neutral-500">Vizyon Kartı</h4>
                      <FormField
                        control={form.control as any}
                        name="missionVision.content.visionLabel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-neutral-500">Kart Etiketi</FormLabel>
                            <FormControl>
                              <Input placeholder="Məs. BİZİM VİZYONUMUZ" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control as any}
                        name="missionVision.content.visionText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-neutral-500">Vizyon Mətni</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Vizyon mətni..." {...field} rows={3} className="resize-none" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Reused Stats card settings */}
                    <div className="md:col-span-2 border p-5 rounded-2xl bg-neutral-50/50 space-y-4">
                      <h4 className="font-bold text-black text-sm border-b pb-1 text-neutral-500">Üçüncü Kart: Statistika Kartı</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control as any}
                          name="missionVision.content.statValue"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold text-neutral-500">Statistika Dəyəri</FormLabel>
                              <FormControl>
                                <Input placeholder="Məs. 100%" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control as any}
                          name="missionVision.content.statLabel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold text-neutral-500">Statistika Etiketi</FormLabel>
                              <FormControl>
                                <Input placeholder="Məs. Məmnun Müştəri" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control as any}
                        name="missionVision.content.statCaption"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-neutral-500">Statistika Açıqlaması</FormLabel>
                            <FormControl>
                              <Input placeholder="Məs. Davamlı əməkdaşlıqlar" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <RepeatableAvatarList
                        value={form.watch("missionVision.content.statAvatarUrls") || []}
                        onChange={(urls) => form.setValue("missionVision.content.statAvatarUrls", urls)}
                        label="Statistika Kartı Avatarları"
                      />
                    </div>
                  </div>

                  {/* Recommendation marquee snippets repeatable list */}
                  <div className="border-t pt-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-black text-sm">Rəylər və Statistika Lentası (Recommendations Marquee)</h4>
                        <p className="text-xs text-[var(--muted-foreground)]">Sonsuz sürüşən lenti idarə edin. Sitat və Statistika növlərini qarışıq əlavə edə bilərsiniz.</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendSnippet({ type: "quote", text: "", value: "", avatarUrl: "", order: snippetFields.length + 1 })}
                      >
                        <Plus size={14} className="mr-1" /> Snippet Əlavə et
                      </Button>
                    </div>

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSnippetDragEnd}>
                      <SortableContext items={snippetFields.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                        <div className="flex flex-col">
                          {snippetFields.map((snip, idx) => (
                            <SortableSnippetItem
                              key={snip.id}
                              id={snip.id}
                              index={idx}
                              control={form.control}
                              watch={form.watch}
                              remove={removeSnippet}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Bottom Actions Row */}
            <div className="border-t pt-6 flex items-center justify-end">
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-[var(--primary)] text-black hover:bg-[var(--primary)]/90 font-bold px-8 h-12"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" /> Yadda saxlanılır...
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
      )}
    </div>
  );
}
