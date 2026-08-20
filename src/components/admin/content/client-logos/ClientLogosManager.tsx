"use client";

import React, { useState, useEffect } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Switch } from "@/components/admin/ui/switch";
import { useToast } from "@/components/admin/ui/use-toast";
import { Plus, GripVertical, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/admin/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/admin/ui/alert-dialog";
import { Label } from "@/components/admin/ui/label";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { AnimatedSaveButton } from "@/components/admin/ui/animated-save-button";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModuleHeader } from "@/components/admin/layout/ModuleHeader";
import { ImageUploadField } from "@/components/admin/ui/ImageUploadField";

type Logo = {
  id: string;
  name: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
};

// Sortable Item Component
const SortableLogoItem = ({ logo, onEdit, onDelete, onToggle }: { logo: Logo, onEdit: (l: Logo) => void, onDelete: (id: string) => void, onToggle: (id: string, active: boolean) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: logo.id });
  
  const style = { 
    transform: CSS.Transform.toString(transform), 
    transition,
    ...(isDragging ? { zIndex: 50 } : {})
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "bg-white shadow-sm border border-[var(--border)] rounded-xl p-4 flex items-center justify-between gap-4 group transition-shadow",
        isDragging && "shadow-xl scale-[1.02] rotate-1 border-[var(--primary)] bg-white"
      )}
    >
      <div className="flex items-center gap-4 flex-1">
        <button className="cursor-grab p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]" {...attributes} {...listeners}>
          <GripVertical size={20} />
        </button>
        <div className="relative w-24 h-12 bg-[#0B0B0C] rounded flex items-center justify-center p-2 border overflow-hidden">
          <img src={logo.imageUrl} alt={logo.name} className="max-h-full max-w-full object-contain filter grayscale invert" />
        </div>
        <div>
          <p className="font-medium text-sm">{logo.name}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Switch checked={logo.isActive} onCheckedChange={(c) => onToggle(logo.id, c)} />
        <Button variant="ghost" size="icon" onClick={() => onEdit(logo)}><Pencil size={16} /></Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
              <Trash2 size={16} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bu loqonu silmək istədiyinizə əminsiniz?</AlertDialogTitle>
              <AlertDialogDescription>Bu əməliyyat geri qaytarıla bilməz.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Ləğv et</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(logo.id)} className="bg-red-500 hover:bg-red-600">Sil</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default function ClientLogosManager() {
  const [logos, setLogos] = useState<Logo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLogo, setEditingLogo] = useState<Logo | null>(null);
  const [formData, setFormData] = useState({ name: "", imageUrl: "" });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchLogos = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/client-logos");
      const data = await res.json();
      setLogos(data);
    } catch (error) {
      toast({ title: "Xəta", description: "Loqolar yüklənmədi", variant: "destructive" } as any);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogos();
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = logos.findIndex((item) => item.id === active.id);
      const newIndex = logos.findIndex((item) => item.id === over?.id);
      const newLogos = arrayMove(logos, oldIndex, newIndex);
      
      setLogos(newLogos);

      try {
        const orderPayload = newLogos.map((l, i) => ({ id: l.id, order: i + 1 }));
        const res = await fetch("http://localhost:4000/api/client-logos/reorder", {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orders: orderPayload })
        });
        if (!res.ok) throw new Error("API xətası");
        toast({ title: "Sıra yeniləndi", variant: "success" } as any);
      } catch (error) {
        toast({ title: "Xəta", description: "Sıra saxlanıla bilmədi", variant: "destructive" } as any);
        fetchLogos();
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (editingLogo) {
        const res = await fetch(`http://localhost:4000/api/client-logos/${editingLogo.id}`, {
          method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error("API xətası");
        toast({ title: "Loqo yeniləndi", variant: "success" } as any);
      } else {
        const res = await fetch("http://localhost:4000/api/client-logos", {
          method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error("API xətası");
        toast({ title: "Loqo əlavə edildi", variant: "success" } as any);
      }
      setIsDialogOpen(false);
      fetchLogos();
    } catch (error) {
      toast({ title: "Xəta", variant: "destructive" } as any);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/client-logos/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("API xətası");
      toast({ title: "Loqo silindi" } as any);
      setLogos(logos.filter(l => l.id !== id));
    } catch (error) {
      toast({ title: "Xəta", variant: "destructive" } as any);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      setLogos(logos.map(l => l.id === id ? { ...l, isActive } : l));
      const res = await fetch(`http://localhost:4000/api/client-logos/${id}`, {
        method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive })
      });
      if (!res.ok) throw new Error("API xətası");
    } catch (error) {
      toast({ title: "Xəta", variant: "destructive" } as any);
      fetchLogos();
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('http://localhost:4000/api/upload', { method: 'POST', credentials: 'include', body: fd });
      const data = await res.json();
      if (data.url) setFormData({ ...formData, imageUrl: data.url });
    } catch (error) {
      toast({ title: "Şəkil yüklənə bilmədi", variant: "destructive" } as any);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-sm text-[var(--muted-foreground)]">Yüklənir...</div>;

  return (
    <div className="flex flex-col gap-12 pb-12">
      <ModuleHeader 
        title="Müştəri Loqoları"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) { setEditingLogo(null); setFormData({ name: "", imageUrl: "" }); }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus size={16} /> Loqo Əlavə Et</Button>
            </DialogTrigger>
            <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingLogo ? "Loqonu Redaktə Et" : "Yeni Loqo"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Şirkət Adı</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Firma adı" />
              </div>
              <div className="space-y-2">
                <Label>Loqo (Şəkil)</Label>
                <ImageUploadField 
                  value={formData.imageUrl} 
                  onChange={(url) => setFormData({ ...formData, imageUrl: url })} 
                  onClear={() => setFormData({ ...formData, imageUrl: "" })}
                />
              </div>
            </div>
            <DialogFooter>
              <AnimatedSaveButton 
                onSave={handleSave} 
                disabled={!formData.name || !formData.imageUrl}
              />
            </DialogFooter>
          </DialogContent>
        </Dialog>
      } />

      <div className="bg-[var(--paper)] p-4 sm:p-6 rounded-2xl border border-[var(--border)]">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={logos} strategy={rectSortingStrategy}>
            <div className="space-y-2 p-3">
              {logos.length === 0 ? (
                <EmptyState 
                  icon={ImageIcon}
                  title="Loqo tapılmadı"
                  description="Hələ heç bir müştəri loqosu əlavə edilməyib. Əlavə etmək üçün yuxarıdakı düymədən istifadə edin."
                  actionLabel="İlk loqonu əlavə et"
                  onAction={() => setIsDialogOpen(true)}
                />
              ) : (
                logos.map((logo) => (
                  <SortableLogoItem
                    key={logo.id}
                    logo={logo}
                    onEdit={(l) => { setEditingLogo(l); setFormData({ name: l.name, imageUrl: l.imageUrl }); setIsDialogOpen(true); }}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
