import { slugify } from "@/lib/utils";
import type {
  BlockPropsMap,
  BlockProps,
  BlockSettings,
  BlockType,
  PageBlock,
} from "./types";

// Page builder — block catalogue (labels for the admin, default props).
// Renderers: src/components/page-builder/blocks. Editors: src/components/admin/page-builder/editors.

export type BlockCategory = "text" | "media" | "sections";

export interface BlockDefinition<T extends BlockType = BlockType> {
  type: T;
  label: string;
  description: string;
  category: BlockCategory;
  defaults: () => BlockPropsMap[T];
  defaultSettings?: Partial<BlockSettings>;
}

export const DEFAULT_SETTINGS: BlockSettings = {
  background: "paper",
  spacing: "md",
  align: "left",
  anchorId: "",
};

export function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export const BLOCK_DEFINITIONS: { [T in BlockType]: BlockDefinition<T> } = {
  hero: {
    type: "hero",
    label: "Hero",
    description: "Böyük başlıq, mətn, fon şəkli və düymələr",
    category: "text",
    defaultSettings: { background: "dark", spacing: "lg" },
    defaults: () => ({
      variant: "image",
      overline: "Yeni",
      heading: "Səhifənin əsas başlığı",
      text: "Qısa təsvir: bu səhifə nə haqqındadır?",
      imageUrl: null,
      buttons: [{ label: "Bizimlə əlaqə", href: "/contact", style: "primary" }],
    }),
  },
  richText: {
    type: "richText",
    label: "Mətn",
    description: "Başlıqlar, paraqraflar, siyahılar, sitatlar",
    category: "text",
    defaults: () => ({
      html: "<h2>Başlıq</h2><p>Mətninizi buraya yazın.</p>",
      width: "narrow",
    }),
  },
  imageText: {
    type: "imageText",
    label: "Şəkil + Mətn",
    description: "Yan-yana şəkil və mətn",
    category: "media",
    defaults: () => ({
      imageUrl: null,
      imageAlt: "",
      overline: "",
      heading: "Başlıq",
      text: "Mətninizi buraya yazın.",
      imagePosition: "left",
      ratio: "50-50",
      buttons: [],
    }),
  },
  cards: {
    type: "cards",
    label: "Kartlar",
    description: "Xidmətlər, üstünlüklər, statistika, paketlər",
    category: "text",
    defaults: () => ({
      heading: "Niyə biz?",
      text: "",
      columns: 3,
      mobileColumns: 1,
      style: "bordered",
      items: [1, 2, 3].map((n) => ({
        id: newId(),
        icon: "Star",
        imageUrl: null,
        value: "",
        title: `Kart ${n}`,
        text: "Qısa təsvir",
        href: "",
        linkLabel: "",
      })),
    }),
  },
  gallery: {
    type: "gallery",
    label: "Qalereya",
    description: "Şəkillər grid və ya slider şəklində",
    category: "media",
    defaults: () => ({ heading: "", layout: "grid", columns: 3, images: [] }),
  },
  faq: {
    type: "faq",
    label: "FAQ",
    description: "Sual-cavab akkordeonu",
    category: "text",
    defaults: () => ({
      heading: "Tez-tez verilən suallar",
      items: [{ id: newId(), question: "Sual?", answer: "Cavab." }],
    }),
  },
  cta: {
    type: "cta",
    label: "CTA band",
    description: "Başlıq, mətn və bir düymə",
    category: "text",
    defaultSettings: { background: "dark", align: "center" },
    defaults: () => ({
      heading: "Layihənizi müzakirə edək",
      text: "",
      button: { label: "Əlaqə saxla", href: "/contact", style: "primary" },
    }),
  },
  testimonials: {
    type: "testimonials",
    label: "Rəylər",
    description: "Mövcud rəylər bölməsi (admin → Rəylər)",
    category: "sections",
    defaults: () => ({ heading: "" }),
  },
  clientLogos: {
    type: "clientLogos",
    label: "Müştəri loqoları",
    description: "Mövcud loqo lenti (admin → Müştəri Loqoları)",
    category: "sections",
    defaults: () => ({}) as Record<string, never>,
  },
  teamMembers: {
    type: "teamMembers",
    label: "Komanda",
    description: "Mövcud komanda üzvləri (admin → Komanda)",
    category: "sections",
    defaults: () => ({ heading: "", count: 4 }),
  },
  contactForm: {
    type: "contactForm",
    label: "Əlaqə forması",
    description: "Mövcud əlaqə forması və məlumatları",
    category: "sections",
    defaults: () => ({}) as Record<string, never>,
  },
};

export const BLOCK_TYPES = Object.keys(BLOCK_DEFINITIONS) as BlockType[];

export function isBlockType(type: string): type is BlockType {
  return type in BLOCK_DEFINITIONS;
}

export function createBlock<T extends BlockType>(type: T): PageBlock<T> {
  const def = BLOCK_DEFINITIONS[type] as BlockDefinition<T>;
  return {
    id: newId(),
    type,
    isVisible: true,
    props: {
      ...def.defaults(),
      settings: { ...DEFAULT_SETTINGS, ...def.defaultSettings },
    } as BlockProps<T>,
  };
}

/** Fills in defaults for props stored by an older version of a block. */
export function withDefaults<T extends BlockType>(type: T, props: Record<string, unknown> | null | undefined): BlockProps<T> {
  const def = BLOCK_DEFINITIONS[type] as BlockDefinition<T>;
  const raw = props ?? {};
  return {
    ...def.defaults(),
    ...raw,
    settings: { ...DEFAULT_SETTINGS, ...def.defaultSettings, ...((raw.settings as object) ?? {}) },
  } as BlockProps<T>;
}

/** Deep copy of blocks with fresh ids (used for "copy from another language" and templates). */
export function cloneBlocks(blocks: PageBlock[]): PageBlock[] {
  return blocks.map((b) => {
    const props = JSON.parse(JSON.stringify(b.props));
    for (const key of ["items", "images"] as const) {
      if (Array.isArray(props[key])) {
        props[key] = props[key].map((item: Record<string, unknown>) => ({ ...item, id: newId() }));
      }
    }
    return { ...b, id: newId(), props };
  });
}

// Keep in sync with RESERVED_SLUGS in server/src/lib/pageBlocks.ts
export const RESERVED_SLUGS = [
  "az", "ru", "en",
  "about", "services", "portfolio", "blogs", "team", "contact",
  "admin", "api", "page-preview", "uploads", "_next", "_vercel",
];

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Returns an error message, or null when the slug is acceptable. */
export function validateSlug(slug: string): string | null {
  if (!slug) return "URL (slug) boş ola bilməz";
  if (!SLUG_PATTERN.test(slug)) return 'URL yalnız kiçik latın hərfləri, rəqəmlər və "-" ola bilər';
  if (RESERVED_SLUGS.includes(slug)) return "Bu URL saytın mövcud səhifəsi üçün istifadə olunur";
  return null;
}

/** slugify() from lib/utils plus the Azerbaijani letters it does not map (ü, İ). */
export function toSlug(text: string): string {
  return slugify(text.replace(/[üÜ]/g, "u").replace(/İ/g, "i")).slice(0, 100).replace(/-$/, "");
}
