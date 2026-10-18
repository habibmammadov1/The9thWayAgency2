import type { BlockProps, BlockType } from "@/lib/page-builder/types";

export interface EditorProps<T extends BlockType> {
  props: BlockProps<T>;
  onChange: (patch: Partial<BlockProps<T>>) => void;
}
