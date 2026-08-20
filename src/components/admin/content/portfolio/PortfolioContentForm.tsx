"use client"

import * as React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { ModuleHeader } from "@/components/admin/layout/ModuleHeader"
import { EmptyState } from "@/components/admin/ui/empty-state"
import { Plus, GripVertical, Trash2, DatabaseBackup, Layers, ArrowRight } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/admin/ui/tabs"
import { Card, CardContent } from "@/components/admin/ui/card"
import { Input } from "@/components/admin/ui/input"
import { Textarea } from "@/components/admin/ui/textarea"
import { Label } from "@/components/admin/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/admin/ui/accordion"
import { Button } from "@/components/admin/ui/button"
import { AnimatedSaveButton } from "@/components/admin/ui/animated-save-button"
import { Loader2 } from "lucide-react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/admin/ui/form"
import { useToast } from "@/components/admin/ui/use-toast"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ImageUploadField } from "@/components/admin/ui/ImageUploadField"

// SCHEMAS
const heroSchema = z.object({
  pillLabel: z.string().min(1, "Sahə boş ola bilməz"),
  heading: z.string().min(1, "Sahə boş ola bilməz"),
  paragraph: z.string().min(1, "Sahə boş ola bilməz"),
  primaryCtaLabel: z.string().min(1, "Sahə boş ola bilməz"),
  secondaryCtaLabel: z.string().min(1, "Sahə boş ola bilməz"),
  backgroundImageUrl: z.string().nullable().optional(),
})

const caseStudySchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1, "Slug boş ola bilməz"),
  tags: z.array(z.string()),
  title: z.string().min(1, "Başlıq boş ola bilməz"),
  colorTheme: z.enum(["ink", "lime-dark", "ink-light"]),
  stat1Value: z.string().min(1, "Dəyər boş ola bilməz"),
  stat1Label: z.string().min(1, "Etiket boş ola bilməz"),
  stat2Value: z.string().min(1, "Dəyər boş ola bilməz"),
  stat2Label: z.string().min(1, "Etiket boş ola bilməz"),
  stat3Value: z.string().min(1, "Dəyər boş ola bilməz"),
  stat3Label: z.string().min(1, "Etiket boş ola bilməz"),
  viewProjectLabel: z.string().min(1, "Düymə mətni boş ola bilməz"),
  projectLink: z.string().nullable().optional(),
  challenge: z.string().min(1, "Problem boş ola bilməz"),
  approach: z.string().min(1, "Yanaşma boş ola bilməz"),
  result: z.string().min(1, "Nəticə boş ola bilməz"),
  galleryImageUrls: z.array(z.string()),
})

const faqIntroSchema = z.object({
  pillLabel: z.string().min(1, "Sahə boş ola bilməz"),
  heading: z.string().min(1, "Sahə boş ola bilməz"),
  calloutHeading: z.string().min(1, "Sahə boş ola bilməz"),
  calloutText: z.string().min(1, "Sahə boş ola bilməz"),
  calloutCtaLabel: z.string().min(1, "Sahə boş ola bilməz"),
})

const faqItemSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(1, "Sual boş ola bilməz"),
  answer: z.string().min(1, "Cavab boş ola bilməz"),
})

const localeSchema = z.object({
  hero: heroSchema,
  caseStudies: z.array(caseStudySchema),
  testimonialsIntro: z.object({ heading: z.string() }),
  faq: z.object({
    intro: faqIntroSchema,
    items: z.array(faqItemSchema),
  })
})

const formSchema = z.object({
  az: localeSchema,
  ru: localeSchema,
  en: localeSchema,
})

type FormValues = z.infer<typeof formSchema>

const defaultLocaleData = {
  hero: { pillLabel: "", heading: "", paragraph: "", primaryCtaLabel: "", secondaryCtaLabel: "", backgroundImageUrl: "" },
  caseStudies: [],
  testimonialsIntro: { heading: "" },
  faq: {
    intro: { pillLabel: "", heading: "", calloutHeading: "", calloutText: "", calloutCtaLabel: "" },
    items: []
  }
}

