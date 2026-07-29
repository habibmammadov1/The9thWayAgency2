import React from "react";
import { setRequestLocale } from "next-intl/server";
import TeamIntro from "@/components/sections/team/TeamIntro";
import TeamGrid from "@/components/sections/team/TeamGrid";
import ContactCTABand from "@/components/ContactCTABand";

export default function TeamPage({ params: { locale } }: { params: { locale: string } }) {
  // Enable static rendering
  setRequestLocale(locale);

  return (
    <main className="w-full flex flex-col min-h-screen">
      <TeamIntro />
      <TeamGrid />
      <ContactCTABand />
    </main>
  );
}
