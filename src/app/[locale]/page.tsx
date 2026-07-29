import HeroCarousel from "@/components/HeroCarousel";
import ClientLogosMarquee from "@/components/ClientLogosMarquee";
import UniquenessSection from "@/components/UniquenessSection";
import AboutStats from "@/components/AboutStats";
import Testimonials from "@/components/Testimonials";
import TeamMembers from "@/components/TeamMembers";
import ContactSection from "@/components/ContactSection";
import StickyCTA from "@/components/StickyCTA";

import { getTranslations, setRequestLocale } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: t('homeTitle'),
    description: t('homeDesc'),
    alternates: {
      languages: {
        'az': '/az',
        'en': '/en',
        'ru': '/ru',
        'x-default': '/az',
      },
    },
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <HeroCarousel />
      <ClientLogosMarquee />
      <UniquenessSection />
      <AboutStats />

      <Testimonials />
      <TeamMembers />
      <ContactSection />
      <StickyCTA />
    </main>
  );
}
