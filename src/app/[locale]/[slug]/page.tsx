import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import PageRenderer from "@/components/page-builder/PageRenderer";
import { fetchPublicPage } from "@/lib/page-builder/pagesApi";
import { loadSectionData } from "@/lib/page-builder/sectionData";

// Admin-built pages (Admin → Səhifələr). Static routes such as /about or /blogs
// take precedence over this dynamic segment, and those slugs are reserved by the API.

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await fetchPublicPage(locale, slug);
  if (!page) return {};

  const title = page.seoTitle || `${page.title} | THE9THWAY AGENCY`;
  const description = page.seoDescription || undefined;
  const images = page.ogImageUrl ? [{ url: page.ogImageUrl }] : undefined;

  return {
    title,
    description,
    alternates: {
      languages: Object.fromEntries(page.availableLocales.map((l) => [l, `/${l}/${page.slug}`])),
    },
    openGraph: { title, description, images },
    twitter: { title, description, images: page.ogImageUrl ? [page.ogImageUrl] : undefined },
  };
}

export default async function BuilderPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const page = await fetchPublicPage(locale, slug);
  if (!page) notFound();

  const sectionData = await loadSectionData(locale, page.blocks);

  return <PageRenderer blocks={page.blocks} sectionData={sectionData} slug={page.slug} locale={locale} />;
}
