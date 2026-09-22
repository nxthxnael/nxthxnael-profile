// Placeholder content — replace with your real bio, skills, and timeline.

export const bio = [
  "I'm nxthxnael — I move between writing code, designing interfaces, and building businesses, usually all on the same project.",
  "That range means I can take something from a rough idea to a shipped product without losing the thread between them: I can scope it, design it, build it, and figure out how it should make money.",
];

export type SkillGroup = {
  category: string;
  skills: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    category: "Development",
    skills: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL"],
  },
  {
    category: "Design",
    skills: ["Product Design", "UI/UX", "Design Systems", "Figma"],
  },
  {
    category: "Business",
    skills: ["Product Strategy", "Go-to-Market", "Client Delivery"],
  },
];

export type TimelineEntry = {
  period: string;
  title: string;
  description: string;
};

export const timeline: TimelineEntry[] = [
  {
    period: "Present",
    title: "Add your current role",
    description: "A short line about what you're building or working on now.",
  },
  {
    period: "20XX",
    title: "Add a past milestone",
    description: "A short line about a past project, role, or launch.",
  },
  {
    period: "20XX",
    title: "Add where it started",
    description: "A short line about how you got into development/design/business.",
  },
];
