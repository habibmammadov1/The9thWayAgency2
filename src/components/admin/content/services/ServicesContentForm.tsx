"use client"

import * as React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { ModuleHeader } from "@/components/admin/layout/ModuleHeader"
import { EmptyState } from "@/components/admin/ui/empty-state"
import { Plus, GripVertical, Pencil, Trash2, ImageIcon, DatabaseBackup, Layers } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/admin/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/admin/ui/card"
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
  pillLabel: z.string(),
  heading: z.string(),
  ctaLabel: z.string(),
})

const serviceSchema = z.object({
  id: z.string().optional(),
  icon: z.string(),
  title: z.string(),
  description: z.string(),
  bullets: z.array(z.object({ value: z.string() })),
  imageUrl: z.string().nullable().optional(),
})

const industrySchema = z.object({
  id: z.string().optional(),
  name: z.string(),
})

const statHighlightSchema = z.object({
  value: z.string(),
  label: z.string(),
  ctaText: z.string(),
  ctaLinkLabel: z.string(),
  imageUrl: z.string().nullable().optional(),
})

const whyChooseUsCardSchema = z.object({
  heading: z.string(),
  paragraph: z.string(),
  checklistItems: z.array(z.string()),
  ctaLabel: z.string(),
})

const happyClientsCardSchema = z.object({
  percentage: z.string(),
  label: z.string(),
  clientCount: z.string(),
  avatarUrls: z.array(z.string()),
})

const supportCardSchema = z.object({
  badge: z.string(),
  heading: z.string(),
  description: z.string(),
})

const localeSchema = z.object({
  intro: introSchema,
  services: z.array(serviceSchema),
  whyChooseUs: z.object({
    intro: z.object({
      pillLabel: z.string(),
      heading: z.string(),
      paragraph: z.string(),
    }),
    industries: z.array(industrySchema),
    statHighlight: statHighlightSchema,
    whyChooseUsCard: whyChooseUsCardSchema,
    happyClientsCard: happyClientsCardSchema,
    supportCard: supportCardSchema,
  })
})

const formSchema = z.object({
  az: localeSchema,
  ru: localeSchema,
  en: localeSchema,
})

type FormValues = z.infer<typeof formSchema>

// default empty values
const defaultLocaleData = {
  intro: { pillLabel: "", heading: "", ctaLabel: "" },
  services: [],
  whyChooseUs: {
    intro: { pillLabel: "", heading: "", paragraph: "" },
    industries: [],
    statHighlight: { value: "", label: "", ctaText: "", ctaLinkLabel: "", imageUrl: "" },
    whyChooseUsCard: { heading: "", paragraph: "", checklistItems: [], ctaLabel: "" },
    happyClientsCard: { percentage: "", label: "", clientCount: "", avatarUrls: [] },
    supportCard: { badge: "", heading: "", description: "" },
  }
}

