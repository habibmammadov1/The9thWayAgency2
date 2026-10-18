import React from "react";
import {
  Award,
  BarChart2,
  BrainCircuit,
  Camera,
  CheckCircle2,
  Clock,
  Code2,
  Globe,
  Handshake,
  Heart,
  Lightbulb,
  LineChart,
  Mail,
  Megaphone,
  Palette,
  PenTool,
  Phone,
  Rocket,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Video,
  Zap,
  type LucideIcon,
} from "lucide-react";

// Icons the admin can pick for card blocks (stored by name in the block props).
export const BLOCK_ICONS: Record<string, LucideIcon> = {
  Star,
  Sparkles,
  TrendingUp,
  LineChart,
  BarChart2,
  Target,
  Rocket,
  Zap,
  Lightbulb,
  BrainCircuit,
  Megaphone,
  Palette,
  PenTool,
  Camera,
  Video,
  Code2,
  Smartphone,
  Globe,
  Search,
  Users,
  Handshake,
  Heart,
  Award,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
};

export const BLOCK_ICON_NAMES = Object.keys(BLOCK_ICONS);

export function BlockIcon({ name, size = 24, className }: { name: string; size?: number; className?: string }) {
  const Icon = BLOCK_ICONS[name];
  if (!Icon) return null;
  return <Icon size={size} strokeWidth={1.5} className={className} />;
}