// SORTABLE COMPONENT FOR CASE STUDIES
function SortableCaseStudyItem({ id, index, control, register, activeTab, remove }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition, ...(isDragging ? { zIndex: 50 } : {}) }

  // nested array for tags
  const { fields: tagFields, append: appendTag, remove: removeTag } = useFieldArray({
    control,
    name: `${activeTab}.caseStudies.${index}.tags` as any,
    keyName: "_tagId"
  })

  // nested array for galleryImageUrls
  const { fields: galleryFields, append: appendGallery, remove: removeGallery } = useFieldArray({
    control,
    name: `${activeTab}.caseStudies.${index}.galleryImageUrls` as any,
    keyName: "_galleryId"
  })

  return (
    <div ref={setNodeRef} style={style} className={cn(
      "bg-white shadow-sm border border-[var(--border)] rounded-xl p-4 md:p-6 group transition-shadow space-y-4",
      isDragging && "shadow-xl scale-[1.02] rotate-1 border-[var(--primary)] bg-white"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-move" {...attributes} {...listeners}>
          <GripVertical className="h-5 w-5 text-[var(--muted-foreground)]" />
          <span className="font-semibold text-sm">Case Study {index + 1}</span>
        </div>
        <Button type="button" variant="ghost" size="icon" className="text-[var(--destructive)] h-8 w-8 hover:bg-[var(--destructive)]/10" onClick={() => remove(index)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField control={control} name={`${activeTab}.caseStudies.${index}.title` as const} render={({ field }) => (
          <FormItem className="md:col-span-2"><FormLabel>Başlıq</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <FormField control={control} name={`${activeTab}.caseStudies.${index}.slug` as const} render={({ field }) => (
          <FormItem><FormLabel>Slug (URL Link hissəsi)</FormLabel><FormControl><Input placeholder="Məs: aurora-brand" {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <FormField control={control} name={`${activeTab}.caseStudies.${index}.colorTheme` as const} render={({ field }) => (
          <FormItem>
            <FormLabel>Rəng Mövzusu (Color Theme)</FormLabel>
            <FormControl>
              <div className="flex items-center gap-3">
                <select 
                  {...field}
                  className="flex h-10 w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                >
                  <option value="ink">Ink (Tünd)</option>
                  <option value="lime-dark">Lime Dark (Yaşıl)</option>
                  <option value="ink-light">Ink Light (Açıq Tünd)</option>
                </select>
                <div className={cn(
                  "w-8 h-8 rounded-full border border-gray-300 shrink-0",
                  field.value === "ink" && "bg-black",
                  field.value === "lime-dark" && "bg-[#8DE45F]",
                  field.value === "ink-light" && "bg-gray-700"
                )} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={control} name={`${activeTab}.caseStudies.${index}.viewProjectLabel` as const} render={({ field }) => (
          <FormItem><FormLabel>Düymə Yazısı</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <FormField control={control} name={`${activeTab}.caseStudies.${index}.projectLink` as const} render={({ field }) => (
          <FormItem><FormLabel>Xarici Layihə Linki (İstəyə bağlı)</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
        )} />

        <FormField control={control} name={`${activeTab}.caseStudies.${index}.challenge` as const} render={({ field }) => (
          <FormItem className="md:col-span-2"><FormLabel>Problem (Challenge)</FormLabel><FormControl><Textarea rows={3} placeholder="Məqsəd nə idi, qarşıya çıxan çətinliklər..." {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <FormField control={control} name={`${activeTab}.caseStudies.${index}.approach` as const} render={({ field }) => (
          <FormItem className="md:col-span-2"><FormLabel>Yanaşma (Approach)</FormLabel><FormControl><Textarea rows={3} placeholder="Biz nə etdik, hansı addımları atdıq..." {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <FormField control={control} name={`${activeTab}.caseStudies.${index}.result` as const} render={({ field }) => (
          <FormItem className="md:col-span-2"><FormLabel>Nəticə (Result / Outcome)</FormLabel><FormControl><Textarea rows={3} placeholder="Əldə olunan uğurlar, statistik göstəricilər..." {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        {/* Dynamic Tags */}
        <div className="md:col-span-2 space-y-2 bg-gray-50/50 p-4 rounded-xl border border-gray-200">
          <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Teqlər (Tags)</Label>
          <div className="flex flex-wrap gap-2">
            {tagFields.map((tagField, tIdx) => (
              <div key={tagField._tagId} className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1 shadow-sm">
                <input 
                  className="bg-transparent text-xs font-semibold focus:outline-none w-24 text-center text-ink"
                  {...register(`${activeTab}.caseStudies.${index}.tags.${tIdx}` as const)}
                />
                <button type="button" onClick={() => removeTag(tIdx)} className="text-red-500 hover:text-red-700 text-xs font-bold">×</button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendTag("Yeni Teq")} className="h-7 text-xs rounded-full bg-white border-dashed border-gray-300">
              + Teq Əlavə Et
            </Button>
          </div>
        </div>

        {/* Dynamic Project Gallery */}
        <div className="md:col-span-2 space-y-4 bg-gray-50/50 p-4 rounded-xl border border-gray-200">
          <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Layihə Qalereyası (Gallery Images)</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {galleryFields.map((galField, gIdx) => (
              <div key={galField._galleryId} className="flex flex-col gap-2 p-3 bg-white border border-gray-200 rounded-xl relative shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Şəkil {gIdx + 1}</span>
                  <Button type="button" variant="ghost" size="icon" className="text-red-500 h-6 w-6 hover:bg-red-50" onClick={() => removeGallery(gIdx)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <FormField control={control} name={`${activeTab}.caseStudies.${index}.galleryImageUrls.${gIdx}` as const} render={({ field }) => (
                  <FormControl>
                    <ImageUploadField value={field.value || ""} onChange={field.onChange} />
                  </FormControl>
                )} />
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => appendGallery("")} className="gap-2 bg-white">
            <Plus className="h-4 w-4" /> Şəkil Əlavə Et
          </Button>
        </div>

        {/* Stats 1 */}
        <div className="grid grid-cols-2 gap-2 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
          <FormField control={control} name={`${activeTab}.caseStudies.${index}.stat1Value` as const} render={({ field }) => (
            <FormItem><FormLabel className="text-xs">Stat 1 Qiymət</FormLabel><FormControl><Input className="h-8 text-xs" placeholder="Məs: +150%" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={control} name={`${activeTab}.caseStudies.${index}.stat1Label` as const} render={({ field }) => (
            <FormItem><FormLabel className="text-xs">Stat 1 Etiket</FormLabel><FormControl><Input className="h-8 text-xs" placeholder="Məs: Brand Awareness" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        {/* Stats 2 */}
        <div className="grid grid-cols-2 gap-2 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
          <FormField control={control} name={`${activeTab}.caseStudies.${index}.stat2Value` as const} render={({ field }) => (
            <FormItem><FormLabel className="text-xs">Stat 2 Qiymət</FormLabel><FormControl><Input className="h-8 text-xs" placeholder="Məs: +64%" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={control} name={`${activeTab}.caseStudies.${index}.stat2Label` as const} render={({ field }) => (
            <FormItem><FormLabel className="text-xs">Stat 2 Etiket</FormLabel><FormControl><Input className="h-8 text-xs" placeholder="Məs: Engagement" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        {/* Stats 3 */}
        <div className="grid grid-cols-2 gap-2 bg-gray-50/50 p-3 rounded-xl border border-gray-100 md:col-span-2">
          <FormField control={control} name={`${activeTab}.caseStudies.${index}.stat3Value` as const} render={({ field }) => (
            <FormItem><FormLabel className="text-xs">Stat 3 Qiymət</FormLabel><FormControl><Input className="h-8 text-xs" placeholder="Məs: 24/7" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={control} name={`${activeTab}.caseStudies.${index}.stat3Label` as const} render={({ field }) => (
            <FormItem><FormLabel className="text-xs">Stat 3 Etiket</FormLabel><FormControl><Input className="h-8 text-xs" placeholder="Məs: Tracking" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
      </div>
    </div>
  )
}

// SORTABLE COMPONENT FOR FAQ ITEMS
function SortableFAQItem({ id, index, control, register, activeTab, remove }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition, ...(isDragging ? { zIndex: 50 } : {}) }

  return (
    <div ref={setNodeRef} style={style} className={cn(
      "bg-white shadow-sm border border-[var(--border)] rounded-xl p-4 md:p-6 group transition-shadow space-y-4",
      isDragging && "shadow-xl scale-[1.02] rotate-1 border-[var(--primary)] bg-white"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-move" {...attributes} {...listeners}>
          <GripVertical className="h-5 w-5 text-[var(--muted-foreground)]" />
          <span className="font-semibold text-sm">Sual {index + 1}</span>
        </div>
        <Button type="button" variant="ghost" size="icon" className="text-[var(--destructive)] h-8 w-8 hover:bg-[var(--destructive)]/10" onClick={() => remove(index)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4">
        <FormField control={control} name={`${activeTab}.faq.items.${index}.question` as const} render={({ field }) => (
          <FormItem><FormLabel>Sual (Question)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={control} name={`${activeTab}.faq.items.${index}.answer` as const} render={({ field }) => (
          <FormItem><FormLabel>Cavab (Answer)</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
        )} />
      </div>
    </div>
  )
}

export function PortfolioContentForm() {
  const [activeTab, setActiveTab] = React.useState<"az" | "ru" | "en">("az")
  const [isLoading, setIsLoading] = React.useState(true)
  const [isError, setIsError] = React.useState(false)
  const [isEmpty, setIsEmpty] = React.useState(false)
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { az: defaultLocaleData, ru: defaultLocaleData, en: defaultLocaleData }
  })

  const { isDirty } = form.formState

  // Drag & drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setIsError(false)
      setIsEmpty(false)
      const locales: ("az" | "ru" | "en")[] = ["az", "ru", "en"]
      
      let anyHasData = false
      const fullFormData = {} as any

      for (const loc of locales) {
        const [heroRes, caseStudiesRes, introTestimonialsRes, faqRes] = await Promise.all([
          fetch(`http://localhost:4000/api/portfolio/hero?locale=${loc}`),
          fetch(`http://localhost:4000/api/portfolio/case-studies?locale=${loc}`),
          fetch(`http://localhost:4000/api/testimonials/intro?locale=${loc}&page=portfolio`),
          fetch(`http://localhost:4000/api/portfolio/faq?locale=${loc}`)
        ])

        if (
          heroRes.status >= 500 || 
          caseStudiesRes.status >= 500 || 
          introTestimonialsRes.status >= 500 || 
          faqRes.status >= 500
        ) {
          throw new Error("Server xətası")
        }

        let hero, caseStudiesData, introTestimonials, faqData
        try {
          hero = await heroRes.json()
          caseStudiesData = await caseStudiesRes.json()
          introTestimonials = await introTestimonialsRes.json()
          faqData = await faqRes.json()
        } catch (e) {
          throw new Error("API xətası (Invalid JSON)")
        }

        if (!hero.error || (caseStudiesData.caseStudies && caseStudiesData.caseStudies.length > 0) || !introTestimonials.error || faqData.intro) {
          anyHasData = true
        }

        fullFormData[loc] = {
          hero: hero.error ? defaultLocaleData.hero : {
            pillLabel: hero.pillLabel, heading: hero.heading, paragraph: hero.paragraph,
            primaryCtaLabel: hero.primaryCtaLabel, secondaryCtaLabel: hero.secondaryCtaLabel,
            backgroundImageUrl: hero.backgroundImageUrl || ""
          },
          caseStudies: (caseStudiesData.caseStudies || []).map((cs: any) => ({
            ...cs,
            galleryImageUrls: cs.galleryImageUrls || []
          })),
          testimonialsIntro: introTestimonials.error ? defaultLocaleData.testimonialsIntro : { heading: introTestimonials.heading },
          faq: {
            intro: faqData.intro ? {
              pillLabel: faqData.intro.pillLabel, heading: faqData.intro.heading,
              calloutHeading: faqData.intro.calloutHeading, calloutText: faqData.intro.calloutText,
              calloutCtaLabel: faqData.intro.calloutCtaLabel
            } : defaultLocaleData.faq.intro,
            items: faqData.items || []
          }
        }
      }

      form.reset(fullFormData)
      
      if (!anyHasData) {
        setIsEmpty(true)
      }
    } catch (err) {
      console.error(err)
      setIsError(true)
      toast({ title: "Xəta baş verdi", description: "Məlumatlar yüklənərkən xəta baş verdi.", variant: "destructive" } as any)
    } finally {
      setIsLoading(false)
    }
  }, [form, toast])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const onSubmit = async (data: FormValues) => {
    console.log("[Portfolio] onSubmit called — sending PUT requests...")
    const locales: ("az" | "ru" | "en")[] = ["az", "ru", "en"]
    
    for (const loc of locales) {
      const localeData = data[loc]
      
      console.log(`[Portfolio] Saving locale: ${loc}...`)
      const responses = await Promise.all([
        fetch(`http://localhost:4000/api/portfolio/hero?locale=${loc}`, {
          method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(localeData.hero)
        }),
        fetch(`http://localhost:4000/api/portfolio/case-studies?locale=${loc}`, {
          method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ caseStudies: localeData.caseStudies })
        }),
        fetch(`http://localhost:4000/api/portfolio/faq?locale=${loc}`, {
          method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(localeData.faq)
        })
      ])

      for (const res of responses) {
        if (!res.ok) {
          const body = await res.text().catch(() => "")
          console.error(`[Portfolio] API error ${res.status} for ${res.url}:`, body)
          throw new Error(`API returned ${res.status} for ${res.url}`)
        }
      }
    }

    // Refresh state
    form.reset(data)
    toast({ title: "Uğurlu", description: "Dəyişikliklər uğurla yadda saxlanıldı.", variant: "success" } as any)
  }

  const handleSave = async () => {
    let hasErrors = false
    await form.trigger()
    if (Object.keys(form.formState.errors).length > 0) {
      hasErrors = true
      toast({ title: "Validasiya xətası", description: "Zəhmət olmasa bütün sahələri düzgün doldurun.", variant: "destructive" } as any)
      throw new Error("Validation failed")
    }

    if (!hasErrors) {
      await form.handleSubmit(onSubmit)()
    }
  }

  const caseStudiesField = useFieldArray({ control: form.control, name: `${activeTab}.caseStudies` as const, keyName: "_id" })
  const faqItemsField = useFieldArray({ control: form.control, name: `${activeTab}.faq.items` as const, keyName: "_id" })

  const handleDragEndCaseStudies = (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      const oldIndex = caseStudiesField.fields.findIndex(f => f._id === active.id)
      const newIndex = caseStudiesField.fields.findIndex(f => f._id === over.id)
      caseStudiesField.move(oldIndex, newIndex)
    }
  }

  const handleDragEndFAQ = (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      const oldIndex = faqItemsField.fields.findIndex(f => f._id === active.id)
      const newIndex = faqItemsField.fields.findIndex(f => f._id === over.id)
      faqItemsField.move(oldIndex, newIndex)
    }
  }

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[var(--muted-foreground)]" /></div>
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <EmptyState 
          icon={DatabaseBackup}
          title="Xəta Baş Verdi"
          description="Məlumatlar yüklənərkən xəta baş verdi. Zəhmət olmasa serverin işlədiyindən əmin olun və yenidən cəhd edin."
          actionLabel="Yenidən Cəhd Et"
          onAction={loadData}
        />
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <EmptyState 
          icon={Layers}
          title="Bu bölmə üçün hələ məlumat yoxdur"
          description="Portfolio məzmunu hələ əlavə edilməyib. Əvvəlcədən təyin olunmuş məlumatları yaratmaq üçün aşağıdakı düymədən istifadə edin."
          actionLabel="Məlumatları Yarat"
          onAction={() => setIsEmpty(false)}
        />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-24">
        
        <ModuleHeader 
          title="Portfolio Səhifəsi Məzmunu"
          tabs={
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="az" className="flex-1">Azərbaycan (AZ)</TabsTrigger>
                <TabsTrigger value="ru" className="flex-1">Русский (RU)</TabsTrigger>
                <TabsTrigger value="en" className="flex-1">English (EN)</TabsTrigger>
              </TabsList>
            </Tabs>
          }
          actions={
            <AnimatedSaveButton 
              type="button" 
              onSave={handleSave} 
              className="shadow-md"
              idleText={isDirty ? "Dəyişiklikləri Yadda Saxla •" : "Saxlanıldı"}
            />
          }
        />

        <Accordion type="multiple" defaultValue={["hero", "cases", "testimonials", "faq"]} className="space-y-12">
          
          {/* 1. HERO */}
          <AccordionItem value="hero" className="rounded-2xl border border-[var(--border)] px-6 bg-[var(--paper)]">
            <AccordionTrigger className="text-xl font-semibold hover:no-underline py-6">
              Hero Bölməsi
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pb-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField control={form.control} name={`${activeTab}.hero.backgroundImageUrl` as const} render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Hero Arxa Plan Şəkli (Background Image)</FormLabel>
                    <FormControl>
                      <ImageUploadField 
                        value={field.value || ""} 
                        onChange={field.onChange} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name={`${activeTab}.hero.pillLabel` as const} render={({ field }) => (
                  <FormItem className="md:col-span-2"><FormLabel>Pill Etiketi (Məs: Case Studies)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name={`${activeTab}.hero.heading` as const} render={({ field }) => (
                  <FormItem className="md:col-span-2"><FormLabel>Başlıq</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name={`${activeTab}.hero.paragraph` as const} render={({ field }) => (
                  <FormItem className="md:col-span-2"><FormLabel>Açıqlama Mətni</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name={`${activeTab}.hero.primaryCtaLabel` as const} render={({ field }) => (
                  <FormItem><FormLabel>Birinci CTA Düymə Yazısı</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name={`${activeTab}.hero.secondaryCtaLabel` as const} render={({ field }) => (
                  <FormItem><FormLabel>İkinci CTA Düymə Yazısı</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 2. CASE STUDIES */}
          <AccordionItem value="cases" className="rounded-2xl border border-[var(--border)] px-6 bg-[var(--paper)]">
            <AccordionTrigger className="text-xl font-semibold hover:no-underline py-6">
              Case Study-lər
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pb-6">
              <div className="flex justify-between items-center">
                <p className="text-sm text-[var(--muted-foreground)]">Case study-ləri sürükləyərək sıralamasını dəyişə bilərsiniz.</p>
                <Button 
                  type="button" 
                  onClick={() => caseStudiesField.append({
                    title: "", slug: "yeni-layihe", colorTheme: "ink", tags: ["Design"],
                    stat1Value: "", stat1Label: "", stat2Value: "", stat2Label: "", stat3Value: "", stat3Label: "",
                    viewProjectLabel: "View Project", projectLink: "#", challenge: "", approach: "", result: "", galleryImageUrls: []
                  })}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" /> Case Study Əlavə Et
                </Button>
              </div>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndCaseStudies}>
                <SortableContext items={caseStudiesField.fields.map(f => f._id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-6">
                    {caseStudiesField.fields.map((field, index) => (
                      <SortableCaseStudyItem 
                        key={field._id} 
                        id={field._id} 
                        index={index} 
                        control={form.control} 
                        register={form.register}
                        activeTab={activeTab} 
                        remove={caseStudiesField.remove} 
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </AccordionContent>
          </AccordionItem>

          {/* 3. TESTIMONIALS HEADING REDIRECT PANEL */}
          <AccordionItem value="testimonials" className="rounded-2xl border border-[var(--border)] px-6 bg-[var(--paper)]">
            <AccordionTrigger className="text-xl font-semibold hover:no-underline py-6">
              Rəylər Bölməsi Başlığı
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pb-6">
              <div className="flex flex-col gap-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-200">
                <div className="flex flex-col gap-2">
                  <Label>Hazırki Portfolio Rəylər Başlığı (Read-Only)</Label>
                  <Input 
                    readOnly 
                    disabled 
                    value={form.watch(`${activeTab}.testimonialsIntro.heading`) || ""} 
                    className="bg-gray-100 font-semibold text-gray-500"
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-[var(--muted-foreground)] max-w-lg">
                    Rəylər listi və hər üç səhifənin rəylər başlığı mərkəzi şəkildə redaktə olunur. Bu başlığı dəyişmək və ya rəy kartlarını idarə etmək üçün "Rəylər" bölməsinə keçin.
                  </p>
                  <Button asChild variant="outline" className="gap-2 shrink-0">
                    <Link href="/admin/content/testimonials">
                      Rəylər Bölməsinə Keç <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 4. FAQ */}
          <AccordionItem value="faq" className="rounded-2xl border border-[var(--border)] px-6 bg-[var(--paper)]">
            <AccordionTrigger className="text-xl font-semibold hover:no-underline py-6">
              FAQ Bölməsi
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pb-6">
              
              {/* FAQ Intro & Callout Card */}
              <div className="grid gap-6 md:grid-cols-2 bg-gray-50/50 p-6 rounded-2xl border border-gray-200 mb-8">
                <FormField control={form.control} name={`${activeTab}.faq.intro.pillLabel` as const} render={({ field }) => (
                  <FormItem className="md:col-span-2"><FormLabel>FAQ Pill Etiketi (Məs: FAQ)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name={`${activeTab}.faq.intro.heading` as const} render={({ field }) => (
                  <FormItem className="md:col-span-2"><FormLabel>FAQ Bölməsi Başlığı</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                
                <div className="md:col-span-2 border-t border-gray-200 my-4" />

                <FormField control={form.control} name={`${activeTab}.faq.intro.calloutHeading` as const} render={({ field }) => (
                  <FormItem><FormLabel>Callout Kart Başlığı (Məs: Sualınız Var?)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name={`${activeTab}.faq.intro.calloutCtaLabel` as const} render={({ field }) => (
                  <FormItem><FormLabel>Callout CTA Düymə Yazısı</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name={`${activeTab}.faq.intro.calloutText` as const} render={({ field }) => (
                  <FormItem className="md:col-span-2"><FormLabel>Callout Açıqlama Mətni</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              {/* Repeatable FAQ Items */}
              <div className="flex justify-between items-center border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-lg">Suallar Siyahısı</h4>
                <Button 
                  type="button" 
                  onClick={() => faqItemsField.append({ question: "", answer: "" })}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" /> Sual Əlavə Et
                </Button>
              </div>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndFAQ}>
                <SortableContext items={faqItemsField.fields.map(f => f._id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-6 mt-4">
                    {faqItemsField.fields.map((field, index) => (
                      <SortableFAQItem 
                        key={field._id} 
                        id={field._id} 
                        index={index} 
                        control={form.control} 
                        register={form.register}
                        activeTab={activeTab} 
                        remove={faqItemsField.remove} 
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </form>
    </Form>
  )
}
