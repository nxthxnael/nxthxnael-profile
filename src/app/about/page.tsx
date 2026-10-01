import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { bio, skillGroups, timeline } from "@/content/about";
import { certifications } from "@/content/certifications";

export const metadata: Metadata = {
  title: "About",
  description: "Developer, designer, and entrepreneur.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="Developer, designer, entrepreneur."
        description="A quick look at how I work and what I've been building."
      />

      <section className="px-6 py-16">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          <div className="flex flex-col items-start gap-6 sm:flex-row">
            <div
              aria-hidden
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-semibold text-accent-foreground"
              style={{
                background: "linear-gradient(135deg, #4338ca, #0f172a)",
              }}
            >
              N
            </div>
            <div className="flex flex-col gap-4">
              {bio.map((paragraph) => (
                <p key={paragraph} className="text-sm text-muted-foreground sm:text-base">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Toolkit
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {skillGroups.map((group) => (
              <div key={group.category}>
                <h3 className="text-sm font-medium text-muted-foreground">
                  {group.category}
                </h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {group.skills.map((skill) => (
                    <li
                      key={skill}
                      className="rounded-full border border-border bg-card px-3 py-1 text-xs text-card-foreground"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Timeline
          </h2>
          <ol className="mt-6 flex flex-col gap-6 border-l border-border pl-6">
            {timeline.map((entry) => (
              <li key={`${entry.period}-${entry.title}`} className="relative">
                <span className="absolute -left-[27px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent" />
                <p className="text-xs font-medium text-muted-foreground">
                  {entry.period}
                </p>
                <h3 className="mt-1 font-medium text-foreground">
                  {entry.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {entry.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-border px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Credentials
            </h2>
            <a
              href="/resume.pdf"
              download
              className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
            >
              Download Resume
            </a>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {certifications.map((cert) => (
              <div
                key={cert.id}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <h3 className="font-medium text-card-foreground">
                  {cert.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {cert.issuer} · {cert.dateEarned}
                </p>
                {cert.verifyUrl ? (
                  <a
                    href={cert.verifyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-sm text-accent transition-opacity hover:opacity-80"
                  >
                    Verify →
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
