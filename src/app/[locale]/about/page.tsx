import React from "react";
import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";

import StudioIntro from "@/components/sections/about/StudioIntro";
import WhatWeBuild from "@/components/sections/about/WhatWeBuild";
import MissionVision from "@/components/sections/about/MissionVision";
import TeamMembers from "@/components/TeamMembers";
import ContactCTABand from "@/components/ContactCTABand";

export default function AboutPage({ params: { locale } }: { params: { locale: string } }) {
  // Enable static rendering
  setRequestLocale(locale);

  const t = useTranslations("AboutPage");

  return (
    <main className="w-full flex flex-col min-h-screen">
      <StudioIntro />
      <WhatWeBuild />
      <MissionVision />
      <TeamMembers customTitle={t("Team.title")} />
      <ContactCTABand />
    </main>
  );
}
