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
import { Tabs, TabsList, TabsTrigger } from "@/components/admin/ui/tabs";
import { 
  fetchContactWhyChooseUsStrict, 
  updateContactWhyChooseUs, 
  fetchContactInfoStrict, 
  updateContactInfo 
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { GripVertical, Plus, Trash2, Save, Loader2, Mail, Link as LinkIcon, Compass, Sparkles, MapPin, Phone } from "lucide-react";
import LocationPickerMap from "@/components/admin/ui/LocationPickerMap";

// Form Validation Schema
const contactFormSchema = z.object({
  whyChooseUs: z.object({
    overline: z.string().min(1, "Sahə boş ola bilməz"),
    chartLabel: z.string().min(1, "Sahə boş ola bilməz"),
    chartHeading: z.string().min(1, "Sahə boş ola bilməz"),
    chartParagraph: z.string().min(1, "Sahə boş ola bilməz"),
    chartBarValues: z.string().refine(
      (val) => val.split(",").map(Number).every((n) => !isNaN(n) && n >= 0 && n <= 100),
      "Vergüllə ayrılmış 0-100 arası ədədlər daxil edin (Məs. 40,65,30,80,55)"
    ),
    rightHeading: z.string().min(1, "Sahə boş ola bilməz"),
    rightParagraph: z.string().min(1, "Sahə boş ola bilməz"),
    bandText: z.string().min(1, "Sahə boş ola bilməz"),
  }),
  cards: z.array(z.object({
    id: z.string().optional(),
    order: z.number(),
    icon: z.string().min(1, "İkon boş ola bilməz"),
    title: z.string().min(1, "Başlıq boş ola bilməz"),
    description: z.string().min(1, "Açıqlama boş ola bilməz"),
  })),
  info: z.object({
    address: z.string(),
    phone: z.string().min(1, "Telefon boş ola bilməz"),
    email: z.string().min(1, "E-poçt boş ola bilməz"),
    workingHours: z.string(),
    mapLatitude: z.number().nullable().optional(),
    mapLongitude: z.number().nullable().optional(),
  }),
  socialLinks: z.array(z.object({
    id: z.string().optional(),
    platform: z.string().min(1, "Platforma boş ola bilməz"),
    url: z.string().min(1, "URL boş ola bilməz"),
    order: z.number(),
  })),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

// Draggable Feature Card Item
function SortableFeatureCardItem({ id, index, control, remove }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, ...(isDragging ? { zIndex: 50 } : {}) };

  return (
    <div ref={setNodeRef} style={style} className="bg-white border rounded-2xl p-4 md:p-6 flex gap-4 items-start shadow-sm mb-4">
      <button type="button" className="cursor-grab p-1 text-gray-400 mt-2" {...attributes} {...listeners}>
        <GripVertical size={18} />
      </button>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1">
        <div className="md:col-span-3">
          <FormField
            control={control}
            name={`cards.${index}.icon`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-neutral-500">İkon (Lucide adı)</FormLabel>
                <FormControl>
                  <Input placeholder="Məs. Users, Target, TrendingUp" {...field} className="h-10 font-mono text-sm" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="md:col-span-4">
          <FormField
            control={control}
            name={`cards.${index}.title`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-neutral-500">Başlıq</FormLabel>
                <FormControl>
                  <Input placeholder="Başlıq" {...field} className="h-10" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="md:col-span-5">
          <FormField
            control={control}
            name={`cards.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-neutral-500">Açıqlama</FormLabel>
                <FormControl>
                  <Input placeholder="Qısa açıqlama mətni" {...field} className="h-10" />
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

// Draggable Social Link Item
function SortableSocialLinkItem({ id, index, control, remove }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, ...(isDragging ? { zIndex: 50 } : {}) };

  return (
    <div ref={setNodeRef} style={style} className="bg-white border rounded-2xl p-4 md:p-6 flex gap-4 items-start shadow-sm mb-4">
      <button type="button" className="cursor-grab p-1 text-gray-400 mt-2" {...attributes} {...listeners}>
        <GripVertical size={18} />
      </button>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1">
        <div className="md:col-span-4">
          <FormField
            control={control}
            name={`socialLinks.${index}.platform`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-neutral-500">Platforma adı</FormLabel>
                <FormControl>
                  <Input placeholder="Məs. Instagram, LinkedIn, Behance" {...field} className="h-10" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="md:col-span-8">
          <FormField
            control={control}
            name={`socialLinks.${index}.url`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-neutral-500">Link URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} className="h-10" />
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

export default function ContactAdminPage() {
  const { toast } = useToast();
  const [locale, setLocale] = useState("az");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [openPanel, setOpenPanel] = useState<string>("info");

  const form = useForm<any>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      whyChooseUs: {
        overline: "",
        chartLabel: "Data Monitoring",
        chartHeading: "",
        chartParagraph: "",
        chartBarValues: "40,65,30,80,55",
        rightHeading: "",
        rightParagraph: "",
        bandText: "",
      },
      cards: [],
      info: {
        address: "",
        phone: "",
        email: "",
        workingHours: "",
        mapLatitude: 40.394508,
        mapLongitude: 49.714875,
      },
      socialLinks: [],
    },
  });

  const { fields: cardFields, append: appendCard, remove: removeCard, move: moveCard } = useFieldArray({
    control: form.control,
    name: "cards",
  });

  const { fields: socialFields, append: appendSocial, remove: removeSocial, move: moveSocial } = useFieldArray({
    control: form.control,
    name: "socialLinks",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    loadAllData();
  }, [locale]);

  const loadAllData = async () => {
    setIsLoading(true);
    setLoadFailed(false);
    try {
      const [wcu, contactInfo] = await Promise.all([
        fetchContactWhyChooseUsStrict(locale),
        fetchContactInfoStrict(locale),
      ]);

      const barValuesString = Array.isArray(wcu?.content?.chartBarValues)
        ? wcu.content.chartBarValues.join(",")
        : "40,65,30,80,55";

      form.reset({
        whyChooseUs: wcu?.content
          ? {
              overline: wcu.content.overline || "",
              chartLabel: wcu.content.chartLabel || "Data Monitoring",
              chartHeading: wcu.content.chartHeading || "",
              chartParagraph: wcu.content.chartParagraph || "",
              chartBarValues: barValuesString,
              rightHeading: wcu.content.rightHeading || "",
              rightParagraph: wcu.content.rightParagraph || "",
              bandText: wcu.content.bandText || "",
            }
          : {
              overline: "NİYƏ THE9THWAY?",
              chartLabel: "Data Monitoring",
              chartHeading: "",
              chartParagraph: "",
              chartBarValues: "40,65,30,80,55",
              rightHeading: "",
              rightParagraph: "",
              bandText: "",
            },
        cards: wcu?.cards || [],
        info: contactInfo?.info || {
          address: "",
          phone: "",
          email: "",
          workingHours: "",
          mapLatitude: 40.394508,
          mapLongitude: 49.714875,
        },
        socialLinks: contactInfo?.socialLinks || [],
      });
    } catch (err) {
      // Never leave an empty default form on screen: saving it could overwrite real data
      setLoadFailed(true);
      toast({
        title: "Xəta",
        description: "Məlumatları yükləyərkən xəta baş verdi. Səhifəni yeniləyin.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = cardFields.findIndex((c) => c.id === active.id);
    const newIndex = cardFields.findIndex((c) => c.id === over.id);

    moveCard(oldIndex, newIndex);

    // Auto-update order indexes
    const updatedCards = form.getValues("cards");
    updatedCards.forEach((_: any, idx: number) => {
      form.setValue(`cards.${idx}.order`, idx + 1);
    });
  };

  const handleSocialDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = socialFields.findIndex((s) => s.id === active.id);
    const newIndex = socialFields.findIndex((s) => s.id === over.id);

    moveSocial(oldIndex, newIndex);

    // Auto-update order indexes
    const updatedSocials = form.getValues("socialLinks");
    updatedSocials.forEach((_: any, idx: number) => {
      form.setValue(`socialLinks.${idx}.order`, idx + 1);
    });
  };

  const friendlyError = (err: unknown, fallback: string) => {
    const msg = err instanceof Error ? err.message : "";
    if (/unauthorized|no session|401/i.test(msg)) return "Sessiyanın vaxtı bitib. Yenidən daxil olun və təkrar cəhd edin.";
    return msg || fallback;
  };

  const firstError = (errs: unknown): { path: string; message: string } | null => {
    if (!errs || typeof errs !== "object") return null;
    const node = errs as Record<string, unknown>;
    if (typeof node.message === "string" && node.message) return { path: "", message: node.message };
    for (const key of Object.keys(node)) {
      if (key === "ref") continue;
      const found = firstError(node[key]);
      if (found) return { path: key + (found.path ? "." + found.path : ""), message: found.message };
    }
    return null;
  };

  // Validates only the given fields; when invalid, opens the panel with the problem and says what it is
  const validateGroup = async (names: string[], panelFor: (root: string) => string) => {
    const valid = await form.trigger(names as any);
    if (valid) return true;
    const found = firstError(form.formState.errors);
    const root = found?.path.split(".")[0] ?? names[0];
    setOpenPanel(panelFor(root));
    toast({
      title: "Məlumat düzgün deyil",
      description: found?.message || "Qırmızı ilə işarələnmiş sahələri düzəldin.",
      variant: "destructive",
    });
    return false;
  };

  // Panels 1 and 2: "Niyə Biz?" texts and feature cards
  const saveContent = async () => {
    if (!(await validateGroup(["whyChooseUs", "cards"], (r) => (r === "cards" ? "cards" : "why-choose-us")))) return;
    const values = form.getValues();
    setIsSaving(true);
    try {
      await updateContactWhyChooseUs(locale, {
        content: { ...values.whyChooseUs, chartBarValues: values.whyChooseUs.chartBarValues.split(",").map(Number) },
        cards: values.cards,
      });
      toast({ title: "Uğurlu", description: "\"Niyə Biz?\" və kartlar yadda saxlanıldı." });
      loadAllData();
    } catch (err) {
      toast({ title: "Xəta", description: friendlyError(err, "Yadda saxlayarkən xəta baş verdi."), variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // Panels 3 and 4: contact details, map and social links (independent of the panels above)
  const saveContact = async () => {
    if (!(await validateGroup(["info", "socialLinks"], (r) => (r === "socialLinks" ? "socials" : "info")))) return;
    const values = form.getValues();
    const finite = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
    setIsSaving(true);
    try {
      await updateContactInfo(locale, {
        info: { ...values.info, mapLatitude: finite(values.info.mapLatitude), mapLongitude: finite(values.info.mapLongitude) },
        socialLinks: values.socialLinks,
      });
      toast({ title: "Uğurlu", description: "Əlaqə məlumatları, xəritə və sosial linklər yadda saxlanıldı." });
      loadAllData();
    } catch (err) {
      toast({ title: "Xəta", description: friendlyError(err, "Yadda saxlayarkən xəta baş verdi."), variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const SaveBar = ({ onSave, label }: { onSave: () => void; label: string }) => (
    <div className="flex justify-end border-t pt-4">
      <Button
        type="button"
        onClick={onSave}
        disabled={isSaving || loadFailed}
        className="bg-[var(--primary)] text-black hover:bg-[var(--primary)]/90 font-bold px-6 h-11"
      >
        {isSaving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
        {label}
      </Button>
    </div>
  );

  return (
    <div className="p-6 md:p-8 space-y-6 overflow-y-auto h-full w-full">
      
      {/* Shell Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-black flex items-center gap-2">
            <Compass className="text-[var(--primary)]" />
            Əlaqə Səhifəsi İdarəetməsi
          </h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            "Niyə Biz?" paneli, feature kartları, ünvan/saat məlumatları və xəritə koordinatlarını idarə edin.
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
          <p className="text-sm text-[var(--muted-foreground)]">Əlaqə səhifəsi məlumatları yüklənir...</p>
        </div>
      ) : loadFailed ? (
        <div className="max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 space-y-3">
          <p className="font-bold text-red-800">Məlumatlar yüklənmədi</p>
          <p className="text-sm text-red-700">
            Boş formanın üstünə yazmamaq üçün redaktə söndürülüb. İnternet əlaqəsini yoxlayın və yenidən yükləyin.
          </p>
          <Button type="button" variant="outline" onClick={loadAllData}>
            Yenidən yüklə
          </Button>
        </div>
      ) : (
        <Form {...(form as any)}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-8 max-w-5xl">
            
            <Accordion type="single" collapsible value={openPanel} onValueChange={setOpenPanel} className="w-full space-y-4">
              
              {/* PANEL 1: WHY CHOOSE US CONTENT */}
              <AccordionItem value="why-choose-us" className="border rounded-2xl bg-white shadow-sm overflow-hidden px-1">
                <AccordionTrigger className="px-6 py-4 font-bold text-black hover:no-underline text-base md:text-lg">
                  1. "Niyə Biz?" Paneli (Why Choose Us)
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control as any}
                      name="whyChooseUs.overline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-black">Overline Mətni</FormLabel>
                          <FormControl>
                            <Input placeholder="Məs. NİYƏ THE9THWAY?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as any}
                      name="whyChooseUs.chartLabel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-black">Diaqram Etiketi (Chart Label)</FormLabel>
                          <FormControl>
                            <Input placeholder="Məs. Data Monitoring" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as any}
                      name="whyChooseUs.chartHeading"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="font-semibold text-black">Diaqram Başlığı (Chart Heading)</FormLabel>
                          <FormControl>
                            <Input placeholder="Etibarlı və Təcrübəli Komanda" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as any}
                      name="whyChooseUs.chartParagraph"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="font-semibold text-black">Diaqram Altı Açıqlama</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Diaqram altı açıqlama..." {...field} rows={2} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as any}
                      name="whyChooseUs.chartBarValues"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="font-semibold text-black">Sütunlu Diaqram Dəyərləri (0-100 arası, vergüllə ayrılmış 5 ədəd)</FormLabel>
                          <FormControl>
                            <Input placeholder="Məs. 40,65,30,80,55" {...field} className="font-mono text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="md:col-span-2 border-t pt-4 my-2" />

                    <FormField
                      control={form.control as any}
                      name="whyChooseUs.rightHeading"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="font-semibold text-black">Sağ Tərəf Başlığı (Right Heading)</FormLabel>
                          <FormControl>
                            <Input placeholder="Məs. Niyə Bizim Marketinq Xidmətlərimizi Seçməlisiniz?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as any}
                      name="whyChooseUs.rightParagraph"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="font-semibold text-black">Sağ Tərəf Açıqlama Mətni</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Açıqlama mətni bura daxil edin..." {...field} rows={4} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as any}
                      name="whyChooseUs.bandText"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="font-semibold text-black">Alt Hərəkətli Lent Mətni (Band Text)</FormLabel>
                          <FormControl>
                            <Input placeholder="Məs. Harada Olursunuz Olun, Bizimlə İşləyin." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {SaveBar({ onSave: saveContent, label: "Niyə Biz? və kartları saxla" })}
                </AccordionContent>
              </AccordionItem>

              {/* PANEL 2: FEATURE CARDS */}
              <AccordionItem value="cards" className="border rounded-2xl bg-white shadow-sm overflow-hidden px-1">
                <AccordionTrigger className="px-6 py-4 font-bold text-black hover:no-underline text-base md:text-lg">
                  2. Feature Kartları (Feature Cards List)
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2 space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-black text-sm">Kartlar siyahısı</h4>
                      <p className="text-xs text-[var(--muted-foreground)]">Sürüşdürərək sıralamanı tənzimləyə bilərsiniz.</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendCard({ order: cardFields.length + 1, icon: "LifeBuoy", title: "", description: "" })}
                    >
                      <Plus size={14} className="mr-1" /> Kart Əlavə et
                    </Button>
                  </div>

                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCardDragEnd}>
                    <SortableContext items={cardFields.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                      <div className="flex flex-col">
                        {cardFields.map((card, idx) => (
                          <SortableFeatureCardItem
                            key={card.id}
                            id={card.id}
                            index={idx}
                            control={form.control}
                            remove={removeCard}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                  {SaveBar({ onSave: saveContent, label: "Niyə Biz? və kartları saxla" })}
                </AccordionContent>
              </AccordionItem>

              {/* PANEL 3: CONTACT INFO & MAP */}
              <AccordionItem value="info" className="border rounded-2xl bg-white shadow-sm overflow-hidden px-1">
                <AccordionTrigger className="px-6 py-4 font-bold text-black hover:no-underline text-base md:text-lg">
                  3. Əlaqə Məlumatları və Koordinatlar (Info & Map)
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control as any}
                      name="info.address"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="font-semibold text-black">Fiziki Ünvan</FormLabel>
                          <FormControl>
                            <Input placeholder="Məs. Bakı şəhəri, Nizami küç. 10" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as any}
                      name="info.phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-black">Telefon Nömrəsi</FormLabel>
                          <FormControl>
                            <Input placeholder="Məs. +994 12 345 67 89" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as any}
                      name="info.email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-black">E-poçt Ünvanı</FormLabel>
                          <FormControl>
                            <Input placeholder="Məs. hello@the9thway.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as any}
                      name="info.workingHours"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="font-semibold text-black">İş Saatları</FormLabel>
                          <FormControl>
                            <Input placeholder="Məs. Bazar ertəsi – Cümə, 09:00 – 18:00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="md:col-span-2 border-t pt-4 my-2 flex flex-col gap-4">
                      <div>
                        <h4 className="font-bold text-black text-sm mb-1">Xəritə Koordinatları (Map Coordinates)</h4>
                        <p className="text-xs text-[var(--muted-foreground)]">Xəritə üzərindən ofisin yerləşdiyi yeri vizual olaraq seçin və ya ünvanı axtarın.</p>
                      </div>

                      <LocationPickerMap
                        latitude={form.watch("info.mapLatitude") || 40.394508}
                        longitude={form.watch("info.mapLongitude") || 49.714875}
                        onCoordinatesChange={(lat, lng) => {
                          form.setValue("info.mapLatitude", lat, { shouldDirty: true, shouldTouch: true });
                          form.setValue("info.mapLongitude", lng, { shouldDirty: true, shouldTouch: true });
                        }}
                      />

                      {/* Typing the coordinates is the fallback when the map cannot be used (blocked, slow, mobile) */}
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        {(["mapLatitude", "mapLongitude"] as const).map((key) => {
                          const current = form.watch(`info.${key}`);
                          return (
                            <div key={key} className="space-y-1.5">
                              <Label className="text-xs font-semibold text-neutral-500">
                                {key === "mapLatitude" ? "Enlik (Latitude)" : "Uzunluq (Longitude)"}
                              </Label>
                              <Input
                                key={String(current)}
                                inputMode="decimal"
                                defaultValue={typeof current === "number" ? String(current) : ""}
                                placeholder={key === "mapLatitude" ? "40.394508" : "49.714875"}
                                className="h-10 font-mono text-sm"
                                onBlur={(e) => {
                                  const n = Number(e.target.value.replace(",", "."));
                                  const max = key === "mapLatitude" ? 90 : 180;
                                  if (e.target.value.trim() && Number.isFinite(n) && Math.abs(n) <= max) {
                                    form.setValue(`info.${key}`, n, { shouldDirty: true, shouldTouch: true });
                                  } else {
                                    e.target.value = typeof current === "number" ? String(current) : "";
                                  }
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  {SaveBar({ onSave: saveContact, label: "Əlaqə məlumatlarını, xəritəni və sosial linkləri saxla" })}
                </AccordionContent>
              </AccordionItem>

              {/* PANEL 4: GLOBAL SOCIAL LINKS */}
              <AccordionItem value="socials" className="border rounded-2xl bg-white shadow-sm overflow-hidden px-1">
                <AccordionTrigger className="px-6 py-4 font-bold text-black hover:no-underline text-base md:text-lg">
                  4. Sosial Şəbəkələr (Global Footer Social Links)
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2 space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-black text-sm">Sosial linklər</h4>
                      <p className="text-xs text-[var(--muted-foreground)]">Footer və əlaqə bölmələrində istifadə olunan linklər.</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendSocial({ order: socialFields.length + 1, platform: "", url: "" })}
                    >
                      <Plus size={14} className="mr-1" /> Sosial Link Əlavə et
                    </Button>
                  </div>

                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSocialDragEnd}>
                    <SortableContext items={socialFields.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                      <div className="flex flex-col">
                        {socialFields.map((social, idx) => (
                          <SortableSocialLinkItem
                            key={social.id}
                            id={social.id}
                            index={idx}
                            control={form.control}
                            remove={removeSocial}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                  {SaveBar({ onSave: saveContact, label: "Əlaqə məlumatlarını, xəritəni və sosial linkləri saxla" })}
                </AccordionContent>
              </AccordionItem>

            </Accordion>

          </form>
        </Form>
      )}
    </div>
  );
}
