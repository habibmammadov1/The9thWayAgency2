import React from "react";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import PortfolioHero from "@/components/sections/portfolio/PortfolioHero";
import CaseStudyShowcase from "@/components/sections/portfolio/CaseStudyShowcase";
import PortfolioTestimonials from "@/components/sections/portfolio/PortfolioTestimonials";
import PortfolioFAQ from "@/components/sections/portfolio/PortfolioFAQ";

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

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <PortfolioHero />
      <CaseStudyShowcase />
      <PortfolioTestimonials />
      <PortfolioFAQ />
    </main>
  );
}
