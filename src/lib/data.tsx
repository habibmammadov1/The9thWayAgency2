import React from "react";
import { TrendingUp, Lightbulb, Handshake, Search } from "lucide-react";

export const SLIDES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2000&auto=format&fit=crop",
    overline: "Marketing & Branding Agency",
    headline: "We Take Your Brand to the Next Level.",
    supporting: "Strategic design and engineering for fearless companies."
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2000&auto=format&fit=crop",
    overline: "Digital Experiences",
    headline: "Engineering the Future of the Web.",
    supporting: "Award-winning interfaces that demand attention."
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=2000&auto=format&fit=crop",
    overline: "Creative Direction",
    headline: "Minimal. Strategic. Unignorable.",
    supporting: "Stripping away the noise to reveal pure brand essence."
  }
];

export const LOGOS = [
  { id: 1, name: "Vercel", src: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Vercel_logo_black.svg" },
  { id: 2, name: "Figma", src: "https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg" },
  { id: 3, name: "Next.js", src: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Nextjs-logo.svg" },
  { id: 4, name: "Stripe", src: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" },
  { id: 5, name: "GitHub", src: "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" },
  { id: 6, name: "Shopify", src: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopify_logo_2018.svg" },
  { id: 7, name: "Slack", src: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg" },
  { id: 8, name: "Notion", src: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" },
];

export const CARDS = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
    icon: <TrendingUp strokeWidth={1} size={24} />,
    title: "Performance Marketing",
    desc: "Run targeted ad campaigns that generate leads, sales, measurable growth."
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
    icon: <Lightbulb strokeWidth={1} size={24} />,
    title: "Data-Driven Strategy",
    desc: "We use data insights to build effective marketing strategies."
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop",
    icon: <Handshake strokeWidth={1} size={24} />,
    title: "Expert Marketing Team",
    desc: "Our expert team delivers strategic marketing results consistently."
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1572177812156-58036aae439c?q=80&w=800&auto=format&fit=crop",
    icon: <Search strokeWidth={1} size={24} />,
    title: "SEO & Organic Growth",
    desc: "We improve rankings and drive consistent organic traffic for your website."
  }
];

export const PORTFOLIO_PROJECTS = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=800&auto=format&fit=crop",
    tags: "Marketing / Product / Agency",
    title: "E-Commerce Growth Campaign",
    description: "Helped an online store increase revenue by 320% through performance marketing, SEO, and conversion optimization."
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=800&auto=format&fit=crop",
    tags: "Corporate / Business / Startup",
    title: "Brand Identity Transformation",
    description: "Redesigned brand positioning and visual identity, resulting in stronger recognition and engagement."
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop",
    tags: "Corporate / Business / Startup",
    title: "Strategic Planning",
    description: "We increased engagement and followers through tailored strategies, and consistent social media campaigns."
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
    tags: "Web / UI / UX",
    title: "Digital Platform Overhaul",
    description: "Built a robust scalable platform that doubled user retention and minimized drop-offs."
  }
];

export const STATS = [
  { id: 1, value: 8, suffix: "+", label: "Years of Experience" },
  { id: 2, value: 250, suffix: "+", label: "Projects Delivered" },
  { id: 3, value: 120, suffix: "+", label: "Happy Clients" },
  { id: 4, value: 98, suffix: "%", label: "Client Retention" },
];

export const AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=100&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
];

export const REVIEWS = [
  {
    id: 1,
    quote: "The9thway Agency completely transformed our digital presence. Their approach to branding is strategic, fearless, and incredibly effective.",
    boldWords: ["strategic, fearless, and incredibly effective."],
    name: "Sarah Jenkins",
    role: "CMO, TechNova",
  },
  {
    id: 2,
    quote: "We've seen a 300% increase in inbound leads since the redesign. They don't just design websites; they engineer growth engines.",
    boldWords: ["engineer growth engines."],
    name: "Marcus Thorne",
    role: "Founder, Zenith Capital",
  },
  {
    id: 3,
    quote: "Meticulous attention to detail and a profound understanding of modern aesthetics. The best creative partners we've ever worked with.",
    boldWords: ["profound understanding of modern aesthetics."],
    name: "Elena Rodriguez",
    role: "VP Marketing, Lumina",
  },
  {
    id: 4,
    quote: "From the initial discovery phase to the final launch, their team executed flawlessly. The new brand identity is a masterpiece.",
    boldWords: ["executed flawlessly.", "masterpiece."],
    name: "David Chen",
    role: "CEO, Horizon Labs",
  }
];

export const TEAM = [
  {
    id: 1,
    name: "Elvin Mammadov",
    role: "Founder & Creative Director",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Aysel Quliyeva",
    role: "Head of Digital Strategy",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Kamran Rzayev",
    role: "Lead Engineer",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 4,
    name: "Leyla Hasanova",
    role: "Performance Marketing",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 5,
    name: "Rashad Aliyev",
    role: "Senior UI/UX Designer",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 6,
    name: "Nigar Huseynova",
    role: "Content Strategist",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 7,
    name: "Tural Abbasov",
    role: "Full-Stack Developer",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 8,
    name: "Fidan Mammadli",
    role: "Account Manager",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop"
  }
];

export const SERVICES_PAGE_DATA = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?q=80&w=2000&auto=format&fit=crop", // SEO
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2000&auto=format&fit=crop", // SMM
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2000&auto=format&fit=crop", // Market Research
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2000&auto=format&fit=crop", // Branding
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=2000&auto=format&fit=crop", // Content
  }
];

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  role: string;
  date: string;
  category: string;
  comments: number;
  image: string;
  content: string;
  authorAvatarUrl?: string;
}

export const getBlogPosts = (t: any): BlogPost[] => {
  return Array.from({ length: 5 }).map((_, idx) => ({
    slug: t(`posts.${idx}.slug`),
    title: t(`posts.${idx}.title`),
    excerpt: t(`posts.${idx}.excerpt`),
    author: t(`posts.${idx}.author`),
    role: t(`posts.${idx}.role`),
    date: t(`posts.${idx}.date`),
    category: t(`posts.${idx}.category`),
    comments: parseInt(t(`posts.${idx}.comments`)) || 0,
    image: t(`posts.${idx}.image`),
    content: t.raw(`posts.${idx}.content`),
    authorAvatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop",
  }));
};
