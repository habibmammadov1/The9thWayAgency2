import React from "react";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { fetchCaseStudyBySlug, fetchPortfolioCaseStudies } from "@/lib/api";
import CaseStudyDetailsClient from "./CaseStudyDetailsClient";
import ContactCTABand from "@/components/ContactCTABand";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const caseStudy = await fetchCaseStudyBySlug(locale, slug);

  if (!caseStudy) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: `${caseStudy.title} | Case Study`,
    description: caseStudy.challenge,
  };
}

export default async function CaseStudyDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [caseStudy, allCaseStudies] = await Promise.all([
    fetchCaseStudyBySlug(locale, slug),
    fetchPortfolioCaseStudies(locale),
  ]);

  if (!caseStudy) {
    notFound();
  }

  // Filter out the current project to find "Other Projects" (max 3)
  const otherProjects = (allCaseStudies || [])
    .filter((cs: any) => cs.slug !== slug)
    .slice(0, 3);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <CaseStudyDetailsClient caseStudy={caseStudy} otherProjects={otherProjects} />
      <div className="w-full bg-[#0B0B0C]">
        <ContactCTABand />
      </div>
    </main>
  );
}
