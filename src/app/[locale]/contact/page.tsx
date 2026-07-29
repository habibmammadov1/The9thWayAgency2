import React from "react";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import ContactWhyChooseUs from "@/components/sections/contact/ContactWhyChooseUs";
import ContactSection from "@/components/ContactSection";
import ContactInfoMap from "@/components/sections/contact/ContactInfoMap";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="w-full flex flex-col items-center justify-center bg-white">
      {/* Contact Page Phase 1 */}
      <ContactWhyChooseUs />
      
      {/* Contact Page Phase 2 (Reused Form) */}
      <ContactSection />
      
      {/* Contact Page Phase 3 (Info & Map) */}
      <ContactInfoMap />
    </main>
  );
}
