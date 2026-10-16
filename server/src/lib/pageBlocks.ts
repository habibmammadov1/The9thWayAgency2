import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';

// ---------------------------------------------------------------------------
// Page builder — block validation (server side).
// Mirrors the block shapes defined on the frontend in
// src/lib/page-builder/types.ts. The frontend has its own form validation;
// this file is the authority on what may be stored.
// ---------------------------------------------------------------------------

export const LOCALES = ['az', 'ru', 'en'] as const;

// Slugs that would collide with existing site routes or system paths.
export const RESERVED_SLUGS = [
  'az', 'ru', 'en',
  'about', 'services', 'portfolio', 'blogs', 'team', 'contact',
  'admin', 'api', 'page-preview', 'uploads', '_next', '_vercel',
];

export const slugSchema = z
  .string()
  .min(1, 'Slug boş ola bilməz')
  .max(100, 'Slug çox uzundur')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug yalnız kiçik latın hərfləri, rəqəmlər və "-" ola bilər')
  .refine((s) => !RESERVED_SLUGS.includes(s), 'Bu slug sistem tərəfindən istifadə olunur');

// Links: site-relative paths, anchors, http(s), mailto, tel. Never javascript: etc.
const hrefSchema = z
  .string()
  .max(500)
  .refine(
    (v) => v === '' || /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i.test(v),
    'Link "/", "#", "http(s)://", "mailto:" və ya "tel:" ilə başlamalıdır',
  );

const imageUrlSchema = z
  .string()
  .max(1000)
  .refine((v) => v === '' || /^(https?:\/\/|\/)/i.test(v), 'Yanlış şəkil ünvanı')
  .nullable()
  .optional();

const text = (max = 2000) => z.string().max(max).default('');

const settingsSchema = z
  .object({
    background: z.enum(['dark', 'paper', 'white', 'accent']).default('paper'),
    spacing: z.enum(['sm', 'md', 'lg']).default('md'),
    align: z.enum(['left', 'center']).default('left'),
    anchorId: z
      .string()
      .max(50)
      .regex(/^[a-zA-Z0-9_-]*$/, 'Anchor id yalnız hərf, rəqəm, "-" və "_" ola bilər')
      .default(''),
  })
  .default({});

const buttonSchema = z.object({
  label: text(100),
  href: hrefSchema.default(''),
  style: z.enum(['primary', 'secondary', 'link']).default('primary'),
});

const itemId = z.string().max(100);

const blockPropsSchemas = {
  hero: z.object({
    variant: z.enum(['image', 'split', 'text']).default('image'),
    overline: text(200),
    heading: text(300),
    text: text(2000),
    imageUrl: imageUrlSchema,
    buttons: z.array(buttonSchema).max(2).default([]),
  }),
  richText: z.object({
    html: z.string().max(100_000).default(''),
    width: z.enum(['narrow', 'wide']).default('narrow'),
  }),
  imageText: z.object({
    imageUrl: imageUrlSchema,
    imageAlt: text(300),
    overline: text(200),
    heading: text(300),
    text: text(5000),
    imagePosition: z.enum(['left', 'right']).default('left'),
    ratio: z.enum(['50-50', '40-60']).default('50-50'),
    buttons: z.array(buttonSchema).max(2).default([]),
  }),
  cards: z.object({
    heading: text(300),
    text: text(2000),
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
    mobileColumns: z.union([z.literal(1), z.literal(2)]).default(1),
    style: z.enum(['plain', 'bordered', 'image', 'stat']).default('bordered'),
    items: z
      .array(
        z.object({
          id: itemId,
          icon: text(50),
          imageUrl: imageUrlSchema,
          value: text(50),
          title: text(300),
          text: text(2000),
          href: hrefSchema.default(''),
          linkLabel: text(100),
        }),
      )
      .max(24)
      .default([]),
  }),
  gallery: z.object({
    heading: text(300),
    layout: z.enum(['grid', 'slider']).default('grid'),
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
    images: z
      .array(z.object({ id: itemId, url: z.string().max(1000), alt: text(300) }))
      .max(48)
      .default([]),
  }),
  faq: z.object({
    heading: text(300),
    items: z
      .array(z.object({ id: itemId, question: text(500), answer: text(5000) }))
      .max(50)
      .default([]),
  }),
  cta: z.object({
    heading: text(300),
    text: text(2000),
    button: buttonSchema.default({}),
  }),
  testimonials: z.object({ heading: text(300) }),
  clientLogos: z.object({}),
  teamMembers: z.object({
    heading: text(300),
    count: z.number().int().min(1).max(24).default(4),
  }),
  contactForm: z.object({}),
} as const;

export type BlockType = keyof typeof blockPropsSchemas;
export const BLOCK_TYPES = Object.keys(blockPropsSchemas) as BlockType[];

export const blockInputSchema = z.object({
  type: z.string(),
  isVisible: z.boolean().default(true),
  props: z.record(z.any()).default({}),
});

export type BlockInput = z.infer<typeof blockInputSchema>;

const RICH_TEXT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ['p', 'h2', 'h3', 'strong', 'b', 'em', 'i', 'u', 's', 'blockquote', 'ul', 'ol', 'li', 'a', 'img', 'br', 'hr', 'code', 'pre'],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https'] },
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
  },
};

export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, RICH_TEXT_OPTIONS);
}

/**
 * Validates one block and returns its normalised props (defaults filled in,
 * rich text sanitised). Throws a readable error message on failure.
 */
export function normaliseBlock(block: BlockInput): { type: BlockType; isVisible: boolean; props: Record<string, unknown> } {
  if (!BLOCK_TYPES.includes(block.type as BlockType)) {
    throw new Error(`Naməlum blok növü: ${block.type}`);
  }
  const type = block.type as BlockType;
  const { settings, ...rest } = block.props ?? {};

  const parsed = blockPropsSchemas[type].safeParse(rest);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new Error(`"${type}" bloku: ${issue.path.join('.') || 'props'} — ${issue.message}`);
  }
  const parsedSettings = settingsSchema.safeParse(settings ?? {});
  if (!parsedSettings.success) {
    const issue = parsedSettings.error.issues[0];
    throw new Error(`"${type}" bloku ayarları: ${issue.path.join('.')} — ${issue.message}`);
  }

  const props: Record<string, unknown> = { ...parsed.data, settings: parsedSettings.data };
  if (type === 'richText') {
    props.html = sanitizeRichText(String(props.html ?? ''));
  }
  return { type, isVisible: block.isVisible, props };
}