// SORTABLE COMPONENT FOR SERVICES
function SortableServiceItem({ id, index, control, activeTab, remove }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition, ...(isDragging ? { zIndex: 50 } : {}) }

  // nested array for bullets
  const { fields: bullets, append, remove: removeBullet } = useFieldArray({
    control,
    name: `${activeTab}.services.${index}.bullets` as const,
    keyName: "_id"
  })

  return (
    <div ref={setNodeRef} style={style} className={cn(
      "bg-white shadow-sm border border-[var(--border)] rounded-xl p-4 md:p-6 group transition-shadow",
      isDragging && "shadow-xl scale-[1.02] rotate-1 border-[var(--primary)] bg-white"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 cursor-move" {...attributes} {...listeners}>
          <GripVertical className="h-5 w-5 text-[var(--muted-foreground)]" />
          <span className="font-semibold">Xidmət {index + 1}</span>
        </div>
        <Button type="button" variant="ghost" size="icon" className="text-[var(--destructive)]" onClick={() => remove(index)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField control={control} name={`${activeTab}.services.${index}.title` as const} render={({ field }) => (
          <FormItem><FormLabel>Başlıq (Title)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
        )} />
        <FormField control={control} name={`${activeTab}.services.${index}.icon` as const} render={({ field }) => (
          <FormItem><FormLabel>İkon</FormLabel><FormControl><Input placeholder="İkon adı və ya class" {...field} /></FormControl></FormItem>
        )} />
        <FormField control={control} name={`${activeTab}.services.${index}.description` as const} render={({ field }) => (
          <FormItem className="md:col-span-2"><FormLabel>Təsvir</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
        )} />
        <FormField control={control} name={`${activeTab}.services.${index}.imageUrl` as const} render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Şəkil</FormLabel>
            <FormControl>
              <ImageUploadField 
                value={field.value} 
                onChange={field.onChange}
                onClear={() => field.onChange("")}
              />
            </FormControl>
          </FormItem>
        )} />
      </div>

      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <FormLabel>Siyahı Təfərrüatları (Bullets)</FormLabel>
          <Button type="button" variant="outline" size="sm" onClick={() => append({ value: "" })}><Plus className="h-3 w-3 mr-1" /> Əlavə et</Button>
        </div>
        <div className="space-y-2">
          {bullets.map((b, bIndex) => (
            <div key={b._id} className="flex gap-2">
              <FormField control={control} name={`${activeTab}.services.${index}.bullets.${bIndex}.value` as const} render={({ field }) => (
                <FormItem className="flex-1"><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeBullet(bIndex)}><Trash2 className="h-4 w-4 text-[var(--destructive)]" /></Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// SORTABLE COMPONENT FOR INDUSTRIES
function SortableIndustryItem({ id, index, control, activeTab, remove }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition, ...(isDragging ? { zIndex: 50 } : {}) }

  return (
    <div ref={setNodeRef} style={style} className={cn(
      "flex items-center gap-2 bg-white shadow-sm border border-[var(--border)] rounded-lg p-2",
      isDragging && "shadow-xl scale-[1.02] rotate-1 border-[var(--primary)] bg-white"
    )}>
      <div className="cursor-move p-2" {...attributes} {...listeners}><GripVertical className="h-4 w-4 text-[var(--muted-foreground)]" /></div>
      <FormField control={control} name={`${activeTab}.whyChooseUs.industries.${index}.name` as const} render={({ field }) => (
        <FormItem className="flex-1 mb-0 space-y-0"><FormControl><Input {...field} className="h-8" /></FormControl></FormItem>
      )} />
      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-[var(--destructive)]" onClick={() => remove(index)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function ServicesContentForm() {
  const [activeTab, setActiveTab] = React.useState<"az" | "ru" | "en">("az")
  const [isLoading, setIsLoading] = React.useState(true)
  const [isError, setIsError] = React.useState(false)
  const [isEmpty, setIsEmpty] = React.useState(false)
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { az: defaultLocaleData, ru: defaultLocaleData, en: defaultLocaleData }
  })

  React.useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        setIsError(false)
        setIsEmpty(false)
        const locales: ("az" | "ru" | "en")[] = ["az", "ru", "en"]
        
        let anyHasData = false;

        const fullFormData = {} as any;
        for (const loc of locales) {
          const [introRes, listRes, whyRes] = await Promise.all([
            fetch(`http://localhost:4000/api/services/intro?locale=${loc}`),
            fetch(`http://localhost:4000/api/services/list?locale=${loc}`),
            fetch(`http://localhost:4000/api/services/why-choose-us?locale=${loc}`),
          ])

          if (introRes.status >= 500 || listRes.status >= 500 || whyRes.status >= 500) {
            throw new Error("Server xətası");
          }

          let intro, list, why;
          try {
             intro = await introRes.json();
             list = await listRes.json();
             why = await whyRes.json();
          } catch (e) {
             throw new Error("API xətası (Invalid JSON)");
          }

          if (!intro.error || (list.services && list.services.length > 0) || !why.error) {
            anyHasData = true;
          }

          fullFormData[loc] = {
            intro: intro.error ? defaultLocaleData.intro : intro,
            services: (list.services || []).map((s: any) => ({
              ...s,
              bullets: s.bullets?.map((b: string) => ({ value: b })) || []
            })),
            whyChooseUs: {
              intro: why.intro || defaultLocaleData.whyChooseUs.intro,
              industries: why.industries || [],
              statHighlight: why.statHighlight || defaultLocaleData.whyChooseUs.statHighlight,
              whyChooseUsCard: why.whyChooseUsCard || defaultLocaleData.whyChooseUs.whyChooseUsCard,
              happyClientsCard: why.happyClientsCard || defaultLocaleData.whyChooseUs.happyClientsCard,
              supportCard: why.supportCard || defaultLocaleData.whyChooseUs.supportCard,
            }
          };
        }

        form.reset(fullFormData);
        
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
    }
    loadData()
  }, [form, toast])

  const onSubmit = async (data: FormValues) => {
    console.log("[Services] onSubmit called — sending PUT requests...")
    const locales: ("az" | "ru" | "en")[] = ["az", "ru", "en"]
    
    for (const loc of locales) {
      const localeData = data[loc]
      
      console.log(`[Services] Saving locale: ${loc}...`)
      const responses = await Promise.all([
        fetch(`http://localhost:4000/api/services/intro?locale=${loc}`, {
          method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(localeData.intro)
        }),
        fetch(`http://localhost:4000/api/services/list?locale=${loc}`, {
          method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ 
            services: localeData.services.map(s => ({ ...s, bullets: s.bullets.map(b => b.value) })) 
          })
        }),
        fetch(`http://localhost:4000/api/services/why-choose-us?locale=${loc}`, {
          method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(localeData.whyChooseUs)
        })
      ])
      
      // Validate all responses
      for (const res of responses) {
        if (!res.ok) {
          const body = await res.text().catch(() => "")
          console.error(`[Services] API error ${res.status} for ${res.url}:`, body)
          throw new Error(`API returned ${res.status} for ${res.url}`);
        }
      }
      console.log(`[Services] Locale ${loc} saved successfully.`)
    }
    
    form.reset(data)
    console.log("[Services] All locales saved. Showing success toast.")
    toast({ title: "Yadda saxlanıldı", description: "Bütün dəyişikliklər uğurla yadda saxlanıldı.", variant: "success" } as any)
  }

  const handleSave = async () => {
    console.log("[Services] Save button clicked — running form validation...")
    let validationPassed = false
    
    try {
      await form.handleSubmit(
        // onValid: form data passed validation
        async (data) => {
          validationPassed = true
          await onSubmit(data)
        },
        // onInvalid: zod validation failed — surface it to the user
        (errors) => {
          console.error("[Services] Form validation failed:", errors)
          toast({ 
            title: "Validasiya xətası", 
            description: "Bəzi sahələr düzgün doldurulmayıb. Zəhmət olmasa yoxlayın.", 
            variant: "destructive" 
          } as any)
          throw new Error("Form validation failed")
        }
      )()
      
      // If handleSubmit resolved without calling either callback (shouldn't happen, but safety net)
      if (!validationPassed) {
        console.warn("[Services] handleSubmit resolved but onValid was never called")
      }
    } catch (err) {
      console.error("[Services] handleSave caught an error:", err)
      // Only show the generic API error toast if it wasn't already a validation error
      if (err instanceof Error && err.message !== "Form validation failed") {
        toast({ 
          title: "Xəta", 
          description: "Yadda saxlanılarkən xəta baş verdi. API əlaqəsini yoxlayın.", 
          variant: "destructive" 
        } as any)
      }
      // Re-throw so AnimatedSaveButton knows it failed and shows the red 'error' state
      throw err;
    }
  }

  const { isDirty } = form.formState

  const servicesField = useFieldArray({ control: form.control, name: `${activeTab}.services` as const, keyName: "_id" })
  const industriesField = useFieldArray({ control: form.control, name: `${activeTab}.whyChooseUs.industries` as const, keyName: "_id" })

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

  const handleDragEndServices = (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      const oldIndex = servicesField.fields.findIndex(f => f._id === active.id)
      const newIndex = servicesField.fields.findIndex(f => f._id === over.id)
      servicesField.move(oldIndex, newIndex)
    }
  }

  const handleDragEndIndustries = (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      const oldIndex = industriesField.fields.findIndex(f => f._id === active.id)
      const newIndex = industriesField.fields.findIndex(f => f._id === over.id)
      industriesField.move(oldIndex, newIndex)
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
          onAction={() => window.location.reload()}
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
          description="Xidmətlər bölməsi üçün məlumatlar hələ əlavə edilməyib. Əvvəlcədən təyin olunmuş məlumatları əlavə etmək və ya yenisini yaratmaq üçün aşağıdakı düymədən istifadə edin."
          actionLabel="Yeni Əlavə Et"
          onAction={() => setIsEmpty(false)}
        />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-24">
        
        <ModuleHeader 
          title="Xidmətlər Məzmunu"
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

        <Accordion type="multiple" defaultValue={["intro", "list", "why"]} className="space-y-12">
          
          {/* 1. INTRO */}
          <AccordionItem value="intro" className="rounded-2xl border border-[var(--border)] px-6 bg-[var(--paper)]">
            <AccordionTrigger className="text-xl font-semibold hover:no-underline py-6">
              Xidmətlər Bölməsi Başlığı
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pb-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField control={form.control} name={`${activeTab}.intro.pillLabel` as const} render={({ field }) => (
                  <FormItem><FormLabel>Pill Etiketi (Məs: Xidmətlərimiz)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name={`${activeTab}.intro.ctaLabel` as const} render={({ field }) => (
                  <FormItem><FormLabel>Düymə Mətni (Məs: Bütün Xidmətlərə Bax)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name={`${activeTab}.intro.heading` as const} render={({ field }) => (
                  <FormItem className="md:col-span-2"><FormLabel>Əsas Başlıq</FormLabel><FormControl><Textarea className="h-20" {...field} /></FormControl></FormItem>
                )} />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 2. SERVICES LIST */}
          <AccordionItem value="list" className="rounded-2xl border border-[var(--border)] px-6 bg-[var(--paper)]">
            <AccordionTrigger className="text-xl font-semibold hover:no-underline py-6">
              Xidmətlər Siyahısı
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pb-6">
              <div className="flex justify-end">
                <Button type="button" onClick={() => servicesField.append({ id: Date.now().toString(), title: "", description: "", icon: "", bullets: [] })}>
                  <Plus className="mr-2 h-4 w-4" /> Yeni Xidmət
                </Button>
              </div>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndServices}>
                <SortableContext items={servicesField.fields.map(f => f._id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-6">
                    {servicesField.fields.map((field, index) => (
                      <SortableServiceItem key={field._id} id={field._id} index={index} control={form.control} activeTab={activeTab} remove={servicesField.remove} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </AccordionContent>
          </AccordionItem>

          {/* 3. WHY CHOOSE US */}
          <AccordionItem value="why" className="rounded-2xl border border-[var(--border)] px-6 bg-[var(--paper)]">
            <AccordionTrigger className="text-xl font-semibold hover:no-underline py-6">
              "Niyə Bizi Seçməlisiniz" Bölməsi
            </AccordionTrigger>
            <AccordionContent className="space-y-12 pb-6">
              
              {/* Intro */}
              <section className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm">
                <h3 className="text-lg font-bold mb-4">Ümumi Başlıqlar</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField control={form.control} name={`${activeTab}.whyChooseUs.intro.pillLabel` as const} render={({ field }) => (
                    <FormItem><FormLabel>Pill Etiketi (Məs: Niyə Biz?)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name={`${activeTab}.whyChooseUs.intro.heading` as const} render={({ field }) => (
                    <FormItem><FormLabel>Əsas Başlıq</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name={`${activeTab}.whyChooseUs.intro.paragraph` as const} render={({ field }) => (
                    <FormItem className="md:col-span-2"><FormLabel>Təsvir / Paraqraf</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
                  )} />
                </div>
              </section>

              {/* Industries */}
              <section className="bg-[var(--muted)]/20 p-6 rounded-xl border border-[var(--border)]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Sektorlar (Industries)</h3>
                  <Button type="button" size="sm" onClick={() => industriesField.append({ id: Date.now().toString(), name: "" })}>
                    <Plus className="mr-2 h-4 w-4" /> Sektor Əlavə Et
                  </Button>
                </div>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndIndustries}>
                  <SortableContext items={industriesField.fields.map(f => f._id)} strategy={verticalListSortingStrategy}>
                    <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {industriesField.fields.map((field, index) => (
                        <SortableIndustryItem key={field._id} id={field._id} index={index} control={form.control} activeTab={activeTab} remove={industriesField.remove} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </section>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Stat Highlight Card */}
                <section className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm space-y-4">
                  <h3 className="text-lg font-bold">Statistika Kartı (Stat Highlight)</h3>
                  <FormField control={form.control} name={`${activeTab}.whyChooseUs.statHighlight.value` as const} render={({ field }) => (
                    <FormItem><FormLabel>Dəyər (Məs: 500+)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name={`${activeTab}.whyChooseUs.statHighlight.label` as const} render={({ field }) => (
                    <FormItem><FormLabel>Başlıq (Məs: Uğurlu Layihə)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name={`${activeTab}.whyChooseUs.statHighlight.ctaText` as const} render={({ field }) => (
                    <FormItem><FormLabel>CTA Mətni</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name={`${activeTab}.whyChooseUs.statHighlight.ctaLinkLabel` as const} render={({ field }) => (
                    <FormItem><FormLabel>Link Mətni (Məs: Əlaqə saxlayın)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name={`${activeTab}.whyChooseUs.statHighlight.imageUrl` as const} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kart Şəkli</FormLabel>
                      <FormControl>
                        <ImageUploadField 
                          value={field.value} 
                          onChange={field.onChange}
                          onClear={() => field.onChange("")}
                        />
                      </FormControl>
                    </FormItem>
                  )} />
                </section>

                {/* Why Choose Us Card */}
                <section className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm space-y-4">
                  <h3 className="text-lg font-bold">Detallı Səbəblər Kartı</h3>
                  <FormField control={form.control} name={`${activeTab}.whyChooseUs.whyChooseUsCard.heading` as const} render={({ field }) => (
                    <FormItem><FormLabel>Başlıq</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name={`${activeTab}.whyChooseUs.whyChooseUsCard.paragraph` as const} render={({ field }) => (
                    <FormItem><FormLabel>Təsvir</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name={`${activeTab}.whyChooseUs.whyChooseUsCard.ctaLabel` as const} render={({ field }) => (
                    <FormItem><FormLabel>Düymə Mətni (Məs: Pulsuz Konsultasiya)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                  )} />
                  <div className="pt-2">
                    <FormLabel>Checklist Elementləri</FormLabel>
                    <p className="text-xs text-[var(--muted-foreground)] mb-2">Elementləri vergüllə ayıraraq yazın</p>
                    <FormField control={form.control} name={`${activeTab}.whyChooseUs.whyChooseUsCard.checklistItems` as const} render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            value={field.value?.join('\n') || ''} 
                            onChange={(e) => field.onChange(e.target.value.split('\n').filter(Boolean))} 
                            placeholder="Hər sətrə bir element yazın"
                            className="min-h-[100px]"
                          />
                        </FormControl>
                      </FormItem>
                    )} />
                  </div>
                </section>

                {/* Happy Clients Card */}
                <section className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm space-y-4">
                  <h3 className="text-lg font-bold">Müştəri Məmnuniyyəti Kartı</h3>
                  <FormField control={form.control} name={`${activeTab}.whyChooseUs.happyClientsCard.percentage` as const} render={({ field }) => (
                    <FormItem><FormLabel>Faiz (Məs: 98%)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name={`${activeTab}.whyChooseUs.happyClientsCard.label` as const} render={({ field }) => (
                    <FormItem><FormLabel>Təsvir (Məs: Müştərilərimiz bizimlə qalır...)</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name={`${activeTab}.whyChooseUs.happyClientsCard.clientCount` as const} render={({ field }) => (
                    <FormItem><FormLabel>Müştəri Sayı (Məs: 62+)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                  )} />
                </section>

                {/* Support Card */}
                <section className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm space-y-4">
                  <h3 className="text-lg font-bold">Dəstək Kartı</h3>
                  <FormField control={form.control} name={`${activeTab}.whyChooseUs.supportCard.badge` as const} render={({ field }) => (
                    <FormItem><FormLabel>Nişan (Məs: 24/7)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name={`${activeTab}.whyChooseUs.supportCard.heading` as const} render={({ field }) => (
                    <FormItem><FormLabel>Başlıq (Məs: Həmişə Dəstək)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name={`${activeTab}.whyChooseUs.supportCard.description` as const} render={({ field }) => (
                    <FormItem><FormLabel>Təsvir</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
                  )} />
                </section>
              </div>

            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </form>
    </Form>
  )
}
