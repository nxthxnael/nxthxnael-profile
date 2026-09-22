export type Project = {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  featured?: boolean;
};

// Placeholder projects — replace with real case studies.
export const projects: Project[] = [
  {
    slug: "project-alpha",
    title: "Project Alpha",
    summary: "A product placeholder — swap in a real case study.",
    tags: ["Product", "Web App"],
    featured: true,
  },
  {
    slug: "project-beta",
    title: "Project Beta",
    summary: "A design placeholder — swap in a real case study.",
    tags: ["Design", "Branding"],
    featured: true,
  },
  {
    slug: "project-gamma",
    title: "Project Gamma",
    summary: "A venture placeholder — swap in a real case study.",
    tags: ["Founder", "SaaS"],
    featured: true,
  },
];

export function getFeaturedProjects(limit = 3): Project[] {
  return projects.filter((project) => project.featured).slice(0, limit);
}
