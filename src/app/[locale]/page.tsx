import HeroCarousel from "@/components/HeroCarousel";
import ClientLogosMarquee from "@/components/ClientLogosMarquee";
import UniquenessSection from "@/components/UniquenessSection";
import AboutStats from "@/components/AboutStats";
import Testimonials from "@/components/Testimonials";
import TeamMembers from "@/components/TeamMembers";
import ContactSection from "@/components/ContactSection";
import StickyCTA from "@/components/StickyCTA";
import { fetchHero, fetchUniqueness, fetchAboutStats, fetchClientLogos, fetchTestimonialsIntro, fetchTestimonialsHighlight, fetchTestimonialsList, fetchTeamTeaser, fetchTeamMembers, fetchContactInfo } from "@/lib/api";

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

  const [heroData, uniquenessData, aboutStatsData, clientLogos, testimonialsIntro, testimonialsHighlight, testimonialsList, teamTeaser, contactInfo] = await Promise.all([
    fetchHero(locale),
    fetchUniqueness(locale),
    fetchAboutStats(locale),
    fetchClientLogos(),
    fetchTestimonialsIntro(locale, 'home'),
    fetchTestimonialsHighlight(locale),
    fetchTestimonialsList(locale),
    fetchTeamTeaser(locale, 'home'),
    fetchContactInfo(locale),
  ]);

  const teamMembers = await fetchTeamMembers(locale, teamTeaser?.displayCount || 4);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <HeroCarousel data={heroData} locale={locale} />
      <ClientLogosMarquee logos={clientLogos} />
      <UniquenessSection data={uniquenessData} locale={locale} />
      <AboutStats data={aboutStatsData} locale={locale} />

      <Testimonials 
        initialIntro={testimonialsIntro}
        initialHighlight={testimonialsHighlight}
        initialList={testimonialsList}
      />
      <TeamMembers teaserSettings={teamTeaser} members={teamMembers} />
      <ContactSection info={contactInfo?.info} sourcePage="home" />
      <StickyCTA />
    </main>
  );
}
