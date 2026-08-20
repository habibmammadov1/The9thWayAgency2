import React from "react";
import { setRequestLocale } from "next-intl/server";
import TeamIntro from "@/components/sections/team/TeamIntro";
import TeamGrid from "@/components/sections/team/TeamGrid";
import ContactCTABand from "@/components/ContactCTABand";
import { fetchTeamIntro, fetchTeamMembers } from "@/lib/api";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function TeamPage({ params }: PageProps) {
  const { locale } = await params;
  // Enable static rendering
  setRequestLocale(locale);

  // Fetch Team Intro and full members list in parallel
  const [teamIntro, teamMembers] = await Promise.all([
    fetchTeamIntro(locale),
    fetchTeamMembers(locale),
  ]);

  return (
    <main className="w-full flex flex-col min-h-screen">
      <TeamIntro data={teamIntro} />
      <TeamGrid members={teamMembers} />
      <ContactCTABand />
    </main>
  );
}
