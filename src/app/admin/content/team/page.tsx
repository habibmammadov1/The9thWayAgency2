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
import { Switch } from "@/components/admin/ui/switch";
import { 
  fetchTeamIntro, 
  updateTeamIntro, 
  fetchTeamTeaser, 
  updateTeamTeaser, 
  fetchTeamMembers, 
  updateTeamMembers 
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { GripVertical, Plus, Trash2, Save, Loader2, Users, Eye, EyeOff } from "lucide-react";

// Form Validation Schema
const teamFormSchema = z.object({
  intro: z.object({
    pillLabel: z.string().min(1, "Sahə boş ola bilməz"),
    heading: z.string().min(1, "Sahə boş ola bilməz"),
    paragraph: z.string().min(1, "Sahə boş ola bilməz"),
  }),
  teasers: z.object({
    home: z.object({
      heading: z.string().min(1, "Sahə boş ola bilməz"),
      viewAllLabel: z.string().min(1, "Sahə boş ola bilməz"),
      displayCount: z.number().int().min(1),
    }),
    about: z.object({
      heading: z.string().min(1, "Sahə boş ola bilməz"),
      viewAllLabel: z.string().min(1, "Sahə boş ola bilməz"),
      displayCount: z.number().int().min(1),
    }),
  }),
  members: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Ad boş ola bilməz"),
    role: z.string().min(1, "Vəzifə boş ola bilməz"),
    department: z.string().nullable().optional(),
    photoUrl: z.string().nullable().optional(),
    linkedinUrl: z.string().nullable().optional(),
    instagramUrl: z.string().nullable().optional(),
    isActive: z.boolean().default(true),
    order: z.number(),
  })),
});

type TeamFormValues = z.infer<typeof teamFormSchema>;

