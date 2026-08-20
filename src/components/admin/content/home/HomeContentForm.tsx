"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { Save, Plus, Trash2, GripVertical, Info } from "lucide-react"

import azMessages from "@/i18n/messages/az.json"
import enMessages from "@/i18n/messages/en.json"
import ruMessages from "@/i18n/messages/ru.json"

import { Button } from "@/components/admin/ui/button"
import { AnimatedSaveButton } from "@/components/admin/ui/animated-save-button"
import { ModuleHeader } from "@/components/admin/layout/ModuleHeader"
import { Loader2 } from "lucide-react"
import { ImageUploadField } from "@/components/admin/ui/ImageUploadField"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/admin/ui/form"
import { Input } from "@/components/admin/ui/input"
import { Textarea } from "@/components/admin/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/admin/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/admin/ui/accordion"
import { Card, CardContent } from "@/components/admin/ui/card"
import { useToast } from "@/components/admin/ui/use-toast"

const slideSchema = z.object({
  id: z.string(),
  overline: z.string().min(1, "Vacib sahə"),
  headline: z.string().min(1, "Vacib sahə"),
  supporting: z.string().min(1, "Vacib sahə"),
  image: z.string().optional(),
})

const cardSchema = z.object({
  id: z.string(),
  icon: z.string(),
  title: z.string(),
  desc: z.string(),
  image: z.string().optional(),
})

const statSchema = z.object({
  id: z.string(),
  value: z.string(),
  label: z.string(),
})

const socialSchema = z.object({
  id: z.string(),
  platform: z.string(),
  url: z.string(),
})

const localeSchema = z.object({
  hero: z.object({
    slides: z.array(slideSchema),
    founderTitle: z.string(),
    letsTalk: z.string(),
    seePortfolio: z.string(),
    founderName: z.string(), // Mock
    founderImage: z.string().optional(), // Mock
  }),
  uniqueness: z.object({
    sectionTitle: z.string(),
    cards: z.array(cardSchema),
  }),
  aboutStats: z.object({
    title: z.string(),
    desc: z.string(),
    image: z.string().optional(),
    stats: z.array(statSchema),
    clientImages: z.array(z.string()).optional(), // Mock
  }),
  footer: z.object({
    stayConnected: z.string(),
    desc: z.string(),
    contactNow: z.string(),
    email: z.string().optional(),
    copyright: z.string(),
    socials: z.array(socialSchema),
  })
})

const formSchema = z.object({
  az: localeSchema,
  ru: localeSchema,
  en: localeSchema,
})

type FormValues = z.infer<typeof formSchema>

// Helper to convert JSON object map to array
const mapObjectToArray = (obj: Record<string, any>, keyMap: (key: string, val: any) => any) => {
  if (!obj) return []
  return Object.entries(obj).map(([key, val]) => keyMap(key, val))
}

const parseLocaleData = (data: any): z.infer<typeof localeSchema> => {
  return {
    hero: {
      slides: mapObjectToArray(data.Hero?.slides || {}, (key, val) => ({
        id: key,
        overline: val.overline || "",
        headline: val.headline || "",
        supporting: val.supporting || "",
      })),
      founderTitle: data.Hero?.founderTitle || "",
      letsTalk: data.Hero?.letsTalk || "",
      seePortfolio: data.Hero?.seePortfolio || "",
      founderName: "John Doe",
      founderImage: "",
    },
    uniqueness: {
      sectionTitle: data.Uniqueness?.sectionTitle || "",
      cards: mapObjectToArray(data.Uniqueness?.cards || {}, (key, val) => {
        // Map card keys to sensible default Lucide icon names
        const iconMap: Record<string, string> = {
          card1: "TrendingUp",
          card2: "Lightbulb",
          card3: "Handshake",
          card4: "Search",
        };
        return {
          id: key,
          icon: val.icon && val.icon !== "IconPlaceholder" ? val.icon : (iconMap[key] || "TrendingUp"),
          title: val.title || "",
          desc: val.desc || "",
        };
      }),
    },
    aboutStats: {
      title: data.AboutStats?.title || "",
      desc: data.AboutStats?.desc || "",
      stats: [
        { id: "stat1", value: "8+", label: data.AboutStats?.stats?.stat1 || "" },
        { id: "stat2", value: "250+", label: data.AboutStats?.stats?.stat2 || "" },
        { id: "stat3", value: "98%", label: data.AboutStats?.stats?.stat3 || "" },
        { id: "stat4", value: "100%", label: data.AboutStats?.stats?.stat4 || "" },
      ]
    },
    footer: {
      stayConnected: data.Footer?.stayConnected || "",
      desc: data.Footer?.desc || "",
      contactNow: data.Footer?.contactNow || "",
      email: "hello@the9thway.com",
      copyright: data.Footer?.copyright || "",
      socials: [
        { id: "instagram", platform: "Instagram", url: "https://instagram.com" },
        { id: "linkedin", platform: "LinkedIn", url: "https://linkedin.com" },
      ]
    }
  }
}

