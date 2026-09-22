export type Project = {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  featured?: boolean;
  year?: string;
  role?: string;
  overview?: string[];
};

// Placeholder projects — replace with real case studies.
export const projects: Project[] = [
  {
    slug: "project-alpha",
    title: "Project Alpha",
    summary: "A product placeholder — swap in a real case study.",
    tags: ["Product", "Web App"],
    featured: true,
    year: "20XX",
    role: "Developer & Designer",
    overview: [
      "Replace this with a short summary of the problem this project solved.",
      "Replace this with what you built and the role you played end to end.",
      "Replace this with the outcome — metrics, launch, or what shipped.",
    ],
  },
  {
    slug: "project-beta",
    title: "Project Beta",
    summary: "A design placeholder — swap in a real case study.",
    tags: ["Design", "Branding"],
    featured: true,
    year: "20XX",
    role: "Designer",
    overview: [
      "Replace this with a short summary of the problem this project solved.",
      "Replace this with what you built and the role you played end to end.",
      "Replace this with the outcome — metrics, launch, or what shipped.",
    ],
  },
  {
    slug: "project-gamma",
    title: "Project Gamma",
    summary: "A venture placeholder — swap in a real case study.",
    tags: ["Founder", "SaaS"],
    featured: true,
    year: "20XX",
    role: "Founder",
    overview: [
      "Replace this with a short summary of the problem this project solved.",
      "Replace this with what you built and the role you played end to end.",
      "Replace this with the outcome — metrics, launch, or what shipped.",
    ],
  },
];

export function getFeaturedProjects(limit = 3): Project[] {
  return projects.filter((project) => project.featured).slice(0, limit);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
