import { createBlock, newId } from "./registry";
import type { PageBlock } from "./types";

// Starting layouts offered in the "new page" dialog. Admins can change everything afterwards.

export interface PageTemplate {
  id: string;
  label: string;
  description: string;
  build: () => PageBlock[];
}

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: "blank",
    label: "Boş səhifə",
    description: "Heç bir blok olmadan başlayın",
    build: () => [],
  },
  {
    id: "landing",
    label: "Landing",
    description: "Hero → Kartlar → Şəkil+Mətn → Rəylər → CTA",
    build: () => [
      createBlock("hero"),
      createBlock("cards"),
      createBlock("imageText"),
      createBlock("testimonials"),
      createBlock("cta"),
    ],
  },
  {
    id: "service",
    label: "Xidmət detalı",
    description: "Hero → Mətn → Proses kartları → FAQ → Əlaqə forması",
    build: () => {
      const steps = createBlock("cards");
      steps.props.heading = "Necə işləyirik";
      steps.props.columns = 4;
      steps.props.items = ["Analiz", "Strategiya", "İcra", "Nəticə"].map((title, i) => ({
        id: newId(),
        icon: ["Search", "Target", "Rocket", "TrendingUp"][i],
        imageUrl: null,
        value: "",
        title,
        text: "Qısa təsvir",
        href: "",
        linkLabel: "",
      }));
      return [createBlock("hero"), createBlock("richText"), steps, createBlock("faq"), createBlock("contactForm")];
    },
  },
  {
    id: "campaign",
    label: "Kampaniya",
    description: "Hero → Statistika → Qalereya → CTA",
    build: () => {
      const stats = createBlock("cards");
      stats.props.heading = "Rəqəmlərlə";
      stats.props.style = "stat";
      stats.props.columns = 3;
      stats.props.items = [
        ["120+", "Layihə"],
        ["40+", "Müştəri"],
        ["8", "İl təcrübə"],
      ].map(([value, title]) => ({ id: newId(), icon: "", imageUrl: null, value, title, text: "", href: "", linkLabel: "" }));
      return [createBlock("hero"), stats, createBlock("gallery"), createBlock("cta")];
    },
  },
];
