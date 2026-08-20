"use client"

import * as React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { ModuleHeader } from "@/components/admin/layout/ModuleHeader"
import { EmptyState } from "@/components/admin/ui/empty-state"
import { Plus, GripVertical, Trash2, DatabaseBackup, Layers, Star } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/admin/ui/tabs"
import { Card, CardContent } from "@/components/admin/ui/card"
import { Input } from "@/components/admin/ui/input"
import { Textarea } from "@/components/admin/ui/textarea"
import { Label } from "@/components/admin/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/admin/ui/accordion"
import { Button } from "@/components/admin/ui/button"
import { AnimatedSaveButton } from "@/components/admin/ui/animated-save-button"
import { Loader2 } from "lucide-react"
import { ImageUploadField } from "@/components/admin/ui/ImageUploadField"
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

// SCHEMAS
const introSchema = z.object({
  heading: z.string().min(1, "Başlıq boş ola bilməz"),
})

const highlightSchema = z.object({
  rating: z.string().min(1, "Reytinq boş ola bilməz"),
  reviewCount: z.string().min(1, "Rəy sayı boş ola bilməz"),
  blurb: z.string().min(1, "Açıqlama boş ola bilməz"),
})

const testimonialSchema = z.object({
  id: z.string().optional(),
  quote: z.string().min(1, "Rəy mətni boş ola bilməz"),
  clientName: z.string().min(1, "Müştəri adı boş ola bilməz"),
  clientRole: z.string().min(1, "Vəzifə boş ola bilməz"),
  avatarUrl: z.string().nullable().optional(),
  trustBadge: z.string().nullable().optional(),
})

const localeSchema = z.object({
  introHome: introSchema,
  introServices: introSchema,
  introPortfolio: introSchema,
  highlight: highlightSchema,
  testimonials: z.array(testimonialSchema),
})

const formSchema = z.object({
  az: localeSchema,
  ru: localeSchema,
  en: localeSchema,
})

type FormValues = z.infer<typeof formSchema>

const defaultLocaleData = {
  introHome: { heading: "" },
  introServices: { heading: "" },
  introPortfolio: { heading: "" },
  highlight: { rating: "", reviewCount: "", blurb: "" },
  testimonials: []
}

