import React from "react";
import ServicesList from "@/components/sections/services/ServicesList";
import WhyChooseUs from "@/components/sections/services/WhyChooseUs";
import Testimonials from "@/components/Testimonials";
import StickyCTA from "@/components/StickyCTA";
import { setRequestLocale } from "next-intl/server";
import { fetchTestimonialsIntro, fetchTestimonialsHighlight, fetchTestimonialsList } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Fallback data in case the API is unreachable
const fallbackServicesData = {
  intro: { pillLabel: "Xidmətlərimiz", heading: "Böyüməni Təmin Edən Marketinq Xidmətlərimiz.", ctaLabel: "Bütün Xidmətlərə Bax" },
  list: [],
  why: null
};

async function getServicesData(locale: string) {
  try {
    // The public site has no /api routes of its own: always call the backend API
    const apiUrl = API;

    const [introRes, listRes, whyRes] = await Promise.all([
      fetch(`${apiUrl}/api/services/intro?locale=${locale}`, { next: { revalidate: 60 } }),
      fetch(`${apiUrl}/api/services/list?locale=${locale}`, { next: { revalidate: 60 } }),
      fetch(`${apiUrl}/api/services/why-choose-us?locale=${locale}`, { next: { revalidate: 60 } })
    ]);

    if (!introRes.ok || !listRes.ok || !whyRes.ok) {
      console.warn("Services API unreachable. Using fallback.");
      return fallbackServicesData;
    }

    return {
      intro: await introRes.json(),
      list: (await listRes.json()).services || [],
      why: await whyRes.json()
    };
  } catch (error) {
    console.warn("Failed to fetch Services API:", error);
    return fallbackServicesData;
  }
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [data, testimonialsIntro, testimonialsHighlight, testimonialsList] = await Promise.all([
    getServicesData(locale),
    fetchTestimonialsIntro(locale, 'services'),
    fetchTestimonialsHighlight(locale),
    fetchTestimonialsList(locale),
  ]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-[#F7F6F4]">
      {/* 
        This is Phase 1 of the Services Page.
        We will add a dedicated Services Hero later if needed.
        For now, the page starts directly with the ServicesList.
      */}
      <ServicesList initialData={{ intro: data.intro, services: data.list }} />
      <WhyChooseUs initialData={data.why} />
      <Testimonials 
        headingOverride={testimonialsIntro?.heading}
        initialHighlight={testimonialsHighlight}
        initialList={testimonialsList}
      />
      <StickyCTA />
    </main>
  );
}
