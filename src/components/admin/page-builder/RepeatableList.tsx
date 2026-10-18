"use client";

import React, { useState } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, Copy, GripVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { newId } from "@/lib/page-builder/registry";

// Sortable list of sub-items inside a block (cards, gallery images, FAQ entries).

interface RepeatableListProps<T extends { id: string }> {
  items: T[];
  onChange: (items: T[]) => void;
  createItem: () => T;
  itemTitle: (item: T, index: number) => string;
  renderItem: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode;
  addLabel: string;
  max?: number;
}

function SortableRow({
  id,
  title,
  open,
  onToggle,
  onDuplicate,
  onRemove,
  children,
}: {
  id: string;
  title: string;
  open: boolean;
  onToggle: () => void;
  onDuplicate?: () => void;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("rounded-lg border border-[var(--border)] bg-white", isDragging && "relative z-10 shadow-lg opacity-90")}
    >
      <div className="flex items-center gap-2 px-2 py-2">
        <button type="button" className="cursor-grab text-gray-400 hover:text-gray-700 p-1" {...attributes} {...listeners} aria-label="Sürüklə">
          <GripVertical size={14} />
        </button>
        <button type="button" onClick={onToggle} className="flex-1 flex items-center gap-2 text-left text-sm font-medium truncate">
          <ChevronDown size={14} className={cn("transition-transform shrink-0", !open && "-rotate-90")} />
          <span className="truncate">{title}</span>
        </button>
        {onDuplicate && (
          <button type="button" onClick={onDuplicate} className="p-1 text-gray-400 hover:text-gray-700" title="Kopyala">
            <Copy size={13} />
          </button>
        )}
        <button type="button" onClick={onRemove} className="p-1 text-gray-400 hover:text-red-600" title="Sil">
          <Trash2 size={13} />
        </button>
      </div>
      {open && <div className="border-t border-[var(--border)] p-3 space-y-3">{children}</div>}
    </div>
  );
}

export function RepeatableList<T extends { id: string }>({
  items,
  onChange,
  createItem,
  itemTitle,
  renderItem,
  addLabel,
  max = 24,
}: RepeatableListProps<T>) {
  const [openId, setOpenId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.id === active.id);
    const to = items.findIndex((i) => i.id === over.id);
    onChange(arrayMove(items, from, to));
  };

  return (
    <div className="space-y-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item, index) => (
            <SortableRow
              key={item.id}
              id={item.id}
              title={itemTitle(item, index)}
              open={openId === item.id}
              onToggle={() => setOpenId(openId === item.id ? null : item.id)}
              onDuplicate={
                items.length < max
                  ? () => {
                      const copy = { ...JSON.parse(JSON.stringify(item)), id: newId() } as T;
                      const next = [...items];
                      next.splice(index + 1, 0, copy);
                      onChange(next);
                    }
                  : undefined
              }
              onRemove={() => onChange(items.filter((i) => i.id !== item.id))}
            >
              {renderItem(item, (patch) => onChange(items.map((i) => (i.id === item.id ? { ...i, ...patch } : i))))}
            </SortableRow>
          ))}
        </SortableContext>
      </DndContext>
      {items.length < max && (
        <button
          type="button"
          onClick={() => {
            const item = createItem();
            onChange([...items, item]);
            setOpenId(item.id);
          }}
          className="w-full rounded-lg border border-dashed border-[var(--border)] py-2 text-xs font-semibold text-gray-600 hover:bg-white hover:border-[var(--primary)]"
        >
          + {addLabel}
        </button>
      )}
    </div>
  );
}
