import {
  fetchClientLogos,
  fetchContactInfo,
  fetchTeamMembers,
  fetchTeamTeaser,
  fetchTestimonialsHighlight,
  fetchTestimonialsIntro,
  fetchTestimonialsList,
} from "@/lib/api";

// Data for the "existing section" blocks (testimonials, logos, team, contact).
// Loaded only for the block types a page actually uses. Works on server and client.

export interface SectionData {
  testimonials?: { intro: unknown; highlight: unknown; list: unknown };
  clientLogos?: unknown[] | null;
  team?: { teaser: { heading: string; viewAllLabel: string; displayCount: number } | null; members: unknown[] };
  contactInfo?: unknown;
}

export async function loadSectionData(
  locale: string,
  blocks: { type: string; props?: Record<string, unknown> }[],
): Promise<SectionData> {
  const types = new Set(blocks.map((b) => b.type));
  const data: SectionData = {};
  const jobs: Promise<void>[] = [];

  if (types.has("testimonials")) {
    jobs.push(
      Promise.all([
        fetchTestimonialsIntro(locale, "home"),
        fetchTestimonialsHighlight(locale),
        fetchTestimonialsList(locale),
      ]).then(([intro, highlight, list]) => {
        data.testimonials = { intro, highlight, list };
      }),
    );
  }

  if (types.has("clientLogos")) {
    jobs.push(fetchClientLogos().then((logos) => void (data.clientLogos = logos)));
  }

  if (types.has("teamMembers")) {
    const maxCount = Math.max(
      4,
      ...blocks.filter((b) => b.type === "teamMembers").map((b) => Number(b.props?.count) || 4),
    );
    jobs.push(
      Promise.all([fetchTeamTeaser(locale, "home"), fetchTeamMembers(locale, maxCount)]).then(([teaser, members]) => {
        data.team = { teaser, members: Array.isArray(members) ? members : [] };
      }),
    );
  }

  if (types.has("contactForm")) {
    jobs.push(fetchContactInfo(locale).then((res) => void (data.contactInfo = res?.info ?? null)));
  }

  await Promise.all(jobs);
  return data;
}
