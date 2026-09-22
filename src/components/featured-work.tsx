import Link from "next/link";
import { getFeaturedProjects } from "@/content/projects";
import { ProjectCard } from "@/components/project-card";

export function FeaturedWork() {
  const featured = getFeaturedProjects();

  return (
    <section className="border-t border-border px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Selected work
          </h2>
          <Link
            href="/work"
            className="shrink-0 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            View all →
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {featured.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
