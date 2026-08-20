"use client";

import React, { useState, useEffect } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { useToast } from "@/components/admin/ui/use-toast";
import { Plus, GripVertical, Pencil, Trash2, X, Save } from "lucide-react";
import { cn, slugify } from "@/lib/utils";
import { fetchBlogCategories, saveBlogCategories } from "@/lib/api";

type Category = {
  id?: string;
  name: string;
  slug: string;
  order: number;
};

// Sortable Category Item Component
const SortableCategoryItem = ({ 
  category, 
  onEdit, 
  onDelete 
}: { 
  category: Category; 
  onEdit: (c: Category) => void; 
  onDelete: (order: number) => void; 
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category.order.toString() });
  
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
        "bg-white shadow-sm border border-[var(--border)] rounded-xl p-3 flex items-center justify-between gap-4 group transition-shadow",
        isDragging && "shadow-xl scale-[1.02] border-[var(--primary)] bg-white"
      )}
    >
      <div className="flex items-center gap-3 flex-1">
        <button className="cursor-grab p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]" {...attributes} {...listeners}>
          <GripVertical size={16} />
        </button>
        <div>
          <p className="font-semibold text-sm">{category.name}</p>
          <p className="text-xs text-[var(--muted-foreground)]">/{category.slug}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(category)}>
          <Pencil size={14} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => onDelete(category.order)}>
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
};

export default function CategoryManager({ 
  locale, 
  onClose,
  onRefresh 
}: { 
  locale: string; 
  onClose: () => void;
  onRefresh?: () => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    loadCategories();
  }, [locale]);

  // Generate slug dynamically from name
  useEffect(() => {
    if (!editingCategory) {
      setSlug(slugify(name));
    }
  }, [name, editingCategory]);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await fetchBlogCategories(locale);
      setCategories(data || []);
    } catch (err) {
      toast({
        title: "Xəta",
        description: "Kateqoriyaları yükləyərkən xəta baş verdi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setCategories((items) => {
      const oldIndex = items.findIndex((item) => item.order.toString() === active.id);
      const newIndex = items.findIndex((item) => item.order.toString() === over.id);
      const reordered = arrayMove(items, oldIndex, newIndex);
      
      // Update order field sequentially based on new index
      return reordered.map((item, idx) => ({ ...item, order: idx + 1 }));
    });
  };

  const handleAddOrEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    if (editingCategory) {
      // Update existing local state item
      setCategories((prev) =>
        prev.map((c) =>
          c.order === editingCategory.order
            ? { ...c, name: name.trim(), slug: slug.trim() }
            : c
        )
      );
      setEditingCategory(null);
    } else {
      // Create new locally
      const newCat: Category = {
        name: name.trim(),
        slug: slug.trim(),
        order: categories.length + 1,
      };
      setCategories((prev) => [...prev, newCat]);
    }
    
    // Reset Form
    setName("");
    setSlug("");
  };

  const handleSelectEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
  };

  const handleDeleteLocal = (order: number) => {
    // Delete item and shift remaining orders
    setCategories((prev) =>
      prev
        .filter((c) => c.order !== order)
        .map((c, idx) => ({ ...c, order: idx + 1 }))
    );
    if (editingCategory?.order === order) {
      setEditingCategory(null);
      setName("");
      setSlug("");
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
  };

  const handleSaveToDatabase = async () => {
    setIsSaving(true);
    try {
      await saveBlogCategories(locale, categories);
      toast({
        title: "Uğurlu",
        description: "Kateqoriyalar yadda saxlanıldı.",
      });
      if (onRefresh) onRefresh();
      onClose();
    } catch (err: any) {
      toast({
        title: "Xəta",
        description: err.message || "Kateqoriyaları yadda saxlayarkən xəta baş verdi.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-[var(--border)] p-6 w-full max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <div>
          <h3 className="font-display font-bold text-lg text-black">Kateqoriya Redaktoru</h3>
          <p className="text-xs text-[var(--muted-foreground)]">Dil: {locale.toUpperCase()}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X size={18} />
        </Button>
      </div>

      {/* Categories Add/Edit Form */}
      <form onSubmit={handleAddOrEdit} className="bg-gray-50 border p-4 rounded-xl mb-6 flex flex-col gap-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
          {editingCategory ? "Kateqoriyanı Dəyiş" : "Yeni Kateqoriya"}
        </h4>
        <div>
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Kateqoriya adı (məs. SEO)" 
            className="h-10 text-sm"
          />
        </div>
        <div>
          <Input 
            value={slug} 
            onChange={(e) => setSlug(e.target.value)} 
            placeholder="Slaq / Slug (məs. seo)" 
            className="h-10 text-sm"
            disabled={!!editingCategory} // lock slug on edit
          />
        </div>
        <div className="flex justify-end gap-2">
          {editingCategory && (
            <Button type="button" variant="outline" size="sm" onClick={handleCancelEdit}>
              İmtina
            </Button>
          )}
          <Button type="submit" size="sm" className="bg-black hover:bg-neutral-800 text-white font-semibold">
            {editingCategory ? "Yenilə" : <><Plus size={16} className="mr-1" /> Əlavə et</>}
          </Button>
        </div>
      </form>

      {/* Draggable Category List */}
      <div className="flex-1 overflow-y-auto min-h-0 mb-6 flex flex-col gap-2">
        {isLoading ? (
          <div className="text-center py-6 text-sm text-[var(--muted-foreground)]">Yüklənir...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-6 text-sm text-[var(--muted-foreground)] border-2 border-dashed border-gray-200 rounded-xl">
            Kateqoriya yoxdur
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={categories.map((c) => c.order.toString())} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {categories.map((cat) => (
                  <SortableCategoryItem 
                    key={cat.order} 
                    category={cat} 
                    onEdit={handleSelectEdit}
                    onDelete={handleDeleteLocal}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Action Footer */}
      <div className="border-t pt-4 mt-auto flex items-center justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={isSaving}>Ləğv et</Button>
        <Button 
          onClick={handleSaveToDatabase} 
          disabled={isSaving || isLoading}
          className="bg-[var(--primary)] text-black hover:bg-[var(--primary)]/90 font-bold"
        >
          <Save size={16} className="mr-2" />
          {isSaving ? "Yadda saxlanılır..." : "Yadda Saxla"}
        </Button>
      </div>
    </div>
  );
}
