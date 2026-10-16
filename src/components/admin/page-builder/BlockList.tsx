"use client";

import React from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, Copy, Eye, EyeOff, GripVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BLOCK_DEFINITIONS, cloneBlocks } from "@/lib/page-builder/registry";
import type { BlockProps, BlockSettings, BlockType, PageBlock } from "@/lib/page-builder/types";
import { BlockEditor } from "./editors";
import { CommonSettingsFields } from "./CommonSettingsFields";

function blockSummary(block: PageBlock): string {
  const p = block.props as unknown as Record<string, unknown>;
  const text = (p.heading as string) || (p.title as string) || "";
  if (text) return text;
  if (block.type === "richText") return String(p.html ?? "").replace(/<[^>]+>/g, " ").trim().slice(0, 60);
  return "";
}

function SortableBlock({
  block,
  open,
  onToggle,
  onChange,
  onDuplicate,
  onRemove,
}: {
  block: PageBlock;
  open: boolean;
  onToggle: () => void;
  onChange: (block: PageBlock) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const def = BLOCK_DEFINITIONS[block.type];
  const summary = blockSummary(block);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "rounded-xl border bg-white shadow-sm",
        open ? "border-[var(--primary)]" : "border-[var(--border)]",
        isDragging && "relative z-20 shadow-xl opacity-90",
        !block.isVisible && "opacity-60",
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button type="button" className="cursor-grab p-1 text-gray-400 hover:text-gray-700" {...attributes} {...listeners} aria-label="Sürüklə">
          <GripVertical size={16} />
        </button>
        <button type="button" onClick={onToggle} className="flex-1 min-w-0 flex items-center gap-2 text-left">
          <ChevronDown size={16} className={cn("shrink-0 transition-transform", !open && "-rotate-90")} />
          <span className="text-sm font-bold shrink-0">{def?.label ?? block.type}</span>
          {summary && <span className="text-xs text-[var(--muted-foreground)] truncate">· {summary}</span>}
          {!block.isVisible && <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 rounded px-1.5 py-0.5 shrink-0">gizli</span>}
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...block, isVisible: !block.isVisible })}
          className="p-1.5 rounded text-gray-500 hover:bg-gray-100"
          title={block.isVisible ? "Gizlət" : "Göstər"}
        >
          {block.isVisible ? <Eye size={15} /> : <EyeOff size={15} />}
        </button>
        <button type="button" onClick={onDuplicate} className="p-1.5 rounded text-gray-500 hover:bg-gray-100" title="Kopyala">
          <Copy size={15} />
        </button>
        <button type="button" onClick={onRemove} className="p-1.5 rounded text-gray-500 hover:bg-red-50 hover:text-red-600" title="Sil">
          <Trash2 size={15} />
        </button>
      </div>
      {open && (
        <div className="border-t border-[var(--border)] p-4 space-y-5">
          <BlockEditor
            block={block}
            onChange={(patch) => onChange({ ...block, props: { ...block.props, ...patch } as BlockProps<BlockType> })}
          />
          <CommonSettingsFields
            value={block.props.settings}
            onChange={(settings: BlockSettings) => onChange({ ...block, props: { ...block.props, settings } as BlockProps<BlockType> })}
          />
        </div>
      )}
    </div>
  );
}

interface BlockListProps {
  blocks: PageBlock[];
  onChange: (blocks: PageBlock[]) => void;
  openId: string | null;
  setOpenId: (id: string | null) => void;
}

export function BlockList({ blocks, onChange, openId, setOpenId }: BlockListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = blocks.findIndex((b) => b.id === active.id);
    const to = blocks.findIndex((b) => b.id === over.id);
    onChange(arrayMove(blocks, from, to));
  };

  const removeBlock = (block: PageBlock) => {
    const label = BLOCK_DEFINITIONS[block.type]?.label ?? block.type;
    if (window.confirm(`"${label}" bloku silinsin?`)) {
      onChange(blocks.filter((b) => b.id !== block.id));
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {blocks.map((block, index) => (
            <SortableBlock
              key={block.id}
              block={block}
              open={openId === block.id}
              onToggle={() => setOpenId(openId === block.id ? null : block.id)}
              onChange={(updated) => onChange(blocks.map((b) => (b.id === block.id ? updated : b)))}
              onDuplicate={() => {
                const [copy] = cloneBlocks([block]);
                const next = [...blocks];
                next.splice(index + 1, 0, copy);
                onChange(next);
                setOpenId(copy.id);
              }}
              onRemove={() => removeBlock(block)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
