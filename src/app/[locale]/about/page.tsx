import React from "react";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

import StudioIntro from "@/components/sections/about/StudioIntro";
import WhatWeBuild from "@/components/sections/about/WhatWeBuild";
import MissionVision from "@/components/sections/about/MissionVision";
import TeamMembers from "@/components/TeamMembers";
import ContactCTABand from "@/components/ContactCTABand";
import { fetchAboutStudioIntro, fetchAboutWhatWeBuild, fetchAboutMissionVision, fetchTeamTeaser, fetchTeamMembers } from "@/lib/api";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  // Enable static rendering
  setRequestLocale(locale);

  const t = await getTranslations("AboutPage");

  // Fetch sections content in parallel
  const [studioIntro, whatWeBuild, missionVision, teamTeaser] = await Promise.all([
    fetchAboutStudioIntro(locale),
    fetchAboutWhatWeBuild(locale),
    fetchAboutMissionVision(locale),
    fetchTeamTeaser(locale, 'about'),
  ]);

  const teamMembers = await fetchTeamMembers(locale, teamTeaser?.displayCount || 4);

  return (
    <main className="w-full flex flex-col min-h-screen">
      <StudioIntro data={studioIntro} />
      <WhatWeBuild data={whatWeBuild} />
      <MissionVision data={missionVision} />
      <TeamMembers customTitle={t("Team.title")} teaserSettings={teamTeaser} members={teamMembers} />
      <ContactCTABand />
    </main>
  );
}