// Draggable Team Member Item
function SortableTeamMemberItem({ id, index, control, register, watch, setValue, remove }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, ...(isDragging ? { zIndex: 50 } : {}) };

  const isActive = watch(`members.${index}.isActive`);

  return (
    <div ref={setNodeRef} style={style} className={cn(
      "bg-white border rounded-2xl p-4 md:p-6 flex gap-4 items-start shadow-sm mb-4 transition-opacity",
      !isActive && "opacity-60 bg-neutral-50/50"
    )}>
      <button type="button" className="cursor-grab p-1 text-gray-400 mt-2" {...attributes} {...listeners}>
        <GripVertical size={18} />
      </button>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1">
        <div className="md:col-span-3">
          <Label className="text-xs font-semibold text-neutral-500 block mb-1">Komanda Üzvü Şəkli</Label>
          <ImageUploadField
            value={watch(`members.${index}.photoUrl`) || ""}
            onChange={(url) => setValue(`members.${index}.photoUrl`, url)}
          />
        </div>

        <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name={`members.${index}.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-neutral-500">Ad, Soyad</FormLabel>
                <FormControl>
                  <Input placeholder="Məs. Elvin Mammadov" {...field} className="h-10" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`members.${index}.role`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-neutral-500">Vəzifə / İxtisas</FormLabel>
                <FormControl>
                  <Input placeholder="Məs. Founder & Creative Director" {...field} className="h-10" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`members.${index}.department`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-neutral-500">Şöbə (Opsional filter üçün)</FormLabel>
                <FormControl>
                  <Input placeholder="Məs. Marketinq, Dizayn, Strategiya" {...field} value={field.value || ""} className="h-10" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-end pb-2 gap-6">
            <FormField
              control={control}
              name={`members.${index}.isActive`}
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-[var(--primary)]"
                    />
                  </FormControl>
                  <FormLabel className="text-xs font-bold text-black flex items-center gap-1 cursor-pointer">
                    {field.value ? (
                      <>
                        <Eye size={14} className="text-[#8B6C3E]" /> Aktiv
                      </>
                    ) : (
                      <>
                        <EyeOff size={14} className="text-neutral-400" /> Aktiv deyil
                      </>
                    )}
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name={`members.${index}.linkedinUrl`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-neutral-500">LinkedIn URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://linkedin.com/..." {...field} value={field.value || ""} className="h-10" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`members.${index}.instagramUrl`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-neutral-500">Instagram URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://instagram.com/..." {...field} value={field.value || ""} className="h-10" />
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
        className="text-red-500 hover:text-red-600 hover:bg-red-50 mt-8"
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
}

export default function TeamAdminPage() {
  const { toast } = useToast();
  const [locale, setLocale] = useState("az");
  const [activeTeaserTab, setActiveTeaserTab] = useState("home");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<any>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      intro: { pillLabel: "", heading: "", paragraph: "" },
      teasers: {
        home: { heading: "", viewAllLabel: "", displayCount: 4 },
        about: { heading: "", viewAllLabel: "", displayCount: 4 },
      },
      members: [],
    },
  });

  const { fields: memberFields, append: appendMember, remove: removeMember, move: moveMember } = useFieldArray({
    control: form.control,
    name: "members",
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
    try {
      const [intro, teaserHome, teaserAbout, members] = await Promise.all([
        fetchTeamIntro(locale),
        fetchTeamTeaser(locale, "home"),
        fetchTeamTeaser(locale, "about"),
        fetchTeamMembers(locale, undefined, true), // fetch all (both active/inactive)
      ]);

      form.reset({
        intro: intro || { pillLabel: "Komandamız", heading: "", paragraph: "" },
        teasers: {
          home: teaserHome || { heading: "", viewAllLabel: "View All Team", displayCount: 4 },
          about: teaserAbout || { heading: "", viewAllLabel: "View All Team", displayCount: 4 },
        },
        members: members || [],
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

  const handleMemberDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = memberFields.findIndex((m) => m.id === active.id);
    const newIndex = memberFields.findIndex((m) => m.id === over.id);

    moveMember(oldIndex, newIndex);

    // Auto-update order indexes
    const updatedMembers = form.getValues("members");
    updatedMembers.forEach((_: any, idx: number) => {
      form.setValue(`members.${idx}.order`, idx + 1);
    });
  };

  const handleFormSubmit = async (values: TeamFormValues) => {
    setIsSaving(true);
    try {
      await Promise.all([
        updateTeamIntro(locale, values.intro),
        updateTeamTeaser(locale, "home", values.teasers.home),
        updateTeamTeaser(locale, "about", values.teasers.about),
        updateTeamMembers(locale, values.members),
      ]);

      toast({
        title: "Uğurlu",
        description: "Komanda məlumatları yadda saxlanıldı.",
      });
      loadAllData(); // Reload list structure
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
            <Users className="text-[var(--primary)]" />
            Komanda İdarəetməsi
          </h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Komanda üzvlərini, fərdi /team səhifəsinin başlıqlarını və Home/About bölmələrindəki teaser limitlərini idarə edin.
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
          <p className="text-sm text-[var(--muted-foreground)]">Komanda məlumatları yüklənir...</p>
        </div>
      ) : (
        <Form {...(form as any)}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8 max-w-5xl">
            
            <Accordion type="single" collapsible defaultValue="teaser" className="w-full space-y-4">
              
              {/* PANEL 1: TEAM PAGE INTRO */}
              <AccordionItem value="intro" className="border rounded-2xl bg-white shadow-sm overflow-hidden px-1">
                <AccordionTrigger className="px-6 py-4 font-bold text-black hover:no-underline text-base md:text-lg">
                  1. Komanda Səhifəsi Başlığı (Team Intro)
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control as any}
                      name="intro.pillLabel"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="font-semibold text-black">Pill Etiketi (Pill Label)</FormLabel>
                          <FormControl>
                            <Input placeholder="Məs. Komandamız" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as any}
                      name="intro.heading"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="font-semibold text-black">Başlıq (Heading)</FormLabel>
                          <FormControl>
                            <Input placeholder="The9thway-nı İrəli Aparan İnsanlarla Tanış Olun..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as any}
                      name="intro.paragraph"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="font-semibold text-black">Açıqlama Mətni (Paragraph)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Açıqlama mətni bura daxil edin..." {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* PANEL 2: TEASER SETTINGS */}
              <AccordionItem value="teaser" className="border rounded-2xl bg-white shadow-sm overflow-hidden px-1">
                <AccordionTrigger className="px-6 py-4 font-bold text-black hover:no-underline text-base md:text-lg">
                  2. Teaser Ayarları (Home / About)
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2 space-y-6">
                  <Tabs value={activeTeaserTab} onValueChange={setActiveTeaserTab} className="w-full">
                    <TabsList className="bg-neutral-50 p-1 border rounded-lg flex w-fit mb-6">
                      <TabsTrigger value="home" className="px-4 py-1.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-black rounded-md">
                        Ana Səhifə Teaseri
                      </TabsTrigger>
                      <TabsTrigger value="about" className="px-4 py-1.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-black rounded-md">
                        Haqqımızda Səhifəsi Teaseri
                      </TabsTrigger>
                    </TabsList>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-2xl bg-neutral-50/50">
                      <FormField
                        control={form.control as any}
                        name={`teasers.${activeTeaserTab}.heading`}
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="font-semibold text-black">Teaser Başlığı</FormLabel>
                            <FormControl>
                              <Input placeholder="Məs. Yaradıcı Komandamızla Tanış Olun" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control as any}
                        name={`teasers.${activeTeaserTab}.viewAllLabel`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold text-black">"View All" Düymə Etiketi</FormLabel>
                            <FormControl>
                              <Input placeholder="Məs. View All Team" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control as any}
                        name={`teasers.${activeTeaserTab}.displayCount`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold text-black">Teaser Kart Sayı (Display Count)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 4)} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Tabs>
                </AccordionContent>
              </AccordionItem>

              {/* PANEL 3: TEAM MEMBERS */}
              <AccordionItem value="members" className="border rounded-2xl bg-white shadow-sm overflow-hidden px-1">
                <AccordionTrigger className="px-6 py-4 font-bold text-black hover:no-underline text-base md:text-lg">
                  3. Komanda Üzvləri (Team Members List)
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2 space-y-6">
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-black text-sm">Üzvlər siyahısı</h4>
                      <p className="text-xs text-[var(--muted-foreground)]">Sıralamanı sürüşdürərək tənzimləyə bilərsiniz.</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendMember({ name: "", role: "", department: "", photoUrl: "", linkedinUrl: "", instagramUrl: "", isActive: true, order: memberFields.length + 1 })}
                    >
                      <Plus size={14} className="mr-1" /> Üzv Əlavə et
                    </Button>
                  </div>

                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleMemberDragEnd}>
                    <SortableContext items={memberFields.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                      <div className="flex flex-col">
                        {memberFields.map((member, idx) => (
                          <SortableTeamMemberItem
                            key={member.id}
                            id={member.id}
                            index={idx}
                            control={form.control}
                            register={form.register}
                            watch={form.watch}
                            setValue={form.setValue}
                            remove={removeMember}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>

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
