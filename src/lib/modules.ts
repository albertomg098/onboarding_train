import { BookOpen, Brain, MessageSquare, DollarSign } from "lucide-react";

export const MODULES = [
  {
    id: "domain" as const,
    href: "/domain",
    label: "Domain Knowledge",
    description:
      "Learn the vocabulary, lifecycle, and AI applications of your target industry.",
    icon: BookOpen,
    order: 1,
    cta: "Start Learning",
  },
  {
    id: "framework" as const,
    href: "/framework",
    label: "Mental Framework",
    description:
      "Build structured thinking patterns for analyzing problems in this domain.",
    icon: Brain,
    order: 2,
    cta: "Build Frameworks",
  },
  {
    id: "simulation" as const,
    href: "/simulation",
    label: "Scenario Simulation",
    description:
      "Practice with realistic scenarios and get feedback from an AI expert.",
    icon: MessageSquare,
    order: 3,
    cta: "Start Simulating",
  },
  {
    id: "pricing" as const,
    href: "/pricing",
    label: "Pricing Strategy",
    description:
      "AI Worker pricing models, market analysis, and strategy recommendations.",
    icon: DollarSign,
    order: 4,
    cta: "Explore Pricing",
  },
] as const;

export type ModuleId = (typeof MODULES)[number]["id"];
