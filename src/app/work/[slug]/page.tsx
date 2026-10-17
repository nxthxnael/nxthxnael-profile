import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug, projects } from "@/content/projects";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) return {};

  return {
    title: project.title,
    description: project.summary,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  return (
    <>
      <section className="border-b border-border bg-grid px-6 py-16 sm:py-20">
        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          <Link
            href="/work"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← All work
          </Link>
          <h1 className="text-glow-gradient text-3xl font-semibold tracking-tight sm:text-4xl">
            {project.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {project.year ? <span>{project.year}</span> : null}
            {project.role ? <span>· {project.role}</span> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs text-card-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          {project.liveUrl || project.repoUrl ? (
            <div className="flex flex-wrap gap-4 pt-1 text-sm">
              {project.liveUrl ? (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent transition-opacity hover:opacity-80"
                >
                  Live site →
                </a>
              ) : null}
              {project.repoUrl ? (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent transition-opacity hover:opacity-80"
                >
                  Source on GitHub →
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {(project.overview ?? [project.summary]).map((paragraph) => (
            <p key={paragraph} className="text-sm text-muted-foreground sm:text-base">
              {paragraph}
            </p>
          ))}
        </div>
      </section>
    </>
  );
}
