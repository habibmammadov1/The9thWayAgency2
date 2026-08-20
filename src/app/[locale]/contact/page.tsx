import React from "react";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import ContactWhyChooseUs from "@/components/sections/contact/ContactWhyChooseUs";
import ContactSection from "@/components/ContactSection";
import ContactInfoMap from "@/components/sections/contact/ContactInfoMap";
import { fetchContactWhyChooseUs, fetchContactInfo } from "@/lib/api";

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

  // Fetch all Contact content in parallel
  const [whyChooseUs, contactInfo] = await Promise.all([
    fetchContactWhyChooseUs(locale),
    fetchContactInfo(locale),
  ]);

  return (
    <main className="w-full flex flex-col items-center justify-center bg-white">
      {/* Contact Page Phase 1 */}
      <ContactWhyChooseUs data={whyChooseUs} />
      
      {/* Contact Page Phase 2 (Reused Form) */}
      <ContactSection info={contactInfo?.info} sourcePage="contact" />
      
      {/* Contact Page Phase 3 (Info & Map) */}
      <ContactInfoMap info={contactInfo?.info} />
    </main>
  );
}
