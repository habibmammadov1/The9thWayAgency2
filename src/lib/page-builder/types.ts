// Page builder — shared block types.
// Server-side validation lives in server/src/lib/pageBlocks.ts; keep the two in sync.

export const PAGE_LOCALES = ["az", "ru", "en"] as const;
export type PageLocale = (typeof PAGE_LOCALES)[number];

export type BlockBackground = "dark" | "paper" | "white" | "accent";
export type BlockSpacing = "sm" | "md" | "lg";
export type BlockAlign = "left" | "center";

export interface BlockSettings {
  background: BlockBackground;
  spacing: BlockSpacing;
  align: BlockAlign;
  anchorId: string;
}

export interface BlockButton {
  label: string;
  href: string;
  style: "primary" | "secondary" | "link";
}

export interface HeroProps {
  variant: "image" | "split" | "text";
  overline: string;
  heading: string;
  text: string;
  imageUrl?: string | null;
  buttons: BlockButton[];
}

export interface RichTextProps {
  html: string;
  width: "narrow" | "wide";
}

export interface ImageTextProps {
  imageUrl?: string | null;
  imageAlt: string;
  overline: string;
  heading: string;
  text: string;
  imagePosition: "left" | "right";
  ratio: "50-50" | "40-60";
  buttons: BlockButton[];
}

export interface CardItem {
  id: string;
  icon: string;
  imageUrl?: string | null;
  value: string;
  title: string;
  text: string;
  href: string;
  linkLabel: string;
}

export interface CardsProps {
  heading: string;
  text: string;
  columns: 2 | 3 | 4;
  mobileColumns: 1 | 2;
  style: "plain" | "bordered" | "image" | "stat";
  items: CardItem[];
}

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
}

export interface GalleryProps {
  heading: string;
  layout: "grid" | "slider";
  columns: 2 | 3 | 4;
  images: GalleryImage[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqProps {
  heading: string;
  items: FaqItem[];
}

export interface CtaProps {
  heading: string;
  text: string;
  button: BlockButton;
}

export interface TestimonialsBlockProps {
  heading: string;
}

export interface TeamMembersBlockProps {
  heading: string;
  count: number;
}

export interface FormBlockProps {
  /** Id of a form built in Admin → Formalar. */
  formId: string;
  heading: string;
  text: string;
}

export interface BookingBlockProps {
  /** Id of a meeting type from Admin → Rezervasiyalar. Empty = the visitor chooses. */
  typeId: string;
  heading: string;
  text: string;
}

export type EmptyProps = Record<string, never>;

export interface BlockPropsMap {
  hero: HeroProps;
  richText: RichTextProps;
  imageText: ImageTextProps;
  cards: CardsProps;
  gallery: GalleryProps;
  faq: FaqProps;
  cta: CtaProps;
  testimonials: TestimonialsBlockProps;
  clientLogos: EmptyProps;
  teamMembers: TeamMembersBlockProps;
  contactForm: EmptyProps;
  form: FormBlockProps;
  booking: BookingBlockProps;
}

export type BlockType = keyof BlockPropsMap;

/** A block as stored in PageBlock.props (type-specific props + common settings). */
export type BlockProps<T extends BlockType = BlockType> = BlockPropsMap[T] & { settings: BlockSettings };

export interface PageBlock<T extends BlockType = BlockType> {
  /** Client-side key; server ids are replaced on every save. */
  id: string;
  type: T;
  isVisible: boolean;
  props: BlockProps<T>;
}

/** Shape returned by the public by-slug endpoint. */
export interface PublicPage {
  slug: string;
  locale: string;
  title: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImageUrl?: string | null;
  availableLocales: string[];
  updatedAt: string;
  blocks: { id: string; type: string; props: Record<string, unknown> }[];
}

export interface PageTranslation {
  locale: PageLocale;
  title: string;
  navLabel?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImageUrl?: string | null;
}

/** Shape returned by the admin GET /api/pages/:id endpoint. */
export interface AdminPage {
  id: string;
  slug: string;
  status: "draft" | "published";
  showInNav: boolean;
  navOrder: number;
  createdAt: string;
  updatedAt: string;
  translations: PageTranslation[];
  blocks: Record<PageLocale, PageBlock[]>;
}

export interface AdminPageListItem {
  id: string;
  slug: string;
  status: "draft" | "published";
  showInNav: boolean;
  navOrder: number;
  updatedAt: string;
  title: string;
  locales: string[];
}

export interface NavPageLink {
  slug: string;
  label: string;
}