export function HomeContentForm() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = React.useState<"az" | "ru" | "en">("az")
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      az: parseLocaleData(azMessages),
      ru: parseLocaleData(ruMessages),
      en: parseLocaleData(enMessages),
    }
  })



  // Load real data from API
  React.useEffect(() => {
    let isMounted = true;
    const loadAllData = async () => {
      try {
        const locales = ["az", "ru", "en"] as const;
        const newData = {} as any;
        for (const loc of locales) {
          const [hero, uniq, stats, footer] = await Promise.all([
            fetch(`http://localhost:4000/api/home/hero?locale=${loc}`).then(r => r.json()),
            fetch(`http://localhost:4000/api/home/uniqueness?locale=${loc}`).then(r => r.json()),
            fetch(`http://localhost:4000/api/home/about-stats?locale=${loc}`).then(r => r.json()),
            fetch(`http://localhost:4000/api/home/footer?locale=${loc}`).then(r => r.json()),
          ]);
          newData[loc] = { hero, uniqueness: uniq, aboutStats: stats, footer };
        }
        if (isMounted) {
          form.reset(newData);
        }
      } catch (error) {
        if (isMounted) {
          toast({ title: "Xəta", description: "Məlumatları yükləmək mümkün olmadı. Backend API aktiv deyil.", variant: "destructive" } as any);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    loadAllData();
    return () => { isMounted = false; }
  }, [form, toast])

  // Watch for unsaved changes (isDirty)
  const { isDirty } = form.formState

  const onSubmit = async (data: FormValues) => {
    setIsSaving(true);
    try {
      const activeData = data[activeTab];
      const responses = await Promise.all([
        fetch(`http://localhost:4000/api/home/hero?locale=${activeTab}`, {
          method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(activeData.hero)
        }),
        fetch(`http://localhost:4000/api/home/uniqueness?locale=${activeTab}`, {
          method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(activeData.uniqueness)
        }),
        fetch(`http://localhost:4000/api/home/about-stats?locale=${activeTab}`, {
          method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(activeData.aboutStats)
        }),
        fetch(`http://localhost:4000/api/home/footer?locale=${activeTab}`, {
          method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(activeData.footer)
        }),
        fetch(`http://localhost:4000/api/home/footer/social-links`, {
          method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ socials: activeData.footer.socials })
        }),
      ]);
      
      // Validate all responses
      for (const res of responses) {
        if (!res.ok) {
          throw new Error(`API returned ${res.status} for ${res.url}`);
        }
      }
      
      form.reset(data); // Clear isDirty
      toast({ title: "Uğurlu", description: "Dəyişikliklər API-yə yadda saxlanıldı." });
    } catch(error) {
       console.error("Save failed:", error)
       toast({ title: "Xəta", description: "Dəyişiklikləri yadda saxlamaq mümkün olmadı. API əlaqəsini yoxlayın.", variant: "destructive" } as any);
       throw error;
    } finally {
       setIsSaving(false);
    }
  }

  const handleSave = async () => {
    let validationPassed = false;
    
    try {
      await form.handleSubmit(
        async (data) => {
          validationPassed = true;
          await onSubmit(data);
        },
        (errors) => {
          console.error("Form validation failed:", errors);
          toast({ 
            title: "Validasiya xətası", 
            description: "Bəzi sahələr düzgün doldurulmayıb. Zəhmət olmasa yoxlayın.", 
            variant: "destructive" 
          } as any);
          throw new Error("Form validation failed");
        }
      )();
    } catch (error) {
      // Re-throw so AnimatedSaveButton sees the error
      throw error;
    }
  }

  // Field arrays for dynamic lists
  const heroSlides = useFieldArray({
    control: form.control,
    name: `${activeTab}.hero.slides` as const,
  })

  const footerSocials = useFieldArray({
    control: form.control,
    name: `${activeTab}.footer.socials` as const,
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-24">
        
        {/* Sticky Header Actions */}
        <ModuleHeader 
          title="Ana Səhifə Məzmunu"
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

        <Accordion type="multiple" defaultValue={["hero"]} className="space-y-10">
          
          {/* 1. HEADER (HERO) */}
          <AccordionItem value="hero" className="rounded-xl border border-[var(--border)] px-6 bg-[var(--card)] even:bg-[var(--muted)]/5">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              Header (Hero) Bölməsi
            </AccordionTrigger>
            <AccordionContent className="space-y-8 pt-4">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Slaydlar</h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => heroSlides.append({ id: Date.now().toString(), overline: "", headline: "", supporting: "" })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Slayd Əlavə Et
                  </Button>
                </div>
                
                {heroSlides.fields.map((field, index) => (
                  <Card key={field.id} className="relative bg-white shadow-sm border-[var(--border)]">
                    <CardContent className="space-y-4 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-5 w-5 cursor-move text-[var(--muted-foreground)]" />
                          <span className="font-semibold">Slayd {index + 1}</span>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="text-[var(--destructive)] hover:bg-[var(--destructive)]/10 hover:text-[var(--destructive)]"
                          onClick={() => heroSlides.remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name={`${activeTab}.hero.slides.${index}.overline` as const}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Üst Başlıq (Overline)</FormLabel>
                              <FormControl>
                                <Input placeholder="Məs: Marketinq Agentliyi" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`${activeTab}.hero.slides.${index}.headline` as const}
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Əsas Başlıq (Headline)</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Məs: Brendinizi Növbəti Səviyyəyə Qaldırırıq." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`${activeTab}.hero.slides.${index}.supporting` as const}
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Köməkçi Mətn (Description)</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Əlavə məlumat..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid gap-6 rounded-md bg-[var(--muted)]/50 p-4 md:grid-cols-2">
                <h3 className="col-span-full text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Statik Elementlər</h3>
                
                <FormField
                  control={form.control}
                  name={`${activeTab}.hero.founderName`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Təsisçi Adı</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`${activeTab}.hero.founderImage`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Təsisçi Şəkli</FormLabel>
                      <FormControl>
                        <ImageUploadField 
                          value={field.value} 
                          onChange={field.onChange} 
                          onClear={() => field.onChange("")}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`${activeTab}.hero.founderTitle`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Təsisçi Vəzifəsi</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`${activeTab}.hero.letsTalk`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>"Danışaq" Linki (Let's Talk)</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`${activeTab}.hero.seePortfolio`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Böyük Düymə Mətni (See Portfolio)</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 2. UNIQUENESS */}
          <AccordionItem value="uniqueness" className="rounded-xl border border-[var(--border)] px-6 bg-[var(--card)] even:bg-[var(--muted)]/5">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              Xüsusiyyətlər (Uniqueness) Bölməsi
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              <FormField
                control={form.control}
                name={`${activeTab}.uniqueness.sectionTitle`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bölmə Başlığı</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                  </FormItem>
                )}
              />
              
              <div className="grid gap-4 md:grid-cols-2">
                {(form.watch(`${activeTab}.uniqueness.cards`) || []).map((_, index) => (
                  <Card key={index}>
                    <CardContent className="space-y-4 p-4">
                      <span className="text-sm font-semibold text-[var(--muted-foreground)]">Kart {index + 1}</span>
                      <FormField
                        control={form.control}
                        name={`${activeTab}.uniqueness.cards.${index}.title` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Başlıq</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`${activeTab}.uniqueness.cards.${index}.desc` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Təsvir</FormLabel>
                            <FormControl><Textarea className="min-h-[60px]" {...field} /></FormControl>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 3. ABOUT STATS */}
          <AccordionItem value="about" className="rounded-xl border border-[var(--border)] px-6 bg-[var(--card)] even:bg-[var(--muted)]/5">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              Haqqımızda və Statistikalar (About Stats)
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              <FormField
                control={form.control}
                name={`${activeTab}.aboutStats.title`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Əsas Başlıq</FormLabel>
                    <FormControl><Textarea {...field} /></FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`${activeTab}.aboutStats.desc`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alt Mətn</FormLabel>
                    <FormControl><Textarea {...field} /></FormControl>
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {(form.watch(`${activeTab}.aboutStats.stats`) || []).map((_, index) => (
                  <Card key={index}>
                    <CardContent className="space-y-4 p-4">
                      <span className="text-sm font-semibold text-[var(--muted-foreground)]">Statistika {index + 1}</span>
                      <FormField
                        control={form.control}
                        name={`${activeTab}.aboutStats.stats.${index}.value` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dəyər (Rəqəm)</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormDescription>Məs: 8+, 98%</FormDescription>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`${activeTab}.aboutStats.stats.${index}.label` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Başlıq</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 4. FOOTER */}
          <AccordionItem value="footer" className="rounded-xl border border-[var(--border)] px-6 bg-[var(--card)] even:bg-[var(--muted)]/5">
            <AccordionTrigger className="hover:no-underline py-6">
              Aşağı Hissə (Footer)
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <div className="flex items-center gap-2 rounded-md bg-blue-500/10 p-4 text-blue-500">
                <Info className="h-5 w-5 shrink-0" />
                <p className="text-sm">
                  Naviqasiya linkləri (Home, Services, Blogs) <a href="/admin/navigation" className="font-semibold underline">Naviqasiya</a> modulundan idarə olunur. THE9THWAY loqosu isə Brendinq modulundan idarə edilir.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name={`${activeTab}.footer.stayConnected`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Başlıq (Stay Connected)</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`${activeTab}.footer.contactNow`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Düymə Mətni (Contact Now)</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`${activeTab}.footer.email`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Əlaqə E-poçtu</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`${activeTab}.footer.desc`}
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Açıqlama Mətni</FormLabel>
                      <FormControl><Textarea {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`${activeTab}.footer.copyright`}
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Müəllif Hüquqları Mətni (Copyright)</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormDescription>İl dinamik olaraq koda daxil edilə bilər (məsələn: Copyright © The9thway Agency 2026)</FormDescription>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Sosial Şəbəkələr</h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => footerSocials.append({ id: Date.now().toString(), platform: "", url: "" })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Link Əlavə Et
                  </Button>
                </div>
                
                {footerSocials.fields.map((field, index) => (
                  <div key={field.id} className="flex items-end gap-4 rounded-md border border-[var(--border)] p-4">
                    <FormField
                      control={form.control}
                      name={`${activeTab}.footer.socials.${index}.platform` as const}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Platforma (məs: Instagram)</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`${activeTab}.footer.socials.${index}.url` as const}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Link URL</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="mb-0.5 shrink-0 text-[var(--destructive)]"
                      onClick={() => footerSocials.remove(index)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          
        </Accordion>
      </form>
    </Form>
  )
}
