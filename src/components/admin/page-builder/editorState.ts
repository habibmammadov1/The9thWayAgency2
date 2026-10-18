import { isBlockType, withDefaults } from "@/lib/page-builder/registry";
import type { AdminPage, PageBlock, PageLocale, PageTranslation } from "@/lib/page-builder/types";
import { PAGE_LOCALES } from "@/lib/page-builder/types";
import type { SavePagePayload } from "@/lib/page-builder/pagesApi";

// Editor working copy of a page and conversions to/from the API shape.

export interface EditorState {
  slug: string;
  showInNav: boolean;
  navOrder: number;
  translations: Record<PageLocale, PageTranslation>;
  blocks: Record<PageLocale, PageBlock[]>;
}

export const LOCALE_LABELS: Record<PageLocale, string> = { az: "AZ", ru: "RU", en: "EN" };

function emptyTranslation(locale: PageLocale): PageTranslation {
  return { locale, title: "", navLabel: "", seoTitle: "", seoDescription: "", ogImageUrl: null };
}

export function stateFromPage(page: AdminPage): EditorState {
  const translations = {} as Record<PageLocale, PageTranslation>;
  const blocks = {} as Record<PageLocale, PageBlock[]>;
  for (const locale of PAGE_LOCALES) {
    const t = page.translations.find((x) => x.locale === locale);
    translations[locale] = t
      ? { ...emptyTranslation(locale), ...t, navLabel: t.navLabel ?? "", seoTitle: t.seoTitle ?? "", seoDescription: t.seoDescription ?? "" }
      : emptyTranslation(locale);
    blocks[locale] = (page.blocks?.[locale] ?? [])
      .filter((b) => isBlockType(b.type))
      .map((b) => ({ ...b, props: withDefaults(b.type, b.props as unknown as Record<string, unknown>) }));
  }
  return { slug: page.slug, showInNav: page.showInNav, navOrder: page.navOrder, translations, blocks };
}

export function payloadFromState(state: EditorState): SavePagePayload {
  return {
    slug: state.slug,
    showInNav: state.showInNav,
    navOrder: state.navOrder,
    translations: PAGE_LOCALES.map((l) => state.translations[l]),
    blocks: state.blocks,
  };
}

export interface PublishCheck {
  level: "error" | "warning";
  text: string;
}

export function publishChecks(state: EditorState): PublishCheck[] {
  const checks: PublishCheck[] = [];
  const ready = PAGE_LOCALES.filter(
    (l) => state.translations[l].title.trim() && state.blocks[l].some((b) => b.isVisible),
  );
  if (ready.length === 0) {
    checks.push({ level: "error", text: "Ən azı bir dildə başlıq və görünən blok olmalıdır." });
  }
  for (const l of PAGE_LOCALES) {
    const t = state.translations[l];
    const label = LOCALE_LABELS[l];
    if (!t.title.trim()) {
      checks.push({ level: "warning", text: `${label}: bu dil boşdur — /${l}/${state.slug} ünvanı 404 verəcək.` });
      continue;
    }
    if (!state.blocks[l].some((b) => b.isVisible)) {
      checks.push({ level: "warning", text: `${label}: başlıq var, amma görünən blok yoxdur (boş səhifə görünəcək).` });
    }
    if (!t.seoDescription?.trim()) {
      checks.push({ level: "warning", text: `${label}: SEO təsviri yoxdur (tövsiyə olunur).` });
    }
  }
  return checks;
}
