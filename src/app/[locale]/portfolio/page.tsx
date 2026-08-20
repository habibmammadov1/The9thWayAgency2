import React from "react";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import PortfolioHero from "@/components/sections/portfolio/PortfolioHero";
import CaseStudyShowcase from "@/components/sections/portfolio/CaseStudyShowcase";
import PortfolioTestimonials from "@/components/sections/portfolio/PortfolioTestimonials";
import PortfolioFAQ from "@/components/sections/portfolio/PortfolioFAQ";

import { 
  fetchClientLogos, 
  fetchPortfolioHero, 
  fetchPortfolioCaseStudies, 
  fetchTestimonialsIntro, 
  fetchTestimonialsList, 
  fetchPortfolioFAQ 
} from "@/lib/api";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: `Portfolio | ${t('homeTitle')}`,
    description: t('homeDesc'),
  };
}

export default async function PortfolioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [
    clientLogos, 
    heroData, 
    caseStudiesData, 
    testimonialsIntro, 
    testimonialsList, 
    faqData
  ] = await Promise.all([
    fetchClientLogos(),
    fetchPortfolioHero(locale),
    fetchPortfolioCaseStudies(locale),
    fetchTestimonialsIntro(locale, 'portfolio'),
    fetchTestimonialsList(locale),
    fetchPortfolioFAQ(locale)
  ]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <PortfolioHero logos={clientLogos} initialData={heroData} />
      <CaseStudyShowcase initialData={caseStudiesData} />
      <PortfolioTestimonials headingOverride={testimonialsIntro?.heading} initialList={testimonialsList} />
      <PortfolioFAQ initialData={faqData} />
    </main>
  );
}
