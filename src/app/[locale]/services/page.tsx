import React from "react";
import ServicesList from "@/components/sections/services/ServicesList";
import WhyChooseUs from "@/components/sections/services/WhyChooseUs";
import Testimonials from "@/components/Testimonials";
import StickyCTA from "@/components/StickyCTA";
import { setRequestLocale } from "next-intl/server";

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-[#F7F6F4]">
      {/* 
        This is Phase 1 of the Services Page.
        We will add a dedicated Services Hero later if needed.
        For now, the page starts directly with the ServicesList.
      */}
      <ServicesList />
      <WhyChooseUs />
      <Testimonials titleKey="servicesTitle" />
      <StickyCTA />
    </main>
  );
}