// SORTABLE COMPONENT FOR TESTIMONIALS
function SortableTestimonialItem({ id, index, control, activeTab, remove }: any) {
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
          <span className="font-semibold text-sm">Rəy {index + 1}</span>
        </div>
        <Button type="button" variant="ghost" size="icon" className="text-[var(--destructive)] h-8 w-8 hover:bg-[var(--destructive)]/10" onClick={() => remove(index)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField control={control} name={`${activeTab}.testimonials.${index}.clientName` as const} render={({ field }) => (
          <FormItem><FormLabel>Müştəri Adı</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={control} name={`${activeTab}.testimonials.${index}.clientRole` as const} render={({ field }) => (
          <FormItem><FormLabel>Vəzifə / Şirkət (Role)</FormLabel><FormControl><Input placeholder="Məs: CEO, Alaxa" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={control} name={`${activeTab}.testimonials.${index}.quote` as const} render={({ field }) => (
          <FormItem className="md:col-span-2"><FormLabel>Müştəri Rəyi (Quote)</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={control} name={`${activeTab}.testimonials.${index}.trustBadge` as const} render={({ field }) => (
          <FormItem><FormLabel>Etiket (Məs: Google Reviews)</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={control} name={`${activeTab}.testimonials.${index}.avatarUrl` as const} render={({ field }) => (
          <FormItem>
            <FormLabel>Profil Şəkli (Avatar)</FormLabel>
            <FormControl>
              <ImageUploadField 
                value={field.value} 
                onChange={field.onChange}
                onClear={() => field.onChange("")}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>
    </div>
  )
}

export function TestimonialsContentForm() {
  const [activeTab, setActiveTab] = React.useState<"az" | "ru" | "en">("az")
  const [introPage, setIntroPage] = React.useState<"home" | "services" | "portfolio">("home")
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
        const [introHomeRes, introServicesRes, introPortfolioRes, highlightRes, listRes] = await Promise.all([
          fetch(`http://localhost:4000/api/testimonials/intro?locale=${loc}&page=home`),
          fetch(`http://localhost:4000/api/testimonials/intro?locale=${loc}&page=services`),
          fetch(`http://localhost:4000/api/testimonials/intro?locale=${loc}&page=portfolio`),
          fetch(`http://localhost:4000/api/testimonials/highlight?locale=${loc}`),
          fetch(`http://localhost:4000/api/testimonials/list?locale=${loc}`)
        ])

        if (
          introHomeRes.status >= 500 || 
          introServicesRes.status >= 500 || 
          introPortfolioRes.status >= 500 || 
          highlightRes.status >= 500 || 
          listRes.status >= 500
        ) {
          throw new Error("Server xətası")
        }

        let introHome, introServices, introPortfolio, highlight, list
        try {
          introHome = await introHomeRes.json()
          introServices = await introServicesRes.json()
          introPortfolio = await introPortfolioRes.json()
          highlight = await highlightRes.json()
          list = await listRes.json()
        } catch (e) {
          throw new Error("API xətası (Invalid JSON)")
        }

        if (!introHome.error || !introServices.error || !introPortfolio.error || !highlight.error || (list.testimonials && list.testimonials.length > 0)) {
          anyHasData = true
        }

        fullFormData[loc] = {
          introHome: introHome.error ? defaultLocaleData.introHome : { heading: introHome.heading },
          introServices: introServices.error ? defaultLocaleData.introServices : { heading: introServices.heading },
          introPortfolio: introPortfolio.error ? defaultLocaleData.introPortfolio : { heading: introPortfolio.heading },
          highlight: highlight.error ? defaultLocaleData.highlight : { rating: highlight.rating, reviewCount: highlight.reviewCount, blurb: highlight.blurb },
          testimonials: list.testimonials || []
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
    console.log("[Testimonials] onSubmit called — sending PUT requests...")
    const locales: ("az" | "ru" | "en")[] = ["az", "ru", "en"]
    
    for (const loc of locales) {
      const localeData = data[loc]
      
      console.log(`[Testimonials] Saving locale: ${loc}...`)
      const responses = await Promise.all([
        fetch(`http://localhost:4000/api/testimonials/intro?locale=${loc}&page=home`, {
          method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(localeData.introHome)
        }),
        fetch(`http://localhost:4000/api/testimonials/intro?locale=${loc}&page=services`, {
          method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(localeData.introServices)
        }),
        fetch(`http://localhost:4000/api/testimonials/intro?locale=${loc}&page=portfolio`, {
          method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(localeData.introPortfolio)
        }),
        fetch(`http://localhost:4000/api/testimonials/highlight?locale=${loc}`, {
          method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(localeData.highlight)
        }),
        fetch(`http://localhost:4000/api/testimonials/list?locale=${loc}`, {
          method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ testimonials: localeData.testimonials })
        })
      ])

      for (const res of responses) {
        if (!res.ok) {
          const body = await res.text().catch(() => "")
          console.error(`[Testimonials] API error ${res.status} for ${res.url}:`, body)
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

  const testimonialsField = useFieldArray({ control: form.control, name: `${activeTab}.testimonials` as const, keyName: "_id" })

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      const oldIndex = testimonialsField.fields.findIndex(f => f._id === active.id)
      const newIndex = testimonialsField.fields.findIndex(f => f._id === over.id)
      testimonialsField.move(oldIndex, newIndex)
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
          description="Rəylər bölməsi üçün məlumatlar hələ əlavə edilməyib. Əvvəlcədən təyin olunmuş məlumatları əlavə etmək üçün aşağıdakı düymədən istifadə edin."
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
          title="Rəylər (Testimonials) Məzmunu"
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

        <Accordion type="multiple" defaultValue={["intro", "highlight", "list"]} className="space-y-12">
          
          {/* 1. INTRO */}
          <AccordionItem value="intro" className="rounded-2xl border border-[var(--border)] px-6 bg-[var(--paper)]">
            <AccordionTrigger className="text-xl font-semibold hover:no-underline py-6">
              Rəylər Bölməsi Başlığı
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pb-6">
              <div className="flex flex-col gap-6">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={introPage === "home" ? "default" : "outline"}
                    onClick={() => setIntroPage("home")}
                    className="flex-1"
                  >
                    Ana Səhifə Başlığı
                  </Button>
                  <Button
                    type="button"
                    variant={introPage === "services" ? "default" : "outline"}
                    onClick={() => setIntroPage("services")}
                    className="flex-grow"
                  >
                    Xidmətlər Səhifəsi Başlığı
                  </Button>
                  <Button
                    type="button"
                    variant={introPage === "portfolio" ? "default" : "outline"}
                    onClick={() => setIntroPage("portfolio")}
                    className="flex-grow"
                  >
                    Portfolio Səhifəsi Başlığı
                  </Button>
                </div>

                {introPage === "home" && (
                  <FormField control={form.control} name={`${activeTab}.introHome.heading` as const} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ana Səhifə Başlığı</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}

                {introPage === "services" && (
                  <FormField control={form.control} name={`${activeTab}.introServices.heading` as const} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Xidmətlər Səhifəsi Başlığı</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}

                {introPage === "portfolio" && (
                  <FormField control={form.control} name={`${activeTab}.introPortfolio.heading` as const} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Portfolio Səhifəsi Başlığı</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 2. HIGHLIGHT CARD */}
          <AccordionItem value="highlight" className="rounded-2xl border border-[var(--border)] px-6 bg-[var(--paper)]">
            <AccordionTrigger className="text-xl font-semibold hover:no-underline py-6">
              Reytinq Kartı (Highlight Card)
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pb-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField control={form.control} name={`${activeTab}.highlight.rating` as const} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reytinq Qiyməti (Məs: 4.9)</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name={`${activeTab}.highlight.reviewCount` as const} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rəy Sayı (Məs: (40+ reviews))</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name={`${activeTab}.highlight.blurb` as const} render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Açıqlama Mətni</FormLabel>
                    <FormControl><Textarea rows={3} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 3. TESTIMONIALS LIST */}
          <AccordionItem value="list" className="rounded-2xl border border-[var(--border)] px-6 bg-[var(--paper)]">
            <AccordionTrigger className="text-xl font-semibold hover:no-underline py-6">
              Müştəri Rəyləri Siyahısı
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pb-6">
              <div className="flex justify-between items-center">
                <p className="text-sm text-[var(--muted-foreground)]">Rəyləri sürükləyərək sıralamasını dəyişə bilərsiniz.</p>
                <Button 
                  type="button" 
                  onClick={() => testimonialsField.append({ quote: "", clientName: "", clientRole: "", avatarUrl: "", trustBadge: "Google Reviews" })}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" /> Rəy Əlavə Et
                </Button>
              </div>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={testimonialsField.fields.map(f => f._id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-6">
                    {testimonialsField.fields.map((field, index) => (
                      <SortableTestimonialItem 
                        key={field._id} 
                        id={field._id} 
                        index={index} 
                        control={form.control} 
                        activeTab={activeTab} 
                        remove={testimonialsField.remove} 
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
