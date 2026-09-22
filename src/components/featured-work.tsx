import Link from "next/link";
import { getFeaturedProjects } from "@/content/projects";

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
            <Link
              key={project.slug}
              href={`/work/${project.slug}`}
              className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-accent"
            >
              <h3 className="font-medium text-card-foreground">
                {project.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {project.summary}
              </p>
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
              <span className="mt-4 inline-block text-sm text-accent opacity-0 transition-opacity group-hover:opacity-100">
                View case study →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
