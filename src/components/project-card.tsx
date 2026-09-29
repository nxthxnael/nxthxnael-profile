import Link from "next/link";
import type { Project } from "@/content/projects";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-accent"
    >
      <h3 className="font-medium text-card-foreground">{project.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{project.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
      <span className="mt-4 inline-block text-sm text-accent">
        View case study →
      </span>
    </Link>
  );
}
