import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import PreviewClient from "./PreviewClient";

// Live preview target for the admin page editor (rendered inside an iframe).
// Shows only what the editor posts to it; it never reads unpublished data itself.

export const metadata: Metadata = {
  title: "Preview",
  robots: { index: false, follow: false },
};

export default async function PagePreview({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PreviewClient locale={locale} />;
}
